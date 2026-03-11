import { Routes, Route } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { authUser, login, isLoggedIn } = useAuthStore();

  console.log("auth user: ", authUser);
  console.log("isLoggedIn: ", isLoggedIn);
  return (
    <div className="min-h-screen bg-[#020617] relative">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-green-500/20 blur-[120px]" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-emerald-400/20 blur-[120px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#2e8b6b]/30 to-transparent" />

      <button onClick={login} className="z-10">
        Login
        </button>

      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  );
}

export default App;
