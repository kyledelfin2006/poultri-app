import Slider from '@react-native-community/slider';
import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export const colors = {
  green: '#6DB33F', darkGreen: '#155B36', ink: '#1D2A1B', muted: '#6E7869',
  canvas: '#F5F8F3', line: '#E4EAE0', paleGreen: '#EDF6E8', amber: '#FFF4D9', amberInk: '#8A5C00',
  white: '#FFFFFF',
};

export function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return <SafeAreaView style={styles.safe} edges={['top']}>
    <View style={styles.header}>
      <Image source={require('../assets/poultri-wordmark.png')} style={styles.wordmark} resizeMode="contain" accessibilityLabel="Poultri" />
      <View style={styles.headerText}><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>
      <View style={styles.demoPill}><Text style={styles.demoPillText}>DEMO</Text></View>
    </View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView>
  </SafeAreaView>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({ title, onPress, secondary = false, disabled = false }: { title: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, pressed && styles.pressed, disabled && styles.disabled]}>
    <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>{title}</Text>
  </Pressable>;
}

export function Tag({ children, color = 'green' }: { children: ReactNode; color?: 'green' | 'amber' | 'muted' }) {
  return <View style={[styles.tag, color === 'amber' && styles.tagAmber, color === 'muted' && styles.tagMuted]}><Text style={[styles.tagText, color === 'amber' && styles.tagAmberText, color === 'muted' && styles.tagMutedText]}>{children}</Text></View>;
}

export function SignalSlider({ label, value, minimum, maximum, step, suffix, onChange }: {
  label: string; value: number; minimum: number; maximum: number; step: number; suffix: string; onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(value);
  const preview = step < 1 ? draft.toFixed(1) : Math.round(draft);
  return <View style={styles.sliderWrap}>
    <View style={styles.sliderHeading}><Text style={styles.sliderLabel}>{label}</Text><Text style={styles.sliderValue}>{preview}{suffix}</Text></View>
    <Slider value={draft} minimumValue={minimum} maximumValue={maximum} step={step} onValueChange={setDraft} onSlidingComplete={(next) => { setDraft(next); onChange(next); }}
      minimumTrackTintColor={colors.green} maximumTrackTintColor="#DCE5D7" thumbTintColor={colors.darkGreen} />
    <View style={styles.sliderLimits}><Text>{minimum}{suffix}</Text><Text>{maximum}{suffix}</Text></View>
  </View>;
}

export function TrendChart({ values, labels, suffix = '' }: { values: number[]; labels: string[]; suffix?: string }) {
  const low = Math.min(...values);
  const high = Math.max(...values);
  const range = Math.max(high - low, 1);
  return <View style={styles.chart}>
    {values.map((value, index) => <View key={`${labels[index]}-${index}`} style={styles.chartColumn}>
      <Text style={styles.chartValue}>{`${value}${suffix}`}</Text>
      <View style={[styles.chartBar, { height: 24 + ((value - low) / range) * 66 }]} />
      <Text style={styles.chartLabel}>{labels[index]}</Text>
    </View>)}
  </View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: { minHeight: 70, backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.line, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmark: { width: 88, height: 36 }, headerText: { flex: 1 }, title: { fontSize: 18, color: colors.ink, fontWeight: '800' }, subtitle: { fontSize: 11, color: colors.muted, marginTop: 2 },
  demoPill: { backgroundColor: colors.paleGreen, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99 }, demoPillText: { color: colors.darkGreen, fontSize: 9, fontWeight: '900', letterSpacing: 0.7 },
  content: { padding: 16, paddingBottom: 32, gap: 12 }, card: { backgroundColor: colors.white, borderRadius: 17, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 10 },
  button: { minHeight: 47, backgroundColor: colors.green, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12 }, buttonSecondary: { backgroundColor: colors.paleGreen, borderWidth: 1, borderColor: '#D4E7C9' }, buttonText: { color: colors.white, fontSize: 14, fontWeight: '800' }, buttonTextSecondary: { color: colors.darkGreen }, pressed: { opacity: 0.75 }, disabled: { opacity: 0.4 },
  tag: { alignSelf: 'flex-start', backgroundColor: colors.paleGreen, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5 }, tagAmber: { backgroundColor: colors.amber }, tagMuted: { backgroundColor: '#EEF1EC' }, tagText: { color: colors.darkGreen, fontSize: 10, fontWeight: '800' }, tagAmberText: { color: colors.amberInk }, tagMutedText: { color: colors.muted },
  sliderWrap: { gap: 2 }, sliderHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sliderLabel: { color: colors.ink, fontSize: 13, fontWeight: '700' }, sliderValue: { color: colors.darkGreen, fontSize: 14, fontWeight: '900' }, sliderLimits: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 3 },
  chart: { height: 130, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }, chartColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 }, chartValue: { fontSize: 11, color: colors.muted }, chartBar: { width: '62%', borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: colors.green }, chartLabel: { fontSize: 11, color: colors.muted },
});
