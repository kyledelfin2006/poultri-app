import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode, useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Tab = 'Overview' | 'Alerts' | 'Records' | 'About';
type AlertStatus = 'New' | 'Acknowledged' | 'Resolved';
type House = {
  id: string;
  name: string;
  birds: number;
  temperature: number;
  humidity: number;
  movement: number;
  eggs: number;
  needsAttention: boolean;
};
type FarmAlert = {
  id: string;
  houseId: string;
  time: string;
  status: AlertStatus;
  temperature: number;
  movement: number;
};
type DemoState = { houses: House[]; alerts: FarmAlert[]; offline: boolean };

const STORAGE_KEY = 'poultri.demo.v1';
const GREEN = '#6DB33F';
const seed: DemoState = {
  offline: false,
  houses: [
    { id: 'house-1', name: 'House 1', birds: 4200, temperature: 28.4, humidity: 62, movement: 86, eggs: 3650, needsAttention: false },
    { id: 'house-2', name: 'House 2', birds: 3800, temperature: 32.8, humidity: 74, movement: 41, eggs: 3190, needsAttention: true },
    { id: 'house-3', name: 'House 3', birds: 4500, temperature: 29.1, humidity: 65, movement: 79, eggs: 3940, needsAttention: false },
  ],
  alerts: [{ id: 'sample-alert', houseId: 'house-2', time: 'Today · 10:42 AM', status: 'New', temperature: 32.8, movement: 41 }],
};

const production = [
  { day: 'Mon', eggs: 10520 }, { day: 'Tue', eggs: 10810 }, { day: 'Wed', eggs: 10740 },
  { day: 'Thu', eggs: 10480 }, { day: 'Fri', eggs: 10630 }, { day: 'Sat', eggs: 10190 }, { day: 'Today', eggs: 10780 },
];

function Label({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'green' | 'amber' | 'red' }) {
  return <Text style={[styles.label, tone === 'green' && styles.labelGreen, tone === 'amber' && styles.labelAmber, tone === 'red' && styles.labelRed]}>{children}</Text>;
}

function Action({ title, onPress, secondary = false }: { title: string; onPress: () => void; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, pressed && styles.pressed]}><Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text></Pressable>;
}

function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export default function App() {
  const [data, setData] = useState<DemoState>(seed);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>('Overview');
  const [houseId, setHouseId] = useState<string | null>(null);
  const [alertId, setAlertId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => { if (saved) setData(JSON.parse(saved) as DemoState); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  const activeAlerts = data.alerts.filter((item) => item.status !== 'Resolved');
  const selectedHouse = data.houses.find((house) => house.id === houseId);
  const selectedAlert = data.alerts.find((item) => item.id === alertId);
  const alertHouse = selectedAlert && data.houses.find((house) => house.id === selectedAlert.houseId);

  function changeAlertStatus(id: string, status: AlertStatus) {
    setData((current) => ({ ...current, alerts: current.alerts.map((item) => item.id === id ? { ...item, status } : item) }));
  }

  function triggerAlert() {
    const id = `demo-${Date.now()}`;
    setData((current) => ({
      ...current,
      houses: current.houses.map((house) => house.id === 'house-2' ? { ...house, temperature: 33.1, humidity: 75, movement: 35, needsAttention: true } : house),
      alerts: [{ id, houseId: 'house-2', time: 'Just now · Demo', status: 'New', temperature: 33.1, movement: 35 }, ...current.alerts],
    }));
    setTab('Alerts');
    setAlertId(id);
  }

  function resetDemo() {
    setData(seed);
    setHouseId(null);
    setAlertId(null);
    setTab('Overview');
  }

  function header(title: string, back?: () => void) {
    return <View style={styles.pageHeader}>{back ? <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={back} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable> : null}<View style={{ flex: 1 }}><Text style={styles.pageTitle}>{title}</Text><Text style={styles.subtle}>Demo Layer Farm</Text></View><Label tone="green">DEMO</Label></View>;
  }

  function pageContent() {
    if (selectedAlert && alertHouse) {
      return <>
        {header('Alert details', () => setAlertId(null))}
        <ScrollView contentContainerStyle={styles.content}>
          <Card>
            <Label tone={selectedAlert.status === 'Resolved' ? 'green' : 'amber'}>{selectedAlert.status.toUpperCase()} · ATTENTION</Label>
            <Text style={styles.cardTitle}>Movement has dropped while temperature is rising</Text>
            <Text style={styles.body}>{alertHouse.name} · {selectedAlert.time}</Text>
            <View style={styles.readingRow}><Text style={styles.reading}>🌡 {selectedAlert.temperature.toFixed(1)}°C</Text><Text style={styles.reading}>Activity {selectedAlert.movement}%</Text></View>
            <Text style={styles.body}>The demo scenario shows a temperature increase alongside reduced bird movement. Inspect this poultry house and decide what action to take.</Text>
            <View style={styles.notice}><Text style={styles.noticeText}>This is an early warning, not a diagnosis. Inspect the area and decide what action to take.</Text></View>
            {selectedAlert.status !== 'Acknowledged' && selectedAlert.status !== 'Resolved' && <Action title="Acknowledge alert" onPress={() => changeAlertStatus(selectedAlert.id, 'Acknowledged')} />}
            {selectedAlert.status !== 'Resolved' && <Action title="Mark resolved" secondary onPress={() => changeAlertStatus(selectedAlert.id, 'Resolved')} />}
            {selectedAlert.status === 'Resolved' && <Text style={styles.success}>This demo alert is resolved.</Text>}
          </Card>
          <Action title={`View ${alertHouse.name}`} secondary onPress={() => { setAlertId(null); setHouseId(alertHouse.id); }} />
        </ScrollView>
      </>;
    }

    if (selectedHouse) {
      const recent = [selectedHouse.temperature - 1.2, selectedHouse.temperature - 0.8, selectedHouse.temperature - 0.5, selectedHouse.temperature - 0.2, selectedHouse.temperature];
      return <>
        {header(selectedHouse.name, () => setHouseId(null))}
        <ScrollView contentContainerStyle={styles.content}>
          <Card>
            <View style={styles.inline}><Text style={styles.cardTitle}>House overview</Text><Label tone={selectedHouse.needsAttention ? 'amber' : 'green'}>{selectedHouse.needsAttention ? 'Needs inspection' : 'Normal'}</Label></View>
            <Text style={styles.body}>{selectedHouse.birds.toLocaleString()} birds · Simulated readings</Text>
            <View style={styles.metricGrid}>
              <Metric label="Temperature" value={`${selectedHouse.temperature.toFixed(1)}°C`} />
              <Metric label="Humidity" value={`${selectedHouse.humidity}%`} />
              <Metric label="Bird activity" value={`${selectedHouse.movement}%`} />
              <Metric label="Eggs today" value={selectedHouse.eggs.toLocaleString()} />
            </View>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Recent temperature</Text>
            <View style={styles.chartBars}>{recent.map((value, index) => <View key={index} style={styles.chartColumn}><View style={[styles.tempBar, { height: `${Math.max(30, (value - 20) * 9)}%` }]} /><Text style={styles.chartCaption}>{index === 4 ? 'Now' : `-${4 - index}h`}</Text></View>)}</View>
            <Text style={styles.caption}>Illustrative demo trend · not a live sensor feed</Text>
          </Card>
          <Card>
            <Text style={styles.cardTitle}>Demo device status</Text>
            <Text style={styles.body}>Camera · simulated activity</Text>
            <Text style={styles.body}>Temperature and humidity sensor · demo readings</Text>
          </Card>
          {activeAlerts.some((item) => item.houseId === selectedHouse.id) && <Action title="Review house alert" onPress={() => setAlertId(activeAlerts.find((item) => item.houseId === selectedHouse.id)!.id)} />}
        </ScrollView>
      </>;
    }

    if (tab === 'Overview') return <>
      {header('Good morning')}
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.farmCard}><Text style={styles.farmName}>Demo Layer Farm</Text><Text style={styles.body}>Layer farm · 12,500 birds</Text><Label tone="green">● {data.offline ? 'SIMULATE OFFLINE' : 'DEMO DATA · ON DEVICE'}</Label></Card>
        <View style={styles.metricGrid}>
          <Metric label="Poultry houses" value="3" />
          <Metric label="Needs attention" value={String(activeAlerts.length)} tone={activeAlerts.length ? 'amber' : 'green'} />
          <Metric label="Avg. temperature" value={`${(data.houses.reduce((sum, house) => sum + house.temperature, 0) / data.houses.length).toFixed(1)}°C`} />
          <Metric label="Eggs today" value={data.houses.reduce((sum, house) => sum + house.eggs, 0).toLocaleString()} />
        </View>
        {activeAlerts[0] && <Pressable onPress={() => setAlertId(activeAlerts[0].id)}><Card style={styles.alertCard}><Label tone="amber">NEEDS INSPECTION · {activeAlerts[0].status.toUpperCase()}</Label><Text style={styles.cardTitle}>Movement has dropped as temperature rises</Text><Text style={styles.body}>{data.houses.find((house) => house.id === activeAlerts[0].houseId)?.name} · Tap to review</Text></Card></Pressable>}
        <View style={styles.sectionTitleRow}><Text style={styles.sectionTitle}>Poultry houses</Text><Text style={styles.caption}>Simulated readings</Text></View>
        {data.houses.map((house) => <Pressable key={house.id} onPress={() => setHouseId(house.id)}><Card style={styles.houseCard}><View style={styles.inline}><Text style={styles.cardTitle}>{house.name}</Text><Label tone={house.needsAttention ? 'amber' : 'green'}>{house.needsAttention ? 'Needs inspection' : 'Normal'}</Label></View><Text style={styles.body}>{house.temperature.toFixed(1)}°C · {house.humidity}% humidity · Activity {house.movement}%</Text><Text style={styles.caption}>{house.birds.toLocaleString()} birds · {house.eggs.toLocaleString()} eggs today</Text></Card></Pressable>)}
        <Card><Text style={styles.cardTitle}>Demo controls</Text><Text style={styles.body}>Trigger a sample change or restore the original demo scenario.</Text><Action title="Trigger sample alert" onPress={triggerAlert} /><Action title="Reset demo" secondary onPress={resetDemo} /><View style={styles.switchRow}><View style={{ flex: 1 }}><Text style={styles.switchTitle}>Simulate offline</Text><Text style={styles.caption}>The demo stays usable; no connection is made.</Text></View><Switch value={data.offline} onValueChange={(offline) => setData((current) => ({ ...current, offline }))} trackColor={{ true: GREEN }} /></View></Card>
        <Text style={styles.caption}>This is a local prototype with simulated farm data. No camera or sensor is connected.</Text>
      </ScrollView>
    </>;

    if (tab === 'Alerts') return <>
      {header('Alerts')}
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>Changes that may need a closer look. Poultri does not diagnose.</Text>
        {data.alerts.length === 0 ? <Card><Text style={styles.cardTitle}>No demo alerts</Text><Text style={styles.body}>Use Demo controls on Overview to create a sample alert.</Text></Card> : data.alerts.map((item) => <Pressable key={item.id} onPress={() => setAlertId(item.id)}><Card><View style={styles.inline}><Label tone={item.status === 'Resolved' ? 'green' : 'amber'}>{item.status.toUpperCase()}</Label><Text style={styles.caption}>{item.time}</Text></View><Text style={styles.cardTitle}>Movement has dropped while temperature is rising</Text><Text style={styles.body}>{data.houses.find((house) => house.id === item.houseId)?.name} · {item.temperature.toFixed(1)}°C · activity {item.movement}%</Text><Text style={styles.link}>Review alert →</Text></Card></Pressable>)}
        <Action title="Trigger sample alert" onPress={triggerAlert} secondary />
      </ScrollView>
    </>;

    if (tab === 'Records') return <>
      {header('Farm records')}
      <ScrollView contentContainerStyle={styles.content}>
        <Card><Label tone="green">SIMULATED · LAST 7 DAYS</Label><Text style={styles.cardTitle}>Daily egg production</Text><Text style={styles.body}>Demo Layer Farm · all houses</Text><View style={styles.chartBars}>{production.map((row) => <View key={row.day} style={styles.chartColumn}><Text style={styles.barValue}>{(row.eggs / 1000).toFixed(1)}k</Text><View style={[styles.prodBar, { height: `${(row.eggs / 11500) * 100}%` }]} /><Text style={styles.chartCaption}>{row.day}</Text></View>)}</View><Text style={styles.caption}>Illustrative records only · production changes are context for inspection.</Text></Card>
        <Card><Text style={styles.cardTitle}>Today's production</Text><Text style={styles.bigNumber}>{data.houses.reduce((sum, house) => sum + house.eggs, 0).toLocaleString()} <Text style={styles.unit}>eggs</Text></Text><Text style={styles.body}>Seeded baseline: approximately 10,700 eggs/day</Text><Label tone={data.houses.reduce((sum, house) => sum + house.eggs, 0) < 10700 ? 'amber' : 'green'}>{data.houses.reduce((sum, house) => sum + house.eggs, 0) < 10700 ? 'Below demo baseline' : 'Near demo baseline'}</Label></Card>
        {data.houses.map((house) => <Card key={house.id}><Text style={styles.cardTitle}>{house.name}</Text><Text style={styles.body}>{house.eggs.toLocaleString()} eggs today · {house.birds.toLocaleString()} birds</Text></Card>)}
      </ScrollView>
    </>;

    return <>
      {header('About Poultri')}
      <ScrollView contentContainerStyle={styles.content}>
        <Card><Text style={styles.brandLarge}>poultri</Text><Text style={styles.tagline}>Poultry, guiding every flock, connecting every farm.</Text><Text style={styles.body}>Poultri is designed to combine existing or compatible camera activity, temperature and humidity sensors, and farm records to help farmers notice unusual changes sooner.</Text><View style={styles.notice}><Text style={styles.noticeText}>Poultri flags potential risks for inspection. It does not diagnose or prescribe treatment.</Text></View></Card>
        <Card><Text style={styles.cardTitle}>Proposed package</Text><Text style={styles.bigNumber}>₱40,000</Text><Text style={styles.body}>Proposed sensor and installation package. A recurring monitoring subscription is separate. Pricing is subject to customer and field validation.</Text></Card>
        <Card><Text style={styles.cardTitle}>Targets to validate</Text><Bullet>Generate an alert within one minute.</Bullet><Bullet>Operate for seven days without internet.</Bullet><Bullet>Reach 80% accuracy in controlled video tests.</Bullet><Bullet>Run an 8–12-week field test across three layer farms.</Bullet><Text style={styles.caption}>These are targets in the concept note, not achieved results.</Text></Card>
        <Card><Text style={styles.cardTitle}>Prototype limitations</Text><Text style={styles.body}>All readings and records are simulated and stored on this device. Camera integration, physical sensors, on-site processing, and field validation are not implemented in this demo.</Text></Card>
        <Card><Text style={styles.cardTitle}>Demo controls</Text><Text style={styles.body}>Try the warning scenario or simulate unreliable connectivity.</Text><Action title="Trigger sample alert" onPress={triggerAlert} /><View style={styles.switchRow}><View style={{ flex: 1 }}><Text style={styles.switchTitle}>Simulate offline</Text><Text style={styles.caption}>Core demo screens remain available.</Text></View><Switch value={data.offline} onValueChange={(offline) => setData((current) => ({ ...current, offline }))} trackColor={{ true: GREEN }} /></View><Action title="Reset demo" secondary onPress={resetDemo} /></Card>
      </ScrollView>
    </>;
  }

  if (!ready) return <SafeAreaView style={styles.safe}><StatusBar style="dark" /><View style={styles.loading}><Text style={styles.brand}>poultri</Text><Text style={styles.body}>Preparing demo farm…</Text></View></SafeAreaView>;

  const detailOpen = selectedHouse || selectedAlert;
  return <SafeAreaView style={styles.safe}>
    <StatusBar style="dark" />
    <View style={styles.screen}>{pageContent()}</View>
    {!detailOpen && <View style={styles.tabs}>{(['Overview', 'Alerts', 'Records', 'About'] as Tab[]).map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: tab === item }} onPress={() => setTab(item)} style={styles.tab}><Text style={[styles.tabIcon, tab === item && styles.tabActive]}>{item === 'Overview' ? '⌂' : item === 'Alerts' ? '◉' : item === 'Records' ? '▥' : 'ⓘ'}</Text><Text style={[styles.tabText, tab === item && styles.tabActive]}>{item}</Text></Pressable>)}</View>}
  </SafeAreaView>;
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'green' | 'amber' }) {
  return <Card style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={[styles.metricValue, tone === 'green' && { color: GREEN }, tone === 'amber' && { color: '#A66B00' }]}>{value}</Text></Card>;
}

function Bullet({ children }: { children: ReactNode }) {
  return <View style={styles.bulletRow}><Text style={styles.bullet}>•</Text><Text style={styles.body}>{children}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F8F5' }, screen: { flex: 1 },
  pageHeader: { minHeight: 74, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFF', flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#E7ECE5' },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1D2A1B' }, subtle: { fontSize: 12, color: '#788276', marginTop: 2 }, back: { width: 36, height: 40, justifyContent: 'center' }, backText: { fontSize: 36, lineHeight: 38, color: GREEN },
  content: { padding: 16, paddingBottom: 28, gap: 12 }, card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E8EDE6', gap: 10 },
  farmCard: { backgroundColor: '#F0F7EC', borderColor: '#DCEBD4' }, farmName: { fontSize: 18, fontWeight: '800', color: '#1D2A1B' }, brand: { color: GREEN, fontWeight: '900', fontSize: 34 }, brandLarge: { color: GREEN, fontWeight: '900', fontSize: 40, letterSpacing: -2 }, tagline: { color: '#426239', fontSize: 14, fontWeight: '600' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, metric: { flexBasis: '47%', flexGrow: 1, minHeight: 80, padding: 12, gap: 6 }, metricLabel: { color: '#687365', fontSize: 12 }, metricValue: { color: '#1D2A1B', fontWeight: '800', fontSize: 21 },
  label: { alignSelf: 'flex-start', fontSize: 10, fontWeight: '800', color: '#697367', backgroundColor: '#EFF2ED', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, overflow: 'hidden' }, labelGreen: { backgroundColor: '#EAF5E4', color: '#467C2B' }, labelAmber: { backgroundColor: '#FFF4D9', color: '#8A5C00' }, labelRed: { backgroundColor: '#FDE8E5', color: '#A7352A' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1D2A1B', flexShrink: 1 }, body: { fontSize: 14, color: '#586355', lineHeight: 21 }, caption: { fontSize: 11, color: '#798276', lineHeight: 16 }, sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }, sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1D2A1B' }, inline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, houseCard: { paddingVertical: 14 }, alertCard: { borderColor: '#EEDCA9', backgroundColor: '#FFFCF3' },
  readingRow: { flexDirection: 'row', gap: 20, paddingVertical: 8 }, reading: { fontWeight: '700', color: '#31402F', fontSize: 16 }, notice: { backgroundColor: '#F0F7EC', borderRadius: 12, padding: 12 }, noticeText: { color: '#416238', lineHeight: 20, fontWeight: '600' }, success: { color: '#467C2B', fontWeight: '700' },
  button: { backgroundColor: GREEN, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center', minHeight: 46, justifyContent: 'center' }, buttonSecondary: { backgroundColor: '#F0F5ED', borderWidth: 1, borderColor: '#DDE9D5' }, buttonText: { color: '#FFF', fontSize: 14, fontWeight: '800' }, buttonTextSecondary: { color: '#477A2E' }, pressed: { opacity: 0.72 }, backText2: { color: GREEN }, link: { color: '#4B842F', fontWeight: '700', marginTop: 2 },
  chartBars: { height: 142, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', gap: 8, paddingTop: 16 }, chartColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 5 }, tempBar: { width: '62%', backgroundColor: '#86BF61', minHeight: 8, borderTopLeftRadius: 5, borderTopRightRadius: 5 }, prodBar: { width: '70%', backgroundColor: '#78B750', minHeight: 8, borderTopLeftRadius: 5, borderTopRightRadius: 5 }, chartCaption: { fontSize: 10, color: '#758071' }, barValue: { fontSize: 9, color: '#758071' }, bigNumber: { fontSize: 28, fontWeight: '900', color: '#1D2A1B' }, unit: { fontSize: 15, fontWeight: '600', color: '#65715F' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 8, borderTopWidth: 1, borderColor: '#EDF0EB' }, switchTitle: { fontSize: 14, fontWeight: '700', color: '#273425' }, bulletRow: { flexDirection: 'row', gap: 8 }, bullet: { fontSize: 18, color: GREEN, lineHeight: 21 },
  tabs: { height: 66, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E7ECE5', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 3 }, tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 54 }, tabIcon: { color: '#7B8576', fontSize: 19 }, tabText: { color: '#7B8576', fontSize: 10, fontWeight: '600' }, tabActive: { color: GREEN, fontWeight: '900' }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
});
