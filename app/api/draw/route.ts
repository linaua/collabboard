import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';
import { kv } from '@vercel/kv';
import { DrawCommand } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { roomId, command } = await request.json() as {
      roomId: string; command: DrawCommand;
    };
    if (!roomId || !command)
      return NextResponse.json({ error: 'Missing roomId or command' }, { status: 400 });

    const key = `room:${roomId}:commands`;
    await kv.lpush(key, JSON.stringify(command));
    await kv.ltrim(key, 0, 499);
    await kv.expire(key, 60 * 60 * 24 * 7);

    await pusherServer.trigger(`room-${roomId}`, 'draw', command);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[draw POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
