import {
  Bell,
  ChevronRight,
  Mic
} from "lucide-react";

import Bear from "../components/Bear";
import Nav from "../components/Nav";
import Activity from "../components/Activity";
import { ConnectionPanel, useBear } from "../BearConnection";
import { formatActivityTime } from "../lib/hardware";

const DEMO_STATES = ["message", "happy", "glowing", "disconnected", "calm"];

export default function Home({ setPage, parent = "Mum", bearState = "calm", setBearState }) {
  const { state, status, activities } = useBear();
  const childVoices = state?.messages.filter(message => message.from === "child") || [];
  const simulateNextState = () => {
    const currentIndex = DEMO_STATES.indexOf(bearState);
    setBearState?.(DEMO_STATES[(currentIndex + 1) % DEMO_STATES.length]);
  };

  return (
    <div className="mobile-screen app-screen">
      <main className="content scroll">
        <div className="home-top">
          <div>
            <h2>Good evening,</h2>
            <h2>{parent}! 👋</h2>
          </div>

          <button
            className="round-btn notification"
            aria-label="Notifications"
          >
            <Bell size={23} />
            <i />
          </button>
        </div>

        <button
          className="connected-card bear-hero-card"
          data-tutorial="bear-card"
          onClick={() => setPage("live")}
        >
          <div className="dark-bear">
            <Bear size={138} state={bearState} />
          </div>

          <div className="bear-hero-copy">
            <strong className={bearState === "disconnected" ? "offline" : "green"}>
              {bearState === "disconnected" ? "Bear Offline" : "Bear Connected"}
            </strong>
            <h3>{bearState === "message" ? "A new moment is waiting" : "Your child's bear is ready"}</h3>
            <small>
              {bearState === "glowing"
                ? "Your warm light was sent"
                : bearState === "happy"
                  ? "A happy interaction just happened"
                  : bearState === "disconnected"
                    ? "Tap to check the connection"
                    : status.detail}
            </small>
          </div>

          <span className="bear-hero-arrow"><ChevronRight color="white" size={21} /></span>
        </button>

        <ConnectionPanel />

        <button
          className="voice-alert"
          data-tutorial="voice-card"
          onClick={() => setPage("messages")}
        >
          <div className="coral-icon">
            <Mic color="white" size={24} />
          </div>

          <div className="grow text-left">
            <h3>Voice Messages</h3>
            <p>{childVoices.length} voice {childVoices.length === 1 ? "note" : "notes"} from your child</p>
          </div>

          <span className="count">{childVoices.length}</span>
          <ChevronRight size={20} color="#888" />
        </button>

        <div className="info-card">
          <span className="emoji">💛</span>
          <div>
            <h3>Teddy heart-light</h3>
            <p>
              When you reply to your child, the bear glows warm yellow —
              a hug across the distance.
            </p>
          </div>
        </div>

        <div className="section-head">
          <h3>Bear Activity</h3>
          <button type="button" onClick={simulateNextState}>Try bear states 🐻</button>
        </div>

        {activities.map(item => (
          <Activity
            key={item.id}
            icon={item.type === "interaction" || item.type === "hug" ? "🤗" : item.type === "light" ? "💛" : "🌟"}
            title={item.text}
            time={formatActivityTime(item.at)}
          />
        ))}
      </main>

      <Nav page="home" setPage={setPage} />
    </div>
  );
}
