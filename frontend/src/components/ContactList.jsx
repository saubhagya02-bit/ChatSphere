import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

function ContactList() {
  const { allContacts, setSelectedUser, isUsersLoading } = useChatStore();

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          className="bg-emerald-500/10 p-4 rounded-lg cursor-pointer hover:bg-emerald-500/20 transition-all duration-200 border border-transparent hover:border-emerald-500/30"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div className={"avatar"}>
              <div className="size-12 rounded-full ring ring-emerald-500/20">
                <img src={contact.profilePic || "/profile.png"} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">
              {contact.fullName}
            </h4>
          </div>
        </div>
      ))}
    </>
  );
}

export default ContactList;
