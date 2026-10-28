import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createBaobei } from './server.mjs';
import { getBearStatus } from '../src/lib/hardware.js';

const KEY = 'test-pairing-key-123456';

function wav(samples = 1600) {
  const bytes = Buffer.alloc(44 + samples * 2);
  bytes.write('RIFF', 0); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8);
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(16000, 24); bytes.writeUInt32LE(32000, 28);
  bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write('data', 36); bytes.writeUInt32LE(samples * 2, 40);
  for (let index = 0; index < samples; index++) bytes.writeInt16LE(Math.round(2000 * Math.sin(index / 10)), 44 + index * 2);
  return bytes;
}

async function setup(t) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'baobei-test-'));
  let now = Date.parse('2026-10-28T02:00:00Z');
  const options = { dataDir, token: KEY, clock: () => now };
  const server = http.createServer(createBaobei(options).handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  async function request(route, body, headers = {}) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { Authorization: `Bearer ${KEY}`, ...headers },
      body: body === undefined ? undefined : Buffer.isBuffer(body) ? body : JSON.stringify(body)
    });
    return { status: response.status, body: response.headers.get('content-type')?.startsWith('audio/') ?
      Buffer.from(await response.arrayBuffer()) : await response.json() };
  }
  const io = body => request('/api/device/sync', { role: 'io', session: 'io-boot', active: false, ...body });
  const card = body => request('/api/device/sync', { role: 'cardputer', session: 'card-boot', status: 'idle', ...body });
  return { request, io, card, options, advance: ms => { now += ms; } };
}

test('six-button contract, hold/release, deduplication and command acknowledgement', async t => {
  const { request, io, card } = await setup(t);
  await card();
  const event = { id: 'press-1', button: 1, pressed: true };
  await io({ events: [event], active: true });
  await io({ events: [event], active: true });
  const start = (await card()).body.command;
  assert.equal(start.type, 'record.start');
  assert.equal((await card()).body.command.id, start.id);
  await card({ status: 'recording', ack: { id: start.id, ok: true } });
  await io({ events: [{ ...event, id: 'press-2' }] });
  const stop = (await card({ status: 'recording' })).body.command;
  assert.equal(stop.type, 'record.stop');
  await card({ ack: { id: stop.id, ok: true } });
  assert.equal((await card()).body.command, null);
  await io({ events: [{ id: 'light-on', button: 4, pressed: true }] });
  const before = (await request('/api/state')).body.led;
  await io({ events: [{ id: 'color', button: 3, pressed: true }], active: true });
  const current = (await request('/api/state')).body;
  assert.equal(current.interaction.active, true);
  assert.equal(current.led.enabled, true);
  assert.notEqual(current.led.color, before.color);
  await io({ active: false });
  assert.equal((await request('/api/state')).body.interaction.active, false);
  await io({ events: [{ id: 'play', button: 2, pressed: true }] });
  assert.equal((await card()).body.command.type, 'play.latest');
  assert.equal((await io({ events: [{ id: 'reserved', button: 6, pressed: true }] })).status, 422);
});

test('real WAV upload, exact download, idempotency, restart persistence and validation', async t => {
  const { request, options } = await setup(t);
  const bytes = wav();
  const headers = { 'X-Message-Id': 'child-1' };
  assert.equal((await request('/api/state', undefined, { Authorization: 'Bearer wrong' })).status, 401);
  assert.equal((await request('/api/messages?from=child', bytes, headers)).status, 201);
  assert.equal((await request('/api/messages?from=child', bytes, headers)).status, 200);
  assert.equal((await request('/api/messages?from=parent', bytes, headers)).status, 409);
  const download = await request('/api/audio/child-1.wav');
  assert.deepEqual(download.body, bytes);
  const corrupt = Buffer.from(bytes); corrupt.writeUInt32LE(44100, 24);
  assert.equal((await request('/api/messages?from=child', corrupt, { 'X-Message-Id': 'broken' })).status, 422);
  const restored = createBaobei(options).snapshot();
  assert.equal(restored.messages.length, 1);
  assert.equal(Object.hasOwn(restored, "checkin"), false);
  assert.equal(restored.devices.cardputer.online, false);
});

test('offline and expired devices never claim success; failed commands report the reason', async t => {
  const { request, io, card, advance } = await setup(t);
  assert.equal((await request('/api/light', { action: 'toggle' })).status, 409);
  await card();
  await io({ active: true, ledRevision: 2, events: [{ id: 'one', button: 1, pressed: true }] });
  const command = (await card()).body.command;
  await card({ ack: { id: command.id, ok: false, error: 'Storage full' }, status: 'error' });
  let state = (await request('/api/state')).body;
  assert.equal(state.commands[0].status, 'failed');
  assert.equal(state.commands[0].error, 'Storage full');
  await io({ events: [{ id: 'two', button: 2, pressed: true }], active: true });
  advance(46000);
  state = (await request('/api/state')).body;
  assert.equal(state.commands[0].status, 'expired');
  assert.equal(state.devices.io.online, false);
  assert.equal(state.interaction.active, false);
});

test('short hold and release in one sync are both reported once', async t => {
  const { request, io } = await setup(t);
  const events = [{ id: 'hold', button: 5, pressed: true }, { id: 'release', button: 5, pressed: false }];
  await io({ active: false, events });
  await io({ active: false, events });
  const state = (await request('/api/state')).body;
  assert.equal(state.interaction.active, false);
  assert.equal(state.events.filter(event => event.type === 'interaction').length, 2);
  assert.match(state.events[0].text, /released/);
});

test('light toggles are atomic, cycle in order, preserve the switch and reach unchanged firmware', async t => {
  const { request, io } = await setup(t);
  await io();
  let state = (await request('/api/state')).body;
  const colors = ['#50dd80', '#5080ff', '#ffb830', '#dd50cc', '#50dddd', '#ffffff', '#ff5050'];
  for (const color of colors) {
    const result = await request('/api/light', { action: 'cycle' });
    assert.equal(result.status, 202);
    assert.equal(result.body.led.color, color);
    assert.equal(result.body.led.enabled, false);
  }
  for (const enabled of [true, false, true, false]) {
    const result = await request('/api/light', { action: 'toggle' });
    assert.equal(result.body.led.enabled, enabled);
  }
  const current = (await io()).body.led;
  assert.equal(current.color, '#ff5050');
  assert.equal(current.enabled, false);
  assert.equal(current.effectUntil, 0);
  assert.equal(current.remainingMs, 0);
  await io({ ledRevision: current.revision });
  state = (await request('/api/state')).body;
  assert.equal(state.ledApplied.revision, current.revision);
  assert.equal((await request('/api/light', { action: 'unknown' })).status, 422);
});

test('all five UI states follow real messages, held buttons and acknowledged light actions', async t => {
  const { request, io, card, advance } = await setup(t);
  const read = async () => (await request('/api/state')).body;
  assert.equal(getBearStatus(await read(), true).state, 'disconnected');
  await card(); await io();
  assert.equal(getBearStatus(await read(), true).state, 'calm');
  await request('/api/messages?from=parent', wav(), { 'X-Message-Id': 'parent-voice' });
  assert.equal(getBearStatus(await read(), true).state, 'message');
  await io({ active: true, events: [{ id: 'press-hold', button: 5, pressed: true }] });
  assert.equal(getBearStatus(await read(), true).state, 'happy');
  await io({ active: false, events: [{ id: 'press-release', button: 5, pressed: false }] });
  assert.equal(getBearStatus(await read(), true).detail, 'Last active: Your child released the bear');
  await request('/api/light', { action: 'toggle' });
  const on = (await request('/api/light', { action: 'toggle' })).body.led;
  assert.equal(getBearStatus(await read(), true).state, 'calm');
  await io({ ledRevision: on.revision });
  assert.equal(getBearStatus(await read(), true).state, 'glowing');
  const view = await read();
  assert.equal(Object.hasOwn(view, 'checkin'), false);
  assert.equal(view.events.some(event => ['checkin', 'reward'].includes(event.type)), false);
  advance(5100);
  assert.equal(getBearStatus(await read(), true).state, 'disconnected');
});
