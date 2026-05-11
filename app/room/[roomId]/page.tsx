'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Whiteboard from '@/components/Whiteboard';

interface UserInfo {
  userId: string;
  userName: string;
  userColor: string;
}

export default function RoomPage() {
  const params  = useParams();
  const router  = useRouter();
  const roomId  = params.roomId as string;
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const userName  = sessionStorage.getItem('userName');
    const userColor = sessionStorage.getItem('userColor');
    const userId    = sessionStorage.getItem('userId');

    if (!userName || !userColor || !userId) {
      router.replace('/');
      return;
    }

    setUserInfo({ userId, userName, userColor });
  }, [router]);

  if (!userInfo) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <Whiteboard
      roomId={roomId}
      userId={userInfo.userId}
      userName={userInfo.userName}
      userColor={userInfo.userColor}
    />
  );
}