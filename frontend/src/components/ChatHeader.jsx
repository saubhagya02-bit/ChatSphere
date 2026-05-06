import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "./Avatar";

function ChatHeader() {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser?._id);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSelectedUser]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg2)",
        flexShrink: 0,
      }}
    >
      <Avatar
        name={selectedUser?.fullName}
        src={selectedUser?.profilePic}
        size={40}
        showDot
        isOnline={isOnline}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ fontSize: "15px", fontWeight: 600, color: "var(--text1)" }}
        >
          {selectedUser?.fullName}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: isOnline ? "var(--online)" : "var(--text3)",
            marginTop: "1px",
          }}
        >
          {isOnline ? "● Online now" : "Offline"}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "4px" }}>
        <button
          className="icon-btn"
          title="Close (Esc)"
          onClick={() => setSelectedUser(null)}
        >
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
