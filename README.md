# 🎨 Real-time Collaborative Whiteboard

A multiplayer whiteboard where multiple users draw, move cursors, and undo actions — all in real time.

🔗 ** · [GitHub](https://github.com/linaua/collabboard)

---

## ✨ Features

- 🖊️ Real-time drawing synced across all connected users
- 🖱️ Live cursor presence — see where others are pointing
- ↩️ Undo/redo support per session
- 🚪 Room-based sessions via dynamic routes
- ⚡ Sub-100ms sync via Pusher WebSockets
- 💾 Canvas state persisted with Vercel KV

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Real-time | Pusher Channels |
| Storage | Vercel KV |
| Deploy | Vercel |

## 🚀 Getting Started

```bash
git clone https://github.com/linaua/collabboard.git
cd collabboard
npm install
cp .env.example .env.local
npm run dev
