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
const activeCalls = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId?.toString()];
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

  socket.on("msg:seen", async ({ senderId }) => {
    try {
      const { default: Message } = await import("../models/message.js");

      const now = new Date();

      await Message.updateMany(
        { senderId, receiverId: userId, seenAt: null },
        { $set: { seenAt: now } },
      );

      emitTo(senderId, "msg:seen", { by: userId, at: now });
    } catch (err) {
      console.error("msg:seen error:", err);
    }
  });

  // TYPING
  socket.on("typing", ({ receiverId }) =>
    emitTo(receiverId, "typing", { senderId: userId }),
  );

  socket.on("stopTyping", ({ receiverId }) =>
    emitTo(receiverId, "stopTyping", { senderId: userId }),
  );

  socket.on("call:start", async ({ to, type, callerName, callerPic }) => {
    try {
      const { default: CallLog } = await import("../models/callLog.js");

      const log = await new CallLog({
        callerId: userId,
        receiverId: to,
        type,
        status: "missed",
      }).save();

      const callId = log._id.toString();

      activeCalls[callId] = {
        callerId: userId,
        receiverId: to,
        type,
        logId: callId,
      };

      socket.callId = callId;

      emitTo(to, "call:incoming", {
        from: userId,
        callerName,
        callerPic,
        type,
        callId,
      });
    } catch (err) {
      console.error("call:start error:", err);
    }
  });

  socket.on("call:offer", ({ to, offer, type }) =>
    emitTo(to, "call:offer", { from: userId, offer, type }),
  );

  socket.on("call:ice-candidate", ({ to, candidate }) =>
    emitTo(to, "call:ice-candidate", { candidate, from: userId }),
  );

  // CALL ACCEPT
  socket.on("call:accept", async ({ to, callId }) => {
    emitTo(to, "call:accepted", { from: userId, callId });

    if (callId && activeCalls[callId]) {
      activeCalls[callId].startedAt = new Date();
      socket.callId = callId;

      try {
        const { default: CallLog } = await import("../models/callLog.js");

        await CallLog.findByIdAndUpdate(callId, {
          status: "answered",
          startedAt: new Date(),
        });
      } catch (err) {
        console.error("call:accept update error:", err);
      }
    }
  });

  socket.on("call:answer", ({ to, answer }) =>
    emitTo(to, "call:answer", { answer }),
  );

  // CALL REJECT
  socket.on("call:reject", async ({ to, callId }) => {
    emitTo(to, "call:rejected", { from: userId });

    if (callId) {
      try {
        const { default: CallLog } = await import("../models/callLog.js");

        await CallLog.findByIdAndUpdate(callId, {
          status: "rejected",
        });

        delete activeCalls[callId];
      } catch {}
    }
  });

  // CALL EN
  socket.on("call:end", async ({ to, callId }) => {
    emitTo(to, "call:ended", { from: userId });

    if (callId && activeCalls[callId]) {
      try {
        const { default: CallLog } = await import("../models/callLog.js");

        const info = activeCalls[callId];
        const endedAt = new Date();

        const duration = info.startedAt
          ? Math.round((endedAt - info.startedAt) / 1000)
          : 0;

        let status = "completed";
        if (duration === 0) {
          status = cancelled ? "cancelled" : "missed";
        }

        await CallLog.findByIdAndUpdate(callId, {
          status: info.startedAt ? "completed" : "missed",
          startedAt: info.startedAt || null,
          endedAt,
          duration,
        });

        delete activeCalls[callId];
        socket.callId = null;
      } catch (err) {
        console.error("call:end error:", err);
      }
    }
  });

  // DISCONNECT
  socket.on("disconnect", async () => {
    console.log(`❌ Disconnected: ${socket.user.fullName}`);

    const callId = socket.callId;

    if (callId && activeCalls[callId]) {
      try {
        const { default: CallLog } = await import("../models/callLog.js");

        const info = activeCalls[callId];
        const endedAt = new Date();

        const duration = info.startedAt
          ? Math.round((endedAt - info.startedAt) / 1000)
          : 0;

        await CallLog.findByIdAndUpdate(callId, {
          status: info.startedAt ? "completed" : "missed",
          endedAt,
          duration,
        });

        const otherId =
          info.callerId === userId ? info.receiverId : info.callerId;

        emitTo(otherId, "call:ended", { from: userId });

        delete activeCalls[callId];
      } catch {}
    }

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
