import test from "node:test";
import assert from "node:assert/strict";

import { TUTORIAL_STEPS, getTutorialStep } from "./tutorial.js";

test("tutorial teaches the main parent tasks on their real pages", () => {
  assert.deepEqual(
    TUTORIAL_STEPS.map((step) => step.page),
    ["home", "home", "messages", "live", "live", "profile"]
  );
});

test("tutorial steps point to unique interface targets", () => {
  const selectors = TUTORIAL_STEPS.map((step) => step.selector);
  assert.equal(new Set(selectors).size, selectors.length);
});

test("tutorial step lookup safely stays within its range", () => {
  assert.equal(getTutorialStep(-1), TUTORIAL_STEPS[0]);
  assert.equal(getTutorialStep(999), TUTORIAL_STEPS.at(-1));
});
