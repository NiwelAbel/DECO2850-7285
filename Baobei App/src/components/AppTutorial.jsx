import { useEffect, useLayoutEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { getTutorialStep, TUTORIAL_STEPS } from "../lib/tutorial";

const EMPTY_RECT = { top: 0, left: 0, width: 0, height: 0, bottom: 0 };

export default function AppTutorial({
  currentPage,
  setPage,
  stepIndex,
  onStepChange,
  onComplete,
}) {
  const [targetRect, setTargetRect] = useState(EMPTY_RECT);
  const step = getTutorialStep(stepIndex);
  const isLast = stepIndex === TUTORIAL_STEPS.length - 1;

  useEffect(() => {
    setPage(step.page);
  }, [setPage, step.page]);

  useLayoutEffect(() => {
    if (currentPage !== step.page) return undefined;

    let frameOne;
    let frameTwo;

    const measure = () => {
      const target = document.querySelector(step.selector);
      if (!target) return;

      target.scrollIntoView({ block: "center", behavior: "instant" });
      const rect = target.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
      });
    };

    frameOne = requestAnimationFrame(() => {
      frameTwo = requestAnimationFrame(measure);
    });
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(frameOne);
      cancelAnimationFrame(frameTwo);
      window.removeEventListener("resize", measure);
    };
  }, [step, currentPage]);

  const tipAbove = targetRect.top > window.innerHeight * 0.55;
  const tipStyle = tipAbove
    ? { bottom: Math.max(20, window.innerHeight - targetRect.top + 16) }
    : { top: Math.min(window.innerHeight - 230, targetRect.bottom + 16) };

  return (
    <div className="app-tutorial" role="dialog" aria-modal="true" aria-label="BaoBei app tutorial">
      <div
        className="tutorial-spotlight"
        style={{
          top: targetRect.top - 7,
          left: targetRect.left - 7,
          width: targetRect.width + 14,
          height: targetRect.height + 14,
        }}
      />

      <section className="tutorial-tip" style={tipStyle}>
        <div className="tutorial-tip-top">
          <span>STEP {stepIndex + 1} OF {TUTORIAL_STEPS.length}</span>
          <button onClick={onComplete} aria-label="Skip tutorial"><X size={19} /></button>
        </div>
        <h2>{step.title}</h2>
        <p>{step.text}</p>

        <div className="tutorial-tip-actions">
          <button
            className="tutorial-previous"
            onClick={() => onStepChange(Math.max(0, stepIndex - 1))}
            disabled={stepIndex === 0}
          >
            <ChevronLeft size={19} /> Back
          </button>
          <button
            className="tutorial-continue"
            onClick={() => isLast ? onComplete() : onStepChange(stepIndex + 1)}
          >
            {isLast ? "Finish" : "Next"}
            {!isLast && <ChevronRight size={19} />}
          </button>
        </div>
      </section>
    </div>
  );
}
