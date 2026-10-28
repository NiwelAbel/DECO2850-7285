import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const liveSource = readFileSync(new URL("./Live.jsx", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

test("keeps bear notifications inside a dedicated scrolling region", () => {
  assert.match(liveSource, /className="bear-notification-list"/);
  assert.match(
    stylesSource,
    /\.bear-notification-list\s*\{[^}]*height:\s*108px[^}]*overflow-y:\s*auto/s
  );
});

test("keeps response controls close to the fixed notification card", () => {
  assert.match(
    stylesSource,
    /\.respond\s*\{[^}]*margin:\s*16px 0 10px/s
  );
});

test("uses a compact Live Activity layout so all four controls remain visible", () => {
  assert.match(liveSource, /className="content scroll live-content"/);
  assert.match(stylesSource, /\.live-content\s*\{[^}]*padding-bottom:\s*24px/s);
  assert.match(stylesSource, /\.live-content \.action\s*\{[^}]*min-height:\s*86px/s);
});
