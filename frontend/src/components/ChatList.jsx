import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "./Avatar";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function ChatList({ search = "" }) {
  const {
    chats,
    getMyChatPartner,
    setSelectedUser,
    selectedUser,
    isUsersLoading,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartner();
  }, [getMyChatPartner]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  const filtered = chats.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  if (filtered.length === 0) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "10px" }}>💬</div>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text2)",
            marginBottom: "8px",
          }}
        >
          No conversations yet
        </p>
        <p style={{ fontSize: "12px", color: "var(--text3)" }}>
          Switch to Contacts to start chatting
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {filtered.map((chat) => {
        const isSelected = selectedUser?._id === chat._id;
        const isOnline = onlineUsers.includes(chat._id);
        return (
          <div
            key={chat._id}
            onClick={() => setSelectedUser(chat)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 10px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "background .15s",
              background: isSelected ? "var(--accent-dim)" : "transparent",
              border: isSelected
                ? "1px solid rgba(0,229,160,.15)"
                : "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = "var(--bg3)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = "transparent";
            }}
          >
            <Avatar
              name={chat.fullName}
              src={chat.profilePic}
              size={44}
              showDot
              isOnline={isOnline}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text1)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    flex: 1,
                  }}
                >
                  {chat.fullName}
                </span>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: isOnline ? "var(--online)" : "var(--text3)",
                }}
              >
                {isOnline ? "Online" : "Offline"}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ChatList;
