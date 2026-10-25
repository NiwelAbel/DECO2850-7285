import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./Messages.jsx", import.meta.url), "utf8");

test("does not display preset fake voice recordings", () => {
  assert.doesNotMatch(source, /function VoiceMessage/);
  assert.doesNotMatch(source, /duration="0:(12|25|18)"/);
});

test("shows a clear empty state before the parent records a real reply", () => {
  assert.match(source, /sentVoices\.length === 0/);
  assert.match(source, /No voice messages yet/);
});
