import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { kv } from '@vercel/kv';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const [rawCommands, undoneRaw] = await Promise.all([
      kv.lrange(`room:${roomId}:commands`, 0, -1),
      kv.smembers(`room:${roomId}:undone`),
    ]);
    const undoneSet = new Set((undoneRaw ?? []) as string[]);
    const commands = (rawCommands ?? [])
      .map((item) => {
        try { return typeof item === 'string' ? JSON.parse(item) : item; }
        catch { return null; }
      })
      .filter((cmd) => cmd !== null && !undoneSet.has(cmd.id))
      .reverse();
    return NextResponse.json({ commands });
  } catch {
    return NextResponse.json({ commands: [] });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    await Promise.all([
      kv.del(`room:${roomId}:commands`),
      kv.del(`room:${roomId}:undone`),
    ]);
    await pusherServer.trigger(`room-${roomId}`, 'clear', {});
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
