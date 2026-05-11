import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CollabBoard — Real-time Collaborative Whiteboard',
  description: 'Draw together in real-time. Built with Next.js, Pusher, Canvas API.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
