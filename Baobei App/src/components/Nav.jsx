import {
  Home as HomeIcon,
  MessageCircle,
  User
} from "lucide-react";

export default function Nav({ page, setPage }) {
  return (
    <nav className="bottom-nav">
      <button
        className={page === "home" ? "nav active" : "nav"}
        onClick={() => setPage("home")}
      >
        <HomeIcon size={22} fill={page === "home" ? "currentColor" : "none"} />
        <span>Home</span>
      </button>

      <button
        className={page === "messages" ? "nav active" : "nav"}
        onClick={() => setPage("messages")}
      >
        <span className="nav-icon-badge">
          <MessageCircle
            size={22}
            fill={page === "messages" ? "currentColor" : "none"}
          />
          <b>1</b>
        </span>
        <span>Messages</span>
      </button>

      <button
        className={page === "profile" ? "nav active" : "nav"}
        onClick={() => setPage("profile")}
      >
        <User size={22} fill={page === "profile" ? "currentColor" : "none"} />
        <span>Profile</span>
      </button>
    </nav>
  );
}
