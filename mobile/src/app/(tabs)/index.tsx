import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Page, PrimaryButton, SignalBar, Tag, TrendChart, colors } from '../../components';
import { getHouseStatus, isAlertConditionActive, useDemo } from '../../demo';

export default function HomeScreen() {
  const { data, openAlerts } = useDemo();
  const production = data.houses.reduce((total, house) => total + house.eggs, 0);
  const housesNeedingAttention = data.houses.filter((house) => getHouseStatus(house) !== 'Normal').length;
  const scenarioHouse = data.houses.find((house) => house.id === 'house-2')!;
  const latestAlert = openAlerts[0];

  return <Page title={data.farmName} subtitle={data.offline ? 'Simulated offline · saved on this device' : 'Demo data · local farm'}>
    <Card style={styles.simulatorCard}>
      <View style={styles.simulatorIntro}><View style={styles.simulatorIcon}><Text style={styles.playGlyph}>▶</Text></View><View style={styles.simulatorCopy}><Text style={styles.eyebrow}>DEMO SIMULATOR</Text><Text style={styles.simulatorTitle}>{data.scenarioStep > 0 ? `${data.scenario} · step ${data.scenarioStep}/3` : data.scenario === 'Normal' ? 'Start a demo scenario' : `${data.scenario} · ready to advance`}</Text><Text style={styles.muted}>Try a scenario and watch the dashboard respond.</Text></View></View>
      <PrimaryButton title="Open simulator" onPress={() => router.push('/simulator')} />
    </Card>

    <View style={styles.metrics}>
      <Card style={[styles.metric, styles.metricGreen]}><Text style={styles.metricLabel}>POULTRY HOUSES</Text><Text style={styles.metricValue}>{data.houses.length}</Text><Text style={styles.metricHint}>in this demo farm</Text></Card>
      <Card style={[styles.metric, housesNeedingAttention ? styles.metricAmber : styles.metricBlue]}><Text style={styles.metricLabel}>NEED INSPECTION</Text><Text style={styles.metricValue}>{housesNeedingAttention}</Text><Text style={styles.metricHint}>{housesNeedingAttention ? 'current house status' : 'all demo houses steady'}</Text></Card>
      <Card style={[styles.metric, latestAlert ? styles.metricAmber : styles.metricTeal]}><Text style={styles.metricLabel}>OPEN ALERTS</Text><Text style={styles.metricValue}>{openAlerts.length}</Text><Text style={styles.metricHint}>{latestAlert ? 'inspection records' : 'none in this demo'}</Text></Card>
      <Card style={[styles.metric, styles.metricPurple]}><Text style={styles.metricLabel}>EGGS TODAY</Text><Text style={styles.metricValue}>{production.toLocaleString()}</Text><Text style={styles.metricHint}>illustrative total</Text></Card>
    </View>

    {latestAlert ? <Pressable accessibilityRole="button" accessibilityLabel={`Review alert for ${scenarioHouse.name}`} accessibilityHint="Opens the alert details" onPress={() => router.push({ pathname: '/alert/[id]', params: { id: latestAlert.id } })}>
      <Card style={styles.alertCard}><View style={styles.row}><Tag color="amber">{isAlertConditionActive(latestAlert) ? 'CONDITION ACTIVE' : 'READINGS RECOVERED'}</Tag><Text style={styles.muted}>{latestAlert.status}</Text></View><Text style={styles.heading}>A change needs a closer look</Text><Text style={styles.body}>{latestAlert.observed}. Tap to review the inspection record.</Text></Card>
    </Pressable> : housesNeedingAttention > 0 ? <Card style={styles.alertCard}><View style={styles.row}><Tag color="amber">NEEDS INSPECTION</Tag><Text style={styles.muted}>No open alert</Text></View><Text style={styles.heading}>A house still meets the demo rule</Text><Text style={styles.body}>The current readings remain elevated after the earlier record was resolved. Review the House 2 dashboard or restart the simulator.</Text></Card> : <Card style={styles.normalCard}><View style={styles.row}><Tag>ALL HOUSES NORMAL</Tag><Text style={styles.goodGlyph}>✓</Text></View><Text style={styles.body}>No house currently meets the demonstration alert rule.</Text></Card>}

    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>House overview</Text><Tag color="muted">SIMULATED</Tag></View>
    <Text style={styles.muted}>Reading bars are visual scales only, not health limits.</Text>
    {data.houses.map((house) => {
      const reading = house.readings.at(-1)!;
      const status = getHouseStatus(house);
      return <Pressable key={house.id} accessibilityRole="button" accessibilityLabel={`${house.name}, ${status}, ${reading.temperature.toFixed(1)} degrees, humidity ${reading.humidity} percent, movement ${reading.movement} percent`} accessibilityHint="Opens house details" onPress={() => router.push({ pathname: '/house/[id]', params: { id: house.id } })}>
        <Card style={styles.houseCard}>
          <View style={styles.row}><View><Text style={styles.houseName}>{house.name}</Text><Text style={styles.muted}>{house.birds.toLocaleString()} birds · {house.eggs.toLocaleString()} eggs today</Text></View><Tag color={status === 'Normal' ? 'green' : 'amber'}>{status}</Tag></View>
          <View style={styles.signalBars}>
            <SignalBar label="Temp" value={`${reading.temperature.toFixed(1)}°`} progress={(reading.temperature - 24) / 14} color={colors.temperature} />
            <SignalBar label="Humidity" value={`${reading.humidity}%`} progress={reading.humidity / 100} color={colors.humidity} />
            <SignalBar label="Movement" value={`${reading.movement}%`} progress={reading.movement / 100} color={colors.movement} />
          </View>
        </Card>
      </Pressable>;
    })}

    <Card>
      <View style={styles.row}><Text style={styles.heading}>House 2 temperature trend</Text><Tag color="muted">LIVE DEMO</Tag></View>
      <TrendChart values={scenarioHouse.readings.slice(-6).map((item) => item.temperature)} labels={scenarioHouse.readings.slice(-6).map((item) => `S${item.step}`)} suffix="°" color={colors.temperature} />
      <Text style={styles.muted}>Updates with each simulator step or saved signal edit.</Text>
    </Card>
  </Page>;
}

const styles = StyleSheet.create({
  simulatorCard: { backgroundColor: '#EDF6E8', borderColor: '#D4E7C9' }, simulatorIntro: { flexDirection: 'row', alignItems: 'center', gap: 12 }, simulatorIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.darkGreen }, playGlyph: { color: colors.white, fontSize: 15 }, simulatorCopy: { flex: 1, gap: 3 }, eyebrow: { color: colors.darkGreen, fontSize: 9, fontWeight: '900', letterSpacing: 1 }, simulatorTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, metric: { width: '48%', flexGrow: 1, padding: 13, gap: 4, borderWidth: 0 }, metricGreen: { backgroundColor: '#EAF5E5' }, metricAmber: { backgroundColor: '#FFF2D9' }, metricBlue: { backgroundColor: '#EAF3FB' }, metricTeal: { backgroundColor: '#E7F5F1' }, metricPurple: { backgroundColor: '#F0ECF8' }, metricLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 0.4 }, metricValue: { color: colors.ink, fontSize: 25, fontWeight: '900' }, metricHint: { color: colors.muted, fontSize: 10 },
  alertCard: { backgroundColor: '#FFF8E9', borderColor: '#EEDCA9' }, normalCard: { backgroundColor: '#EDF6E8' }, goodGlyph: { color: colors.darkGreen, fontSize: 20, fontWeight: '900' }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, heading: { color: colors.ink, fontWeight: '800', fontSize: 15 }, body: { color: '#586355', fontSize: 13, lineHeight: 20 }, muted: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }, sectionTitle: { fontSize: 17, fontWeight: '900', color: colors.ink }, houseCard: { paddingVertical: 14, gap: 12 }, houseName: { fontSize: 15, fontWeight: '800', color: colors.ink }, signalBars: { flexDirection: 'row', gap: 9 },
});
