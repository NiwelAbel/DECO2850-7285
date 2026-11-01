import test from 'node:test';
import assert from 'node:assert/strict';
import { getBearStatus, formatVoiceTime } from './hardware.js';

function snapshot() {
  return {
    serverTime: 10000,
    devices: { io: { online: true }, cardputer: { online: true } },
    interaction: { active: false },
    led: { enabled: false, revision: 0, effectUntil: 0 },
    ledApplied: { revision: 0 },
    events: [{ id: 'released', text: 'Your child released the bear', at: 9000 }],
    moment: { id: 'moment', type: 'interaction.end' }
  };
}

test('offline overrides pending messages and an interaction when either board disconnects', () => {
  const state = snapshot();
  state.moment.type = 'parent.voice';
  state.interaction.active = true;
  assert.equal(getBearStatus(state, false).state, 'disconnected');
  state.devices.cardputer.online = false;
  assert.equal(getBearStatus(state, true).state, 'disconnected');
  assert.equal(getBearStatus(null, false).state, 'disconnected');
});

test('last active shows the latest shared activity content', () => {
  const status = getBearStatus(snapshot(), true);
  assert.equal(status.state, 'calm');
  assert.equal(status.detail, 'Last active: Your child released the bear');
});

test('a parent voice reply selects the waiting moment even when its automatic light is on', () => {
  const state = snapshot();
  state.moment.type = 'parent.voice';
  state.led.enabled = true;
  assert.equal(getBearStatus(state, true).state, 'message');
  state.interaction.active = true;
  assert.equal(getBearStatus(state, true).state, 'happy');
});

test('a light request becomes glowing only after the board confirms the current revision', () => {
  const state = snapshot();
  state.moment.type = 'light.on';
  state.led = { enabled: true, revision: 2, effectUntil: 0 };
  assert.equal(getBearStatus(state, true).state, 'calm');
  state.ledApplied.revision = 2;
  assert.equal(getBearStatus(state, true).state, 'glowing');
  state.led.enabled = false;
  assert.equal(getBearStatus(state, true).state, 'calm');
  state.led.enabled = true;
  state.led.effectUntil = 9999;
  assert.equal(getBearStatus(state, true).state, 'calm');
});

test('audio durations use complete seconds in the existing control layout', () => {
  assert.equal(formatVoiceTime(0.3), '00:00');
  assert.equal(formatVoiceTime(29.984), '00:29');
  assert.equal(formatVoiceTime(60), '01:00');
});
