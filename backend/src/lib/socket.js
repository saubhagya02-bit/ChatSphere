import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socketAuthMiddleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: [ENV.CLIENT_URL], credentials: true },
});

io.use(socketAuthMiddleware);

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId.toString()];
}

function emitTo(userId, event, data) {
  const sid = userSocketMap[userId?.toString()];
  if (sid) io.to(sid).emit(event, data);
}

io.on("connection", (socket) => {
  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  console.log(`✅ Connected: ${socket.user.fullName} (${socket.id})`);
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // TYPING
  socket.on("typing", ({ receiverId }) => {
    emitTo(receiverId, "typing", { senderId: userId });
  });

  socket.on("stopTyping", ({ receiverId }) => {
    emitTo(receiverId, "stopTyping", { senderId: userId });
  });

  // Flow:
  //   Caller                        Receiver
  //   ──────                        ────────
  //   call:start  ──────────────▶  call:incoming  (shows banner)
  //   call:offer  ──────────────▶  call:offer     (relayed, used by CallOverlay)
  //               ◀─────────────  call:accept    (receiver accepted)
  //               ◀─────────────  call:answer    (SDP answer)
  //   call:ice-candidate ◀──────▶  call:ice-candidate
  //   call:end    ──────────────▶  call:ended
  //               ◀─────────────  call:end

  socket.on("call:start", ({ to, type, callerName, callerPic }) => {
    emitTo(to, "call:incoming", {
      from: userId,
      callerName,
      callerPic,
      type,
    });
  });

  socket.on("call:offer", ({ to, offer, type }) => {
    emitTo(to, "call:offer", { from: userId, offer, type });
  });

  socket.on("call:accept", ({ to }) => {
    emitTo(to, "call:accepted", { from: userId });
  });

  socket.on("call:answer", ({ to, answer }) => {
    emitTo(to, "call:answer", { answer });
  });

  socket.on("call:ice-candidate", ({ to, candidate }) => {
    emitTo(to, "call:ice-candidate", { candidate, from: userId });
  });

  socket.on("call:end", ({ to }) => {
    emitTo(to, "call:ended", { from: userId });
  });

  socket.on("call:reject", ({ to }) => {
    emitTo(to, "call:rejected", { from: userId });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.user.fullName}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
