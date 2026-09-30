import {
  Bell,
  ChevronRight,
  HelpCircle,
  LogOut,
  Settings,
  Sun,
  User
} from "lucide-react";

import Nav from "../components/Nav";

export default function Profile({ setPage }) {
  const rows = [
    [User, "Child's Information"],
    [Bell, "Notification Settings"],
    [Settings, "App Settings"],
    [HelpCircle, "Help & Support"]
  ];

  return (
    <div className="mobile-screen app-screen">
      <main className="content scroll">
        <div className="profile-top">
          <h2>Profile</h2>
          <button className="round-btn">
            <Sun size={22} />
          </button>
        </div>

        <div className="user-card">
          <div className="avatar">👩</div>
          <div>
            <h2>Mum</h2>
            <p>mum@example.com</p>
          </div>
        </div>

        {rows.map(([Icon, label]) => (
          <button className="profile-row" key={label}>
            <Icon size={21} color="#48337A" />
            <strong>{label}</strong>
            <ChevronRight size={19} color="#888" />
          </button>
        ))}

        <button className="logout">
          <LogOut size={21} />
          <strong>Log Out</strong>
          <ChevronRight size={19} color="#888" />
        </button>
      </main>

      <Nav page="profile" setPage={setPage} />
    </div>
  );
}
