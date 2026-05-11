import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const { roomId, commandId } = await request.json() as {
      roomId: string; commandId: string;
    };
    const undoneKey = `room:${roomId}:undone`;
    await kv.sadd(undoneKey, commandId);
    await kv.expire(undoneKey, 60 * 60 * 24 * 7);
    await pusherServer.trigger(`room-${roomId}`, 'undo', { commandId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
