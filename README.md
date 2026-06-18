<div align="center">

# ChatSphere 💬

</div>

A full-stack, real-time messaging application built with the MERN stack, WebRTC voice & video calling and a robust, security-hardened backend.

---

## Overview

ChatSphere is a real-time, one-on-one messaging platform. It combines a Node.js/Express/MongoDB backend with a React + Vite frontend, using Socket.io for live messaging, presence, and signaling, and native WebRTC for peer-to-peer voice and video calls.

The project was built to demonstrate production-grade patterns across the full stack: clean separation of concerns, optimistic UI updates, JWT-based authentication, rate limiting and bot protection, and a polished, theme-driven dark UI.

---

## Features

### 💬 Messaging
- Real-time one-on-one text messaging via Socket.io
- Image sharing (uploaded and hosted via Cloudinary)
- Optimistic message sending with rollback on failure
- Message ticks: sending (single grey), delivered (double grey), seen (double green)
- "Seen" receipts that update live when the recipient opens the conversation
- Typing indicators (animated dots, live `typing` / `stopTyping` socket events)
- In-conversation message search with match highlighting and next/previous navigation
- 200-character message limit with live character counter
- Last-message preview and automatic chat reordering (most recent conversation surfaces to the top)
- Unread message badges per contact, cleared automatically when a chat is opened

### 📞 Voice & Video Calling
- Peer-to-peer WebRTC audio and video calls (no third-party media server required)
- Full-screen call overlay with blurred background (audio calls) and live video feed (video calls)
- Incoming call banner with accept/reject actions, shown anywhere in the app
- Local + remote video preview with picture-in-picture style local feed
- In-call controls: mute/unmute microphone, toggle camera, speaker toggle
- Live call duration timer
- Automatic call termination handling on disconnect, rejection, or hangup
- Call history log with caller/receiver direction, call type (audio/video), duration, and status (completed, missed, rejected, cancelled)
- Call history grouped by date ("Today," "Yesterday," or full date) with a "Chat" shortcut back to the conversation

### 👤 Contacts & Profile
- Three-tab sidebar: **Chats**, **Contacts**, and **Calls**
- Contact search/filter by name
- View profile modal showing avatar, name, email, online status and join date
- Profile picture upload and update (stored via Cloudinary)
- Auto-generated colored initials avatar as a fallback when no profile picture is set
- Live online/offline presence indicators across the app

### 🚫 Privacy & Conversation Controls
- Block / unblock contacts directly from the chat header menu or profile modal
- Blocked contacts cannot send messages in either direction; sending is disabled client-side with a clear status message
- Clear chat history for a conversation (with confirmation prompt)
- Confirmation modals for all destructive or relationship-changing actions (block, unblock, clear chat)

### 🔐 Authentication & Account
- Email/password signup and login
- Passwords hashed with bcrypt before storage
- JWT-based sessions stored in secure, httpOnly cookies
- Persistent login via session check on app load
- Automated welcome email on signup (HTML email template, sent via Resend)
- Logout with cookie invalidation

### 🎨 UI/UX
- Dark theme with a custom CSS variable design system
- Smooth fade/slide-in animations for messages and dropdowns
- Loading skeletons for contacts, chats and message history
- Toast notifications for all success/error states
- Sound effects for clicks, sent messages and received messages, with a global mute toggle (persisted to local storage)
- Fully responsive chat bubbles with grouped message styling (avatar only shown on first message in a consecutive group)
- Empty states for no conversations, no contacts, no call history and no messages in a chat

### 🛡️ Backend Security & Reliability
- Arcjet-powered protection: bot detection, shield (SQL injection / common attack protection), and sliding-window rate limiting
- Per-route auth middleware (`protectRoute`) verifying JWT on every protected request
- Separate Socket.io authentication middleware validating the JWT cookie on connection
- Centralized environment configuration with fail-fast checks (e.g. missing `MONGO_URI`)

---

## Tech Stack

**Frontend**
- React (Vite)
- Zustand (global state management)
- React Router
- Axios
- Socket.io Client
- react-hot-toast
- lucide-react
- Tailwind CSS (utility classes) + CSS custom properties (design tokens)

**Backend**
- Node.js / Express
- MongoDB with Mongoose
- Socket.io
- JSON Web Tokens (jsonwebtoken)
- bcryptjs
- Cloudinary (image hosting)
- Resend (transactional email)
- Arcjet (bot detection, rate limiting, shield)
- cookie-parser, cors

**Realtime / Media**
- Socket.io (messaging, presence, typing, call signaling)
- WebRTC (peer-to-peer audio/video transport, STUN-based NAT traversal)

**Infrastructure**
- Frontend deployed on Vercel
- Backend deployed on Render
- Database hosted on MongoDB Atlas
- Containerized with Docker for local development parity

---

## Architecture

```
┌─────────────┐       HTTPS/REST        ┌──────────────┐
│   React SPA  │ ──────────────────────► │ Express API  │
│  (Vite, Zus- │ ◄────────────────────── │  (Node.js)   │
│   tand)      │                          └──────┬───────┘
│              │       WebSocket (Socket.io)      │
│              │ ◄───────────────────────────────►│
└──────┬───────┘                                   │
       │                                    ┌──────▼───────┐
       │ WebRTC (P2P media via STUN)        │   MongoDB    │
       └────────────────────────────────────│   (Atlas)    │
                                              └──────────────┘
```

Messages and call metadata are persisted to MongoDB. Real-time delivery, presence, typing status and call signaling (offer/answer/ICE candidates) flow through a single Socket.io connection per authenticated user. Actual call audio/video never touches the server — it travels directly between peers once the WebRTC connection is established.

---

## Folder Structure

```
chatsphere/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── messageController.js
│   │   └── callController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── socketAuthMiddleware.js
│   │   └── arcjetMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── message.js
│   │   └── callLog.js
│   ├── routes/
│   │   ├── authRoute.js
│   │   ├── messageRoute.js
│   │   └── callRoute.js
│   ├── lib/
│   │   ├── db.js
│   │   ├── env.js
│   │   ├── socket.js
│   │   ├── cloudinary.js
│   │   ├── resend.js
│   │   ├── arcjet.js
│   │   └── utils.js
│   ├── emails/
│   │   ├── emailHandlers.js
│   │   └── emailTemplates.js
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── ChatPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   └── SignupPage.jsx
    │   ├── store/
    │   │   ├── useAuthStore.js
    │   │   └── useChatStore.js
    │   ├── hooks/
    │   │   └── useKeyboardSound.js
    │   ├── lib/
    │   │   ├── axios.js
    │   │   └── utils.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── index.html
```

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| POST | `/signup` | Register a new user | No |
| POST | `/login` | Log in and receive a session cookie | No |
| POST | `/logout` | Clear the session cookie | No |
| PUT | `/update-profile` | Update profile picture | Yes |
| GET | `/check` | Verify current session / fetch authenticated user | Yes |

### Messages — `/api/messages`
| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/contacts` | Get all users except the current one | Yes |
| GET | `/chats` | Get users you've previously exchanged messages with | Yes |
| GET | `/:id` | Get message history with a specific user | Yes |
| POST | `/send/:id` | Send a text and/or image message | Yes |
| DELETE | `/clear/:id` | Clear all messages with a specific user | Yes |
| PUT | `/block/:id` | Block a contact | Yes |
| PUT | `/unblock/:id` | Unblock a contact | Yes |

### Calls — `/api/calls`
| Method | Endpoint | Description | Auth required |
|---|---|---|---|
| GET | `/history` | Get the current user's call history (last 100) | Yes |

---

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `msg:seen` | `{ senderId }` | Mark messages from a sender as seen |
| `typing` | `{ receiverId }` | Notify a user that you're typing |
| `stopTyping` | `{ receiverId }` | Notify a user that you've stopped typing |
| `call:start` | `{ to, type, callerName, callerPic }` | Initiate a call |
| `call:offer` | `{ to, offer, type }` | Send a WebRTC offer |
| `call:answer` | `{ to, answer }` | Send a WebRTC answer |
| `call:ice-candidate` | `{ to, candidate }` | Exchange ICE candidates |
| `call:accept` | `{ to, callId }` | Accept an incoming call |
| `call:reject` | `{ to, callId }` | Reject an incoming call |
| `call:end` | `{ to, callId }` | End an active call |

### Server → Client
| Event | Payload | Description |
|---|---|---|
| `getOnlineUsers` | `string[]` | Broadcast of currently connected user IDs |
| `newMessage` | `Message` | A new message has arrived |
| `msg:seen` | `{ by, at }` | Your messages were just seen |
| `typing` / `stopTyping` | `{ senderId }` | A contact's typing status changed |
| `call:incoming` | `{ from, callerName, callerPic, type, callId }` | Someone is calling you |
| `call:offer` / `call:answer` / `call:ice-candidate` | — | WebRTC signaling relay |
| `call:accepted` | `{ from, callId }` | Your call was accepted |
| `call:rejected` | `{ from }` | Your call was rejected |
| `call:ended` | `{ from }` | The active call ended |

---

## Security

- **Password hashing** — bcrypt with a generated salt before any password touches the database
- **JWT sessions** — signed tokens stored in httpOnly, sameSite cookies (not accessible to client-side JS)
- **Rate limiting** — Arcjet sliding-window protection against brute-force and spam traffic
- **Bot detection** — Arcjet filters automated/non-browser traffic while allowlisting legitimate crawlers and monitors
- **Shield protection** — Arcjet guards against common attack patterns (e.g. SQL injection attempts)
- **Authenticated sockets** — every WebSocket connection is validated against the same JWT used for REST requests before any real-time data is exchanged
- **Blocking enforcement** — message sending is blocked server-side in both directions when either party has blocked the other, not just hidden in the UI

---

## Future Improvements

- Group chats and group calling
- Message reactions and replies/threads
- Push notifications for offline users
- Read receipts at the individual-message level for group chats
- Server-side full-text message search across all conversations
- End-to-end encryption for message content

---
