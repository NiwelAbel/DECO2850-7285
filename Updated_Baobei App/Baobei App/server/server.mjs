import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COLORS = ['#ff5050', '#50dd80', '#5080ff', '#ffb830', '#dd50cc', '#50dddd', '#ffffff'];
const ONLINE_MS = 5000;
const COMMAND_MS = 15000;
const MAX_AUDIO_BYTES = 960044;

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

export function inspectWav(bytes) {
  if (bytes.length < 46 || bytes.length > MAX_AUDIO_BYTES ||
      bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE' ||
      bytes.toString('ascii', 12, 16) !== 'fmt ' || bytes.readUInt32LE(16) !== 16 ||
      bytes.readUInt16LE(20) !== 1 || bytes.readUInt16LE(22) !== 1 ||
      bytes.readUInt32LE(24) !== 16000 || bytes.readUInt32LE(28) !== 32000 ||
      bytes.readUInt16LE(32) !== 2 || bytes.readUInt16LE(34) !== 16 ||
      bytes.toString('ascii', 36, 40) !== 'data' ||
      bytes.readUInt32LE(40) !== bytes.length - 44 || bytes.readUInt32LE(4) !== bytes.length - 8 ||
      (bytes.length - 44) % 2 !== 0) fail(422, 'Audio must be a 16 kHz, 16-bit mono PCM WAV of up to 30 seconds.');
  return (bytes.length - 44) / 32000;
}

export function createBaobei({ dataDir = path.join(ROOT, 'data'), token, clock = Date.now } = {}) {
  fs.mkdirSync(path.join(dataDir, 'audio'), { recursive: true, mode: 0o700 });
  const tokenFile = path.join(dataDir, 'pairing-key.txt');
  if (!token) {
    if (!fs.existsSync(tokenFile)) fs.writeFileSync(tokenFile, crypto.randomBytes(24).toString('hex'), { mode: 0o600 });
    token = fs.readFileSync(tokenFile, 'utf8').trim();
  }
  if (token.length < 16) throw new Error('Pairing key must contain at least 16 characters.');
  const stateFile = path.join(dataDir, 'state.json');
  let state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {
    version: 1, messages: [], events: [], seen: [], commands: [],
    led: { enabled: false, color: COLORS[0], revision: 0, effectUntil: 0 },
    moment: null, recordingDesired: false
  };
  if (state.version !== 1 || !Array.isArray(state.messages) || !Array.isArray(state.commands)) {
    throw new Error('Invalid saved server state. Restore a known checkpoint before starting.');
  }
  const devices = {};
  let interaction = { active: false, updatedAt: 0 };
  let ledApplied = null;
  let savedJson = fs.existsSync(stateFile) ? fs.readFileSync(stateFile, 'utf8') : '';

  function save() {
    const json = JSON.stringify(state);
    if (json === savedJson) return;
    const temp = `${stateFile}.tmp`;
    const fd = fs.openSync(temp, 'w', 0o600);
    try {
      fs.writeFileSync(fd, json);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(temp, stateFile);
    savedJson = json;
  }

  function activity(type, text, details = {}) {
    state.events.unshift({ id: crypto.randomUUID(), type, text, at: clock(), ...details });
    state.events = state.events.slice(0, 100);
  }

  function setMoment(type, details = {}) {
    state.moment = { id: crypto.randomUUID(), type, at: clock(), ...details };
  }

  function online(role) {
    return Boolean(devices[role] && clock() - devices[role].seenAt < ONLINE_MS);
  }

  function expire() {
    let changed = false;
    for (const command of state.commands) {
      if (['queued', 'delivered'].includes(command.status) && clock() > command.expiresAt) {
        command.status = 'expired';
        command.error = 'Device did not confirm before the deadline.';
        activity('error', `${command.type}: ${command.error}`);
        changed = true;
      }
    }
    if (!online('io') && interaction.active) interaction = { active: false, updatedAt: clock() };
    if (!state.commands.some(command => command.type.startsWith('record.') && ['queued', 'delivered'].includes(command.status))) {
      state.recordingDesired = online('cardputer') && devices.cardputer.status === 'recording';
    }
    if (changed) save();
  }

  function queue(type) {
    const command = { id: crypto.randomUUID(), type, createdAt: clock(), expiresAt: clock() + (type === 'play.latest' ? 45000 : COMMAND_MS), status: 'queued' };
    state.commands.push(command);
    state.commands = state.commands.slice(-100);
    return command;
  }

  function light({ enabled, color, durationMs = 0 }, source = 'app') {
    if (typeof enabled !== 'boolean' || !/^#[0-9a-f]{6}$/i.test(color) ||
      !Number.isInteger(durationMs) || durationMs < 0 || durationMs > 30000) fail(422, 'Invalid light settings.');
    state.led = { enabled, color: color.toLowerCase(), revision: state.led.revision + 1,
      effectUntil: durationMs ? clock() + durationMs : 0 };
    activity('light', enabled ? `Bear light turned on: ${color}` : 'Bear light turned off', { source, enabled, color, revision: state.led.revision });
    if (source === 'app') setMoment(enabled ? 'light.on' : 'light.off', { revision: state.led.revision });
    if (source === 'io') setMoment('activity');
  }

  function snapshot() {
    expire();
    return {
      serverTime: clock(), devices: Object.fromEntries(['io', 'cardputer'].map(role => [role, {
        ...devices[role], online: online(role)
      }])), interaction, led: state.led, ledApplied,
      messages: state.messages, events: state.events.filter(event => !['checkin', 'reward', 'command'].includes(event.type)),
      commands: state.commands.slice(-20).reverse(), moment: state.moment || null
    };
  }

  function sync(body) {
    if (!body || typeof body !== 'object') fail(422, 'Invalid device sync.');
    const { role, session, events = [], ack } = body;
    if (!['io', 'cardputer'].includes(role) || typeof session !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(session) ||
      !Array.isArray(events) || events.length > 32) fail(422, 'Invalid device sync.');
    if (role === 'cardputer' && !['idle', 'recording', 'playing', 'uploading', 'error'].includes(body.status)) fail(422, 'Invalid audio status.');
    for (const event of events) {
      if (role !== 'io' || typeof event.id !== 'string' || !/^[a-zA-Z0-9_-]{1,120}$/.test(event.id) ||
        !Number.isInteger(event.button) || event.button < 1 || event.button > 5 || typeof event.pressed !== 'boolean') fail(422, 'Invalid button event.');
    }
    if (role === 'io' && typeof body.active !== 'boolean') fail(422, 'Interaction state is required.');
    if (ack && (role !== 'cardputer' || typeof ack.id !== 'string' || typeof ack.ok !== 'boolean' ||
      (!ack.ok && (typeof ack.error !== 'string' || !ack.error)))) fail(422, 'Invalid command acknowledgement.');
    expire();
    if (role === 'cardputer' && devices.cardputer?.session !== session) {
      state.recordingDesired = false;
      for (const command of state.commands) {
        if (command.status === 'delivered') {
          command.status = 'failed';
          command.error = 'Cardputer restarted before confirmation.';
          activity('error', command.error);
        }
      }
    }
    devices[role] = { seenAt: clock(), session, status: body.status || 'ready', error: String(body.error || '').slice(0, 200) };
    if (role === 'io') {
      const active = body.active;
      if (active !== interaction.active) {
        interaction = { active, updatedAt: clock() };
        setMoment(active ? 'interaction.start' : 'interaction.end');
        if (!events.some(event => event.button === 5 && !state.seen.includes(event.id))) {
          activity('interaction', active ? 'Your child is holding the bear' : 'Your child released the bear');
        }
      }
      if (Number.isInteger(body.ledRevision)) ledApplied = { revision: body.ledRevision, at: clock() };
    }
    if (ack) {
      const command = state.commands.find(item => item.id === ack.id);
      if (command && ['queued', 'delivered'].includes(command.status)) {
        command.status = ack.ok ? 'done' : 'failed';
        command.error = ack.ok ? null : String(ack.error).slice(0, 200);
        const messages = { 'record.start': 'Your child started recording', 'record.stop': 'Your child finished recording', 'play.latest': 'A voice message played on the bear' };
        activity(ack.ok ? command.type === 'play.latest' ? 'playback' : 'recording' : 'error', ack.ok ? messages[command.type] : command.error);
        if (ack.ok) setMoment('activity');
      }
    }
    const accepted = [];
    for (const event of events) {
      accepted.push(event.id);
      if (state.seen.includes(event.id)) continue;
      state.seen.push(event.id);
      if (event.button === 5) {
        activity('interaction', event.pressed ? 'Your child is holding the bear' : 'Your child released the bear');
        setMoment(event.pressed ? 'interaction.start' : 'interaction.end');
        continue;
      }
      if (!event.pressed) continue;
      if (event.button === 1) {
        if (!online('cardputer')) activity('error', 'Record request rejected: Cardputer is offline.');
        else {
          state.recordingDesired = !state.recordingDesired;
          queue(state.recordingDesired ? 'record.start' : 'record.stop');
        }
      }
      if (event.button === 2) {
        if (online('cardputer')) queue('play.latest');
        else activity('error', 'Play request rejected: Cardputer is offline.');
      }
      if (event.button === 3) {
        const next = (COLORS.indexOf(state.led.color) + 1) % COLORS.length;
        light({ enabled: state.led.enabled, color: COLORS[next] }, 'io');
      }
      if (event.button === 4) light({ enabled: !state.led.enabled, color: state.led.color }, 'io');
    }
    state.seen = state.seen.slice(-4096);
    const command = role === 'cardputer' ? state.commands.find(item => ['queued', 'delivered'].includes(item.status)) : null;
    if (command) command.status = 'delivered';
    save();
    return { accepted, command: command ? { ...command, remainingMs: Math.max(0, command.expiresAt - clock()) } : null, led: { ...state.led,
      remainingMs: state.led.effectUntil ? Math.max(0, state.led.effectUntil - clock()) : 0 },
      latestParent: state.messages.findLast(message => message.from === 'parent') || null };
  }

  async function readBody(req, max) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > max) fail(413, 'Request too large.');
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const url = new URL(req.url, 'http://localhost');
    const send = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(value)); };
    try {
      if (url.pathname.startsWith('/api/')) {
        const supplied = Buffer.from(req.headers.authorization || '');
        const expected = Buffer.from(`Bearer ${token}`);
        if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) fail(401, 'Enter the bear pairing key to connect.');
        if (req.method === 'GET' && url.pathname === '/api/state') return send(200, snapshot());
        if (req.method === 'POST' && url.pathname === '/api/device/sync') {
          let body;
          try { body = JSON.parse((await readBody(req, 16000)).toString()); }
          catch (error) { if (error.status) throw error; fail(400, 'Invalid JSON.'); }
          return send(200, sync(body));
        }
        if (req.method === 'POST' && url.pathname === '/api/light') {
          const body = JSON.parse((await readBody(req, 2000)).toString());
          if (!online('io')) fail(409, 'Button and light board is offline.');
          const illuminated = state.led.enabled && (!state.led.effectUntil || clock() < state.led.effectUntil);
          if (body.action === 'toggle') light({ enabled: !illuminated, color: state.led.color });
          else if (body.action === 'cycle') {
            const index = (COLORS.indexOf(state.led.color) + 1) % COLORS.length;
            light({ enabled: illuminated, color: COLORS[index] });
          } else fail(422, 'Unknown light action.');
          save(); return send(202, { revision: state.led.revision, led: state.led });
        }
        if (req.method === 'POST' && url.pathname === '/api/messages') {
          const from = url.searchParams.get('from');
          const id = req.headers['x-message-id'];
          if (!['child', 'parent'].includes(from) || typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(id)) fail(422, 'Invalid message identity.');
          const bytes = await readBody(req, MAX_AUDIO_BYTES);
          const duration = inspectWav(bytes);
          const existing = state.messages.find(message => message.id === id);
          if (existing) {
            if (existing.from !== from || existing.sha256 !== crypto.createHash('sha256').update(bytes).digest('hex')) fail(409, 'Message ID already belongs to different audio.');
            save(); return send(200, existing);
          }
          const filename = path.join(dataDir, 'audio', `${id}.wav`);
          fs.writeFileSync(filename, bytes, { mode: 0o600 });
          const message = { id, from, duration, at: clock(), url: `/api/audio/${id}.wav`,
            sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
          state.messages.push(message);
          activity('voice', from === 'child' ? 'New voice message from your child' : 'Your voice reply was saved for the bear');
          if (from === 'parent') light({ enabled: true, color: '#ffb830', durationMs: 30000 }, 'reply');
          setMoment(from === 'parent' ? 'parent.voice' : 'activity');
          save(); return send(201, message);
        }
        if (req.method === 'GET' && /^\/api\/audio\/[a-zA-Z0-9_-]{1,100}\.wav$/.test(url.pathname)) {
          const id = path.basename(url.pathname, '.wav');
          if (!state.messages.some(message => message.id === id)) fail(404, 'Voice message not found.');
          const bytes = fs.readFileSync(path.join(dataDir, 'audio', `${id}.wav`));
          res.writeHead(200, { 'Content-Type': 'audio/wav', 'Content-Length': bytes.length }); return res.end(bytes);
        }
        fail(404, 'API route not found.');
      }
      if (req.method !== 'GET') fail(405, 'Method not allowed.');
      const dist = path.join(ROOT, 'dist');
      let target = path.resolve(dist, `.${decodeURIComponent(url.pathname)}`);
      if (!target.startsWith(`${dist}${path.sep}`) && target !== dist) fail(403, 'Invalid path.');
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) target = path.join(dist, 'index.html');
      if (!fs.existsSync(target)) fail(503, 'Build the app with npm run build first, or use the Vite development server.');
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
      res.end(fs.readFileSync(target));
    } catch (error) {
      if (!error.status) console.error(error);
      if (!res.headersSent) send(error.status || (error instanceof SyntaxError ? 400 : 500), { error: error.status ? error.message : 'The server could not complete this request.' });
      else res.destroy(error);
    }
  }
  return { handler, snapshot, tokenFile };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = createBaobei({ dataDir: process.env.BAOBEI_DATA_DIR, token: process.env.BAOBEI_DEVICE_TOKEN });
  const port = Number(process.env.PORT || 8787);
  http.createServer(app.handler).listen(port, '0.0.0.0', () => {
    console.log(`Baobei: http://localhost:${port}`);
    console.log(`Pairing key file: ${app.tokenFile}`);
  });
  if (process.env.BAOBEI_TLS_CERT && process.env.BAOBEI_TLS_KEY) {
    https.createServer({ cert: fs.readFileSync(process.env.BAOBEI_TLS_CERT), key: fs.readFileSync(process.env.BAOBEI_TLS_KEY) }, app.handler)
      .listen(Number(process.env.BAOBEI_TLS_PORT || 8443), '0.0.0.0', () => console.log('HTTPS app is ready.'));
  }
}
