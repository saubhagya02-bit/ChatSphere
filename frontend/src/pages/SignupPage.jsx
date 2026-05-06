import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function SignupPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ok = await signup(form);
    if (ok) navigate("/login");
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
          minHeight: "580px",
        }}
      >
        {/* Left: form */}
        <div
          style={{
            flex: "0 0 420px",
            background: "var(--sidebar)",
            padding: "48px 44px",
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
              marginBottom: "32px",
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
            Create account
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text2)",
              marginBottom: "28px",
            }}
          >
            Join ChatSphere — it's free forever
          </p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Alex Johnson"
                value={form.fullName}
                onChange={set("fullName")}
                required
              />
            </div>
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
                placeholder="At least 6 characters"
                value={form.password}
                onChange={set("password")}
                minLength={6}
                required
              />
            </div>
            <button
              className="auth-btn"
              type="submit"
              disabled={isSigningUp}
              style={{ marginTop: "8px" }}
            >
              {isSigningUp ? (
                <>
                  <Spinner /> Creating account…
                </>
              ) : (
                "Create account"
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
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Right: feature list */}
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
            gap: "14px",
          }}
        >
          {[
            {
              icon: "🔐",
              title: "End-to-end encrypted",
              sub: "Your messages stay private",
              color: "rgba(0,229,160,.1)",
              stroke: "var(--accent)",
            },
            {
              icon: "⚡",
              title: "Real-time delivery",
              sub: "Messages arrive instantly via WebSocket",
              color: "rgba(96,165,250,.1)",
              stroke: "#60a5fa",
            },
            {
              icon: "🖼️",
              title: "Image sharing",
              sub: "Send photos straight from your device",
              color: "rgba(167,139,250,.1)",
              stroke: "#a78bfa",
            },
            {
              icon: "🔊",
              title: "Sound notifications",
              sub: "Never miss an incoming message",
              color: "rgba(251,191,36,.1)",
              stroke: "#fbbf24",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                width: "100%",
                maxWidth: "320px",
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: f.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text1)",
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text2)",
                    marginTop: "2px",
                  }}
                >
                  {f.sub}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

export default SignupPage;
