import { getBearPresentation } from "../lib/experience";

export default function Bear({
  size = 64,
  state = "calm",
  showStatus = false,
}) {
  const presentation = getBearPresentation(state);

  return (
    <div className={`baobei-mascot ${presentation.state}`}>
      <svg
        className="baobei-bear-svg"
        width={size}
        height={size}
        viewBox="0 0 160 160"
        role="img"
        aria-label={presentation.label}
      >
        <circle className="bear-ear" cx="42" cy="38" r="25" />
        <circle className="bear-ear" cx="118" cy="38" r="25" />
        <circle className="bear-ear-inner" cx="42" cy="38" r="12" />
        <circle className="bear-ear-inner" cx="118" cy="38" r="12" />
        <ellipse className="bear-head" cx="80" cy="82" rx="58" ry="61" />
        <ellipse className="bear-muzzle" cx="80" cy="103" rx="28" ry="23" />
        <g className="bear-face">
          <ellipse className="bear-eye left" cx="58" cy="75" rx="5" ry="7" />
          <ellipse className="bear-eye right" cx="102" cy="75" rx="5" ry="7" />
          <path className="bear-happy-eye left" d="M50 76 Q58 68 66 76" />
          <path className="bear-happy-eye right" d="M94 76 Q102 68 110 76" />
          <path className="bear-sad-brow left" d="M50 68 Q58 63 65 69" />
          <path className="bear-sad-brow right" d="M95 69 Q102 63 110 68" />
          <ellipse className="bear-nose" cx="80" cy="96" rx="8" ry="6" />
          <path className="bear-mouth" d="M80 101 Q80 112 69 112 M80 101 Q80 112 91 112" />
        </g>
        <circle className="bear-heart-light" cx="80" cy="132" r="12" />
        <path className="bear-heart" d="M80 139 C65 129 69 119 80 125 C91 119 95 129 80 139Z" />
        <g className="bear-sound-waves">
          <path d="M126 67 Q139 80 126 93" />
          <path d="M136 57 Q156 80 136 103" />
        </g>
      </svg>

      {showStatus && (
        <div className="mascot-status" aria-live="polite">
          <strong>{presentation.label}</strong>
          <small>{presentation.detail}</small>
        </div>
      )}
    </div>
  );
}
