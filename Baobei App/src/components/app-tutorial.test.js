import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./AppTutorial.jsx", import.meta.url), "utf8");

test("remeasures the spotlight after the tutorial changes page", () => {
  assert.match(source, /currentPage/);
  assert.match(source, /\[step, currentPage\]/);
});

test("keeps the active tutorial step outside the route-specific component", () => {
  assert.match(source, /stepIndex,\s*onStepChange/);
  assert.doesNotMatch(source, /useState\(0\)/);
});
