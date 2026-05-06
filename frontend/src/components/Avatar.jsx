import { avatarColor, initials } from "../lib/utils";

function Avatar({
  name = "",
  src,
  size = 40,
  showDot = false,
  isOnline = false,
  style = {},
}) {
  const cls = avatarColor(name);
  const init = initials(name);
  const fontSize = Math.round(size * 0.36);

  return (
    <div
      className={cls}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize,
        fontWeight: 600,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        init || "?"
      )}

      {showDot && (
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: size * 0.26,
            height: size * 0.26,
            borderRadius: "50%",
            background: isOnline ? "var(--online)" : "var(--text3)",
            border: "2px solid var(--sidebar)",
          }}
        />
      )}
    </div>
  );
}

export default Avatar;
