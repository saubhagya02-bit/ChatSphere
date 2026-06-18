import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "./Avatar";
import ProfileModal from "./ProfileModal";
import ConfirmModal from "./ConfirmModal";

function ChatHeader() {
  const {
    selectedUser,
    setSelectedUser,
    toggleSearch,
    blockContact,
    unblockContact,
    clearChat,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser?._id);

  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "block" | "clear" | null
  const menuRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showMenu) setShowMenu(false);
      else setSelectedUser(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSelectedUser, showMenu]);

  useEffect(() => {
    if (!showMenu) return;
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showMenu]);

  const handleSearchChat = () => {
    setShowMenu(false);
    toggleSearch();
  };

  const handleViewProfile = () => {
    setShowMenu(false);
    setShowProfile(true);
  };

  const handleBlockClick = () => {
    setShowMenu(false);
    setShowProfile(false);
    setConfirmAction("block");
  };

  const handleClearClick = () => {
    setShowMenu(false);
    setConfirmAction("clear");
  };

  const confirmBlockOrUnblock = async () => {
    if (selectedUser.isBlocked) await unblockContact(selectedUser._id);
    else await blockContact(selectedUser._id);
    setConfirmAction(null);
  };

  const confirmClear = async () => {
    await clearChat(selectedUser._id);
    setConfirmAction(null);
  };

  return (
    <>
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

        <div
          style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
          onClick={handleViewProfile}
        >
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
            {selectedUser?.isBlocked
              ? "🚫 Blocked"
              : isOnline
                ? "● Online now"
                : "Offline"}
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{ display: "flex", gap: "4px", position: "relative" }}
          ref={menuRef}
        >
          <button
            className="icon-btn"
            title="Search in chat"
            onClick={handleSearchChat}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          <button
            className="icon-btn"
            title="More options"
            onClick={() => setShowMenu((v) => !v)}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.8" style={{ fill: "var(--text2)" }} />
              <circle
                cx="12"
                cy="12"
                r="1.8"
                style={{ fill: "var(--text2)" }}
              />
              <circle
                cx="12"
                cy="19"
                r="1.8"
                style={{ fill: "var(--text2)" }}
              />
            </svg>
          </button>

          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                minWidth: "200px",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                boxShadow: "0 12px 28px rgba(0,0,0,.35)",
                padding: "6px",
                zIndex: 20,
              }}
            >
              <MenuItem label="View profile" onClick={handleViewProfile} />
              <MenuItem label="Search chat" onClick={handleSearchChat} />
              <MenuItem
                label={
                  selectedUser?.isBlocked ? "Unblock contact" : "Block contact"
                }
                danger={!selectedUser?.isBlocked}
                onClick={handleBlockClick}
              />
              <MenuItem label="Clear chat" danger onClick={handleClearClick} />
            </div>
          )}

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

      {showProfile && (
        <ProfileModal
          user={selectedUser}
          isOnline={isOnline}
          onClose={() => setShowProfile(false)}
          onBlockToggle={handleBlockClick}
        />
      )}

      {confirmAction === "block" && (
        <ConfirmModal
          title={
            selectedUser?.isBlocked ? "Unblock contact?" : "Block contact?"
          }
          message={
            selectedUser?.isBlocked
              ? `${selectedUser?.fullName} will be able to message you again.`
              : `${selectedUser?.fullName} won't be able to send you messages. They won't be notified.`
          }
          confirmLabel={selectedUser?.isBlocked ? "Unblock" : "Block"}
          danger={!selectedUser?.isBlocked}
          onConfirm={confirmBlockOrUnblock}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {confirmAction === "clear" && (
        <ConfirmModal
          title="Clear this chat?"
          message="All messages in this conversation will be permanently deleted. This cannot be undone."
          confirmLabel="Clear chat"
          danger
          onConfirm={confirmClear}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}

function MenuItem({ label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "9px 12px",
        borderRadius: "8px",
        background: "transparent",
        border: "none",
        fontSize: "13px",
        color: danger ? "var(--red)" : "var(--text1)",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg4)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {label}
    </button>
  );
}

export default ChatHeader;
