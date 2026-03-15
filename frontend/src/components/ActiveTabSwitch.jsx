import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="tabs tabs-boxed bg-emerald-900/20 backdrop-blur-sm p-2 m-2 rounded-lg border border-emerald-500/20">

      <button
        onClick={() => setActiveTab("chats")}
        className={`tab ${
          activeTab === "chats"
            ? "bg-emerald-500/20 text-emerald-400"
            : "text-slate-400 hover:text-emerald-300"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab ${
          activeTab === "contacts"
            ? "bg-emerald-500/20 text-emerald-400"
            : "text-slate-400 hover:text-emerald-300"
        }`}
      >
        Contacts
      </button>

    </div>
  );
}

export default ActiveTabSwitch;