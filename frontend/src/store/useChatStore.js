import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const sameId = (a, b) => a?.toString() === b?.toString();

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) !== false,

  unreadMessages: {},

  lastMessages: {},

  typingUsers: new Set(),

  toggleSound: () => {
    const next = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(next));
    set({ isSoundEnabled: next });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (user) => {
    if (!user) {
      set({ selectedUser: null });
      return;
    }

    const socket = useAuthStore.getState().socket;
    if (socket) socket.emit("msg:seen", { senderId: user._id });

    set((state) => {
      const updated = { ...state.unreadMessages };
      delete updated[user._id];
      return { selectedUser: user, unreadMessages: updated };
    });
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartner: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      const socket = useAuthStore.getState().socket;
      if (socket) socket.emit("msg:seen", { senderId: userId });

      // Set last message preview from history
      if (res.data.length > 0) {
        const last = res.data[res.data.length - 1];
        set((s) => ({
          lastMessages: {
            ...s.lastMessages,
            [userId]: last.image ? "📷 Photo" : last.text || "",
          },
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      senderId: authUser._id.toString(),
      receiverId: selectedUser._id.toString(),
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    set({ messages: [...messages, optimistic] });

    // Update last message preview immediately
    set((s) => ({
      lastMessages: {
        ...s.lastMessages,
        [selectedUser._id]: messageData.image
          ? "📷 Photo"
          : messageData.text || "",
      },
    }));

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set((s) => ({
        messages: s.messages.map((m) => (m._id === tempId ? res.data : m)),
      }));

      // Move this chat to top of list
      set((s) => {
        const chats = [...s.chats];
        const idx = chats.findIndex((c) => sameId(c._id, selectedUser._id));
        if (idx > 0) {
          chats.unshift(chats.splice(idx, 1)[0]);
        }
        return { chats };
      });
    } catch (err) {
      set({ messages });
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessage: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // New message
    socket.on("newMessage", (msg) => {
      const { selectedUser, isSoundEnabled } = get();

      const isFromSelectedUser = sameId(msg.senderId, selectedUser?._id);
      const isToSelectedUser = sameId(msg.receiverId, selectedUser?._id);

      const already = get().messages.some((m) => sameId(m._id, msg._id));
      if (already) return;

      // Append to messages only if this conversation is open
      if (isFromSelectedUser || isToSelectedUser) {
        set((s) => ({ messages: [...s.messages, msg] }));

        /*If the message is FROM the other person and we have their chat open,
        immediately mark it as seen */ if (isFromSelectedUser) {
          const socket = useAuthStore.getState().socket;
          if (socket) socket.emit("msg:seen", { senderId: msg.senderId });
        }
      }

      // Update last message preview for the sender's row in the sidebar
      const previewText = msg.image ? "📷 Photo" : msg.text || "";
      set((s) => ({
        lastMessages: {
          ...s.lastMessages,
          [msg.senderId]: previewText,
        },
        //move the sender to the top
        chats: (() => {
          const chats = [...s.chats];
          const idx = chats.findIndex((c) => sameId(c._id, msg.senderId));
          if (idx > 0) {
            chats.unshift(chats.splice(idx, 1)[0]);
          }
          return chats;
        })(),
      }));

      // Unread count — only if this conversation is NOT open
      if (!isFromSelectedUser) {
        set((s) => ({
          unreadMessages: {
            ...s.unreadMessages,
            [msg.senderId]: (s.unreadMessages[msg.senderId] || 0) + 1,
          },
        }));
      }

      // Sound — only for messages from the other person
      if (isFromSelectedUser && isSoundEnabled) {
        const snd = new Audio("/sounds/msgSound.mp3");
        snd.volume = 0.6;
        snd.play().catch(() => {});
      }
    });

    socket.on("msg:seen", ({ by, at }) => {
      set((s) => ({
        messages: s.messages.map((m) =>
          m.senderId?.toString() ===
            useAuthStore.getState().authUser?._id?.toString() &&
          m.receiverId?.toString() === by?.toString() &&
          !m.seenAt
            ? { ...m, seenAt: at }
            : m,
        ),
      }));
    });
    socket.on("typing", ({ senderId }) => {
      set((s) => {
        const next = new Set(s.typingUsers);
        next.add(senderId);
        return { typingUsers: next };
      });
    });

    socket.on("stopTyping", ({ senderId }) => {
      set((s) => {
        const next = new Set(s.typingUsers);
        next.delete(senderId);
        return { typingUsers: next };
      });
    });
  },

  unsubscribeFromMessage: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("msg:seen");
    socket?.off("typing");
    socket?.off("stopTyping");
  },

  emitTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });
    }
  },

  emitStopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  },
}));
