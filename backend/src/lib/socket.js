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

io.on("connection", (socket) => {
  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  console.log(`✅ Connected: ${socket.user.fullName} (${socket.id})`);

  // Broadcast updated online users list to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Typing indicator
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId?.toString()];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId?.toString()];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Disconnected: ${socket.user.fullName}`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
