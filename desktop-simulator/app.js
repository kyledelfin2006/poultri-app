const $ = (selector) => document.querySelector(selector);
let selected = 'house-2';
let current = null;
let editing = false;

async function api(path, payload) {
  const response = await fetch(path, payload === undefined ? undefined : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Simulator request failed.');
  return body;
}

function message(value) { $('#message').textContent = value; }

function selectedHouse() { return current?.houses.find((house) => house.id === selected); }

function renderAlerts(alerts) {
  const list = $('#alerts');
  list.replaceChildren();
  if (!alerts.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-alert'; empty.textContent = 'No changes need inspection yet.';
    list.append(empty); return;
  }
  for (const alert of alerts.slice(0, 6)) {
    const entry = document.createElement('div'); entry.className = 'alert-entry';
    const title = document.createElement('strong');
    title.textContent = `${current.houses.find((house) => house.id === alert.houseId)?.name || alert.houseId} · ${alert.active ? 'Condition active' : 'Readings recovered'}`;
    const detail = document.createElement('p'); detail.textContent = alert.observed;
    const suggestion = document.createElement('p'); suggestion.textContent = alert.suggestions.join(' ');
    entry.append(title, detail, suggestion); list.append(entry);
  }
}

function render() {
  if (!current) return;
  const house = selectedHouse();
  $('#clock').textContent = `STEP ${current.clock}`;
  $('#run-state').textContent = current.running ? `PLAYING · ${current.speed}×` : 'PAUSED';
  $('#play').textContent = current.running ? 'Ⅱ Pause' : '▶ Play';
  $('#speed').value = String(current.speed);
  $('#addresses').textContent = current.addresses.join('  ·  ') || 'Check the server terminal for the LAN address.';
  $('#pairing-code').textContent = current.pairingCode || 'Shown only on this computer';
  $('#phone-status').textContent = current.paired ? 'PHONE PAIRED' : 'NO PHONE';
  $('#phone-status').classList.toggle('neutral', !current.paired);
  $('#push-status').textContent = `${current.pushStatus.state}: ${current.pushStatus.detail}`;
  const overview = $('#house-overview'); overview.replaceChildren();
  for (const item of current.houses) {
    const button = $(`[data-house="${item.id}"]`);
    button.setAttribute('aria-pressed', String(item.id === selected));
    button.classList.toggle('warning', item.status !== 'Normal');
    button.classList.toggle('low-movement', item.reference.movement - item.movement >= 20);
    button.querySelector('.house-condition').textContent = item.status === 'Normal' ? 'NORMAL' : 'INSPECT';
    const summary = document.createElement('div'); summary.className = `overview-item ${item.status === 'Normal' ? '' : 'warning'}`;
    const title = document.createElement('strong'); title.textContent = item.name;
    const detail = document.createElement('span'); detail.textContent = `${item.temperature.toFixed(1)}°C · ${item.movement}% movement · ${item.status}`;
    summary.append(title, detail); overview.append(summary);
  }
  $('#selected-heading').textContent = house.name;
  $('#selected-status').textContent = house.status === 'Normal' ? 'NORMAL' : 'INSPECT';
  $('#selected-status').classList.toggle('warning', house.status !== 'Normal');
  $('#temperature-readout').textContent = `${house.temperature.toFixed(1)}°C`;
  $('#humidity-readout').textContent = `${house.humidity}%`;
  $('#movement-readout').textContent = `${house.movement}%`;
  for (const button of document.querySelectorAll('[data-scenario]')) button.classList.toggle('selected', button.dataset.scenario === house.scenario);
  if (!editing) {
    for (const field of ['temperature', 'humidity', 'movement', 'eggs']) $(`#${field}`).value = house[field];
    renderOutputs();
  }
  renderAlerts(current.alerts);
}

function renderOutputs() {
  $('#temperature-output').value = `${Number($('#temperature').value).toFixed(1)}°C`;
  $('#humidity-output').value = `${$('#humidity').value}%`;
  $('#movement-output').value = `${$('#movement').value}%`;
}

async function refresh() {
  try { current = await api('/api/state'); render(); }
  catch (error) { message(`Connection lost: ${error.message}`); }
  setTimeout(refresh, 1000);
}

async function act(path, payload) {
  try { current = await api(path, payload); render(); message('Simulated farm updated.'); }
  catch (error) { message(error.message); }
}

for (const button of document.querySelectorAll('[data-house]')) button.addEventListener('click', () => { selected = button.dataset.house; editing = false; render(); });
for (const button of document.querySelectorAll('[data-scenario]')) button.addEventListener('click', () => act('/api/scenario', { houseId: selected, scenario: button.dataset.scenario }));
$('#play').addEventListener('click', () => act('/api/control', { action: current?.running ? 'pause' : 'play' }));
$('#step').addEventListener('click', () => act('/api/control', { action: 'step' }));
$('#speed').addEventListener('change', () => act('/api/control', { action: 'speed', speed: Number($('#speed').value) }));
for (const field of ['temperature', 'humidity', 'movement']) $('#'+field).addEventListener('input', () => { editing = true; renderOutputs(); });
async function sendManual() {
  const payload = { houseId: selected, temperature: Number($('#temperature').value), humidity: Number($('#humidity').value), movement: Number($('#movement').value), eggs: Number($('#eggs').value) };
  try { await api('/api/readings', payload); editing = false; current = await api('/api/state'); render(); message('Simulated reading sent to the phone.'); }
  catch (error) { message(error.message); }
}
for (const field of ['temperature', 'humidity', 'movement', 'eggs']) $('#'+field).addEventListener('change', sendManual);
void refresh();
