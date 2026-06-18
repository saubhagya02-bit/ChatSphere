export function formatMessageTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return time;
  if (isYesterday) return `Yesterday, ${time}`;

  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

export function avatarColor(name = "") {
  const colours = [
    "av-teal",
    "av-blue",
    "av-purple",
    "av-coral",
    "av-pink",
    "av-amber",
  ];
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colours[Math.abs(hash) % colours.length];
}

export function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function isUserBlocked(authUser, userId) {
  if (!authUser?.blockedUsers || !userId) return false;
  return authUser.blockedUsers.some(
    (id) => id?.toString() === userId.toString(),
  );
}
