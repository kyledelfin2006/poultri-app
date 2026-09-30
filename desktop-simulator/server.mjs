import { randomInt, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT || 4174);
const pairingCode = String(randomInt(100000, 1000000));
const runId = randomUUID().slice(0, 8);
const baselines = [
  { id: 'house-1', name: 'House 1', temperature: 28.4, humidity: 62, movement: 86, eggs: 3650 },
  { id: 'house-2', name: 'House 2', temperature: 28.8, humidity: 64, movement: 82, eggs: 3190 },
  { id: 'house-3', name: 'House 3', temperature: 29.1, humidity: 65, movement: 79, eggs: 3940 },
];
const houses = baselines.map((base) => ({
  id: base.id, name: base.name, reference: { temperature: base.temperature, humidity: base.humidity, movement: base.movement },
  temperature: base.temperature, humidity: base.humidity, movement: base.movement, eggs: base.eggs,
  scenario: 'Normal', step: 0, recoveryStart: null, activeAlertId: null,
}));
const events = [];
const alerts = [];
const pendingReceipts = new Map();
let sequence = 0;
let clock = 0;
let running = false;
let speed = 1;
let timer;
let pushToken = null;
let pushStatus = { state: 'No phone paired', detail: 'Pair a phone to enable system notifications.' };

function localAddresses() {
  return Object.values(networkInterfaces()).flatMap((entries) => (entries || [])
    .filter((entry) => entry.family === 'IPv4' && !entry.internal).map((entry) => entry.address));
}

function publicHouse(house) {
  const { recoveryStart, activeAlertId, ...visible } = house;
  return { ...visible, status: activeAlertId ? 'Needs inspection' : 'Normal' };
}

function state(request) {
  const loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket.remoteAddress);
  return { runId, houses: houses.map(publicHouse), alerts, sequence, clock, running, speed, paired: Boolean(pushToken), pushStatus,
    addresses: localAddresses().map((address) => `http://${address}:${PORT}`), ...(loopback ? { pairingCode } : {}) };
}

function json(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(body));
}

async function bodyJson(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 4096) throw new Error('Payload is too large.');
  }
  try { return JSON.parse(raw); } catch { throw new Error('Expected JSON.'); }
}

function validReading(value) {
  const { temperature, humidity, movement, eggs } = value;
  return [temperature, humidity, movement, eggs].every(Number.isFinite)
    && temperature >= 0 && temperature <= 60 && humidity >= 0 && humidity <= 100
    && movement >= 0 && movement <= 100 && Number.isInteger(eggs) && eggs >= 0 && eggs <= 10000;
}

function conditions(house) {
  const temperatureRise = +(house.temperature - house.reference.temperature).toFixed(1);
  const movementDrop = house.reference.movement - house.movement;
  const hot = temperatureRise >= 1.5;
  const still = movementDrop >= 20;
  return {
    active: hot || still,
    observed: [hot && `temperature rose ${temperatureRise.toFixed(1)}°C from its demo reference`,
      still && `movement dropped ${movementDrop} points from its demo reference`].filter(Boolean).join(' while '),
    suggestions: [hot && 'Verify the reading and inspect conditions in this house.',
      still && 'Verify the movement reading and visually inspect activity in this house.'].filter(Boolean),
  };
}

function commit(house, values) {
  Object.assign(house, values);
  const result = conditions(house);
  let alert = alerts.find((item) => item.id === house.activeAlertId);
  const newAlert = result.active && !alert;
  if (newAlert) {
    alert = { id: `sim-${runId}-${++sequence}`, houseId: house.id, status: 'New', observed: result.observed,
      temperature: house.temperature, movement: house.movement, referenceTemperature: house.reference.temperature,
      referenceMovement: house.reference.movement, suggestions: result.suggestions, active: true };
    house.activeAlertId = alert.id;
    alerts.unshift(alert);
    if (alerts.length > 100) alerts.pop();
  } else if (alert) {
    Object.assign(alert, { temperature: house.temperature, movement: house.movement, active: result.active,
      ...(result.active ? { observed: result.observed, suggestions: result.suggestions } : {}) });
    if (!result.active) house.activeAlertId = null;
  }
  const event = { sequence: ++sequence, houseId: house.id, temperature: house.temperature, humidity: house.humidity,
    movement: house.movement, eggs: house.eggs, alert: alert ? { ...alert } : null, at: new Date().toISOString() };
  events.push(event);
  if (events.length > 500) events.shift();
  if (newAlert) void sendPush(alert, house.name);
  return event;
}

function tickHouse(house) {
  const base = house.reference;
  const next = Math.min(house.step + 1, 3);
  if (house.scenario === 'Custom' || (house.scenario !== 'Normal' && house.step >= 3)) return;
  let values;
  if (house.scenario === 'Temperature rising') {
    values = { temperature: +(base.temperature + [0, 1.2, 2.4, 3.3][next]).toFixed(1), humidity: base.humidity + [0, 2, 5, 8][next], movement: base.movement - [0, 5, 12, 21][next] };
  } else if (house.scenario === 'Movement dropping') {
    values = { temperature: +(base.temperature + [0, 0.1, 0.3, 0.4][next]).toFixed(1), humidity: base.humidity + [0, 0, 1, 1][next], movement: base.movement - [0, 14, 24, 31][next] };
  } else if (house.scenario === 'Recovery') {
    const start = house.recoveryStart;
    values = { temperature: +(start.temperature + (base.temperature - start.temperature) * next / 3).toFixed(1),
      humidity: Math.round(start.humidity + (base.humidity - start.humidity) * next / 3),
      movement: Math.round(start.movement + (base.movement - start.movement) * next / 3) };
  } else {
    const i = (house.step + 1) % 3;
    values = { temperature: +(base.temperature + [0.1, -0.1, 0][i]).toFixed(1), humidity: base.humidity + [0, -1, 0][i], movement: base.movement + [-1, 1, 0][i] };
  }
  house.step = house.scenario === 'Normal' ? house.step + 1 : next;
  commit(house, values);
  if (house.scenario === 'Recovery' && next === 3) { house.scenario = 'Normal'; house.step = 0; house.recoveryStart = null; }
}

function tick() {
  clock++;
  for (const house of houses) tickHouse(house);
}

function setTimer() {
  clearInterval(timer);
  if (running) timer = setInterval(tick, Math.round(2500 / speed));
}

async function sendPush(alert, houseName) {
  if (!pushToken) { pushStatus = { state: 'No phone paired', detail: 'Alert recorded; system notification was not sent.' }; return; }
  pushStatus = { state: 'Sending', detail: `${houseName}: submitting system notification.` };
  const payload = { to: pushToken, title: `Poultri demo · ${houseName}`, body: 'Simulated change needs inspection. Tap to review.',
    sound: 'default', channelId: 'demo-alerts', data: { type: 'poultri-simulator-alert', alert } };
  for (const delay of [0, 1000, 3000]) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', { method: 'POST',
        headers: { 'content-type': 'application/json', ...(process.env.EXPO_ACCESS_TOKEN ? { authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {}) },
        body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
      const result = await response.json();
      const ticket = Array.isArray(result.data) ? result.data[0] : result.data;
      if (response.status === 429 || response.status >= 500) continue;
      if (!response.ok || ticket?.status !== 'ok') throw new Error(ticket?.message || result.errors?.[0]?.message || `Push service returned ${response.status}`);
      pendingReceipts.set(ticket.id, alert.id);
      pushStatus = { state: 'Submitted', detail: `${houseName}: accepted by Expo; phone delivery is not yet confirmed.` };
      return;
    } catch (error) {
      if (delay === 3000) pushStatus = { state: 'Failed', detail: String(error.message || error) };
    }
  }
  if (pushStatus.state === 'Sending') pushStatus = { state: 'Failed', detail: 'Push service is temporarily unavailable.' };
}

async function checkReceipts() {
  if (!pendingReceipts.size) return;
  try {
    const ids = [...pendingReceipts.keys()];
    const response = await fetch('https://exp.host/--/api/v2/push/getReceipts', { method: 'POST',
      headers: { 'content-type': 'application/json', ...(process.env.EXPO_ACCESS_TOKEN ? { authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {}) },
      body: JSON.stringify({ ids }), signal: AbortSignal.timeout(8000) });
    if (!response.ok) return;
    const result = await response.json();
    for (const id of ids) {
      const receipt = result.data?.[id];
      if (!receipt) continue;
      pendingReceipts.delete(id);
      if (receipt.status === 'error') {
        pushStatus = { state: 'Failed', detail: receipt.message || receipt.details?.error || 'Push provider rejected the notification.' };
        if (receipt.details?.error === 'DeviceNotRegistered') pushToken = null;
      } else pushStatus = { state: 'Provider accepted', detail: 'FCM accepted the push; phone display cannot be confirmed by the server.' };
    }
  } catch { /* Keep receipts pending for the next check. */ }
}
setInterval(() => { void checkReceipts(); }, 60_000).unref();

const files = {
  '/': [new URL('./index.html', import.meta.url), 'text/html; charset=utf-8'],
  '/app.js': [new URL('./app.js', import.meta.url), 'text/javascript; charset=utf-8'],
  '/styles.css': [new URL('./styles.css', import.meta.url), 'text/css; charset=utf-8'],
  '/brand/logo.png': [new URL('../assets/poultri_logo.png', import.meta.url), 'image/png'],
  '/brand/wordmark.png': [new URL('../assets/poultri_text.png.png', import.meta.url), 'image/png'],
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
    const file = request.method === 'GET' && files[url.pathname];
    if (file) { response.writeHead(200, { 'content-type': file[1], 'cache-control': 'no-store' }); return response.end(await readFile(fileURLToPath(file[0]))); }
    if (request.method === 'GET' && url.pathname === '/api/state') return json(response, 200, state(request));
    if (request.method === 'GET' && url.pathname === '/api/events') {
      const after = Number(url.searchParams.get('after')) || 0;
      return json(response, 200, { runId, sequence, events: events.filter((event) => event.sequence > after) });
    }
    if (request.method === 'POST' && url.pathname === '/api/pair') {
      const body = await bodyJson(request);
      if (body?.code !== pairingCode || !/^(Exponent|Expo)PushToken\[[^\]]+\]$/.test(body?.token || '')) return json(response, 403, { error: 'Invalid pairing code or push token.' });
      pushToken = body.token;
      pushStatus = { state: 'Ready', detail: 'Phone paired; system notifications can be submitted.' };
      return json(response, 200, { paired: true });
    }
    if (request.method === 'POST' && url.pathname === '/api/unpair') {
      const body = await bodyJson(request);
      if (body?.code !== pairingCode) return json(response, 403, { error: 'Invalid pairing code.' });
      pushToken = null;
      pushStatus = { state: 'No phone paired', detail: 'Phone disconnected; system notifications are off.' };
      return json(response, 200, { paired: false });
    }
    if (request.method === 'POST' && url.pathname === '/api/readings') {
      const body = await bodyJson(request);
      const house = houses.find((item) => item.id === body?.houseId);
      if (!house || !validReading(body)) return json(response, 400, { error: 'House or reading values are outside the supported demo ranges.' });
      house.scenario = 'Custom'; house.step = 0;
      return json(response, 201, commit(house, { temperature: body.temperature, humidity: body.humidity, movement: body.movement, eggs: body.eggs }));
    }
    if (request.method === 'POST' && url.pathname === '/api/scenario') {
      const body = await bodyJson(request);
      const house = houses.find((item) => item.id === body?.houseId);
      if (!house || !['Normal', 'Temperature rising', 'Movement dropping', 'Recovery'].includes(body?.scenario)) return json(response, 400, { error: 'Invalid house or scenario.' });
      house.scenario = body.scenario; house.step = 0;
      house.recoveryStart = body.scenario === 'Recovery' ? { temperature: house.temperature, humidity: house.humidity, movement: house.movement } : null;
      if (body.scenario === 'Normal' || body.scenario === 'Temperature rising' || body.scenario === 'Movement dropping') commit(house, house.reference);
      return json(response, 200, state(request));
    }
    if (request.method === 'POST' && url.pathname === '/api/control') {
      const body = await bodyJson(request);
      if (body?.action === 'step') tick();
      else if (body?.action === 'play') running = true;
      else if (body?.action === 'pause') running = false;
      else if (body?.action === 'speed' && [1, 2, 4].includes(body.speed)) speed = body.speed;
      else return json(response, 400, { error: 'Invalid simulation control.' });
      setTimer();
      return json(response, 200, state(request));
    }
    json(response, 404, { error: 'Not found.' });
  } catch (error) { json(response, 400, { error: error.message || 'Invalid request.' }); }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Poultri IoT Simulator: http://localhost:${PORT}`);
  for (const address of localAddresses()) console.log(`Phone connection: http://${address}:${PORT}`);
  console.log(`Phone pairing code: ${pairingCode}`);
});
