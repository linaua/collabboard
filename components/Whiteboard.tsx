'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { DrawCommand, Point, Tool, UserCursor } from '@/lib/types';
import { getPusherClient } from '@/lib/pusher-client';
import { renderCommand, redrawAll } from '@/lib/draw';
import Toolbar from './Toolbar';
import Cursors from './Cursors';

interface WhiteboardProps {
  roomId: string;
  userId: string;
  userName: string;
  userColor: string;
}

export default function Whiteboard({
  roomId,
  userId,
  userName,
  userColor,
}: WhiteboardProps) {
  const containerRef    = useRef<HTMLDivElement>(null);
  const baseCanvasRef   = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Refs для стану малювання (без ре-рендеру)
  const isDrawingRef      = useRef(false);
  const currentPointsRef  = useRef<Point[]>([]);
  const commandsRef       = useRef<DrawCommand[]>([]);
  const cursorTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tool, setTool]           = useState<Tool>('pen');
  const [color, setColor]         = useState('#000000');
  const [lineWidth, setLineWidth] = useState(4);
  const [cursors, setCursors]     = useState<Map<string, UserCursor>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  /* ─── Helpers ──────────────────────────────────────────── */

  const getBaseCtx    = () => baseCanvasRef.current?.getContext('2d') ?? null;
  const getPreviewCtx = () => previewCanvasRef.current?.getContext('2d') ?? null;

  const getPointFromMouse = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const rect = previewCanvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getPointFromTouch = (e: React.TouchEvent<HTMLCanvasElement>): Point => {
    const rect  = previewCanvasRef.current!.getBoundingClientRect();
    const touch = e.touches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  /* ─── Canvas розміри ────────────────────────────────────── */

  const resizeCanvases = useCallback(() => {
    const container = containerRef.current;
    const base      = baseCanvasRef.current;
    const preview   = previewCanvasRef.current;
    if (!container || !base || !preview) return;

    const { width, height } = container.getBoundingClientRect();
    base.width    = width;
    base.height   = height;
    preview.width = width;
    preview.height = height;

    const ctx = getBaseCtx();
    if (ctx) redrawAll(ctx, commandsRef.current, width, height);
  }, []);

  /* ─── Завантаження початкового стану ───────────────────── */

  useEffect(() => {
    resizeCanvases();

    fetch(`/api/canvas/${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.commands)) {
          commandsRef.current = data.commands;
          const base = baseCanvasRef.current;
          const ctx  = getBaseCtx();
          if (base && ctx) {
            redrawAll(ctx, commandsRef.current, base.width, base.height);
          }
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [roomId, resizeCanvases]);

  /* ─── ResizeObserver ────────────────────────────────────── */

  useEffect(() => {
    const observer = new ResizeObserver(resizeCanvases);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resizeCanvases]);

  /* ─── Pusher підписки ───────────────────────────────────── */

  useEffect(() => {
    const client  = getPusherClient();
    const channel = client.subscribe(`room-${roomId}`);

    channel.bind('draw', (cmd: DrawCommand) => {
      if (cmd.userId === userId) return; // вже намальовано локально
      commandsRef.current = [...commandsRef.current, cmd];
      const ctx = getBaseCtx();
      if (ctx) renderCommand(ctx, cmd);
    });

    channel.bind('cursor-move', (cursor: UserCursor) => {
      if (cursor.userId === userId) return;
      setCursors((prev) => {
        const next = new Map(prev);
        next.set(cursor.userId, cursor);
        return next;
      });
    });

    channel.bind('cursor-leave', ({ userId: leftId }: { userId: string }) => {
      setCursors((prev) => {
        const next = new Map(prev);
        next.delete(leftId);
        return next;
      });
    });

    channel.bind('clear', () => {
      commandsRef.current = [];
      const base = baseCanvasRef.current;
      const ctx  = getBaseCtx();
      if (base && ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, base.width, base.height);
      }
    });

    channel.bind('undo', ({ commandId }: { commandId: string }) => {
      commandsRef.current = commandsRef.current.filter((c) => c.id !== commandId);
      const base = baseCanvasRef.current;
      const ctx  = getBaseCtx();
      if (base && ctx) redrawAll(ctx, commandsRef.current, base.width, base.height);
    });

    return () => {
      channel.unbind_all();
      client.unsubscribe(`room-${roomId}`);
      // Повідомити інших що цей користувач пішов
      fetch('/api/cursor', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, userId }),
      }).catch(() => {});
    };
  }, [roomId, userId]);

  /* ─── Малювання ─────────────────────────────────────────── */

  const startDrawing = useCallback(
    (point: Point) => {
      isDrawingRef.current    = true;
      currentPointsRef.current = [point];

      if (tool === 'pen' || tool === 'eraser') {
        const ctx = getBaseCtx();
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = tool === 'eraser' ? '#FFFFFF' : color;
        ctx.arc(point.x, point.y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    },
    [tool, color, lineWidth]
  );

  const continueDrawing = useCallback(
    (point: Point) => {
      if (!isDrawingRef.current) return;
      const points = currentPointsRef.current;
      points.push(point);

      if (tool === 'pen' || tool === 'eraser') {
        const ctx = getBaseCtx();
        if (!ctx || points.length < 2) return;

        const i = points.length - 1;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
        ctx.lineWidth   = lineWidth;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';

        if (i === 1) {
          ctx.moveTo(points[0].x, points[0].y);
          ctx.lineTo(points[1].x, points[1].y);
        } else {
          const midPrevX = (points[i - 2].x + points[i - 1].x) / 2;
          const midPrevY = (points[i - 2].y + points[i - 1].y) / 2;
          const midX     = (points[i - 1].x + points[i].x) / 2;
          const midY     = (points[i - 1].y + points[i].y) / 2;
          ctx.moveTo(midPrevX, midPrevY);
          ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, midX, midY);
        }
        ctx.stroke();
        ctx.restore();
      } else {
        // Прев'ю фігури на верхньому canvas
        const previewCanvas = previewCanvasRef.current;
        const ctx = getPreviewCtx();
        if (!previewCanvas || !ctx) return;

        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        const tempCmd: DrawCommand = {
          id: 'preview',
          userId,
          tool,
          color,
          lineWidth,
          points: [...points],
          timestamp: 0,
        };
        renderCommand(ctx, tempCmd);
      }
    },
    [tool, color, lineWidth, userId]
  );

  const endDrawing = useCallback(async () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    const points = [...currentPointsRef.current];
    currentPointsRef.current = [];

    // Очистити preview canvas
    const previewCanvas = previewCanvasRef.current;
    const previewCtx    = getPreviewCtx();
    if (previewCanvas && previewCtx) {
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    if (points.length === 0) return;

    const command: DrawCommand = {
      id: crypto.randomUUID(),
      userId,
      tool,
      color,
      lineWidth,
      points,
      timestamp: Date.now(),
    };

    // Для фігур: малюємо фінальну версію на base canvas
    if (tool !== 'pen' && tool !== 'eraser') {
      const ctx = getBaseCtx();
      if (ctx) renderCommand(ctx, command);
    }

    commandsRef.current = [...commandsRef.current, command];

    // Відправити на сервер (зберегти + broadcast іншим)
    try {
      await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, command }),
      });
    } catch (err) {
      console.error('Failed to save draw command:', err);
    }
  }, [tool, color, lineWidth, roomId, userId]);

  /* ─── Broadcast курсора ─────────────────────────────────── */

  const sendCursor = useCallback(
    (point: Point) => {
      if (cursorTimerRef.current) return; // throttle 50ms
      cursorTimerRef.current = setTimeout(() => {
        cursorTimerRef.current = null;
      }, 50);

      fetch('/api/cursor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          cursor: { userId, name: userName, color: userColor, x: point.x, y: point.y },
        }),
      }).catch(() => {});
    },
    [roomId, userId, userName, userColor]
  );

  /* ─── Дії ───────────────────────────────────────────────── */

  const handleClear = useCallback(async () => {
    commandsRef.current = [];
    const base = baseCanvasRef.current;
    const ctx  = getBaseCtx();
    if (base && ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, base.width, base.height);
    }
    await fetch(`/api/canvas/${roomId}`, { method: 'DELETE' }).catch(console.error);
  }, [roomId]);

  const handleUndo = useCallback(async () => {
    const myCommands = commandsRef.current.filter((c) => c.userId === userId);
    if (myCommands.length === 0) return;

    const last = myCommands[myCommands.length - 1];
    commandsRef.current = commandsRef.current.filter((c) => c.id !== last.id);

    const base = baseCanvasRef.current;
    const ctx  = getBaseCtx();
    if (base && ctx) redrawAll(ctx, commandsRef.current, base.width, base.height);

    await fetch('/api/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, commandId: last.id }),
    }).catch(console.error);
  }, [roomId, userId]);

  /* ─── Event handlers ────────────────────────────────────── */

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    startDrawing(getPointFromMouse(e));
  };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = getPointFromMouse(e);
    sendCursor(p);
    if (isDrawingRef.current) continueDrawing(p);
  };
  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    endDrawing();
  };

  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    startDrawing(getPointFromTouch(e));
  };
  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    continueDrawing(getPointFromTouch(e));
  };
  const onTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    endDrawing();
  };

  /* ─── Render ─────────────────────────────────────────────── */

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        onClear={handleClear}
        onUndo={handleUndo}
        roomId={roomId}
      />

      <div ref={containerRef} className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white">
            <span className="text-gray-400 animate-pulse">Loading canvas…</span>
          </div>
        )}

        {/* Нижній canvas: завершені мазки */}
        <canvas
          ref={baseCanvasRef}
          className="absolute inset-0"
          style={{ background: '#FFFFFF' }}
        />

        {/* Верхній canvas: поточний мазок + обробка подій */}
        <canvas
          ref={previewCanvasRef}
          className="absolute inset-0"
          style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />

        {/* Курсори інших користувачів */}
        <Cursors cursors={Array.from(cursors.values())} />
      </div>
    </div>
  );
}



