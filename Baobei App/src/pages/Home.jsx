import {
  Bell,
  ChevronRight,
  Mic
} from "lucide-react";

import Bear from "../components/Bear";
import Nav from "../components/Nav";
import Activity from "../components/Activity";

export default function Home({ setPage }) {
  return (
    <div className="mobile-screen app-screen">
      <main className="content scroll">
        <div className="home-top">
          <div>
            <h2>Good evening,</h2>
            <h2>Mum! 👋</h2>
          </div>

          <button className="round-btn notification">
            <Bell size={23} />
            <i />
          </button>
        </div>

        <button className="connected-card" onClick={() => setPage("live")}>
          <div className="dark-bear">
            <Bear size={61} />
          </div>

          <div className="grow">
            <strong className="green">Bear Connected</strong>
            <h3>Your child is doing well!</h3>
            <small>Last active: 2 mins ago</small>
          </div>

          <ChevronRight color="white" size={21} />
        </button>

        <button className="voice-alert" onClick={() => setPage("messages")}>
          <div className="coral-icon">
            <Mic color="white" size={24} />
          </div>

          <div className="grow text-left">
            <h3>Voice Messages</h3>
            <p>1 new voice note from your child</p>
          </div>

          <span className="count">1</span>
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
          <button>Simulate 🐻</button>
        </div>

        <Activity icon="🤗" title="Your child hugged the bear" time="2 mins ago" />
        <Activity icon="💛" title="Bear glowed warm yellow" time="18 mins ago" />
        <Activity icon="🌟" title="Bear lit up for 30 seconds" time="1 hr ago" />
      </main>

      <Nav page="home" setPage={setPage} />
    </div>
  );
}
