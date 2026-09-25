import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Page, SignalSlider, Tag, TrendChart, colors } from '../../components';
import { useDemo } from '../../demo';

const DAYS = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];

export default function RecordsScreen() {
  const { data, setEggs } = useDemo();
  const [houseId, setHouseId] = useState(data.houses[0].id);
  const house = data.houses.find((item) => item.id === houseId) ?? data.houses[0];
  const totalToday = data.houses.reduce((sum, item) => sum + item.eggs, 0);

  return <Page title="Farm records" subtitle="Illustrative egg production · local demo">
    <Card>
      <View style={styles.row}><Text style={styles.heading}>Select poultry house</Text><Tag color="muted">7 DAYS</Tag></View>
      <View style={styles.picker}>{data.houses.map((item) => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: houseId === item.id }} onPress={() => setHouseId(item.id)} style={[styles.pill, houseId === item.id && styles.pillSelected]}><Text style={[styles.pillText, houseId === item.id && styles.pillTextSelected]}>{item.name}</Text></Pressable>)}</View>
    </Card>
    <Card>
      <Text style={styles.heading}>{house.name} daily eggs</Text>
      <Text style={styles.body}>Seven demo days · records change when you adjust today&apos;s production.</Text>
      <TrendChart values={house.production} labels={DAYS} suffix="" />
      <Text style={styles.big}>{house.eggs.toLocaleString()} <Text style={styles.unit}>eggs today</Text></Text>
      <Text style={styles.muted}>Seeded reference: around 10,700 eggs/day across the farm. A production change is context for inspection, not a diagnosis.</Text>
      <Tag color={totalToday < 10700 ? 'amber' : 'green'}>{totalToday < 10700 ? 'BELOW DEMO REFERENCE' : 'NEAR DEMO REFERENCE'}</Tag>
      <SignalSlider key={`${house.id}-${house.eggs}`} label={`Edit ${house.name} production`} value={house.eggs} minimum={1000} maximum={house.birds} step={10} suffix=" eggs" onChange={(eggs) => setEggs(house.id, eggs)} />
    </Card>
    {data.houses.map((item) => <Card key={item.id} style={styles.smallCard}><Text style={styles.houseTitle}>{item.name}</Text><Text style={styles.body}>{item.eggs.toLocaleString()} eggs today · {item.birds.toLocaleString()} birds</Text></Card>)}
  </Page>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, heading: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  picker: { flexDirection: 'row', gap: 7 }, pill: { minHeight: 44, justifyContent: 'center', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#F1F4EF', borderWidth: 1, borderColor: colors.line }, pillSelected: { backgroundColor: colors.paleGreen, borderColor: colors.green }, pillText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, pillTextSelected: { color: colors.darkGreen },
  body: { color: '#586355', fontSize: 13, lineHeight: 20 }, big: { fontSize: 25, fontWeight: '900', color: colors.ink }, unit: { fontSize: 13, color: colors.muted, fontWeight: '600' }, muted: { color: colors.muted, fontSize: 11, lineHeight: 16 }, houseTitle: { color: colors.ink, fontSize: 14, fontWeight: '800' }, smallCard: { paddingVertical: 13 },
});
