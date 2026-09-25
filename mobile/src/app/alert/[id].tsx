import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';
import { Card, ComparisonBars, Page, PrimaryButton, Tag, colors } from '../../components';
import { isAlertConditionActive, useDemo, type FarmAlert, type House } from '../../demo';

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useDemo();
  const alert = data.alerts.find((item) => item.id === id);
  const house = data.houses.find((item) => item.id === alert?.houseId);
  if (!alert || !house) return <Page title="Alert not found"><Card><Text style={styles.body}>This demo alert is no longer available.</Text></Card></Page>;
  return <AlertDetails key={alert.id} alert={alert} house={house} />;
}

function AlertDetails({ alert, house }: { alert: FarmAlert; house: House }) {
  const { updateAlert } = useDemo();
  const [note, setNote] = useState(alert.note);
  return <Page title="Alert details" subtitle={`${house.name} · simulated alert`}>
    <Card>
      <View style={styles.row}><Tag color={alert.status === 'Resolved' ? 'green' : 'amber'}>{alert.status.toUpperCase()}</Tag>{alert.status !== 'Resolved' ? <Tag color={isAlertConditionActive(alert) ? 'amber' : 'green'}>{isAlertConditionActive(alert) ? 'CONDITION ACTIVE' : 'READINGS RECOVERED'}</Tag> : null}</View>
      <Text style={styles.heading}>{alert.status === 'Resolved' ? 'Inspection record' : 'A change needs a closer look'}</Text>
      <Text style={styles.body}>The demo rule first observed {alert.observed}. Compare the reference with {alert.status === 'Resolved' ? 'the reading when this record was resolved' : 'the latest recorded reading'}.</Text>
      <ComparisonBars label="Temperature" reference={alert.referenceTemperature} latest={alert.temperature} minimum={24} maximum={38} suffix="°C" precision={1} latestLabel={alert.status === 'Resolved' ? 'At resolve' : 'Latest'} color={colors.temperature} />
      <ComparisonBars label="Bird movement" reference={alert.referenceMovement} latest={alert.movement} minimum={0} maximum={100} suffix="%" latestLabel={alert.status === 'Resolved' ? 'At resolve' : 'Latest'} color={colors.movement} />
      {!isAlertConditionActive(alert) && alert.status !== 'Resolved' ? <Text style={styles.recovered}>Latest readings no longer meet the demo alert rule. The inspection record stays open until you resolve it.</Text> : null}
      <View style={styles.notice}><Text style={styles.noticeText}>Early warning, not a diagnosis. Inspect the area and decide what action to take.</Text></View>
      {alert.status === 'New' && <PrimaryButton title="Acknowledge alert" onPress={() => updateAlert(alert.id, { status: 'Acknowledged' })} />}
      {alert.status !== 'Resolved' && <PrimaryButton title="Mark resolved" onPress={() => updateAlert(alert.id, { status: 'Resolved' })} secondary />}
    </Card>
    <Card>
      <Text style={styles.heading}>Inspection record</Text>
      <Text style={styles.body}>Record what the farmer inspected or did. This note stays on this device.</Text>
      <TextInput value={note} onChangeText={setNote} multiline placeholder="Example: Checked ventilation; readings returned toward normal." placeholderTextColor="#899386" style={styles.input} textAlignVertical="top" />
      <PrimaryButton title="Save inspection note" onPress={() => { updateAlert(alert.id, { note: note.trim() }); router.back(); }} />
    </Card>
  </Page>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 7 }, muted: { color: colors.muted, fontSize: 11 }, recovered: { color: colors.darkGreen, backgroundColor: colors.paleGreen, padding: 10, borderRadius: 9, fontSize: 12, lineHeight: 18 },
  heading: { color: colors.ink, fontSize: 17, fontWeight: '800' }, body: { color: '#586355', fontSize: 13, lineHeight: 20 },
  notice: { backgroundColor: colors.paleGreen, padding: 12, borderRadius: 11 }, noticeText: { color: colors.darkGreen, fontSize: 12, lineHeight: 19, fontWeight: '600' },
  input: { minHeight: 112, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, fontSize: 14, color: colors.ink, backgroundColor: '#FBFCFA' },
});
