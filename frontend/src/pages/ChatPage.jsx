import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatList from "../components/ChatList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="relative w-full max-w-6xl h-[800px] mx-auto">
      <BorderAnimatedContainer>
        <div className="flex w-full h-full">

          <div className="w-80 bg-emerald-950/40 backdrop-blur-md border-r border-emerald-500/20 flex flex-col">
            <ProfileHeader />
            <ActiveTabSwitch />

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeTab === "chats" ? <ChatList /> : <ContactList />}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-slate-900/70 backdrop-blur-md">
            {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
          </div>

        </div>
      </BorderAnimatedContainer>
    </div>
  );
}

export default ChatPage;