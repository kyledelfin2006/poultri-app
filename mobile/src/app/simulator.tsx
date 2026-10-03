import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, Page, PrimaryButton, SignalSlider, Tag, colors } from '../components';
import { RULE_EXPLANATION, scenarios, useDemo } from '../demo';

const scenarioCopy = {
  Normal: 'Show steady readings near the demo reference.',
  'Temperature rising': 'Raise temperature over three steps and watch for a change to inspect.',
  'Movement dropping': 'Lower movement to demonstrate an alert on its own.',
  Recovery: 'Start with elevated readings, then advance toward the reference.',
} as const;

export default function SimulatorScreen() {
  const { data, selectScenario, advanceScenario, setSignal, setEggs, desktopUrl, pairingCode, desktopStatus, pushStatus, connectDesktop, disconnectDesktop } = useDemo();
  const [serverAddress, setServerAddress] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState('');
  const house = data.houses.find((item) => item.id === 'house-2')!;
  const latest = house.readings.at(-1)!;

  return <Page title="Simulator" subtitle="Local demo input · not live data">
    <Card style={styles.notice}>
      <Tag color="amber">DEMO INPUT · SIMULATION ONLY</Tag>
      <Text style={styles.noticeText}>These readings come from this app or the local desktop simulator. A deployed Poultri system is intended to receive data from a Raspberry Pi and connected IoT devices. This prototype is not connected to that hardware.</Text>
    </Card>
    <Card>
      <View style={styles.sectionRow}><Text style={styles.heading}>Desktop simulator connection</Text><Tag color={desktopStatus === 'connected' ? 'green' : 'amber'}>{desktopStatus === 'connected' ? 'CONNECTED' : desktopStatus === 'connecting' ? 'CONNECTING' : 'NOT CONNECTED'}</Tag></View>
      <Text style={styles.body}>Enter the address and pairing code shown on the desktop IoT Simulator. Both devices need the same Wi‑Fi for simulated readings. Actual system push notifications also need internet and an installed APK.</Text>
      <TextInput accessibilityLabel="Desktop simulator server address" autoCapitalize="none" autoCorrect={false} keyboardType="url" placeholder="http://192.168.1.20:4174" value={serverAddress ?? desktopUrl} onChangeText={setServerAddress} style={styles.addressInput} />
      <TextInput accessibilityLabel="Desktop simulator pairing code" keyboardType="number-pad" maxLength={6} placeholder="6-digit pairing code" value={code ?? pairingCode} onChangeText={setCode} style={styles.addressInput} />
      <View style={styles.connectActions}>
        <PrimaryButton title="Connect" onPress={() => {
          const value = (serverAddress ?? desktopUrl).trim().replace(/\/+$/, '');
          if (!/^http:\/\/(localhost|\d{1,3}(?:\.\d{1,3}){3})(:\d+)?$/i.test(value)) { setConnectionError('Enter the desktop LAN address, such as http://192.168.1.20:4174.'); return; }
          const enteredCode = (code ?? pairingCode).trim();
          if (!/^\d{6}$/.test(enteredCode)) { setConnectionError('Enter the six-digit pairing code shown on the desktop.'); return; }
          setConnectionError('');
          connectDesktop(value, enteredCode);
        }} />
        <PrimaryButton title="Disconnect" secondary onPress={() => { setConnectionError(''); disconnectDesktop(); }} />
      </View>
      {connectionError ? <Text style={styles.connectionError}>{connectionError}</Text> : null}
      <Text style={styles.caption}>System push: {pushStatus}</Text>
      {desktopStatus === 'connecting' ? <Text style={styles.caption}>Connecting or trying to reconnect. New desktop readings will appear when the server is reachable.</Text> : null}
      {desktopStatus === 'connected' ? <Text style={styles.caption}>Connected. The app checks for new readings about once per second.</Text> : null}
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
  addressInput: { minHeight: 46, borderWidth: 1, borderColor: colors.line, borderRadius: 11, paddingHorizontal: 12, color: colors.ink, backgroundColor: '#FFFFFF' }, connectActions: { gap: 8 }, connectionError: { color: '#A23A2D', fontSize: 12, lineHeight: 18 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, heading: { color: colors.ink, fontSize: 16, fontWeight: '900' }, caption: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  scenarios: { gap: 8 }, scenario: { minHeight: 68, borderRadius: 13, borderWidth: 1, borderColor: colors.line, padding: 12, backgroundColor: '#FAFBF9', justifyContent: 'center', gap: 4 }, scenarioSelected: { borderColor: colors.green, backgroundColor: colors.paleGreen }, scenarioTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' }, scenarioTitleSelected: { color: colors.darkGreen }, scenarioDescription: { color: colors.muted, fontSize: 11, lineHeight: 16 }, selectedMark: { color: colors.darkGreen, fontWeight: '900' },
  body: { color: '#586355', fontSize: 13, lineHeight: 20 }, rule: { backgroundColor: '#F4F6F2', borderRadius: 11, padding: 12, gap: 4 }, ruleTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' }, ruleText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
