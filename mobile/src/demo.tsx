import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

export type Scenario = 'Normal' | 'Temperature rising' | 'Movement dropping' | 'Recovery';
export type Signal = { step: number; temperature: number; humidity: number; movement: number };
export type House = {
  id: string;
  name: string;
  birds: number;
  eggs: number;
  production: number[];
  reference: Signal;
  readings: Signal[];
};
export type AlertStatus = 'New' | 'Acknowledged' | 'Resolved';
export type FarmAlert = {
  id: string;
  houseId: string;
  status: AlertStatus;
  observed: string;
  temperature: number;
  movement: number;
  referenceTemperature: number;
  referenceMovement: number;
  note: string;
  suggestions?: string[];
  source?: 'desktop';
};
export type RemoteAlert = Omit<FarmAlert, 'note' | 'source'> & { suggestions: string[]; active: boolean };
type RemoteReading = { houseId: string; temperature: number; humidity: number; movement: number; eggs: number; alert?: RemoteAlert | null };
type DemoData = {
  farmName: string;
  ownerName: string;
  scenario: Scenario;
  scenarioStep: number;
  offline: boolean;
  houses: House[];
  alerts: FarmAlert[];
};

const STORAGE_KEY = 'poultri.demo.v2';
const DESKTOP_URL_KEY = 'poultri.desktop.url.v1';
const DESKTOP_CODE_KEY = 'poultri.desktop.code.v1';
const TEMPERATURE_RISE_THRESHOLD = 1.5;
const MOVEMENT_DROP_THRESHOLD = 20;
export const RULE_EXPLANATION = `Demo rule: flag a change when temperature rises ${TEMPERATURE_RISE_THRESHOLD}°C or more above this house’s reference, or movement drops by ${MOVEMENT_DROP_THRESHOLD} points or more. This example rule is not validated for farm use.`;
const HOUSE_ID = 'house-2';
const BASELINE: Signal = { step: 0, temperature: 28.8, humidity: 64, movement: 82 };
const SCENARIOS: Record<Scenario, Signal[]> = {
  Normal: [
    { step: 1, temperature: 28.9, humidity: 64, movement: 81 },
    { step: 2, temperature: 28.7, humidity: 63, movement: 83 },
    { step: 3, temperature: 28.8, humidity: 64, movement: 82 },
  ],
  'Temperature rising': [
    { step: 1, temperature: 30, humidity: 66, movement: 77 },
    { step: 2, temperature: 31.2, humidity: 69, movement: 70 },
    { step: 3, temperature: 32.1, humidity: 72, movement: 61 },
  ],
  'Movement dropping': [
    { step: 1, temperature: 28.9, humidity: 64, movement: 68 },
    { step: 2, temperature: 29.1, humidity: 65, movement: 58 },
    { step: 3, temperature: 29.2, humidity: 65, movement: 51 },
  ],
  Recovery: [
    { step: 1, temperature: 31.4, humidity: 69, movement: 65 },
    { step: 2, temperature: 30.2, humidity: 67, movement: 74 },
    { step: 3, temperature: 28.9, humidity: 64, movement: 82 },
  ],
};

function newHouse(id: string, name: string, birds: number, eggs: number, temperature: number, humidity: number, movement: number): House {
  const reference = { step: 0, temperature, humidity, movement };
  const production = Array.from({ length: 7 }, (_, index) => Math.round(eggs * (0.97 + index * 0.005)));
  production[6] = eggs;
  return { id, name, birds, eggs, production, reference, readings: [reference] };
}

function initialData(): DemoData {
  return {
    farmName: 'Demo Layer Farm', ownerName: 'Mang Conor', scenario: 'Normal', scenarioStep: 0, offline: false,
    houses: [
      newHouse('house-1', 'House 1', 4200, 3650, 28.4, 62, 86),
      newHouse(HOUSE_ID, 'House 2', 3800, 3190, BASELINE.temperature, BASELINE.humidity, BASELINE.movement),
      newHouse('house-3', 'House 3', 4500, 3940, 29.1, 65, 79),
    ],
    alerts: [],
  };
}

function commitReading(data: DemoData, houseId: string, reading: Signal): DemoData {
  const house = data.houses.find((item) => item.id === houseId);
  if (!house) return data;

  const nextHouse = { ...house, readings: [...house.readings.slice(-11), reading] };
  const temperatureRise = reading.temperature - house.reference.temperature;
  const movementDrop = house.reference.movement - reading.movement;
  const previousReading = house.readings.at(-1);
  const wasConditionActive = previousReading ? meetsDemoRule(previousReading.temperature, previousReading.movement, house.reference.temperature, house.reference.movement) : false;
  const observed: string[] = [];
  if (temperatureRise >= TEMPERATURE_RISE_THRESHOLD) observed.push(`temperature rose ${temperatureRise.toFixed(1)}°C from its demo reference`);
  if (movementDrop >= MOVEMENT_DROP_THRESHOLD) observed.push(`movement dropped ${movementDrop} points from its demo reference`);

  const openAlert = data.alerts.find((alert) => alert.houseId === houseId && alert.status !== 'Resolved');
  let alerts = data.alerts;
  if (openAlert) {
    alerts = data.alerts.map((alert) => alert.id === openAlert.id
      ? { ...alert, observed: observed.length ? observed.join(' while ') : alert.observed, temperature: reading.temperature, movement: reading.movement, referenceTemperature: house.reference.temperature, referenceMovement: house.reference.movement }
      : alert);
  } else if (observed.length && !wasConditionActive) {
    alerts = [{ id: `alert-${houseId}-${Date.now()}`, houseId, status: 'New', observed: observed.join(' while '), temperature: reading.temperature, movement: reading.movement, referenceTemperature: house.reference.temperature, referenceMovement: house.reference.movement, note: '' }, ...data.alerts];
  }

  return { ...data, houses: data.houses.map((item) => item.id === houseId ? nextHouse : item), alerts };
}

function addReading(data: DemoData, signal: Omit<Signal, 'step'>): DemoData {
  return addHouseReading(data, HOUSE_ID, signal);
}

function addHouseReading(data: DemoData, houseId: string, signal: Omit<Signal, 'step'>): DemoData {
  const house = data.houses.find((item) => item.id === houseId);
  if (!house) return data;
  return commitReading(data, houseId, { ...signal, step: (house.readings.at(-1)?.step ?? -1) + 1 });
}

function applyRemoteAlert(data: DemoData, alert: RemoteAlert): DemoData {
  if (!alert || typeof alert.id !== 'string' || typeof alert.observed !== 'string'
    || !data.houses.some((house) => house.id === alert.houseId)
    || ![alert.temperature, alert.movement, alert.referenceTemperature, alert.referenceMovement].every(Number.isFinite)) return data;
  const suggestions = Array.isArray(alert.suggestions) ? alert.suggestions.filter((item): item is string => typeof item === 'string') : [];
  const existing = data.alerts.find((item) => item.id === alert.id);
  if (existing?.status === 'Resolved') return data;
  const record: FarmAlert = { id: alert.id, houseId: alert.houseId, status: existing?.status ?? 'New', observed: alert.observed,
    temperature: alert.temperature, movement: alert.movement, referenceTemperature: alert.referenceTemperature,
    referenceMovement: alert.referenceMovement, note: existing?.note ?? '', suggestions, source: 'desktop' };
  return { ...data, alerts: existing ? data.alerts.map((item) => item.id === alert.id ? record : item) : [record, ...data.alerts] };
}

function applyRemoteReading(data: DemoData, item: RemoteReading): DemoData {
  const house = data.houses.find((entry) => entry.id === item.houseId);
  if (!house || ![item.temperature, item.humidity, item.movement, item.eggs].every(Number.isFinite)) return data;
  const latest = house.readings.at(-1)!;
  const changed = latest.temperature !== item.temperature || latest.humidity !== item.humidity || latest.movement !== item.movement;
  const nextHouse = { ...house,
    readings: changed ? [...house.readings.slice(-11), { step: latest.step + 1, temperature: item.temperature, humidity: item.humidity, movement: item.movement }] : house.readings,
    eggs: item.eggs, production: house.production.map((value, index) => index === 6 ? item.eggs : value) };
  const next = { ...data, houses: data.houses.map((entry) => entry.id === item.houseId ? nextHouse : entry) };
  return item.alert ? applyRemoteAlert(next, item.alert) : next;
}

async function fetchJson(url: string, options?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    return response.json();
  } finally { clearTimeout(timeout); }
}

async function getPushToken() {
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('demo-alerts', { name: 'Poultri demo alerts', importance: Notifications.AndroidImportance.MAX });
  let permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error('Expo project ID is missing.');
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

type DemoContextValue = {
  data: DemoData;
  ready: boolean;
  openAlerts: FarmAlert[];
  selectScenario: (scenario: Scenario) => void;
  advanceScenario: () => void;
  setSignal: (signal: Omit<Signal, 'step'>) => void;
  desktopUrl: string;
  pairingCode: string;
  desktopStatus: 'disconnected' | 'connecting' | 'connected';
  pushStatus: string;
  connectDesktop: (url: string, code: string) => void;
  disconnectDesktop: () => void;
  applyPushAlert: (alert: RemoteAlert) => void;
  setEggs: (houseId: string, eggs: number) => void;
  updateFarm: (values: Partial<Pick<DemoData, 'farmName' | 'ownerName'>>) => void;
  updateHouse: (houseId: string, values: Partial<Pick<House, 'name' | 'birds'>>) => void;
  updateAlert: (id: string, values: Partial<Pick<FarmAlert, 'status' | 'note'>>) => void;
  setOffline: (offline: boolean) => void;
  reset: () => void;
};
const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);
  const [desktopUrl, setDesktopUrl] = useState('');
  const [pairingCode, setPairingCode] = useState('');
  const [desktopStatus, setDesktopStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [pushStatus, setPushStatus] = useState('Connect and pair to enable system notifications.');
  const [pairRevision, setPairRevision] = useState(0);

  const applyPushAlert = useCallback((alert: RemoteAlert) => setData((current) => applyRemoteAlert(current, alert)), []);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(DESKTOP_URL_KEY), AsyncStorage.getItem(DESKTOP_CODE_KEY)])
      .then(([saved, url, code]) => {
        if (saved) setData(JSON.parse(saved) as DemoData);
        if (url) { setDesktopUrl(url); setDesktopStatus('connecting'); }
        if (code) setPairingCode(code);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  useEffect(() => {
    if (!ready || !desktopUrl || data.offline) return;
    let active = true;
    let cursor: number | null = null;
    let runId = '';
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        if (cursor === null) {
          const snapshot = await fetchJson(`${desktopUrl}/api/state`) as { runId: string; sequence: number; houses: RemoteReading[]; alerts: RemoteAlert[] };
          if (!active) return;
          runId = snapshot.runId;
          cursor = snapshot.sequence;
          setData((current) => {
            let next = current;
            for (const house of snapshot.houses) next = applyRemoteReading(next, house);
            for (const alert of snapshot.alerts) next = applyRemoteAlert(next, alert);
            return next;
          });
        } else {
          const batch = await fetchJson(`${desktopUrl}/api/events?after=${cursor}`) as { runId: string; sequence: number; events: RemoteReading[] };
          if (!active) return;
          if (batch.runId !== runId || batch.sequence < cursor) cursor = null;
          else { cursor = batch.sequence; for (const event of batch.events) setData((current) => applyRemoteReading(current, event)); }
        }
        setDesktopStatus('connected');
        timer = setTimeout(poll, 700);
      } catch {
        if (!active) return;
        setDesktopStatus('connecting');
        timer = setTimeout(poll, 1500);
      }
    };
    void poll();
    return () => { active = false; clearTimeout(timer); };
  }, [ready, desktopUrl, data.offline]);

  useEffect(() => {
    if (!ready || !desktopUrl || !pairingCode || desktopStatus !== 'connected' || data.offline) return;
    let active = true;
    const pair = async () => {
      setPushStatus('Requesting system notification permission…');
      try {
        const token = await getPushToken();
        if (!active) return;
        if (!token) { setPushStatus('Notification permission denied. Enable it in phone settings to receive system alerts.'); return; }
        await fetchJson(`${desktopUrl}/api/pair`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: pairingCode, token }) });
        if (active) setPushStatus('Phone paired. Push token registered; Android delivery requires configured FCM credentials.');
      } catch (error) { if (active) setPushStatus(`Push unavailable: ${error instanceof Error ? error.message : 'check pairing code and APK setup'}.`); }
    };
    void pair();
    return () => { active = false; };
  }, [ready, desktopUrl, pairingCode, desktopStatus, pairRevision, data.offline]);

  const value = useMemo<DemoContextValue>(() => ({
    data,
    ready,
    openAlerts: data.alerts.filter((alert) => alert.status !== 'Resolved'),
    selectScenario: (scenario) => setData((current) => {
      const house = current.houses.find((item) => item.id === HOUSE_ID)!;
      const next = {
        ...current,
        scenario,
        scenarioStep: 0,
        houses: current.houses.map((item) => item.id === HOUSE_ID ? { ...item, readings: [] } : item),
      };
      const firstReading = scenario === 'Recovery' ? { temperature: 32.6, humidity: 72, movement: 52 } : house.reference;
      return commitReading(next, HOUSE_ID, { ...firstReading, step: 0 });
    }),
    advanceScenario: () => setData((current) => {
      const nextSignal = SCENARIOS[current.scenario][current.scenarioStep];
      if (!nextSignal) return current;
      return { ...addReading(current, nextSignal), scenarioStep: current.scenarioStep + 1 };
    }),
    setSignal: (signal) => setData((current) => addReading(current, signal)),
    desktopUrl,
    pairingCode,
    desktopStatus,
    pushStatus,
    connectDesktop: (url, code) => {
      const normalized = url.trim().replace(/\/+$/, '');
      setDesktopUrl(normalized);
      setPairingCode(code.trim());
      setDesktopStatus('connecting');
      setPairRevision((revision) => revision + 1);
      setPushStatus('Connecting to the desktop simulator…');
      AsyncStorage.setItem(DESKTOP_URL_KEY, normalized).catch(() => {});
      AsyncStorage.setItem(DESKTOP_CODE_KEY, code.trim()).catch(() => {});
    },
    disconnectDesktop: () => {
      if (desktopUrl && pairingCode) fetchJson(`${desktopUrl}/api/unpair`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: pairingCode }) }).catch(() => {});
      setDesktopUrl('');
      setPairingCode('');
      setDesktopStatus('disconnected');
      setPushStatus('System push notifications are off for this simulator.');
      AsyncStorage.removeItem(DESKTOP_URL_KEY).catch(() => {});
      AsyncStorage.removeItem(DESKTOP_CODE_KEY).catch(() => {});
    },
    applyPushAlert,
    setEggs: (houseId, eggs) => setData((current) => ({
      ...current,
      houses: current.houses.map((house) => house.id === houseId
        ? { ...house, eggs, production: house.production.map((value, index) => index === 6 ? eggs : value) }
        : house),
    })),
    updateFarm: (values) => setData((current) => ({ ...current, ...values })),
    updateHouse: (houseId, values) => setData((current) => ({ ...current, houses: current.houses.map((house) => house.id === houseId ? { ...house, ...values } : house) })),
    updateAlert: (id, values) => setData((current) => ({ ...current, alerts: current.alerts.map((alert) => alert.id === id ? { ...alert, ...values } : alert) })),
    setOffline: (offline) => { setData((current) => ({ ...current, offline })); if (offline) setDesktopStatus('disconnected'); else if (desktopUrl) setDesktopStatus('connecting'); },
    reset: () => setData(initialData()),
  }), [data, desktopStatus, desktopUrl, pairingCode, pushStatus, ready, applyPushAlert]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used inside DemoProvider');
  return context;
}

export const scenarios = Object.keys(SCENARIOS) as Scenario[];
const meetsDemoRule = (temperature: number, movement: number, referenceTemperature: number, referenceMovement: number) =>
  temperature - referenceTemperature >= TEMPERATURE_RISE_THRESHOLD || referenceMovement - movement >= MOVEMENT_DROP_THRESHOLD;

export const isAlertConditionActive = (alert: FarmAlert) => meetsDemoRule(alert.temperature, alert.movement, alert.referenceTemperature, alert.referenceMovement);
export const getHouseStatus = (house: House) => {
  const latest = house.readings.at(-1)!;
  return meetsDemoRule(latest.temperature, latest.movement, house.reference.temperature, house.reference.movement) ? 'Needs inspection' : 'Normal';
};
