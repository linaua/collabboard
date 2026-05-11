'use client';
import { UserCursor } from '@/lib/types';

export default function Cursors({ cursors }: { cursors: UserCursor[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {cursors.map((cursor) => (
        <div key={cursor.userId} className="absolute"
          style={{
            left: cursor.x, top: cursor.y,
            transform: 'translate(-4px, -4px)',
            transition: 'left 50ms linear, top 50ms linear',
          }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 2L17 10L10 12L7 18L3 2Z"
              fill={cursor.color} stroke="white" strokeWidth="1.5"/>
          </svg>
          <div className="absolute top-5 left-3 text-xs text-white
                          px-1.5 py-0.5 rounded-md whitespace-nowrap
                          shadow font-medium"
            style={{ backgroundColor: cursor.color }}>
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
}
