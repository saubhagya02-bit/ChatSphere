import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PageLoader from "./components/PageLoader";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Routes>
        <Route
          path="/"
          element={authUser ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--bg3)",
            color: "var(--text1)",
            border: "1px solid var(--border)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "var(--accent)", secondary: "#000" },
          },
        }}
      />
    </div>
  );
}

export default App;
