'use client';
import { Tool } from '@/lib/types';

const COLORS = ['#000000','#FFFFFF','#EF4444','#F97316',
                '#EAB308','#22C55E','#3B82F6','#8B5CF6','#EC4899'];
const TOOLS: { id: Tool; icon: string; label: string }[] = [
  { id: 'pen',       icon: '✏️', label: 'Pen' },
  { id: 'eraser',    icon: '🧹', label: 'Eraser' },
  { id: 'line',      icon: '📏', label: 'Line' },
  { id: 'rectangle', icon: '⬜', label: 'Rectangle' },
  { id: 'circle',    icon: '⭕', label: 'Ellipse' },
];

interface ToolbarProps {
  tool: Tool; setTool: (t: Tool) => void;
  color: string; setColor: (c: string) => void;
  lineWidth: number; setLineWidth: (w: number) => void;
  onClear: () => void; onUndo: () => void; roomId: string;
}

export default function Toolbar({
  tool, setTool, color, setColor,
  lineWidth, setLineWidth, onClear, onUndo, roomId,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white
                    border-b border-gray-200 shadow-sm flex-wrap z-10">
      <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2.5 py-1">
        <span className="text-xs text-gray-400">Room</span>
        <span className="text-sm font-mono font-bold text-gray-700">{roomId}</span>
      </div>
      <div className="h-6 w-px bg-gray-200" />
      <div className="flex gap-1">
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
            className={`w-9 h-9 rounded-lg text-lg flex items-center
              justify-center transition-all ${tool === t.id
                ? 'bg-blue-100 ring-2 ring-blue-500 scale-105'
                : 'hover:bg-gray-100'}`}>
            {t.icon}
          </button>
        ))}
      </div>
      <div className="h-6 w-px bg-gray-200" />
      <div className="flex gap-1 flex-wrap">
        {COLORS.map((c) => (
          <button key={c} onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-full border-2 transition-transform
              hover:scale-110 ${color === c
                ? 'border-blue-500 scale-110' : 'border-gray-300'}`}
            style={{ backgroundColor: c }} />
        ))}
        <input type="color" value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-7 h-7 rounded-full cursor-pointer border-2
                     border-gray-300 p-0 overflow-hidden" />
      </div>
      <div className="h-6 w-px bg-gray-200" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Size: {lineWidth}
        </span>
        <input type="range" min={1} max={50} value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="w-24 accent-blue-500" />
      </div>
      <div className="h-6 w-px bg-gray-200" />
      <button onClick={onUndo}
        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200
                   rounded-lg transition font-medium">
        ↩ Undo
      </button>
      <button onClick={onClear}
        className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100
                   text-red-600 rounded-lg transition font-medium">
        Clear
      </button>
    </div>
  );
}
