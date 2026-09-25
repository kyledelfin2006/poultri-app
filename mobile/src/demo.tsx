import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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
};
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

function commitReading(data: DemoData, reading: Signal): DemoData {
  const house = data.houses.find((item) => item.id === HOUSE_ID);
  if (!house) return data;

  const nextHouse = { ...house, readings: [...house.readings.slice(-11), reading] };
  const temperatureRise = reading.temperature - house.reference.temperature;
  const movementDrop = house.reference.movement - reading.movement;
  const previousReading = house.readings.at(-1);
  const wasConditionActive = previousReading ? meetsDemoRule(previousReading.temperature, previousReading.movement, house.reference.temperature, house.reference.movement) : false;
  const observed: string[] = [];
  if (temperatureRise >= TEMPERATURE_RISE_THRESHOLD) observed.push(`temperature rose ${temperatureRise.toFixed(1)}°C from its demo reference`);
  if (movementDrop >= MOVEMENT_DROP_THRESHOLD) observed.push(`movement dropped ${movementDrop} points from its demo reference`);

  const openAlert = data.alerts.find((alert) => alert.houseId === HOUSE_ID && alert.status !== 'Resolved');
  let alerts = data.alerts;
  if (openAlert) {
    alerts = data.alerts.map((alert) => alert.id === openAlert.id
      ? { ...alert, observed: observed.length ? observed.join(' while ') : alert.observed, temperature: reading.temperature, movement: reading.movement, referenceTemperature: house.reference.temperature, referenceMovement: house.reference.movement }
      : alert);
  } else if (observed.length && !wasConditionActive) {
    alerts = [{ id: `alert-${Date.now()}`, houseId: HOUSE_ID, status: 'New', observed: observed.join(' while '), temperature: reading.temperature, movement: reading.movement, referenceTemperature: house.reference.temperature, referenceMovement: house.reference.movement, note: '' }, ...data.alerts];
  }

  return { ...data, houses: data.houses.map((item) => item.id === HOUSE_ID ? nextHouse : item), alerts };
}

function addReading(data: DemoData, signal: Omit<Signal, 'step'>): DemoData {
  const house = data.houses.find((item) => item.id === HOUSE_ID);
  if (!house) return data;
  return commitReading(data, { ...signal, step: (house.readings.at(-1)?.step ?? -1) + 1 });
}

type DemoContextValue = {
  data: DemoData;
  ready: boolean;
  openAlerts: FarmAlert[];
  selectScenario: (scenario: Scenario) => void;
  advanceScenario: () => void;
  setSignal: (signal: Omit<Signal, 'step'>) => void;
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

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => { if (saved) setData(JSON.parse(saved) as DemoData); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

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
      return commitReading(next, { ...firstReading, step: 0 });
    }),
    advanceScenario: () => setData((current) => {
      const nextSignal = SCENARIOS[current.scenario][current.scenarioStep];
      if (!nextSignal) return current;
      return { ...addReading(current, nextSignal), scenarioStep: current.scenarioStep + 1 };
    }),
    setSignal: (signal) => setData((current) => addReading(current, signal)),
    setEggs: (houseId, eggs) => setData((current) => ({
      ...current,
      houses: current.houses.map((house) => house.id === houseId
        ? { ...house, eggs, production: house.production.map((value, index) => index === 6 ? eggs : value) }
        : house),
    })),
    updateFarm: (values) => setData((current) => ({ ...current, ...values })),
    updateHouse: (houseId, values) => setData((current) => ({ ...current, houses: current.houses.map((house) => house.id === houseId ? { ...house, ...values } : house) })),
    updateAlert: (id, values) => setData((current) => ({ ...current, alerts: current.alerts.map((alert) => alert.id === id ? { ...alert, ...values } : alert) })),
    setOffline: (offline) => setData((current) => ({ ...current, offline })),
    reset: () => setData(initialData()),
  }), [data, ready]);

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
