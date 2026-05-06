function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Animated logo mark */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "16px",
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            animation: "pulse 1.4s ease-in-out infinite",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M4 14C4 8.477 8.477 4 14 4s10 4.477 10 10-4.477 10-10 10a9.97 9.97 0 01-5.5-1.65L4 24l1.65-4.5A9.97 9.97 0 014 14z"
              stroke="#000"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M10 13h8M10 17h5"
              stroke="#000"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p
          style={{
            color: "var(--text3)",
            fontSize: "13px",
            letterSpacing: ".04em",
          }}
        >
          ChatSphere
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .7; transform: scale(.92); }
        }
      `}</style>
    </div>
  );
}

export default PageLoader;
