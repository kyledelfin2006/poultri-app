import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Card, Page, Tag, TrendChart, colors } from '../../components';
import { getHouseStatus, useDemo } from '../../demo';

export default function HouseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useDemo();
  const house = data.houses.find((item) => item.id === id);
  if (!house) return <Page title="House not found"><Card><Text style={styles.body}>This demo house is no longer available.</Text></Card></Page>;

  const latest = house.readings.at(-1)!;
  return <Page title={house.name} subtitle="Simulated house readings">
    <Card><View style={styles.row}><Text style={styles.heading}>House status</Text><Tag color={getHouseStatus(house) === 'Normal' ? 'green' : 'amber'}>{getHouseStatus(house)}</Tag></View><Text style={styles.body}>{house.birds.toLocaleString()} birds · {house.eggs.toLocaleString()} eggs today</Text></Card>
    <Card><Text style={styles.heading}>Current readings</Text><View style={styles.metrics}><Metric label="Temperature" value={`${latest.temperature.toFixed(1)}°C`} /><Metric label="Humidity" value={`${latest.humidity}%`} /><Metric label="Bird movement" value={`${latest.movement}%`} /></View><Text style={styles.muted}>Camera activity is represented by the movement signal in this demo. No camera or sensor is connected.</Text></Card>
    <Card><Text style={styles.heading}>Temperature trend</Text><TrendChart values={house.readings.slice(-8).map((item) => item.temperature)} labels={house.readings.slice(-8).map((item) => `S${item.step}`)} suffix="°" /><Text style={styles.muted}>Trend updates with simulator steps and slider edits.</Text></Card>
    <Card style={styles.notice}><Text style={styles.noticeText}>Potential changes are prompts to inspect this area. Poultri does not diagnose.</Text></Card>
  </Page>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <View style={styles.metric}><Text style={styles.muted}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>;
}

const styles = {
  row: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const },
  heading: { color: colors.ink, fontSize: 16, fontWeight: '800' as const }, body: { color: '#586355', fontSize: 13, lineHeight: 20 }, muted: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  metrics: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, gap: 8 }, metric: { flex: 1, backgroundColor: '#F5F8F3', borderRadius: 12, padding: 10 }, metricValue: { color: colors.ink, fontWeight: '900' as const, fontSize: 16, marginTop: 4 },
  notice: { backgroundColor: colors.paleGreen }, noticeText: { color: colors.darkGreen, lineHeight: 19, fontSize: 12, fontWeight: '600' as const },
};
