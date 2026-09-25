import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Card, Page, Tag, colors } from '../../components';
import { useDemo } from '../../demo';

export default function AlertsScreen() {
  const { data, openAlerts } = useDemo();
  return <Page title="Alerts" subtitle={`${openAlerts.length} open · simulated signals`}>
    <Text style={styles.intro}>Alerts describe changes that may need inspection. They do not diagnose.</Text>
    {data.alerts.length === 0 ? <Card><Tag>NO DEMO ALERTS</Tag><Text style={styles.body}>Use the scenario simulator on Home to create one.</Text></Card> : data.alerts.map((alert) => {
      const house = data.houses.find((item) => item.id === alert.houseId);
      return <Card key={alert.id}>
        <View style={styles.row}><Tag color={alert.status === 'Resolved' ? 'green' : 'amber'}>{alert.status.toUpperCase()}</Tag><Text style={styles.muted}>House {house?.name.replace('House ', '')}</Text></View>
        <Text style={styles.heading}>A change to inspect</Text>
        <Text style={styles.body}>{alert.observed}</Text>
        <Text style={styles.muted}>{alert.temperature.toFixed(1)}°C · movement {alert.movement}%</Text>
        {alert.note ? <Text style={styles.notePreview}>Inspection note: {alert.note}</Text> : null}
        <Link href={{ pathname: '/alert/[id]', params: { id: alert.id } }} asChild><Pressable style={styles.button}><Text style={styles.buttonText}>Review alert</Text></Pressable></Link>
      </Card>;
    })}
    <Card style={styles.notice}><Text style={styles.noticeText}>Poultri helps the farmer decide where to look. Inspect the house and decide what action to take.</Text></Card>
  </Page>;
}

const styles = {
  row: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
  intro: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  body: { color: '#586355', fontSize: 13, lineHeight: 20 },
  muted: { color: colors.muted, fontSize: 11 },
  heading: { color: colors.ink, fontSize: 16, fontWeight: '800' as const },
  notePreview: { color: colors.darkGreen, fontSize: 12, lineHeight: 18, backgroundColor: colors.paleGreen, padding: 10, borderRadius: 9 },
  notice: { backgroundColor: colors.paleGreen }, noticeText: { color: colors.darkGreen, lineHeight: 19, fontSize: 12, fontWeight: '600' as const },
  button: { minHeight: 45, borderRadius: 11, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: colors.paleGreen }, buttonText: { color: colors.darkGreen, fontWeight: '800' as const },
};
