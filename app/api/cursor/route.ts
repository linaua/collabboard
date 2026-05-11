import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const { roomId, cursor } = await request.json();
    await pusherServer.trigger(`room-${roomId}`, 'cursor-move', cursor);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { roomId, userId } = await request.json();
    await pusherServer.trigger(`room-${roomId}`, 'cursor-leave', { userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
