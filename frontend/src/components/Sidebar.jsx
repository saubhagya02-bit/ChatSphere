import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import Avatar from "./Avatar";
import ChatList from "./ChatList";
import ContactList from "./ContactList";
import useKeyboardSound from "../hooks/useKeyboardSound";

function Sidebar() {
  const { authUser, logout, uploadProfile } = useAuthStore();
  const { activeTab, setActiveTab, isSoundEnabled, toggleSound } =
    useChatStore();
  const { playClick } = useKeyboardSound();
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        await uploadProfile({ profilePic: reader.result });
        setUploading(false);
      };
    };
    input.click();
  };

  return (
    <aside
      style={{
        width: "320px",
        flexShrink: 0,
        background: "var(--sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          {/* Clickable avatar for profile upload */}
          <div
            style={{ position: "relative", cursor: "pointer" }}
            onClick={handleAvatarClick}
            title="Change photo"
          >
            <Avatar
              name={authUser?.fullName}
              src={authUser?.profilePic}
              size={40}
              showDot
              isOnline
            />
            {uploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ animation: "spin .7s linear infinite" }}
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text1)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {authUser?.fullName}
            </div>
            <div style={{ fontSize: "11px", color: "var(--online)" }}>
              ● Online
            </div>
          </div>

          {/* Actions */}
          <button
            className="icon-btn"
            title={isSoundEnabled ? "Mute sounds" : "Unmute sounds"}
            onClick={() => {
              playClick();
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <svg viewBox="0 0 24 24">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </button>

          <button className="icon-btn" title="Logout" onClick={logout}>
            <svg viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text3)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              position: "absolute",
              left: "11px",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            style={{
              width: "100%",
              background: "var(--bg3)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "9px 12px 9px 34px",
              fontSize: "13px",
              color: "var(--text1)",
              outline: "none",
              transition: "border-color .2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,160,.3)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "6px",
          padding: "12px 16px 8px",
          flexShrink: 0,
        }}
      >
        {["chats", "contacts"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "6px 18px",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              border: "1px solid transparent",
              transition: "all .2s",
              background: activeTab === t ? "var(--accent-dim)" : "var(--bg3)",
              color: activeTab === t ? "var(--accent)" : "var(--text2)",
              borderColor:
                activeTab === t ? "rgba(0,229,160,.2)" : "transparent",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
        {activeTab === "chats" ? (
          <ChatList search={search} />
        ) : (
          <ContactList search={search} />
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </aside>
  );
}

export default Sidebar;
