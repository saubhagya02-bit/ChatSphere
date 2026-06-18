import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { isUserBlocked } from "../lib/utils";
import toast from "react-hot-toast";

const MAX = 200;

function MessageInput() {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const fileRef = useRef(null);
  const { sendMessage, emitTyping, emitStopTyping, selectedUser } =
    useChatStore();
  const { authUser } = useAuthStore();
  const { playClick, playMessageSent } = useKeyboardSound();

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() && !img) return;
    playClick();
    await sendMessage({ text: text.trim(), image: img });
    playMessageSent();
    setText("");
    setImg(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Images only");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImg(reader.result);
    reader.readAsDataURL(file);
  };

  const near = text.length > 150;
  const over = text.length >= MAX;
  const blocked = isUserBlocked(authUser, selectedUser?._id);

  if (selectedUser?.isBlocked) {
    return (
      <div
        style={{
          padding: "14px 16px 16px",
          borderTop: `1px solid ${S.border}`,
          background: S.chatBg,
          flexShrink: 0,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, color: S.text3, margin: 0 }}>
          You blocked this contact. Unblock them from the menu to send messages.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "14px 16px",
        borderTop: "1px solid var(--border)",
        background: "var(--bg2)",
        flexShrink: 0,
      }}
    >
      {/* Image preview */}
      {img && (
        <div style={{ marginBottom: "10px", display: "flex" }}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <img
              src={img}
              alt="Preview"
              style={{
                width: "72px",
                height: "72px",
                objectFit: "cover",
                borderRadius: "10px",
                border: "1px solid var(--border)",
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
                top: "-8px",
                right: "-8px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "var(--bg4)",
                border: "1px solid var(--border)",
                color: "var(--text1)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "var(--bg3)",
          borderRadius: "14px",
          border: "1px solid var(--border)",
          padding: "6px 6px 6px 14px",
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
            justifyContent: "center",
            padding: "4px",
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={img ? "var(--accent)" : "var(--text2)"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        {/* Text input */}
        <div style={{ flex: 1, position: "relative" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            maxLength={MAX}
            placeholder="Type a message…"
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              fontSize: "14px",
              color: "var(--text1)",
              outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              paddingRight: near ? "44px" : "0",
            }}
          />
          {near && (
            <span
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "11px",
                color: over ? "var(--red)" : "var(--text3)",
              }}
            >
              {text.length}/{MAX}
            </span>
          )}
        </div>

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && !img}
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: !text.trim() && !img ? "var(--bg4)" : "var(--accent)",
            border: "none",
            cursor: !text.trim() && !img ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            if (text.trim() || img)
              e.currentTarget.style.background = "var(--accent2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              text.trim() || img ? "var(--accent)" : "var(--bg4)";
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={!text.trim() && !img ? "var(--text3)" : "#000"}
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default MessageInput;
