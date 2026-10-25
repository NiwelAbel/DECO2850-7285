import test from "node:test";
import assert from "node:assert/strict";

import {
  completeOnboarding,
  getBearPresentation,
  hasCompletedOnboarding,
} from "./experience.js";

test("returns the presentation for a known bear state", () => {
  assert.deepEqual(getBearPresentation("message"), {
    state: "message",
    label: "New message from your child",
    detail: "BaoBei has something for you",
  });
});

test("falls back to calm for an unknown bear state", () => {
  assert.equal(getBearPresentation("surprised").state, "calm");
});

test("onboarding completion can be saved and read", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  assert.equal(hasCompletedOnboarding(storage), false);
  completeOnboarding(storage);
  assert.equal(hasCompletedOnboarding(storage), true);
});
