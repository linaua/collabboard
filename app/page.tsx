'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const USER_COLORS = ['#EF4444','#F97316','#EAB308',
                     '#22C55E','#3B82F6','#8B5CF6','#EC4899'];
const randomColor = () => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
const randomRoomId = () => Math.random().toString(36).substring(2,8).toUpperCase();

export default function HomePage() {
  const router = useRouter();
  const [name, setName]           = useState('');
  const [roomInput, setRoomInput] = useState('');

  const saveAndJoin = (roomId: string) => {
    const trimmed = name.trim();
    if (!trimmed) { alert('Please enter your name first!'); return; }
    sessionStorage.setItem('userName',  trimmed);
    sessionStorage.setItem('userColor', randomColor());
    sessionStorage.setItem('userId',    crypto.randomUUID());
    router.push(`/room/${roomId.toUpperCase()}`);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-900
                     via-purple-900 to-slate-900 flex items-center
                     justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20
                      rounded-2xl shadow-2xl p-8 w-full max-w-sm text-white">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🎨</div>
          <h1 className="text-3xl font-bold">CollabBoard</h1>
          <p className="text-white/60 text-sm mt-1">Draw together, in real-time</p>
        </div>
        <div className="mb-5">
          <label className="text-xs font-semibold text-white/70
                            uppercase tracking-wider block mb-1.5">
            Your Name
          </label>
          <input type="text" value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex" maxLength={20}
            className="w-full bg-white/10 border border-white/20
                       rounded-xl px-4 py-3 text-white
                       placeholder-white/30 focus:outline-none
                       focus:ring-2 focus:ring-purple-400"
            onKeyDown={(e) => e.key === 'Enter' && saveAndJoin(randomRoomId())} />
        </div>
        <button onClick={() => saveAndJoin(randomRoomId())}
          className="w-full bg-purple-600 hover:bg-purple-500
                     font-semibold py-3 rounded-xl transition mb-4">
          Create New Room
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-xs text-white/40">or join existing</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>
        <div className="flex gap-2">
          <input type="text" value={roomInput}
            onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
            placeholder="Room ID" maxLength={6}
            className="flex-1 bg-white/10 border border-white/20
                       rounded-xl px-4 py-3 text-white
                       placeholder-white/30 font-mono
                       focus:outline-none focus:ring-2 focus:ring-purple-400"
            onKeyDown={(e) => e.key === 'Enter' && saveAndJoin(roomInput)} />
          <button onClick={() => saveAndJoin(roomInput)}
            className="px-5 py-3 bg-white/10 hover:bg-white/20
                       border border-white/20 rounded-xl
                       font-semibold transition">
            Join
          </button>
        </div>
      </div>
    </main>
  );
}
