import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { formatMessageTime, avatarColor, initials } from "../lib/utils";
import useKeyboardSound from "../hooks/useKeyboardSound";
import toast from "react-hot-toast";

const S = {
  sidebar: "#111318",
  sideHdr: "#13161e",
  mainBg: "#0e1117",
  chatBg: "#0e1117",
  bg3: "#1a1f2b",
  bg4: "#222736",
  border: "rgba(255,255,255,0.06)",
  accent: "#00e5a0",
  accent2: "#00c589",
  accentDim: "rgba(0,229,160,0.10)",
  sent: "#1a4731",
  sentBorder: "rgba(0,229,160,0.25)",
  recv: "#0f3324",
  recvBorder: "rgba(0,229,160,0.15)",
  text1: "#e8edf8",
  text2: "#7d8799",
  text3: "#444d5e",
  online: "#00e5a0",
  red: "#ff5c6a",
};

//AVATAR

const AV_COLORS = [
  { bg: "rgba(0,229,160,.14)", fg: "#00e5a0" },
  { bg: "rgba(96,165,250,.14)", fg: "#60a5fa" },
  { bg: "rgba(167,139,250,.14)", fg: "#a78bfa" },
  { bg: "rgba(251,146,60,.14)", fg: "#fb923c" },
  { bg: "rgba(244,114,182,.14)", fg: "#f472b6" },
  { bg: "rgba(251,191,36,.14)", fg: "#fbbf24" },
];

function getAVColor(name = "") {
  let h = 0;
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h);
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}

function Avatar({ name = "", src, size = 40, online, dot }) {
  const av = getAVColor(name);
  const ini = initials(name);
  const dsz = Math.round(size * 0.28);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: av.bg,
        color: av.fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.38),
        fontWeight: 700,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          onError={(e) => (e.target.style.display = "none")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      ) : (
        ini || "?"
      )}
      {dot && (
        <span
          style={{
            position: "absolute",
            bottom: size > 32 ? 1 : 0,
            right: size > 32 ? 1 : 0,
            width: dsz,
            height: dsz,
            borderRadius: "50%",
            background: online ? S.online : S.text3,
            border: `2px solid ${S.sidebar}`,
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

const pulse = `@keyframes _p{0%,100%{opacity:.25}50%{opacity:.75}}`;

function SkeletonUserList() {
  return (
    <>
      <style>{pulse}</style>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "11px 12px",
            animation: `_p 1.5s ${i * 0.12}s ease infinite`,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: S.bg3,
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: 13,
                background: S.bg3,
                borderRadius: 6,
                width: "55%",
                marginBottom: 7,
              }}
            />
            <div
              style={{
                height: 10,
                background: S.bg4,
                borderRadius: 6,
                width: "38%",
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
}

function SkeletonMessages() {
  return (
    <>
      <style>{pulse}</style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingTop: 8,
        }}
      >
        {[120, 200, 90, 160, 110, 220, 80].map((w, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: i % 2 === 0 ? "row" : "row-reverse",
              alignItems: "flex-end",
              gap: 8,
              alignSelf: i % 2 === 0 ? "flex-start" : "flex-end",
              animation: `_p 1.5s ${i * 0.1}s ease infinite`,
            }}
          >
            {i % 2 === 0 && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: S.bg3,
                  flexShrink: 0,
                }}
              />
            )}
            <div
              style={{
                height: 40,
                width: w,
                borderRadius: 16,
                background: S.bg3,
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

//TYPING DOTS
function TypingDots() {
  return (
    <>
      <style>{`@keyframes _td{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 0",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: S.accent,
              display: "inline-block",
              animation: `_td 1.2s ${i * 0.2}s ease infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}

//USER ROW
function UserRow({ user, selected, online, showMsgBtn, onClick, onMessage }) {
  const { unreadMessages, lastMessages, typingUsers } = useChatStore();
  const unread = unreadMessages[user._id] || 0;
  const hasUnread = unread > 0;
  const lastMsg = lastMessages[user._id] || "";
  const isTyping = typingUsers.has(user._id);

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "10px 10px",
        borderRadius: 14,
        cursor: "pointer",
        transition: "background .15s",
        background: selected
          ? "linear-gradient(135deg, rgba(0,229,160,.13) 0%, rgba(0,229,160,.06) 100%)"
          : "transparent",
        border: selected
          ? "1px solid rgba(0,229,160,.2)"
          : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = S.bg3;
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Avatar with unread dot overlay */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar
          name={user.fullName}
          src={user.profilePic}
          size={46}
          online={online}
          dot
        />
        {hasUnread && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: S.accent,
              border: `2px solid ${S.sidebar}`,
              boxSizing: "border-box",
              boxShadow: `0 0 6px ${S.accent}`,
            }}
          />
        )}
      </div>

      {/* Name + last message / typing */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: hasUnread ? 700 : 600,
            color: selected ? S.accent : S.text1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 3,
          }}
        >
          {user.fullName}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {isTyping ? (
            <TypingDots />
          ) : lastMsg ? (
            <span
              style={{
                fontSize: 12,
                color: hasUnread ? S.text2 : S.text3,
                fontWeight: hasUnread ? 600 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 140,
              }}
            >
              {lastMsg}
            </span>
          ) : (
            <span
              style={{
                fontSize: 12,
                color: online ? S.online : S.text3,
                fontWeight: online ? 500 : 400,
              }}
            >
              {online ? "● Online" : "Offline"}
            </span>
          )}
        </div>
      </div>

      {/* Unread badge */}
      {hasUnread && (
        <div
          style={{
            minWidth: 20,
            height: 20,
            borderRadius: 12,
            background: S.accent,
            color: "#000",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 6px",
            flexShrink: 0,
            boxShadow: `0 0 8px ${S.accent}50`,
          }}
        >
          {unread > 99 ? "99+" : unread}
        </div>
      )}

      {/* Message button */}
      {showMsgBtn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMessage();
          }}
          style={{
            padding: "5px 13px",
            borderRadius: 100,
            fontSize: 12,
            fontWeight: 600,
            background: S.accentDim,
            border: `1px solid rgba(0,229,160,.25)`,
            color: S.accent,
            cursor: "pointer",
            flexShrink: 0,
            fontFamily: "inherit",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,229,160,.22)";
            e.currentTarget.style.transform = "scale(1.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = S.accentDim;
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Message
        </button>
      )}
    </div>
  );
}

function EmptyList({ tab, onSwitch }) {
  return (
    <div style={{ padding: "40px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>
        {tab === "chats" ? "💬" : "👥"}
      </div>
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: S.text1,
          margin: "0 0 6px",
        }}
      >
        {tab === "chats" ? "No conversations yet" : "No contacts found"}
      </p>
      <p style={{ fontSize: 12, color: S.text3, margin: 0 }}>
        {tab === "chats"
          ? "Go to Contacts to start a new chat"
          : "Nobody to show here"}
      </p>
      {tab === "chats" && (
        <button
          onClick={onSwitch}
          style={{
            marginTop: 16,
            padding: "8px 20px",
            borderRadius: 100,
            background: S.accent,
            border: "none",
            color: "#000",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Find contacts
        </button>
      )}
    </div>
  );
}

//SIDEBAR
function Sidebar({ search, setSearch }) {
  const { authUser, logout, uploadProfile, onlineUsers } = useAuthStore();
  const {
    activeTab,
    setActiveTab,
    isSoundEnabled,
    toggleSound,
    chats,
    allContacts,
    setSelectedUser,
    selectedUser,
    isUsersLoading,
    getMyChatPartner,
    getAllContacts,
  } = useChatStore();
  const { playClick } = useKeyboardSound();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeTab === "chats") getMyChatPartner();
    else getAllContacts();
  }, [activeTab]);

  const handlePhotoUpload = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = async (e) => {
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
    inp.click();
  };

  const list = activeTab === "chats" ? chats : allContacts;
  const filtered = list.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside
      style={{
        width: 300,
        flexShrink: 0,
        background: S.sidebar,
        borderRight: `1px solid ${S.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: S.sideHdr,
          borderBottom: `1px solid ${S.border}`,
          padding: "14px 16px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}
            onClick={handlePhotoUpload}
            title="Change photo"
          >
            <Avatar
              name={authUser?.fullName}
              src={authUser?.profilePic}
              size={42}
              online
              dot
            />
            {uploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SpinnerSVG size={14} color="white" />
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: S.text1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {authUser?.fullName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: S.online,
                marginTop: 2,
                fontWeight: 500,
              }}
            >
              ● Online
            </div>
          </div>

          <HdrBtn
            onClick={() => {
              playClick();
              toggleSound();
            }}
            title={isSoundEnabled ? "Mute" : "Unmute"}
          >
            {isSoundEnabled ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={S.text2}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={S.text2}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
          </HdrBtn>
          <HdrBtn onClick={logout} title="Logout">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={S.text2}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </HdrBtn>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: "10px 12px 6px", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={S.text3}
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            autoComplete="off"
            style={{
              width: "100%",
              background: S.bg3,
              border: `1px solid ${S.border}`,
              borderRadius: 24,
              padding: "9px 14px 9px 34px",
              fontSize: 13,
              color: S.text1,
              outline: "none",
              fontFamily: "inherit",
              transition: "border-color .2s, box-shadow .2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(0,229,160,.35)";
              e.target.style.boxShadow = "0 0 0 3px rgba(0,229,160,.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = S.border;
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "8px 12px 10px",
          flexShrink: 0,
        }}
      >
        {["chats", "contacts"].map((t) => {
          const on = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                flex: 1,
                padding: "7px 0",
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: on ? "none" : `1px solid ${S.border}`,
                transition: "all .2s",
                fontFamily: "inherit",
                background: on ? S.accent : "transparent",
                color: on ? "#000" : S.text2,
              }}
            >
              {t === "chats" ? "Chats" : "Contacts"}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 6px 8px" }}>
        {isUsersLoading ? (
          <SkeletonUserList />
        ) : filtered.length === 0 ? (
          <EmptyList
            tab={activeTab}
            onSwitch={() => setActiveTab("contacts")}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {filtered.map((user) => (
              <UserRow
                key={user._id}
                user={user}
                selected={selectedUser?._id === user._id}
                online={onlineUsers.includes(user._id)}
                showMsgBtn={activeTab === "contacts"}
                onClick={() => setSelectedUser(user)}
                onMessage={() => {
                  setSelectedUser(user);
                  setActiveTab("chats");
                }}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function HdrBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        width: 32,
        height: 32,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "background .15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = S.bg3)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}

//MESSAGE INPUT
function MessageInput() {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const fileRef = useRef(null);
  const typingTimer = useRef(null);
  const { sendMessage, emitTyping, emitStopTyping } = useChatStore();
  const { playClick, playMessageSent } = useKeyboardSound();
  const MAX = 200;

  const doSend = async () => {
    if (!text.trim() && !img) return;
    clearTimeout(typingTimer.current);
    emitStopTyping();
    playClick();
    await sendMessage({ text: text.trim(), image: img });
    playMessageSent();
    setText("");
    setImg(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  const onType = (e) => {
    setText(e.target.value);
    emitTyping();
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitStopTyping(), 1500);
  };

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Images only");
      return;
    }
    const r = new FileReader();
    r.onloadend = () => setImg(r.result);
    r.readAsDataURL(f);
  };

  const can = !!(text.trim() || img);
  const near = text.length > 160;

  return (
    <div
      style={{
        padding: "12px 16px 16px",
        borderTop: `1px solid ${S.border}`,
        background: S.chatBg,
        flexShrink: 0,
      }}
    >
      {img && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={img}
              alt="preview"
              style={{
                width: 70,
                height: 70,
                objectFit: "cover",
                borderRadius: 10,
                border: `1px solid ${S.border}`,
                display: "block",
              }}
            />
            <button
              onClick={() => {
                setImg(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              style={{
                position: "absolute",
                top: -8,
                right: -8,
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: S.bg4,
                border: `1px solid ${S.border}`,
                color: S.text1,
                cursor: "pointer",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: S.bg3,
          borderRadius: 16,
          border: `1px solid ${S.border}`,
          padding: "8px 8px 8px 16px",
          transition: "border-color .2s, box-shadow .2s",
        }}
        onFocusCapture={(e) => {
          if (e.target.tagName === "INPUT") {
            e.currentTarget.style.borderColor = "rgba(0,229,160,.3)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,229,160,.06)";
          }
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = S.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Attach */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            padding: 2,
            borderRadius: 8,
            transition: "transform .15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.15)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={img ? S.accent : S.text2}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        {/* Input */}
        <div style={{ flex: 1, position: "relative" }}>
          <input
            value={text}
            onChange={onType}
            onKeyDown={onKey}
            maxLength={MAX}
            placeholder="Type a message…"
            autoComplete="off"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              fontSize: 14,
              color: S.text1,
              outline: "none",
              fontFamily: "inherit",
              paddingRight: near ? 48 : 0,
            }}
          />
          {near && (
            <span
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 11,
                color: text.length >= MAX ? S.red : S.text3,
              }}
            >
              {text.length}/{MAX}
            </span>
          )}
        </div>

        {/* Send */}
        <button
          onClick={doSend}
          disabled={!can}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "none",
            cursor: can ? "pointer" : "not-allowed",
            background: can ? S.accent : S.bg4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all .2s",
            boxShadow: can ? "0 2px 12px rgba(0,229,160,.25)" : "none",
          }}
          onMouseEnter={(e) => {
            if (can) {
              e.currentTarget.style.background = S.accent2;
              e.currentTarget.style.transform = "scale(1.06)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = can ? S.accent : S.bg4;
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={can ? "#000" : S.text3}
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}

//CHAT HEADER  (WhatsApp-style)
function ChatHeader({ selectedUser, isOnline, isTyping, onClose }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [calling, setCalling] = useState(null);
  const { socket, authUser } = useAuthStore();
  const menuRef = useRef(null);
  const searchRef = useRef(null);

  // Emit call:start to receiver when caller opens overlay
  useEffect(() => {
    if (!calling || !socket || !selectedUser) return;
    socket.emit("call:start", {
      to: selectedUser._id,
      type: calling,
      callerName: authUser?.fullName,
      callerPic: authUser?.profilePic,
    });
  }, [calling]);

  useEffect(() => {
    const fn = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searching) searchRef.current?.focus();
  }, [searching]);

  const menuItems = [
    {
      label: "View profile",
      icon: "👤",
      action: () => toast("Profile view coming soon"),
    },
    {
      label: "Search messages",
      icon: "🔍",
      action: () => {
        setSearching(true);
        setMenuOpen(false);
      },
    },
    { label: "Mute notifications", icon: "🔕", action: () => toast("Muted") },
    {
      label: "Clear chat",
      icon: "🗑️",
      action: () => toast("Clear chat coming soon"),
    },
    {
      label: "Block",
      icon: "🚫",
      action: () => toast("Block coming soon"),
      danger: true,
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
          height: 64,
          background: S.sideHdr,
          borderBottom: `1px solid ${S.border}`,
          flexShrink: 0,
          position: "relative",
          boxShadow: "0 2px 12px rgba(0,0,0,.25)",
        }}
      >
        {/* Avatar + info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flex: 1,
            minWidth: 0,
          }}
        >
          <div style={{ position: "relative", cursor: "pointer" }}>
            <Avatar
              name={selectedUser?.fullName}
              src={selectedUser?.profilePic}
              size={42}
              online={isOnline}
              dot
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: S.text1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selectedUser?.fullName}
            </div>
            <div
              style={{
                fontSize: 12,
                marginTop: 1,
                fontWeight: 500,
                color: isTyping ? S.accent : isOnline ? S.online : S.text3,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {isTyping ? (
                <>
                  <TypingDots />
                  <span style={{ marginLeft: 4 }}>typing…</span>
                </>
              ) : isOnline ? (
                "● Online"
              ) : (
                "Offline"
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexShrink: 0,
          }}
        >
          {/* Search toggle */}
          <ChatBtn
            onClick={() => setSearching((v) => !v)}
            active={searching}
            title="Search messages"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </ChatBtn>

          {/* Audio call */}
          <ChatBtn onClick={() => setCalling("audio")} title="Voice call">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </ChatBtn>

          {/* Video call */}
          <ChatBtn onClick={() => setCalling("video")} title="Video call">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </ChatBtn>

          {/* More options */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <ChatBtn
              onClick={() => setMenuOpen((v) => !v)}
              active={menuOpen}
              title="More options"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </ChatBtn>

            {/* Dropdown menu */}
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  background: S.bg3,
                  border: `1px solid ${S.border}`,
                  borderRadius: 14,
                  minWidth: 200,
                  zIndex: 100,
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,.4), 0 2px 8px rgba(0,0,0,.3)",
                  overflow: "hidden",
                  animation: "_fd .15s ease both",
                }}
              >
                <style>{`@keyframes _fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      item.action();
                      setMenuOpen(false);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 16px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                      fontSize: 14,
                      color: item.danger ? S.red : S.text1,
                      borderTop: i > 0 ? `1px solid ${S.border}` : "none",
                      transition: "background .12s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = S.bg4)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ChatBtn onClick={onClose} title="Close (Esc)">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </ChatBtn>
        </div>
      </div>

      {searching && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 16px",
            background: S.bg3,
            borderBottom: `1px solid ${S.border}`,
            animation: "_fd .15s ease both",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke={S.text3}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={searchRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search in conversation…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 13,
              color: S.text1,
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={() => {
              setSearching(false);
              setSearchTerm("");
            }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: S.text3,
              fontSize: 18,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {calling && (
        <CallOverlay
          user={selectedUser}
          type={calling}
          isCaller={true}
          onEnd={() => setCalling(null)}
        />
      )}
    </>
  );
}

function ChatBtn({ onClick, title, active, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? S.accentDim : "transparent",
        color: active ? S.accent : S.text2,
        transition: "all .15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = S.bg3;
          e.currentTarget.style.color = S.text1;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = S.text2;
        }
      }}
    >
      {children}
    </button>
  );
}

//INCOMING CALL BANNER
function IncomingCallBanner({ call, onAccept, onReject }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 300,
        background: S.bg3,
        border: `1px solid ${S.border}`,
        borderRadius: 20,
        padding: "18px 24px",
        minWidth: 320,
        boxShadow: "0 12px 48px rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        animation: "_fd .2s ease both",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          flexShrink: 0,
          animation: "_ring2 1.5s ease infinite",
        }}
      >
        <Avatar name={call.callerName} src={call.callerPic} size={52} />
      </div>
      <style>{`@keyframes _ring2{0%,100%{box-shadow:0 0 0 3px ${S.accent}50}50%{box-shadow:0 0 0 7px ${S.accent}20}}`}</style>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.text1 }}>
          {call.callerName}
        </div>
        <div style={{ fontSize: 12, color: S.text2, marginTop: 2 }}>
          {call.type === "video"
            ? "📹 Incoming video call…"
            : "📞 Incoming voice call…"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {/* Reject */}
        <button
          onClick={onReject}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            background: S.red,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 14px ${S.red}60`,
            transition: "transform .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M23.36 14.6c-.23-.22-5.3-3.8-6.48-3.57-.57.12-1 .56-1.83 1.6-.13.17-.46.54-.7.76a9.67 9.67 0 01-2.15-1.26 9.37 9.37 0 01-1.27-2.14c.23-.25.6-.58.77-.72 1.03-.83 1.47-1.27 1.59-1.84.22-1.18-3.38-6.27-3.6-6.5A2 2 0 008.24.99C6.5.99 1 7.96 1 9.23c0 .08.02 8.65 10.7 13.64C16.1 25 20.7 23 21.6 22.5l.06-.04A2 2 0 0023.36 14.6z" />
          </svg>
        </button>
        {/* Accept */}
        <button
          onClick={onAccept}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "none",
            background: S.accent,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 14px ${S.accent}60`,
            transition: "transform .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
            <path d="M23.36 14.6c-.23-.22-5.3-3.8-6.48-3.57-.57.12-1 .56-1.83 1.6-.13.17-.46.54-.7.76a9.67 9.67 0 01-2.15-1.26 9.37 9.37 0 01-1.27-2.14c.23-.25.6-.58.77-.72 1.03-.83 1.47-1.27 1.59-1.84.22-1.18-3.38-6.27-3.6-6.5A2 2 0 008.24.99C6.5.99 1 7.96 1 9.23c0 .08.02 8.65 10.7 13.64C16.1 25 20.7 23 21.6 22.5l.06-.04A2 2 0 0023.36 14.6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// REAL WebRTC CALL OVERLA
function CallOverlay({ user, type, isCaller, onEnd }) {
  const { socket } = useAuthStore();
  const { selectedUser } = useChatStore();

  // Call state
  const [status, setStatus] = useState(isCaller ? "Calling…" : "Connecting…");
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [speaker, setSpeaker] = useState(true);

  const pcRef = useRef(null);
  const localStream = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const STUN = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (!socket) return;
    let pc;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: type === "video",
        });
        localStream.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        pc = new RTCPeerConnection(STUN);
        pcRef.current = pc;

        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        o;
        pc.ontrack = (e) => {
          if (remoteVideoRef.current)
            remoteVideoRef.current.srcObject = e.streams[0];
        };

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("call:ice-candidate", {
              to: user._id,
              candidate: e.candidate,
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") setStatus("connected");
          if (["disconnected", "failed", "closed"].includes(pc.connectionState))
            hangup();
        };

        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("call:offer", { to: user._id, offer, type });
        }
      } catch (err) {
        console.error("Media error:", err);
        toast.error("Could not access camera/microphone");
        onEnd();
      }
    };

    init();

    const onAnswer = async ({ answer }) => {
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const onIce = async ({ candidate }) => {
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {}
    };

    const onOffer = async ({ offer, from }) => {
      if (!pc || isCaller) return;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call:answer", { to: from, answer });
    };

    const onHangup = () => hangup(false);

    socket.on("call:answer", onAnswer);
    socket.on("call:ice-candidate", onIce);
    socket.on("call:offer", onOffer);
    socket.on("call:ended", onHangup);

    return () => {
      socket.off("call:answer", onAnswer);
      socket.off("call:ice-candidate", onIce);
      socket.off("call:offer", onOffer);
      socket.off("call:ended", onHangup);
      hangup(false);
    };
  }, [socket]);

  useEffect(() => {
    if (status !== "connected") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const hangup = (notify = true) => {
    if (notify && socket) socket.emit("call:end", { to: user._id });
    localStream.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    onEnd();
  };

  const toggleMute = () => {
    localStream.current?.getAudioTracks().forEach((t) => (t.enabled = muted));
    setMuted((v) => !v);
  };

  const toggleCam = () => {
    localStream.current?.getVideoTracks().forEach((t) => (t.enabled = camOff));
    setCamOff((v) => !v);
  };

  const isVideo = type === "video";
  const isConnected = status === "connected";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: isVideo ? "#000" : "rgba(10,14,20,.96)",
        backdropFilter: isVideo ? "none" : "blur(16px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: "_fd .2s ease both",
      }}
    >
      {/* Video streams */}
      {isVideo && (
        <>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
            }}
          />

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: "absolute",
              bottom: 100,
              right: 20,
              width: 160,
              height: 100,
              borderRadius: 12,
              objectFit: "cover",
              zIndex: 2,
              border: `2px solid ${S.border}`,
              boxShadow: "0 4px 20px rgba(0,0,0,.6)",
            }}
          />
        </>
      )}

      {!isVideo && <audio ref={remoteVideoRef} autoPlay />}

      <div
        style={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          display: isVideo && isConnected ? "none" : "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            animation: "_ring 2s ease infinite",
          }}
        >
          <Avatar name={user?.fullName} src={user?.profilePic} size={120} />
        </div>
        <style>{`@keyframes _ring{0%,100%{box-shadow:0 0 0 4px ${S.accent}40,0 0 0 10px ${S.accent}18}50%{box-shadow:0 0 0 8px ${S.accent}30,0 0 0 18px ${S.accent}08}}`}</style>

        <div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: S.text1,
              marginBottom: 6,
            }}
          >
            {user?.fullName}
          </div>
          <div
            style={{
              fontSize: 14,
              color: isConnected ? S.accent : S.text2,
              fontWeight: 500,
            }}
          >
            {isConnected ? fmt(elapsed) : status}
          </div>
          <div style={{ fontSize: 12, color: S.text3, marginTop: 4 }}>
            {isVideo ? "📹 Video call" : "📞 Voice call"}
          </div>
        </div>
      </div>

      {isVideo && isConnected && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 3,
            background: "rgba(0,0,0,.5)",
            backdropFilter: "blur(8px)",
            borderRadius: 100,
            padding: "6px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: S.accent,
              boxShadow: `0 0 6px ${S.accent}`,
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>
            {fmt(elapsed)}
          </span>
        </div>
      )}

      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(0,0,0,.55)",
          backdropFilter: "blur(12px)",
          borderRadius: 24,
          padding: "12px 20px",
          border: `1px solid rgba(255,255,255,.08)`,
        }}
      >
        {/* Mute */}
        <CallCtrlBtn
          active={muted}
          onClick={toggleMute}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
              <path d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
            </svg>
          )}
          <span style={{ fontSize: 11, marginTop: 3 }}>
            {muted ? "Unmute" : "Mute"}
          </span>
        </CallCtrlBtn>

        {/* Speaker*/}
        {!isVideo && (
          <CallCtrlBtn
            active={!speaker}
            onClick={() => setSpeaker((v) => !v)}
            title="Speaker"
          >
            {speaker ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            )}
            <span style={{ fontSize: 11, marginTop: 3 }}>Speaker</span>
          </CallCtrlBtn>
        )}

        {/* Camera */}
        {isVideo && (
          <CallCtrlBtn
            active={camOff}
            onClick={toggleCam}
            title={camOff ? "Turn on camera" : "Turn off camera"}
          >
            {camOff ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M21 21H3a2 2 0 01-2-2V8a2 2 0 012-2h3m3-3h6l2 3h3a2 2 0 012 2v9.34" />
                <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            )}
            <span style={{ fontSize: 11, marginTop: 3 }}>
              {camOff ? "Camera off" : "Camera"}
            </span>
          </CallCtrlBtn>
        )}

        {/* End call */}
        <button
          onClick={() => hangup(true)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            width: 64,
            height: 64,
            borderRadius: "50%",
            border: "none",
            background: S.red,
            cursor: "pointer",
            color: "white",
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "inherit",
            boxShadow: `0 4px 20px ${S.red}70`,
            transition: "transform .15s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.08)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M23.36 14.6c-.23-.22-5.3-3.8-6.48-3.57-.57.12-1 .56-1.83 1.6-.13.17-.46.54-.7.76a9.67 9.67 0 01-2.15-1.26 9.37 9.37 0 01-1.27-2.14c.23-.25.6-.58.77-.72 1.03-.83 1.47-1.27 1.59-1.84.22-1.18-3.38-6.27-3.6-6.5A2 2 0 008.24.99C6.5.99 1 7.96 1 9.23c0 .08.02 8.65 10.7 13.64C16.1 25 20.7 23 21.6 22.5l.06-.04A2 2 0 0023.36 14.6z" />
          </svg>
          End
        </button>
      </div>
    </div>
  );
}

function CallCtrlBtn({ onClick, active, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: active ? S.accentDim : "rgba(255,255,255,.08)",
        color: active ? S.accent : "white",
        fontFamily: "inherit",
        transition: "all .15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = active
          ? S.accentDim
          : "rgba(255,255,255,.15)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = active
          ? S.accentDim
          : "rgba(255,255,255,.08)")
      }
    >
      {children}
    </button>
  );
}

function CallManager() {
  const { socket, authUser } = useAuthStore();
  const [incoming, setIncoming] = useState(null);
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const onIncoming = ({ from, callerName, callerPic, type, offer }) => {
      setIncoming({ callerId: from, callerName, callerPic, type, offer });
    };

    const onEnded = () => {
      setIncoming(null);
      setActive(null);
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:ended", onEnded);
    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:ended", onEnded);
    };
  }, [socket]);

  const acceptCall = () => {
    if (!incoming) return;

    socket.emit("call:accept", { to: incoming.callerId });
    setActive({
      user: {
        _id: incoming.callerId,
        fullName: incoming.callerName,
        profilePic: incoming.callerPic,
      },
      type: incoming.type,
      isCaller: false,
      offer: incoming.offer,
    });
    setIncoming(null);
  };

  const rejectCall = () => {
    if (incoming) socket.emit("call:reject", { to: incoming.callerId });
    setIncoming(null);
  };

  return (
    <>
      {incoming && !active && (
        <IncomingCallBanner
          call={incoming}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}
      {active && (
        <CallOverlay
          user={active.user}
          type={active.type}
          isCaller={active.isCaller}
          onEnd={() => setActive(null)}
        />
      )}
    </>
  );
}

//CHAT AREA
function ChatArea() {
  const {
    selectedUser,
    setSelectedUser,
    messages,
    isMessagesLoading,
    getMessagesByUserId,
    subscribeToMessage,
    unsubscribeFromMessage,
    typingUsers,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const bottomRef = useRef(null);
  const isOnline = onlineUsers.includes(selectedUser?._id);
  const isTyping = typingUsers.has(selectedUser?._id);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessage();
    return () => unsubscribeFromMessage();
  }, [selectedUser._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") setSelectedUser(null);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ChatHeader
        selectedUser={selectedUser}
        isOnline={isOnline}
        isTyping={isTyping}
        onClose={() => setSelectedUser(null)}
      />

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          background: `radial-gradient(ellipse at top left, rgba(0,229,160,.03) 0%, transparent 60%), ${S.chatBg}`,
        }}
      >
        {isMessagesLoading ? (
          <SkeletonMessages />
        ) : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 12,
              margin: "auto 0",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "rgba(0,229,160,.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
              }}
            >
              👋
            </div>
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: S.text1,
                margin: 0,
              }}
            >
              Say hello to {selectedUser?.fullName}
            </p>
            <p
              style={{
                fontSize: 13,
                color: S.text3,
                maxWidth: 260,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              This is the beginning of your conversation.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isMine =
                msg.senderId?.toString() === authUser?._id?.toString();
              const pSender = messages[i - 1]?.senderId?.toString();
              const nSender = messages[i + 1]?.senderId?.toString();
              const newGroup = pSender !== msg.senderId?.toString();
              const lastGrp = nSender !== msg.senderId?.toString();
              return (
                <div
                  key={msg._id}
                  style={{
                    display: "flex",
                    flexDirection: isMine ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: 8,
                    maxWidth: "70%",
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    marginTop: newGroup ? 14 : 3,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      flexShrink: 0,
                      visibility: !isMine && lastGrp ? "visible" : "hidden",
                    }}
                  >
                    {!isMine && lastGrp && (
                      <Avatar
                        name={selectedUser?.fullName}
                        src={selectedUser?.profilePic}
                        size={28}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      padding: "10px 14px 8px",
                      wordBreak: "break-word",
                      borderRadius: isMine
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                      background: isMine ? S.sent : S.recv,
                      border: `1px solid ${isMine ? S.sentBorder : S.recvBorder}`,
                      opacity: msg.isOptimistic ? 0.6 : 1,
                      transition: "opacity .2s",
                      boxShadow: isMine
                        ? "0 2px 12px rgba(0,229,160,.12)"
                        : "0 2px 12px rgba(0,229,160,.06)",
                    }}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt=""
                        style={{
                          display: "block",
                          maxWidth: 220,
                          width: "100%",
                          borderRadius: 10,
                          marginBottom: msg.text ? 8 : 3,
                        }}
                      />
                    )}
                    {msg.text && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          color: S.text1,
                          lineHeight: 1.55,
                        }}
                      >
                        {msg.text}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 3,
                        marginTop: 5,
                      }}
                    >
                      <span
                        style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {isMine && (
                        <span
                          style={{
                            fontSize: 12,
                            color: msg.isOptimistic
                              ? "rgba(255,255,255,.35)"
                              : S.accent,
                          }}
                        >
                          {msg.isOptimistic ? "✓" : "✓✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator bubble */}
            {isTyping && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  alignSelf: "flex-start",
                  marginTop: 14,
                  maxWidth: "70%",
                }}
              >
                <Avatar
                  name={selectedUser?.fullName}
                  src={selectedUser?.profilePic}
                  size={28}
                />
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "18px 18px 18px 4px",
                    background: S.recv,
                    border: `1px solid ${S.recvBorder}`,
                    boxShadow: "0 2px 12px rgba(0,229,160,.06)",
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  );
}

//NO CONVERSATION PLACEHOLDER
function NoConversation() {
  const { setActiveTab } = useChatStore();
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(ellipse at center, rgba(0,229,160,.04) 0%, transparent 65%), ${S.mainBg}`,
        textAlign: "center",
        gap: 18,
        padding: 48,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 26,
          background: "rgba(0,229,160,.1)",
          border: "1px solid rgba(0,229,160,.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          boxShadow: "0 0 40px rgba(0,229,160,.08)",
        }}
      >
        💬
      </div>
      <div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: S.text1,
            margin: "0 0 10px",
          }}
        >
          Select a conversation
        </h2>
        <p
          style={{
            fontSize: 14,
            color: S.text2,
            maxWidth: 300,
            margin: "0 0 24px",
            lineHeight: 1.7,
          }}
        >
          Choose a contact from the sidebar to start chatting or continue where
          you left off.
        </p>
        <button
          onClick={() => setActiveTab("contacts")}
          style={{
            padding: "11px 28px",
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 700,
            background: S.accent,
            border: "none",
            color: "#000",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .2s",
            boxShadow: "0 4px 20px rgba(0,229,160,.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = S.accent2;
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = S.accent;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Find contacts
        </button>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 16px",
          borderRadius: 100,
          background: "rgba(255,255,255,.03)",
          border: `1px solid ${S.border}`,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: S.online,
            boxShadow: `0 0 6px ${S.online}`,
          }}
        />
        <span style={{ fontSize: 12, color: S.text3 }}>
          End-to-end encrypted · Real-time delivery
        </span>
      </div>
    </div>
  );
}

function SpinnerSVG({ size = 16, color = "#000" }) {
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ animation: "_spin .7s linear infinite" }}
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
      <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}

//ROOT
export default function ChatPage() {
  const { selectedUser } = useChatStore();
  const [search, setSearch] = useState("");
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: S.mainBg,
        overflow: "hidden",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <CallManager />
      <Sidebar search={search} setSearch={setSearch} />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: S.mainBg,
        }}
      >
        {selectedUser ? <ChatArea /> : <NoConversation />}
      </main>
    </div>
  );
}
