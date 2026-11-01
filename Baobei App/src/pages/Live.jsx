import { useEffect, useRef, useState } from "react";

import Bear from "../components/Bear";
import Header from "../components/Header";
import Action from "../components/Action";
import { useBear } from "../BearConnection";
import { formatActivityTime } from "../lib/hardware";

export default function Live({ setPage, bearState = "calm", setBearState }) {
  const [activeEffect, setActiveEffect] = useState(null);
  const { activities, status, sendLight, addVirtualHug } = useBear();
  const [controlError, setControlError] = useState("");
  const effectTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(effectTimer.current), []);

  const triggerEffect = (effect, message) => {
    setActiveEffect(effect);
    if (effect === "hug") addVirtualHug(message);
    window.clearTimeout(effectTimer.current);
    effectTimer.current = window.setTimeout(() => {
      setActiveEffect(null);
    }, effect === "hug" ? 1200 : 3000);
  };

  const controlLight = async (action) => {
    setControlError("");
    try {
      const result = await sendLight(action);
      if (result.led.enabled) triggerEffect(action === "toggle" ? "heart" : "light");
      else {
        window.clearTimeout(effectTimer.current);
        setActiveEffect(null);
      }
    } catch (error) {
      setControlError(error.message);
    }
  };

  return (
    <div className="mobile-screen app-screen">
      <main className="content scroll live-content">
        <Header title="Live Activity" back={() => setPage("home")} />

        <div className="live-card">
          <div className={`live-bear ${activeEffect || ""}`}>
            <Bear size={112} state={activeEffect === "hug" ? "happy" : bearState} />

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

          <span className="connected-pill">{status.connected ? "● CONNECTED" : "● OFFLINE"}</span>

          <h2>
            {activeEffect === "heart"
              ? "Bear is glowing warmly"
              : activeEffect === "light"
              ? "Bear is lighting up"
              : activeEffect === "hug"
              ? "Bear is giving a warm hug"
              : status.connected ? "Your child is with the bear" : "Bear is offline"}
          </h2>

          <small>{activities[0] ? formatActivityTime(activities[0].at) : "No activity yet"}</small>
        </div>

        <div className="latest-card">
          <label>LATEST FROM BEAR</label>

          <div className="bear-notification-list" data-tutorial="activity-list" aria-live="polite">
            {activities.length === 0 ? (
              <div className="bear-notification">
                <strong>No bear activity yet</strong>
                <small>Activity will appear here</small>
              </div>
            ) : (
              activities.map((item) => (
                <div className="bear-notification" key={item.id}>
                  <strong>{item.text}</strong>
                  <small>{formatActivityTime(item.at)}</small>
                </div>
              ))
            )}
            {controlError && <div className="bear-notification" role="alert"><strong>{controlError}</strong></div>}
          </div>
        </div>

        <p className="respond">RESPOND TO YOUR CHILD</p>

        <div className="actions" data-tutorial="response-actions">
          <Action
            icon="💛"
            text="Heart-light"
            onClick={() => controlLight("toggle")}
          />

          <Action
            icon="💡"
            text="Chenge color"
            onClick={() => controlLight("cycle")}
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
