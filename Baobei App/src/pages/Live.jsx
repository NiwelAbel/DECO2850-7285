import { useState } from "react";

import Bear from "../components/Bear";
import Header from "../components/Header";
import Action from "../components/Action";

export default function Live({ setPage, bearState = "calm", setBearState }) {
  const [activeEffect, setActiveEffect] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const triggerEffect = (effect, message) => {
    setActiveEffect(effect);
    setBearState?.(effect === "hug" ? "happy" : "glowing");

    setNotifications(prev => [
      { message, time: "Just now" },
      ...prev
    ]);

    window.clearTimeout(window.__baobeiEffectTimer);

    window.__baobeiEffectTimer = window.setTimeout(() => {
      setActiveEffect(null);
      setBearState?.("calm");
    }, effect === "hug" ? 1200 : 3000);
  };

  return (
    <div className="mobile-screen app-screen">
      <main className="content scroll live-content">
        <Header title="Live Activity" back={() => setPage("home")} />

        <div className="live-card">
          <div className={`live-bear ${activeEffect || ""}`}>
            <Bear size={112} state={bearState} />

            {activeEffect === "heart" && (
              <span className="bear-glow">💛</span>
            )}

            {activeEffect === "light" && (
              <span className="bear-rays">✦</span>
            )}

            {activeEffect === "hug" && (
              <span className="bear-hug">💗</span>
            )}
          </div>

          <span className="connected-pill">● CONNECTED</span>

          <h2>
            {activeEffect === "heart"
              ? "Bear is glowing warmly"
              : activeEffect === "light"
              ? "Bear is lighting up"
              : activeEffect === "hug"
              ? "Bear is giving a warm hug"
              : "Your child is with the bear"}
          </h2>

          <small>Just now</small>
        </div>

        <div className="latest-card">
          <label>LATEST FROM BEAR</label>

          <div className="bear-notification-list" data-tutorial="activity-list" aria-live="polite">
            {notifications.length === 0 ? (
              <div className="bear-notification">
                <strong>🤗 Your child just hugged the bear!</strong>
                <small>Just now</small>
              </div>
            ) : (
              notifications.map((item, index) => (
                <div className="bear-notification" key={index}>
                  <strong>{item.message}</strong>
                  <small>{item.time}</small>
                </div>
              ))
            )}
          </div>
        </div>

        <p className="respond">RESPOND TO YOUR CHILD</p>

        <div className="actions" data-tutorial="response-actions">
          <Action
            icon="💛"
            text="Heart-light"
            onClick={() =>
              triggerEffect(
                "heart",
                "🤗 You sent a heart-light to the bear!"
              )
            }
          />

          <Action
            icon="💡"
            text="Light up"
            onClick={() =>
              triggerEffect(
                "light",
                "💡 You lit up the bear!"
              )
            }
          />

          <Action
            icon="🧣"
            text="Warm hug"
            onClick={() =>
              triggerEffect(
                "hug",
                "🧣 You sent a warm hug to the bear!"
              )
            }
          />

          <Action
            icon="🎙️"
            text="Send voice"
            onClick={() => setPage("messages")}
          />
        </div>
      </main>
    </div>
  );
}
