import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatList from "../components/ChatList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import { useEffect } from "react";
import Sidebar from "../components/Sidebar"; 

function ChatPage() {
  const { selectedUser, activeTab, getAllContacts, getMyChatPartner } =
    useChatStore();

  useEffect(() => {
    if (activeTab === "chats") getMyChatPartner();
    else getAllContacts();
  }, [activeTab, getAllContacts, getMyChatPartner]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "var(--bg2)",
        }}
      >
        {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
      </main>
    </div>
  );
}

export default ChatPage;
