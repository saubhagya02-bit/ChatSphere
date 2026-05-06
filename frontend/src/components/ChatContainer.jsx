import { useEffect, useRef } from "react";
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
  } = useChatStore();
  const { authUser } = useAuthStore();
  const bottomRef = useRef(null);

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

              return (
                <div
                  key={msg._id}
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
                  {/* Avatar — only show on first message in a group */}
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
                      border: `1px solid ${isMine ? "var(--sent-border)" : "var(--recv-border)"}`,
                      wordBreak: "break-word",
                      opacity: msg.isOptimistic ? 0.7 : 1,
                      transition: "opacity .2s",
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
                        {msg.text}
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
