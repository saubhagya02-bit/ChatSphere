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

  isSearchOpen: false,
  searchQuery: "",

  // Call history
  callHistory: [],
  isCallHistoryLoading: false,

  fetchCallHistory: async () => {
    set({ isCallHistoryLoading: true });
    try {
      const res = await axiosInstance.get("/calls/history");
      set({ callHistory: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load call history");
    } finally {
      set({ isCallHistoryLoading: false });
    }
  },

  toggleSound: () => {
    const next = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(next));
    set({ isSoundEnabled: next });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  toggleSearch: () =>
    set((s) => ({
      isSearchOpen: !s.isSearchOpen,
      searchQuery: s.isSearchOpen ? "" : s.searchQuery,
    })),

  closeSearch: () => set({ isSearchOpen: false, searchQuery: "" }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  setSelectedUser: (user) => {
    if (!user) {
      set({ selectedUser: null, isSearchOpen: false, searchQuery: "" });
      return;
    }
    const socket = useAuthStore.getState().socket;
    if (socket) socket.emit("msg:seen", { senderId: user._id });
    set((state) => {
      const updated = { ...state.unreadMessages };
      delete updated[user._id];
      return {
        selectedUser: user,
        unreadMessages: updated,
        isSearchOpen: false,
        searchQuery: "",
      };
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

  blockContact: async (userId) => {
    try {
      await axiosInstance.put(`/messages/block/${userId}`);
      set((s) => ({
        selectedUser:
          s.selectedUser?._id === userId
            ? { ...s.selectedUser, isBlocked: true }
            : s.selectedUser,
        allContacts: s.allContacts.map((c) =>
          c._id === userId ? { ...c, isBlocked: true } : c,
        ),
        chats: s.chats.map((c) =>
          c._id === userId ? { ...c, isBlocked: true } : c,
        ),
      }));
      toast.success("Contact blocked");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to block contact");
    }
  },

  unblockContact: async (userId) => {
    try {
      await axiosInstance.put(`/messages/unblock/${userId}`);
      set((s) => ({
        selectedUser:
          s.selectedUser?._id === userId
            ? { ...s.selectedUser, isBlocked: false }
            : s.selectedUser,
        allContacts: s.allContacts.map((c) =>
          c._id === userId ? { ...c, isBlocked: false } : c,
        ),
        chats: s.chats.map((c) =>
          c._id === userId ? { ...c, isBlocked: false } : c,
        ),
      }));
      toast.success("Contact unblocked");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unblock contact");
    }
  },

  clearChat: async (userId) => {
    try {
      await axiosInstance.delete(`/messages/clear/${userId}`);
      set((s) => ({
        messages: s.selectedUser?._id === userId ? [] : s.messages,
        lastMessages: { ...s.lastMessages, [userId]: "" },
      }));
      toast.success("Chat cleared");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear chat");
    }
  },

  subscribeToMessage: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (msg) => {
      const { selectedUser, isSoundEnabled } = get();

      const isFromSelectedUser = sameId(msg.senderId, selectedUser?._id);
      const isToSelectedUser = sameId(msg.receiverId, selectedUser?._id);

      const already = get().messages.some((m) => sameId(m._id, msg._id));
      if (already) return;

      if (isFromSelectedUser || isToSelectedUser) {
        set((s) => ({ messages: [...s.messages, msg] }));

        if (isFromSelectedUser) {
          const socket = useAuthStore.getState().socket;
          if (socket) socket.emit("msg:seen", { senderId: msg.senderId });
        }
      }

      const previewText = msg.image ? "📷 Photo" : msg.text || "";
      set((s) => ({
        lastMessages: {
          ...s.lastMessages,
          [msg.senderId]: previewText,
        },
        chats: (() => {
          const chats = [...s.chats];
          const idx = chats.findIndex((c) => sameId(c._id, msg.senderId));
          if (idx > 0) {
            chats.unshift(chats.splice(idx, 1)[0]);
          }
          return chats;
        })(),
      }));

      if (!isFromSelectedUser) {
        set((s) => ({
          unreadMessages: {
            ...s.unreadMessages,
            [msg.senderId]: (s.unreadMessages[msg.senderId] || 0) + 1,
          },
        }));
      }

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
