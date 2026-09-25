import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Page, PrimaryButton, SignalSlider, Tag, TrendChart, colors } from '../components';
import { RULE_EXPLANATION, getHouseStatus, scenarios, useDemo } from '../demo';

const scenarioCopy = {
  Normal: 'Show steady readings near the demo reference.',
  'Temperature rising': 'Raise temperature over three steps and watch for a change to inspect.',
  'Movement dropping': 'Lower movement to demonstrate an alert on its own.',
  Recovery: 'Start with elevated readings, then advance toward the reference.',
} as const;

export default function SimulatorScreen() {
  const { data, selectScenario, advanceScenario, setSignal, setEggs } = useDemo();
  const house = data.houses.find((item) => item.id === 'house-2')!;
  const latest = house.readings.at(-1)!;

  return <Page title="Simulator" subtitle="Local demo input · not live data">
    <Card style={styles.notice}>
      <Tag color="amber">DEMO INPUT · SIMULATION ONLY</Tag>
      <Text style={styles.noticeText}>These readings are entered locally for demonstration. A deployed Poultri system is intended to receive data from a Raspberry Pi and connected IoT devices. This prototype is not connected to that hardware.</Text>
    </Card>
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backLink}><Text style={styles.backText}>‹  Home dashboard</Text></Pressable>

    <Card style={styles.currentCard}>
      <View style={styles.sectionRow}><Text style={styles.heading}>{house.name} live demo state</Text><Tag color={getHouseStatus(house) === 'Normal' ? 'green' : 'amber'}>{getHouseStatus(house)}</Tag></View>
      <View style={styles.metrics}>
        <View style={[styles.metric, { backgroundColor: '#FFF2E7' }]}><Text style={[styles.metricLabel, { color: colors.temperature }]}>TEMP</Text><Text style={styles.metricValue}>{latest.temperature.toFixed(1)}°C</Text></View>
        <View style={[styles.metric, { backgroundColor: '#EAF4FC' }]}><Text style={[styles.metricLabel, { color: colors.humidity }]}>HUMIDITY</Text><Text style={styles.metricValue}>{latest.humidity}%</Text></View>
        <View style={[styles.metric, { backgroundColor: '#E9F6F3' }]}><Text style={[styles.metricLabel, { color: colors.movement }]}>MOVEMENT</Text><Text style={styles.metricValue}>{latest.movement}%</Text></View>
      </View>
      <View style={styles.sectionRow}><Text style={styles.subheading}>Reading trend</Text><Tag color="muted">STEP {data.scenarioStep}/3</Tag></View>
      <TrendChart values={house.readings.slice(-6).map((item) => item.temperature)} labels={house.readings.slice(-6).map((item) => `S${item.step}`)} suffix="°" color={colors.temperature} />
      <Text style={styles.caption}>House status and alerts respond to the latest reading.</Text>
    </Card>

    <Card>
      <View style={styles.sectionRow}><Text style={styles.heading}>Choose a scenario</Text><Tag color="muted">{data.scenarioStep} OF 3 STEPS</Tag></View>
      <View style={styles.scenarios}>{scenarios.map((scenario) => <Pressable key={scenario} accessibilityRole="button" accessibilityState={{ selected: data.scenario === scenario }} onPress={() => selectScenario(scenario)} style={[styles.scenario, data.scenario === scenario && styles.scenarioSelected]}>
        <View style={styles.sectionRow}><Text style={[styles.scenarioTitle, data.scenario === scenario && styles.scenarioTitleSelected]}>{scenario}</Text>{data.scenario === scenario ? <Text style={styles.selectedMark}>✓</Text> : null}</View>
        <Text style={styles.scenarioDescription}>{scenarioCopy[scenario]}</Text>
      </Pressable>)}</View>
      <PrimaryButton title={data.scenarioStep >= 3 ? 'Scenario complete' : 'Advance one step'} onPress={advanceScenario} disabled={data.scenarioStep >= 3} />
      <PrimaryButton title="Restart scenario" secondary onPress={() => selectScenario(data.scenario)} />
    </Card>

    <Card>
      <View style={styles.sectionRow}><Text style={styles.heading}>Create your own example</Text><Tag color="muted">HOUSE 2</Tag></View>
      <Text style={styles.body}>Drag a slider to preview a value. Release it to record the new reading across the demo.</Text>
      <SignalSlider key={`temperature-${latest.temperature}`} label="Temperature" value={latest.temperature} minimum={24} maximum={38} step={0.1} suffix="°C" onChange={(temperature) => setSignal({ temperature, humidity: latest.humidity, movement: latest.movement })} />
      <SignalSlider key={`humidity-${latest.humidity}`} label="Humidity" value={latest.humidity} minimum={30} maximum={90} step={1} suffix="%" onChange={(humidity) => setSignal({ temperature: latest.temperature, humidity, movement: latest.movement })} />
      <SignalSlider key={`movement-${latest.movement}`} label="Bird movement" value={latest.movement} minimum={0} maximum={100} step={1} suffix="%" onChange={(movement) => setSignal({ temperature: latest.temperature, humidity: latest.humidity, movement })} />
      <SignalSlider key={`eggs-${house.eggs}`} label="Egg production today" value={house.eggs} minimum={1500} maximum={4000} step={10} suffix=" eggs" onChange={(eggs) => setEggs(house.id, eggs)} />
      <Text style={styles.caption}>Production changes update the Home total and Records history.</Text>
      <View style={styles.rule}><Text style={styles.ruleTitle}>How the demo alert works</Text><Text style={styles.ruleText}>{RULE_EXPLANATION}</Text></View>
    </Card>

  </Page>;
}

const styles = StyleSheet.create({
  notice: { backgroundColor: '#FFF6E3', borderColor: '#E8D4A6' }, noticeText: { color: colors.amberInk, fontSize: 13, lineHeight: 20, fontWeight: '600' },
  backLink: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }, backText: { color: colors.darkGreen, fontWeight: '800', fontSize: 13 },
  currentCard: { backgroundColor: '#FCFDFC' }, sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, heading: { color: colors.ink, fontSize: 16, fontWeight: '900' }, subheading: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  metrics: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, minHeight: 76, borderRadius: 13, padding: 10, justifyContent: 'center', gap: 6 }, metricLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.4 }, metricValue: { color: colors.ink, fontSize: 16, fontWeight: '900' }, caption: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  scenarios: { gap: 8 }, scenario: { minHeight: 68, borderRadius: 13, borderWidth: 1, borderColor: colors.line, padding: 12, backgroundColor: '#FAFBF9', justifyContent: 'center', gap: 4 }, scenarioSelected: { borderColor: colors.green, backgroundColor: colors.paleGreen }, scenarioTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, scenarioTitleSelected: { color: colors.darkGreen }, scenarioDescription: { color: colors.muted, fontSize: 11, lineHeight: 16 }, selectedMark: { color: colors.darkGreen, fontWeight: '900' },
  body: { color: '#586355', fontSize: 13, lineHeight: 20 }, rule: { backgroundColor: '#F4F6F2', borderRadius: 11, padding: 12, gap: 4 }, ruleTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' }, ruleText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
