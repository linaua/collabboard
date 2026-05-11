export type Tool = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle';

export interface Point { x: number; y: number; }

export interface DrawCommand {
  id: string;
  userId: string;
  tool: Tool;
  color: string;
  lineWidth: number;
  points: Point[];
  timestamp: number;
}

export interface UserCursor {
  userId: string;
  name: string;
  color: string;
  x: number;
  y: number;
}
