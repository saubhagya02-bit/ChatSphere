export function NoConversationPlaceholder() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "14px",
        padding: "40px",
        background: "var(--bg2)",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "24px",
          background: "var(--accent-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
        }}
      >
        💬
      </div>
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "var(--text1)",
          margin: 0,
        }}
      >
        Select a conversation
      </h2>
      <p
        style={{
          fontSize: "14px",
          color: "var(--text2)",
          maxWidth: "300px",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        Choose a contact from the sidebar to start chatting or continue where
        you left off.
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "4px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--online)",
          }}
        />
        <span style={{ fontSize: "12px", color: "var(--text3)" }}>
          End-to-end encrypted · Real-time delivery
        </span>
      </div>
    </div>
  );
}

export function MessagesLoadingSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "4px 0",
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: i % 2 === 0 ? "row-reverse" : "row",
            alignItems: "flex-end",
            gap: "8px",
            maxWidth: "60%",
            alignSelf: i % 2 === 0 ? "flex-end" : "flex-start",
          }}
        >
          {i % 2 !== 0 && (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "var(--bg3)",
                flexShrink: 0,
                animation: "skpulse 1.4s ease-in-out infinite",
              }}
            />
          )}
          <div
            style={{
              height: "40px",
              borderRadius: "12px",
              background: "var(--bg3)",
              width: `${80 + ((i * 23) % 80)}px`,
              animation: "skpulse 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        </div>
      ))}
      <style>{`@keyframes skpulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
    </div>
  );
}

export function UsersLoadingSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "4px 0",
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 10px",
            animation: "skpulse 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--bg3)",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: 13,
                background: "var(--bg3)",
                borderRadius: "6px",
                width: "60%",
                marginBottom: "6px",
              }}
            />
            <div
              style={{
                height: 10,
                background: "var(--bg4)",
                borderRadius: "6px",
                width: "40%",
              }}
            />
          </div>
        </div>
      ))}
      <style>{`@keyframes skpulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
    </div>
  );
}

export default NoConversationPlaceholder;
