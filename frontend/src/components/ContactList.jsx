import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Avatar from "./Avatar";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function ContactList({ search = "" }) {
  const {
    allContacts,
    getAllContacts,
    setSelectedUser,
    selectedUser,
    isUsersLoading,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  const filtered = allContacts.filter((c) =>
    c.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  if (filtered.length === 0) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "10px" }}>👥</div>
        <p style={{ fontSize: "13px", color: "var(--text2)" }}>
          No contacts found
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {filtered.map((contact) => {
        const isSelected = selectedUser?._id === contact._id;
        const isOnline = onlineUsers.includes(contact._id);
        return (
          <div
            key={contact._id}
            onClick={() => setSelectedUser(contact)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 10px",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "background .15s",
              background: isSelected ? "var(--accent-dim)" : "transparent",
              border: isSelected
                ? "1px solid rgba(0,229,160,.15)"
                : "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = "var(--bg3)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = "transparent";
            }}
          >
            <Avatar
              name={contact.fullName}
              src={contact.profilePic}
              size={44}
              showDot
              isOnline={isOnline}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text1)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {contact.fullName}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: isOnline ? "var(--online)" : "var(--text3)",
                  marginTop: "2px",
                }}
              >
                {isOnline ? "● Online" : "Offline"}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(contact);
              }}
              style={{
                padding: "5px 14px",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: 500,
                background: "var(--accent-dim)",
                border: "1px solid rgba(0,229,160,.2)",
                color: "var(--accent)",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background .2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,229,160,.18)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent-dim)")
              }
            >
              Message
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ContactList;
