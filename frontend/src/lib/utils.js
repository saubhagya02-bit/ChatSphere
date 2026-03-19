export function formatMessageTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();

  const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };
  const time = date.toLocaleTimeString([], timeOptions);

  if (isToday) return time;
  if (isYesterday) return `Yesterday, ${time}`;
  
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}