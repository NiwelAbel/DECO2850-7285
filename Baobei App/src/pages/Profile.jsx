
import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  X,
  Volume2,
  Vibrate,
  Mail,
  ShieldCheck,
  Mic,
} from "lucide-react";

import Nav from "../components/Nav";

const FAQS = [
  {
    question: "How does Baobei connect with the teddy bear?",
    answer:
      "Baobei helps parents stay connected with their children through voice messages and teddy bear interactions. Physical hardware connectivity will be integrated in a future version.",
  },
  {
    question: "How do I send a voice message?",
    answer:
      "Open Voice Messages and tap Record a reply. Allow microphone access, record your message, stop recording, and play it back before sending.",
  },
  {
    question: "What do the bear's light and hug functions do?",
    answer:
      "Heart-light, Light up and Warm hug currently simulate responses in the app. Physical bear responses will require hardware integration.",
  },
  {
    question: "How do I manage my account?",
    answer:
      "You can view your account on the Profile page and log out using the Log Out option.",
  },
];

export default function Profile({ setPage }) {
  const [activePanel, setActivePanel] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("baobeiDarkMode") === "true"
  );
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem("baobeiSound") !== "false"
  );
  const [vibrationEnabled, setVibrationEnabled] = useState(
    () => localStorage.getItem("baobeiVibration") !== "false"
  );
  const [faqOpen, setFaqOpen] = useState(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const savedUser = JSON.parse(
    localStorage.getItem("baobeiUser") || "null"
  );

  const parent =
    savedUser?.parent ||
    localStorage.getItem("baobeiParent") ||
    "Mum";

  const email = savedUser?.email || "mum@example.com";

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("baobeiDarkMode", String(darkMode));

    return () => {
      document.body.classList.remove("dark-mode");
    };
  }, [darkMode]);

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("baobeiSound", String(next));
  }

  function toggleVibration() {
    const next = !vibrationEnabled;
    setVibrationEnabled(next);
    localStorage.setItem("baobeiVibration", String(next));
  }

  function handleLogout() {
    setLogoutConfirm(false);
    setActivePanel(null);
    setPage("login");
  }

  const rows = [
    {
      icon: User,
      label: "Child's Information",
      action: () => setActivePanel("child"),
    },
    {
      icon: Bell,
      label: "Notification Settings",
      action: () => setActivePanel("notifications"),
    },
    {
      icon: Settings,
      label: "App Settings",
      action: () => setActivePanel("settings"),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      action: () => setActivePanel("help"),
    },
  ];

  return (
    <div className="mobile-screen app-screen profile-screen">
      <main className="content scroll">
        <div className="profile-top">
          <h2>Profile</h2>

          <button
            className="round-btn"
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? <Moon size={22} /> : <Sun size={22} />}
          </button>
        </div>

        <div className="user-card">
          <div className="avatar">
            {parent === "Dad" ? "👨" : "👩"}
          </div>

          <div className="profile-user-details">
            <h2>{parent}</h2>
            <p>{email}</p>
          </div>
        </div>

        {rows.map(({ icon: Icon, label, action }) => (
          <button
            className="profile-row"
            key={label}
            onClick={action}
          >
            <Icon size={21} color="#48337A" />
            <strong>{label}</strong>
            <ChevronRight size={19} color="#888" />
          </button>
        ))}

        <button
          className="logout"
          onClick={() => setLogoutConfirm(true)}
        >
          <LogOut size={21} />
          <strong>Log Out</strong>
          <ChevronRight size={19} color="#888" />
        </button>
      </main>

      <Nav page="profile" setPage={setPage} />

      {/* SETTINGS AND SUPPORT BOTTOM SHEET */}
      {activePanel && (
        <div
          className="profile-overlay"
          onClick={() => setActivePanel(null)}
        >
          <section
            className="profile-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-header">
              <h2>
                {activePanel === "settings" && "App Settings"}
                {activePanel === "help" && "Help & Support"}
                {activePanel === "child" && "Child's Information"}
                {activePanel === "notifications" &&
                  "Notification Settings"}
              </h2>

              <button
                className="panel-close"
                onClick={() => setActivePanel(null)}
                aria-label="Close panel"
              >
                <X size={22} />
              </button>
            </div>

            {activePanel === "settings" && (
              <div className="settings-list">
                <SettingRow
                  icon={darkMode ? Moon : Sun}
                  title="Dark Mode"
                  description="Use a darker appearance"
                  enabled={darkMode}
                  onToggle={() => setDarkMode((value) => !value)}
                />

                <SettingRow
                  icon={Volume2}
                  title="Sound Effects"
                  description="Enable app sounds"
                  enabled={soundEnabled}
                  onToggle={toggleSound}
                />

                <SettingRow
                  icon={Vibrate}
                  title="Vibration"
                  description="Enable vibration feedback"
                  enabled={vibrationEnabled}
                  onToggle={toggleVibration}
                />

                <div className="settings-note">
                  <ShieldCheck size={19} />
                  <p>
                    Preferences are saved in this browser. Actual
                    sound and vibration feedback must be connected
                    separately.
                  </p>
                </div>
              </div>
            )}

            {activePanel === "help" && (
              <div className="help-content">
                <div className="help-intro">
                  <div className="help-illustration">🐻</div>
                  <h3>How can we help?</h3>
                  <p>
                    Find answers to common Baobei questions.
                  </p>
                </div>

                <h4 className="faq-heading">
                  Frequently Asked Questions
                </h4>

                {FAQS.map((faq, index) => (
                  <div className="faq-item" key={faq.question}>
                    <button
                      className="faq-question"
                      onClick={() =>
                        setFaqOpen((current) =>
                          current === index ? null : index
                        )
                      }
                    >
                      <span>{faq.question}</span>
                      <ChevronRight
                        size={19}
                        className={
                          faqOpen === index
                            ? "faq-chevron expanded"
                            : "faq-chevron"
                        }
                      />
                    </button>

                    {faqOpen === index && (
                      <p className="faq-answer">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}

                <button
                  className="contact-support"
                  onClick={() => {
                    window.location.href =
                      "mailto:support@baobei.example?subject=Baobei%20Support";
                  }}
                >
                  <Mail size={19} />
                  Contact Support
                </button>

                <p className="support-note">
                  Update the example support email before publishing.
                </p>
              </div>
            )}

            {activePanel === "child" && (
              <div className="simple-panel-content">
                <div className="help-illustration">🧒</div>
                <h3>Child's Information</h3>
                <p>
                  Child profile details can be added here when
                  your child's information is connected to the app.
                </p>
                <p className="panel-hint">
                  Child information storage is not implemented yet.
                </p>
              </div>
            )}

            {activePanel === "notifications" && (
              <div className="settings-list">
                <SettingRow
                  icon={Mic}
                  title="Voice Messages"
                  description="New voice message alerts"
                  enabled={true}
                  onToggle={() => {}}
                  readOnly
                />

                <SettingRow
                  icon={Bell}
                  title="Bear Activity"
                  description="Updates from your child's bear"
                  enabled={true}
                  onToggle={() => {}}
                  readOnly
                />

                <div className="settings-note">
                  <Bell size={19} />
                  <p>
                    These are prototype settings. Push notifications
                    require a notification service and device
                    permissions.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* LOGOUT CONFIRMATION */}
      {logoutConfirm && (
        <div
          className="profile-overlay logout-overlay"
          onClick={() => setLogoutConfirm(false)}
        >
          <section
            className="logout-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="logout-dialog-icon">
              <LogOut size={25} />
            </div>

            <h2>Log out?</h2>

            <p>
              Are you sure you want to log out of Baobei?
              You can log in again later.
            </p>

            <button
              className="confirm-logout"
              onClick={handleLogout}
            >
              Yes, Log Out
            </button>

            <button
              className="cancel-logout"
              onClick={() => setLogoutConfirm(false)}
            >
              Cancel
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  readOnly = false,
}) {
  return (
    <div className="setting-item">
      <div className="setting-icon">
        <Icon size={21} />
      </div>

      <div className="setting-description">
        <strong>{title}</strong>
        <small>{description}</small>
      </div>

      <button
        className={`toggle ${enabled ? "on" : ""}`}
        onClick={onToggle}
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        disabled={readOnly}
      >
        <span />
      </button>
    </div>
  );
}
