import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "920px",
          display: "flex",
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid var(--border)",
          minHeight: "560px",
        }}
      >
        {/* Left: form */}
        <div
          style={{
            flex: "0 0 420px",
            background: "var(--sidebar)",
            padding: "52px 44px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-80px",
              left: "-80px",
              width: "280px",
              height: "280px",
              background:
                "radial-gradient(circle, rgba(0,229,160,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "36px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
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
            <span
              style={{
                fontSize: "17px",
                fontWeight: 600,
                color: "var(--text1)",
                letterSpacing: "-.01em",
              }}
            >
              ChatSphere
            </span>
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "var(--text1)",
              marginBottom: "6px",
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text2)",
              marginBottom: "32px",
            }}
          >
            Sign in to continue your conversations
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>
            <button
              className="auth-btn"
              type="submit"
              disabled={isLoggingIn}
              style={{ marginTop: "8px" }}
            >
              {isLoggingIn ? (
                <>
                  <Spinner /> Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p
            style={{
              marginTop: "24px",
              fontSize: "13px",
              color: "var(--text2)",
              textAlign: "center",
            }}
          >
            No account?{" "}
            <Link
              to="/signup"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign up free
            </Link>
          </p>
        </div>

        {/* Right: preview */}
        <div
          style={{
            flex: 1,
            background:
              "linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          <ChatPreview />
          <div style={{ marginTop: "28px", textAlign: "center" }}>
            <h3
              style={{
                fontSize: "19px",
                fontWeight: 600,
                color: "var(--text1)",
                marginBottom: "6px",
              }}
            >
              Real conversations, refined
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text2)" }}>
              End-to-end encrypted · Real-time · Always there
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatPreview() {
  const msgs = [
    {
      id: 1,
      from: "S",
      text: "Hey! Are you free this evening? 👋",
      out: false,
      time: "6:41 PM",
    },
    {
      id: 2,
      from: "A",
      text: "Yeah! Let's grab dinner 🍜",
      out: true,
      time: "6:42 PM",
    },
    {
      id: 3,
      from: "S",
      text: "Perfect! 7pm at the usual spot?",
      out: false,
      time: "6:43 PM",
    },
  ];
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "340px",
        background: "var(--bg3)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "16px",
      }}
    >
      {msgs.map((m) => (
        <div
          key={m.id}
          style={{
            display: "flex",
            flexDirection: m.out ? "row-reverse" : "row",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <div
            className={m.from === "S" ? "av-teal" : "av-purple"}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {m.from}
          </div>
          <div>
            <div
              style={{
                padding: "9px 13px",
                borderRadius: m.out
                  ? "16px 16px 4px 16px"
                  : "16px 16px 16px 4px",
                background: m.out ? "var(--sent)" : "var(--recv)",
                border: `1px solid ${m.out ? "var(--sent-border)" : "var(--recv-border)"}`,
                fontSize: "13px",
                color: "var(--text1)",
                lineHeight: 1.5,
              }}
            >
              {m.text}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "var(--text3)",
                marginTop: "3px",
                textAlign: m.out ? "right" : "left",
              }}
            >
              {m.time}
              {m.out && (
                <span style={{ color: "var(--accent)", marginLeft: "3px" }}>
                  ✓✓
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "spin .7s linear infinite" }}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}

export default LoginPage;
