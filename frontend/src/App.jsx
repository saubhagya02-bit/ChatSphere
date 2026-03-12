import { Routes, Route, Navigate } from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  //if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="min-h-screen bg-[#020617] relative">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-green-500/20 blur-[120px]" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-emerald-400/20 blur-[120px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#2e8b6b]/30 to-transparent" />

      <Routes>
        <Route path="/" element={<SignupPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
