import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Page, Tag, TrendChart, colors } from '../../components';
import { useDemo } from '../../demo';

const DAYS = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];

export default function RecordsScreen() {
  const { data } = useDemo();
  const [houseId, setHouseId] = useState(data.houses[0].id);
  const house = data.houses.find((item) => item.id === houseId) ?? data.houses[0];
  const totalToday = data.houses.reduce((sum, item) => sum + item.eggs, 0);

  return <Page title="Farm records" subtitle="Illustrative production history · local demo">
    <View style={styles.summary}>
      <Card style={[styles.summaryCard, styles.totalCard]}><Text style={styles.metricLabel}>FARM TOTAL TODAY</Text><Text style={styles.farmTotal}>{totalToday.toLocaleString()}</Text><Text style={styles.muted}>eggs · demo values</Text></Card>
      <Card style={[styles.summaryCard, styles.houseCountCard]}><Text style={styles.metricLabel}>SELECTED HOUSE</Text><Text style={styles.houseEggs}>{house.eggs.toLocaleString()}</Text><Text style={styles.muted}>{house.name} · {house.birds.toLocaleString()} birds</Text></Card>
    </View>
    <Card>
      <View style={styles.row}><Text style={styles.heading}>Production by house</Text><Tag color="muted">7 DAYS</Tag></View>
      <View style={styles.picker}>{data.houses.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: houseId === item.id }} onPress={() => setHouseId(item.id)} style={[styles.pill, houseId === item.id && styles.pillSelected]}><Text style={[styles.pillText, houseId === item.id && styles.pillTextSelected]}>{item.name}</Text></Pressable>)}</View>
    </Card>
    <Card style={styles.chartCard}>
      <View style={styles.row}><Text style={styles.heading}>{house.name} daily eggs</Text><Text style={styles.latest}>{house.eggs.toLocaleString()}</Text></View>
      <Text style={styles.body}>Seven illustrative days. Today&apos;s value follows the demo input on Simulator.</Text>
      <TrendChart values={house.production} labels={DAYS} color={colors.eggs} />
      <View style={styles.legend}><View style={styles.legendDot} /><Text style={styles.muted}>Eggs produced each day · simulated</Text></View>
      <Tag color={totalToday < 10700 ? 'amber' : 'green'}>{totalToday < 10700 ? 'BELOW DEMO REFERENCE' : 'NEAR DEMO REFERENCE'}</Tag>
      <Text style={styles.muted}>Seeded farm reference: around 10,700 eggs/day. This is illustrative context, not a production target.</Text>
    </Card>
    <Card>
      <Text style={styles.heading}>House comparison today</Text>
      {data.houses.map((item) => <View key={item.id} style={styles.houseRow}><View style={styles.row}><Text style={styles.houseName}>{item.name}</Text><Text style={styles.houseTotal}>{item.eggs.toLocaleString()} eggs</Text></View><View style={styles.barTrack}><View style={[styles.bar, { width: `${Math.min(100, (item.eggs / Math.max(...data.houses.map((houseItem) => houseItem.eggs))) * 100)}%` }]} /></View></View>)}
      <Text style={styles.muted}>Relative to the highest house total shown here; no target level is implied.</Text>
    </Card>
  </Page>;
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: 8 }, summaryCard: { flex: 1, padding: 13, gap: 4, borderWidth: 0 }, totalCard: { backgroundColor: '#F0ECF8' }, houseCountCard: { backgroundColor: '#EAF5E5' }, metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '900' }, farmTotal: { color: colors.eggs, fontSize: 24, fontWeight: '900' }, houseEggs: { color: colors.darkGreen, fontSize: 24, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, heading: { color: colors.ink, fontSize: 15, fontWeight: '800' }, latest: { color: colors.eggs, fontSize: 20, fontWeight: '900' },
  picker: { flexDirection: 'row', gap: 7 }, pill: { minHeight: 44, justifyContent: 'center', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#F1F4EF', borderWidth: 1, borderColor: colors.line }, pillSelected: { backgroundColor: '#F0ECF8', borderColor: colors.eggs }, pillText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, pillTextSelected: { color: colors.eggs },
  chartCard: { backgroundColor: '#FCFAFE' }, body: { color: '#586355', fontSize: 13, lineHeight: 20 }, legend: { flexDirection: 'row', alignItems: 'center', gap: 7 }, legendDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.eggs }, muted: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  houseRow: { gap: 6 }, houseName: { color: colors.ink, fontSize: 13, fontWeight: '800' }, houseTotal: { color: colors.ink, fontSize: 12, fontWeight: '700' }, barTrack: { height: 9, backgroundColor: '#ECE8F4', borderRadius: 99, overflow: 'hidden' }, bar: { height: '100%', backgroundColor: colors.eggs, borderRadius: 99 },
});
