import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Card, Page, PrimaryButton, Tag, colors } from '../../components';
import { useDemo } from '../../demo';

export default function ProfileScreen() {
  const { data, updateFarm, updateHouse, setOffline, reset } = useDemo();
  return <Page title="Profile" subtitle="Farm profile and demo settings">
    <Card style={styles.profileCard}>
      <Image source={require('../../../assets/poultri-logo.png')} style={styles.avatar} resizeMode="contain" accessibilityLabel="Poultri logo" />
      <View style={styles.profileText}><Text style={styles.name}>{data.ownerName}</Text><Text style={styles.muted}>Farm owner · demo profile</Text></View>
      <Tag color="green">LOCAL DEMO</Tag>
    </Card>
    <Card><Text style={styles.heading}>Farm profile</Text><Text style={styles.label}>Farm name</Text><TextInput accessibilityLabel="Farm name" value={data.farmName} onChangeText={(farmName) => updateFarm({ farmName })} style={styles.input} /><Text style={styles.label}>Farm owner</Text><TextInput accessibilityLabel="Farm owner" value={data.ownerName} onChangeText={(ownerName) => updateFarm({ ownerName })} style={styles.input} /></Card>
    <Card><Text style={styles.heading}>Edit houses</Text><Text style={styles.muted}>Changes are saved on this device and reflected on Home and Records.</Text>
      {data.houses.map((house) => <View key={house.id} style={styles.houseEdit}>
        <TextInput accessibilityLabel={`${house.name} name`} value={house.name} onChangeText={(name) => updateHouse(house.id, { name })} style={[styles.input, styles.houseInput]} />
        <BirdCount key={`${house.id}-${house.birds}`} value={house.birds} onSave={(birds) => updateHouse(house.id, { birds })} />
      </View>)}
    </Card>
    <Card><Text style={styles.heading}>Demonstration mode</Text><View style={styles.switchRow}><View style={{ flex: 1 }}><Text style={styles.body}>Simulate offline</Text><Text style={styles.muted}>All prototype screens use data stored on this device.</Text></View><Switch value={data.offline} onValueChange={setOffline} trackColor={{ true: colors.green }} /></View><PrimaryButton title="Reset demo data" secondary onPress={() => Alert.alert('Reset demo?', 'Restore sample houses, records, readings, and alerts.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: reset }])} /></Card>
    <Card><Text style={styles.heading}>About Poultri</Text><Text style={styles.body}>Poultri is designed to combine camera activity, temperature and humidity readings, and farm records so farmers can see which house may need inspection.</Text><Text style={styles.body}>On-site processing is an intended product capability for farms with unreliable internet. This app is a local simulation; it does not connect to farm hardware or process camera video.</Text><Text style={styles.muted}>Potential risks for inspection only · Poultri does not diagnose or prescribe treatment.</Text></Card>
    <Card><Text style={styles.heading}>Proposed package</Text><Text style={styles.price}>₱40,000</Text><Text style={styles.body}>Proposed sensor and installation package. Monitoring subscription is separate. Pricing is subject to field validation.</Text><View style={styles.divider} /><Text style={styles.heading}>Targets to validate</Text><Text style={styles.body}>Alert within one minute · seven days offline · 80% accuracy in controlled tests · field test with three farms.</Text><Text style={styles.muted}>Targets from the concept note; none are presented as achieved results.</Text></Card>
    <PrimaryButton title="Return to welcome screen" onPress={() => router.replace('/')} secondary />
  </Page>;
}

function BirdCount({ value, onSave }: { value: number; onSave: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  return <View style={styles.birdField}><Text style={styles.label}>Birds</Text><TextInput value={draft} onChangeText={setDraft} onEndEditing={() => { const parsed = Number(draft); if (Number.isFinite(parsed) && parsed >= 1) onSave(Math.round(parsed)); else setDraft(String(value)); }} keyboardType="number-pad" style={styles.input} accessibilityLabel="Bird count" /></View>;
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 12 }, avatar: { width: 52, height: 52 }, profileText: { flex: 1 }, name: { color: colors.ink, fontWeight: '900', fontSize: 16 }, muted: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  heading: { color: colors.ink, fontWeight: '800', fontSize: 15 }, label: { color: colors.muted, fontSize: 12 }, input: { minHeight: 44, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FBFCFA', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.ink, fontSize: 14 },
  body: { color: '#586355', fontSize: 13, lineHeight: 19 }, price: { color: colors.darkGreen, fontSize: 27, fontWeight: '900' }, switchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, divider: { borderTopWidth: 1, borderTopColor: colors.line },
  houseEdit: { flexDirection: 'row', gap: 10, alignItems: 'center' }, houseInput: { flex: 1 }, birdField: { width: 112, gap: 4 },
});
