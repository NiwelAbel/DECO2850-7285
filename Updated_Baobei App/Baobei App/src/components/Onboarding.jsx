import { useState } from "react";
import { ChevronLeft, ChevronRight, LockKeyhole, Mic, Sparkles, Wifi } from "lucide-react";

import Bear from "./Bear";

const STEPS = [
  {
    eyebrow: "WELCOME TO BAOBEI",
    title: "Close to them, even from far away",
    text: "BaoBei connects this parent app with your child's teddy bear, so small moments can still be shared across the distance.",
    icon: Wifi,
    bearState: "happy",
    accent: "#ff765e",
  },
  {
    eyebrow: "VOICE MESSAGES",
    title: "Listen when you have time",
    text: "Your child can leave a voice message through the bear. You can listen and reply when your schedule allows.",
    icon: Mic,
    bearState: "message",
    accent: "#ff765e",
  },
  {
    eyebrow: "A WARM RESPONSE",
    title: "Let the bear carry your reply",
    text: "Send a voice reply, a warm light or a virtual hug. The bear gives your child a simple sign that you are thinking of them.",
    icon: Sparkles,
    bearState: "glowing",
    accent: "#e8b52f",
  },
  {
    eyebrow: "PRIVACY FIRST",
    title: "Your child stays in control",
    text: "Recording only starts when your child presses the bear's button. Parents cannot remotely turn on its microphone or camera.",
    icon: LockKeyhole,
    bearState: "calm",
    accent: "#39a96b",
  },
];

export default function Onboarding({ onComplete, onStartTutorial }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="onboarding-layer" role="dialog" aria-modal="true" aria-label="Welcome to BaoBei">
      <section className="onboarding-card">
        <div className="onboarding-topbar">
          <span className="onboarding-brand">BAOBEI</span>
          <button className="onboarding-skip" onClick={onComplete}>Skip</button>
        </div>

        <div className="onboarding-visual" style={{ "--step-accent": current.accent }}>
          <div className="onboarding-orbit" />
          <Bear size={178} state={current.bearState} />
          <span className="onboarding-icon"><Icon size={22} /></span>
        </div>

        <div className="onboarding-copy" key={current.title}>
          <span>{current.eyebrow}</span>
          <h1>{current.title}</h1>
          <p>{current.text}</p>
        </div>

        <div className="onboarding-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          {STEPS.map((item, index) => (
            <i key={item.title} className={index === step ? "active" : ""} />
          ))}
        </div>

        {isLast ? (
          <div className="onboarding-choice-actions">
            <button className="onboarding-next tutorial-choice" onClick={onStartTutorial}>
              Show me how to use the app
              <ChevronRight size={20} />
            </button>
            <button className="explore-choice" onClick={onComplete}>Explore on my own</button>
          </div>
        ) : (
          <div className="onboarding-actions">
            <button
              className="onboarding-back"
              onClick={() => setStep((value) => Math.max(0, value - 1))}
              disabled={step === 0}
              aria-label="Previous step"
            >
              <ChevronLeft size={21} />
            </button>

            <button
              className="onboarding-next"
              onClick={() => setStep((value) => value + 1)}
            >
              Next <ChevronRight size={20} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
