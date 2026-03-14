import React from "react";
import { useAuthStore } from "../store/useAuthStore";

function chatPage() {
  const { logout } = useAuthStore();
  return (
    <div className="z-10">
      chatPage
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default chatPage;
