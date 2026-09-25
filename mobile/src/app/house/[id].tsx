import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Card, Page, Tag, TrendChart, colors } from '../../components';
import { getHouseStatus, useDemo } from '../../demo';

export default function HouseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useDemo();
  const house = data.houses.find((item) => item.id === id);
  if (!house) return <Page title="House not found"><Card><Text style={styles.body}>This demo house is no longer available.</Text></Card></Page>;

  const latest = house.readings.at(-1)!;
  const status = getHouseStatus(house);
  const readings = house.readings.slice(-8);
  const labels = readings.map((item) => `S${item.step}`);
  return <Page title={house.name} subtitle="Simulated house dashboard">
    <Card style={status === 'Normal' ? styles.normalCard : styles.alertCard}>
      <View style={styles.row}><View><Text style={styles.muted}>HOUSE STATUS</Text><Text style={styles.statusTitle}>{status === 'Normal' ? 'Steady in this demo' : 'Change to inspect'}</Text></View><Tag color={status === 'Normal' ? 'green' : 'amber'}>{status.toUpperCase()}</Tag></View>
      <View style={styles.flockInfo}><Text style={styles.flockNumber}>{house.birds.toLocaleString()}</Text><View><Text style={styles.metricLabel}>BIRDS</Text><Text style={styles.body}>{house.eggs.toLocaleString()} eggs today</Text></View></View>
    </Card>

    <Card>
      <View style={styles.row}><Text style={styles.heading}>Current readings</Text><Tag color="muted">SIMULATED</Tag></View>
      <View style={styles.readingGrid}>
        <Metric label="Temp" value={`${latest.temperature.toFixed(1)}°C`} color={colors.temperature} surface="#FFF2E7" />
        <Metric label="Humidity" value={`${latest.humidity}%`} color={colors.humidity} surface="#EAF4FC" />
        <Metric label="Bird movement" value={`${latest.movement}%`} color={colors.movement} surface="#E9F6F3" />
      </View>
      <Text style={styles.muted}>Bars show movement across recent demo readings, not a health threshold. No camera or sensor is connected.</Text>
    </Card>

    <Card style={styles.trendCard}><View style={styles.row}><Text style={styles.heading}>Temperature over time</Text><View style={styles.legend}><View style={[styles.dot, { backgroundColor: colors.temperature }]} /><Text style={styles.legendText}>°C</Text></View></View><TrendChart values={readings.map((item) => item.temperature)} labels={labels} suffix="°" color={colors.temperature} /><Text style={styles.muted}>Each simulator step and signal edit adds a reading.</Text></Card>
    <Card style={styles.trendCard}><View style={styles.row}><Text style={styles.heading}>Humidity over time</Text><View style={styles.legend}><View style={[styles.dot, { backgroundColor: colors.humidity }]} /><Text style={styles.legendText}>%</Text></View></View><TrendChart values={readings.map((item) => item.humidity)} labels={labels} suffix="%" color={colors.humidity} /></Card>
    <Card style={styles.trendCard}><View style={styles.row}><Text style={styles.heading}>Movement over time</Text><View style={styles.legend}><View style={[styles.dot, { backgroundColor: colors.movement }]} /><Text style={styles.legendText}>%</Text></View></View><TrendChart values={readings.map((item) => item.movement)} labels={labels} suffix="%" color={colors.movement} /></Card>
    <Card style={styles.notice}><Text style={styles.noticeTitle}>What this means</Text><Text style={styles.noticeText}>A potential change is a prompt to inspect this area. Poultri does not diagnose or prescribe treatment.</Text></Card>
  </Page>;
}

function Metric({ label, value, color, surface }: { label: string; value: string; color: string; surface: string }) {
  return <View style={[styles.metric, { backgroundColor: surface }]}><Text style={[styles.metricLabel, { color }]}>{label.toUpperCase()}</Text><Text style={[styles.metricValue, { color }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  normalCard: { backgroundColor: '#EDF6E8' }, alertCard: { backgroundColor: '#FFF2D9', borderColor: '#EEDCA9' }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, statusTitle: { color: colors.ink, fontWeight: '900', fontSize: 18, marginTop: 3 }, muted: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  flockInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: '#DCE8D6', paddingTop: 10 }, flockNumber: { color: colors.darkGreen, fontSize: 25, fontWeight: '900' }, metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 }, body: { color: '#586355', fontSize: 13, lineHeight: 20 },
  heading: { color: colors.ink, fontSize: 15, fontWeight: '800' }, readingGrid: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, minHeight: 70, borderRadius: 12, padding: 10, justifyContent: 'center', gap: 7 }, metricValue: { fontSize: 17, fontWeight: '900' }, trendCard: { backgroundColor: '#FCFDFC' }, legend: { flexDirection: 'row', alignItems: 'center', gap: 4 }, dot: { width: 8, height: 8, borderRadius: 4 }, legendText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  notice: { backgroundColor: '#F0ECF8', borderColor: '#E2D9F1' }, noticeTitle: { color: colors.eggs, fontSize: 13, fontWeight: '900' }, noticeText: { color: colors.ink, fontSize: 13, lineHeight: 20 },
});
