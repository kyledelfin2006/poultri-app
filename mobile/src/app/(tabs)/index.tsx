import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Page, PrimaryButton, SignalSlider, Tag, TrendChart, colors } from '../../components';
import { RULE_EXPLANATION, getHouseStatus, scenarios, useDemo } from '../../demo';

export default function HomeScreen() {
  const { data, openAlerts, selectScenario, advanceScenario, setSignal, setEggs } = useDemo();
  const house = data.houses.find((item) => item.id === 'house-2')!;
  const latest = house.readings.at(-1)!;
  const production = data.houses.reduce((total, item) => total + item.eggs, 0);
  const scenarioValues = {
    Normal: ['normal and steady', 'Signals return to the house reference.'],
    'Temperature rising': ['temperature increases over each step', 'Watch how movement and temperature change together.'],
    'Movement dropping': ['movement decreases over each step', 'The demo rule can flag a movement change on its own.'],
    Recovery: ['readings start elevated', 'Advance to show readings returning toward the demo reference.'],
  } as const;

  return <Page title={data.farmName} subtitle={data.offline ? 'Simulated offline · saved on this device' : 'Demo data · local farm'}>
    <View style={styles.metrics}>
      <Card style={styles.metric}><Text style={styles.metricLabel}>Houses</Text><Text style={styles.metricValue}>3</Text></Card>
      <Card style={styles.metric}><Text style={styles.metricLabel}>Open alerts</Text><Text style={[styles.metricValue, openAlerts.length > 0 && { color: colors.amberInk }]}>{openAlerts.length}</Text></Card>
      <Card style={styles.metric}><Text style={styles.metricLabel}>Eggs today</Text><Text style={styles.metricValue}>{production.toLocaleString()}</Text></Card>
    </View>

    {openAlerts[0] ? <Pressable accessibilityRole="button" accessibilityLabel={`Review alert for ${house.name}`} accessibilityHint="Opens the alert details" onPress={() => router.push({ pathname: '/alert/[id]', params: { id: openAlerts[0].id } })}>
      <Card style={styles.alertCard}><View style={styles.row}><Tag color="amber">NEEDS INSPECTION</Tag><Text style={styles.muted}>{openAlerts[0].status}</Text></View><Text style={styles.heading}>A change needs a closer look</Text><Text style={styles.body}>{openAlerts[0].observed}. Tap to review the alert.</Text></Card>
    </Pressable> : <Card style={styles.normalCard}><Tag>ALL HOUSES NORMAL</Tag><Text style={styles.body}>Choose a simulator scenario below to demonstrate how Poultri can surface a change for inspection.</Text></Card>}

    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Poultry houses</Text><Text style={styles.muted}>Simulated readings</Text></View>
    {data.houses.map((item) => {
      const last = item.readings.at(-1)!;
      const status = getHouseStatus(item);
      return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.name}, ${status}, ${last.temperature.toFixed(1)} degrees, humidity ${last.humidity} percent, movement ${last.movement} percent`} accessibilityHint="Opens house details" onPress={() => router.push({ pathname: '/house/[id]', params: { id: item.id } })}>
        <Card style={styles.houseCard}>
          <View style={styles.row}><Text style={styles.houseName}>{item.name}</Text><Tag color={status === 'Normal' ? 'green' : 'amber'}>{status}</Tag></View>
          <Text style={styles.body}>{last.temperature.toFixed(1)}°C · {last.humidity}% humidity · Movement {last.movement}%</Text>
          <Text style={styles.muted}>{item.birds.toLocaleString()} birds · {item.eggs.toLocaleString()} eggs today</Text>
        </Card>
      </Pressable>;
    })}

    <Card>
      <View style={styles.row}><Text style={styles.sectionTitle}>Scenario simulator</Text><Tag color="muted">STEP {data.scenarioStep}/3</Tag></View>
      <Text style={styles.body}>Advance a local scenario. Readings, trends, house status, and alerts update together.</Text>
      <View style={styles.scenarios}>{scenarios.map((scenario) => <Pressable key={scenario} accessibilityRole="button" accessibilityState={{ selected: data.scenario === scenario }} onPress={() => selectScenario(scenario)} style={[styles.scenarioChip, data.scenario === scenario && styles.scenarioSelected]}><Text style={[styles.scenarioText, data.scenario === scenario && styles.scenarioTextSelected]}>{scenario}</Text></Pressable>)}</View>
      <Text style={styles.muted}>Scenario: {scenarioValues[data.scenario][0]}. {scenarioValues[data.scenario][1]}</Text>
      <PrimaryButton title={data.scenarioStep >= 3 ? 'Scenario complete' : 'Advance one step'} onPress={advanceScenario} disabled={data.scenarioStep >= 3} />
      <View style={styles.divider} />
      <Text style={styles.heading}>Create your own example</Text>
      <Text style={styles.muted}>{house.name} · readings update when you release a slider</Text>
      <SignalSlider key={`temperature-${latest.temperature}`} label="Temperature" value={latest.temperature} minimum={24} maximum={38} step={0.1} suffix="°C" onChange={(temperature) => setSignal({ temperature, humidity: latest.humidity, movement: latest.movement })} />
      <SignalSlider key={`humidity-${latest.humidity}`} label="Humidity" value={latest.humidity} minimum={30} maximum={90} step={1} suffix="%" onChange={(humidity) => setSignal({ temperature: latest.temperature, humidity, movement: latest.movement })} />
      <SignalSlider key={`movement-${latest.movement}`} label="Bird movement" value={latest.movement} minimum={0} maximum={100} step={1} suffix="%" onChange={(movement) => setSignal({ temperature: latest.temperature, humidity: latest.humidity, movement })} />
      <SignalSlider key={`eggs-${house.eggs}`} label="Egg production · House 2" value={house.eggs} minimum={1500} maximum={4000} step={10} suffix=" eggs" onChange={(eggs) => setEggs(house.id, eggs)} />
      <Text style={styles.rule}>{RULE_EXPLANATION}</Text>
    </Card>

    <Card><View style={styles.row}><Text style={styles.heading}>House 2 temperature trend</Text><Tag color="muted">SIMULATED</Tag></View><TrendChart values={house.readings.slice(-6).map((item) => item.temperature)} labels={house.readings.slice(-6).map((item) => `S${item.step}`)} suffix="°" /><Text style={styles.muted}>Each slider release and scenario step appends a point.</Text></Card>
  </Page>;
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, padding: 12, gap: 6 }, metricLabel: { color: colors.muted, fontSize: 10 }, metricValue: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  alertCard: { backgroundColor: '#FFFCF3', borderColor: '#EEDCA9' }, normalCard: { backgroundColor: colors.paleGreen }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, heading: { color: colors.ink, fontWeight: '800', fontSize: 15 }, body: { color: '#586355', fontSize: 13, lineHeight: 20 }, muted: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }, sectionTitle: { fontSize: 17, fontWeight: '900', color: colors.ink }, houseCard: { paddingVertical: 14 }, houseName: { fontSize: 15, fontWeight: '800', color: colors.ink },
  scenarios: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, scenarioChip: { minHeight: 44, justifyContent: 'center', backgroundColor: '#F2F4F0', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.line }, scenarioSelected: { backgroundColor: colors.paleGreen, borderColor: colors.green }, scenarioText: { color: colors.muted, fontSize: 12, fontWeight: '700' }, scenarioTextSelected: { color: colors.darkGreen }, divider: { borderTopWidth: 1, borderTopColor: colors.line, marginVertical: 3 }, rule: { color: colors.muted, backgroundColor: '#F4F6F2', borderRadius: 10, padding: 10, fontSize: 12, lineHeight: 18 },
});
