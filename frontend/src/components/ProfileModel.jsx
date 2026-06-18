import Avatar from "./Avatar";

function ProfileModal({ user, isOnline, onClose, onBlockToggle }) {
  if (!user) return null;

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString([], {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "var(--bg3)",
          border: "1px solid var(--border)",
          borderRadius: "18px",
          padding: "28px 24px",
          textAlign: "center",
        }}
      >
        <Avatar
          name={user.fullName}
          src={user.profilePic}
          size={88}
          showDot
          isOnline={isOnline}
          style={{ margin: "0 auto 16px", fontSize: "30px" }}
        />

        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "var(--text1)",
            margin: "0 0 4px",
          }}
        >
          {user.fullName}
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: isOnline ? "var(--online)" : "var(--text3)",
            margin: "0 0 18px",
          }}
        >
          {user.isBlocked
            ? "🚫 Blocked"
            : isOnline
              ? "● Online now"
              : "Offline"}
        </p>

        <div
          style={{
            textAlign: "left",
            background: "var(--bg2)",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--text3)",
              textTransform: "uppercase",
              letterSpacing: ".06em",
              marginBottom: "4px",
            }}
          >
            Email
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "var(--text1)",
              marginBottom: joined ? "14px" : 0,
            }}
          >
            {user.email}
          </div>
          {joined && (
            <>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text3)",
                  textTransform: "uppercase",
                  letterSpacing: ".06em",
                  marginBottom: "4px",
                }}
              >
                Member since
              </div>
              <div style={{ fontSize: "14px", color: "var(--text1)" }}>
                {joined}
              </div>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onBlockToggle}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: user.isBlocked ? "var(--accent)" : "var(--red)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {user.isBlocked ? "Unblock" : "Block"}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: "none",
              background: "var(--accent)",
              color: "#000",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;
