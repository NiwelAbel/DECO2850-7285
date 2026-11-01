import { Play } from "lucide-react";

export default function Voice({ from, time, duration, mine, fresh }) {
  const bars = [8,14,20,11,17,24,13,19,10,16,21,12,18,9,15,22,12,18];

  return (
    <div className={`voice ${mine ? "mine" : ""}`}>
      <div className="voice-top">
        <strong>{from}</strong>
        <span>{fresh && <b className="new">NEW</b>} {time}</span>
      </div>

      <div className="wave-row">
        <button className="play">
          <Play size={14} fill="white" />
        </button>

        <div className="wave">
          {bars.map((h, i) => (
            <i key={i} style={{ height: h }} />
          ))}
        </div>

        <span>{duration}</span>
      </div>
    </div>
  );
}
