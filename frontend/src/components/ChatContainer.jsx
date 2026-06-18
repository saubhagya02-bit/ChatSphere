import { useEffect, useMemo, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { formatMessageTime } from "../lib/utils";

function ChatContainer() {
  const {
    selectedUser,
    messages,
    isMessagesLoading,
    getMessagesByUserId,
    subscribeToMessage,
    unsubscribeFromMessage,
    isSearchOpen,
    searchQuery,
    setSearchQuery,
    closeSearch,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);
  const messageRefs = useRef({});
  const [matchIndex, setMatchIndex] = useState(0);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessage();
    return () => unsubscribeFromMessage();
  }, [
    selectedUser._id,
    getMessagesByUserId,
    subscribeToMessage,
    unsubscribeFromMessage,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const matches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return messages
      .filter((m) => m.text?.toLowerCase().includes(q))
      .map((m) => m._id);
  }, [messages, searchQuery]);

  useEffect(() => {
    setMatchIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (matches.length === 0) return;
    const id = matches[matchIndex] ?? matches[0];
    messageRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [matchIndex, matches]);

  const goPrevMatch = () =>
    setMatchIndex((i) =>
      matches.length ? (i - 1 + matches.length) % matches.length : 0,
    );
  const goNextMatch = () =>
    setMatchIndex((i) => (matches.length ? (i + 1) % matches.length : 0));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ChatHeader />

      {isSearchOpen && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg2)",
            flexShrink: 0,
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text3)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in this chat…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "13px",
              color: "var(--text1)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          {searchQuery && (
            <span
              style={{
                fontSize: "12px",
                color: "var(--text3)",
                whiteSpace: "nowrap",
              }}
            >
              {matches.length
                ? `${matchIndex + 1}/${matches.length}`
                : "No results"}
            </span>
          )}
          <button
            className="icon-btn"
            title="Previous match"
            onClick={goPrevMatch}
            disabled={!matches.length}
            style={{ opacity: matches.length ? 1 : 0.4 }}
          >
            <svg viewBox="0 0 24 24">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
          <button
            className="icon-btn"
            title="Next match"
            onClick={goNextMatch}
            disabled={!matches.length}
            style={{ opacity: matches.length ? 1 : 0.4 }}
          >
            <svg viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <button
            className="icon-btn"
            title="Close search"
            onClick={closeSearch}
          >
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length === 0 ? (
          <EmptyChat name={selectedUser?.fullName} />
        ) : (
          <>
            {messages.map((msg, i) => {
              const isMine =
                msg.senderId.toString() === authUser._id.toString();
              const prevMsg = messages[i - 1];
              const isNewGroup =
                !prevMsg ||
                prevMsg.senderId.toString() !== msg.senderId.toString();
              const isActiveMatch =
                isSearchOpen && matches[matchIndex] === msg._id;

              return (
                <div
                  key={msg._id}
                  ref={(el) => (messageRefs.current[msg._id] = el)}
                  style={{
                    display: "flex",
                    flexDirection: isMine ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: "8px",
                    maxWidth: "72%",
                    alignSelf: isMine ? "flex-end" : "flex-start",
                    marginTop: isNewGroup ? "10px" : "2px",
                  }}
                  className="anim-fade-up"
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      flexShrink: 0,
                      visibility: isNewGroup && !isMine ? "visible" : "hidden",
                    }}
                  >
                    {isNewGroup && !isMine && (
                      <div
                        className={`av-teal`}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {selectedUser?.fullName?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "10px 14px 8px",
                      borderRadius: isMine
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                      background: isMine ? "var(--sent)" : "var(--recv)",
                      border: isActiveMatch
                        ? "1px solid var(--accent)"
                        : `1px solid ${isMine ? "var(--sent-border)" : "var(--recv-border)"}`,
                      boxShadow: isActiveMatch
                        ? "0 0 0 2px rgba(0,229,160,.25)"
                        : "none",
                      wordBreak: "break-word",
                      opacity: msg.isOptimistic ? 0.7 : 1,
                      transition: "opacity .2s, box-shadow .2s",
                    }}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Shared"
                        style={{
                          display: "block",
                          maxWidth: "220px",
                          borderRadius: "10px",
                          marginBottom: msg.text ? "8px" : "4px",
                          width: "100%",
                        }}
                      />
                    )}
                    {msg.text && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "var(--text1)",
                          lineHeight: 1.55,
                        }}
                      >
                        {isSearchOpen && searchQuery.trim()
                          ? highlightMatch(msg.text, searchQuery)
                          : msg.text}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "5px",
                      }}
                    >
                      <span style={{ fontSize: "10px", color: "var(--text3)" }}>
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {isMine && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: msg.isOptimistic
                              ? "var(--text3)"
                              : "var(--accent)",
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
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <MessageInput />
    </div>
  );
}

function highlightMatch(text, query) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "var(--accent)",
          color: "#000",
          borderRadius: "3px",
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

function EmptyChat({ name }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "12px",
        opacity: 0.7,
      }}
    >
      <div style={{ fontSize: "40px" }}>👋</div>
      <p style={{ fontSize: "16px", fontWeight: 500, color: "var(--text1)" }}>
        Start your conversation with {name}
      </p>
      <p style={{ fontSize: "13px", color: "var(--text2)", maxWidth: "260px" }}>
        Say hello! Your messages are end-to-end encrypted.
      </p>
    </div>
  );
}

export default ChatContainer;
