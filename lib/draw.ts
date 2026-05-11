import { DrawCommand } from './types';

export function renderCommand(
  ctx: CanvasRenderingContext2D,
  cmd: DrawCommand
): void {
  if (cmd.points.length === 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = cmd.tool === 'eraser' ? '#FFFFFF' : cmd.color;
  ctx.fillStyle   = cmd.tool === 'eraser' ? '#FFFFFF' : cmd.color;
  ctx.lineWidth   = cmd.lineWidth;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  switch (cmd.tool) {
    case 'pen':
    case 'eraser': {
      if (cmd.points.length === 1) {
        ctx.arc(cmd.points[0].x, cmd.points[0].y, cmd.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.moveTo(cmd.points[0].x, cmd.points[0].y);
        for (let i = 1; i < cmd.points.length - 1; i++) {
          const midX = (cmd.points[i].x + cmd.points[i + 1].x) / 2;
          const midY = (cmd.points[i].y + cmd.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(cmd.points[i].x, cmd.points[i].y, midX, midY);
        }
        const last = cmd.points[cmd.points.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }
      break;
    }
    case 'line': {
      const start = cmd.points[0];
      const end   = cmd.points[cmd.points.length - 1];
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      break;
    }
    case 'rectangle': {
      const s = cmd.points[0];
      const e = cmd.points[cmd.points.length - 1];
      ctx.strokeRect(s.x, s.y, e.x - s.x, e.y - s.y);
      break;
    }
    case 'circle': {
      const s = cmd.points[0];
      const e = cmd.points[cmd.points.length - 1];
      ctx.ellipse(
        (s.x + e.x) / 2, (s.y + e.y) / 2,
        Math.max(Math.abs(e.x - s.x) / 2, 1),
        Math.max(Math.abs(e.y - s.y) / 2, 1),
        0, 0, Math.PI * 2
      );
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

export function redrawAll(
  ctx: CanvasRenderingContext2D,
  commands: DrawCommand[],
  width: number, height: number
): void {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  commands.forEach((cmd) => renderCommand(ctx, cmd));
}
