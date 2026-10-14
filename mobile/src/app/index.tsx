import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Reading = {
  temperatureC: number;
  humidityPct: number;
  receivedAt: string;
};

type ReadingResponse = { reading: Reading | null };
type AlertRecord = { acknowledged: boolean; recovered: boolean };

const THRESHOLD_C = 1.5;
const STALE_AFTER_MS = 5000;

async function getJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function isReading(value: unknown): value is Reading {
  if (!value || typeof value !== 'object') return false;
  const sample = value as Partial<Reading>;
  return Number.isFinite(sample.temperatureC)
    && Number.isFinite(sample.humidityPct)
    && typeof sample.receivedAt === 'string'
    && Number.isFinite(Date.parse(sample.receivedAt));
}

function Button({
  title,
  onPress,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, secondary && styles.secondaryButton, disabled && styles.disabledButton]}
    >
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{title}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [bridgeUrl, setBridgeUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState('Enter the laptop bridge URL, then connect.');
  const [reading, setReading] = useState<Reading | null>(null);
  const [baseline, setBaseline] = useState<number | null>(null);
  const [alertRecord, setAlertRecord] = useState<AlertRecord | null>(null);
  const [now, setNow] = useState(0);
  const baselineRef = useRef<number | null>(null);
  const alertRef = useRef<AlertRecord | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!connected || !activeUrl) return undefined;
    let active = true;
    let busy = false;

    const poll = async () => {
      if (busy) return;
      busy = true;
      try {
        const payload = await getJson<ReadingResponse>(`${activeUrl}/api/reading`);
        if (!active) return;
        if (payload.reading === null) {
          setReading(null);
          return;
        }
        if (!isReading(payload.reading)) throw new Error('Bridge returned an invalid reading.');

        const sample = payload.reading;
        setReading(sample);
        const fresh = Date.now() - Date.parse(sample.receivedAt) <= STALE_AFTER_MS;
        if (!fresh) return;

        if (baselineRef.current === null) {
          baselineRef.current = sample.temperatureC;
          setBaseline(sample.temperatureC);
          return;
        }

        const recovered = sample.temperatureC - baselineRef.current < THRESHOLD_C;
        if (alertRef.current === null && !recovered) {
          const next = { acknowledged: false, recovered: false };
          alertRef.current = next;
          setAlertRecord(next);
        } else if (alertRef.current !== null) {
          const next = { ...alertRef.current, recovered };
          alertRef.current = next;
          setAlertRecord(next);
        }
      } catch (error) {
        if (active) {
          setConnected(false);
          setMessage(`Bridge disconnected: ${error instanceof Error ? error.message : 'request failed'}`);
        }
      } finally {
        busy = false;
      }
    };

    void poll();
    const timer = setInterval(() => void poll(), 1000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [activeUrl, connected]);

  const sampleAgeMs = reading ? Math.max(0, now - Date.parse(reading.receivedAt)) : 0;
  const stale = reading !== null && sampleAgeMs > STALE_AFTER_MS;
  const status = !connected && activeUrl
    ? (stale ? 'DISCONNECTED · STALE READING' : 'DISCONNECTED')
    : stale
      ? 'STALE READING'
      : connected
        ? (reading ? 'CONNECTED' : 'WAITING FOR WOKWI DATA')
        : 'DISCONNECTED';

  async function connect() {
    const normalized = bridgeUrl.trim().replace(/\/+$/, '');
    if (!/^http:\/\//i.test(normalized)) {
      setMessage('Enter the laptop URL starting with http://');
      return;
    }

    setConnecting(true);
    setConnected(false);
    setMessage('Checking bridge…');
    try {
      const health = await getJson<{ ok: boolean }>(`${normalized}/api/health`);
      if (health.ok !== true) throw new Error('Bridge health check failed.');
      baselineRef.current = null;
      alertRef.current = null;
      setBaseline(null);
      setAlertRecord(null);
      setReading(null);
      setActiveUrl(normalized);
      setConnected(true);
      setMessage('Connected. Waiting for a fresh Wokwi reading.');
    } catch (error) {
      setMessage(`Could not connect: ${error instanceof Error ? error.message : 'request failed'}`);
    } finally {
      setConnecting(false);
    }
  }

  function acknowledge() {
    if (!alertRef.current) return;
    const next = { ...alertRef.current, acknowledged: true };
    alertRef.current = next;
    setAlertRecord(next);
  }

  function resetDemo() {
    baselineRef.current = null;
    alertRef.current = null;
    setBaseline(null);
    setAlertRecord(null);
    setMessage('Demo reset. The next fresh reading becomes the reference.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Image source={require('../../assets/poultri-logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Official Poultri logo" />
          <Image source={require('../../assets/poultri-wordmark.png')} style={styles.wordmark} resizeMode="contain" accessibilityLabel="Poultri" />
        </View>

        <Text style={styles.eyebrow}>WOKWI DEMO · SIMULATED DATA</Text>
        <View style={styles.statusCard}>
          <Text style={styles.status}>{status}</Text>
          <Text style={styles.supporting}>{message}</Text>
        </View>

        <View style={styles.connectCard}>
          <Text style={styles.sectionTitle}>Local bridge</Text>
          <TextInput
            accessibilityLabel="Laptop bridge URL"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={setBridgeUrl}
            placeholder="http://<laptop-LAN-IP>:4174"
            placeholderTextColor="#87938A"
            style={styles.input}
            value={bridgeUrl}
          />
          <Button title={connecting ? 'Connecting…' : 'Connect'} onPress={() => void connect()} disabled={connecting} />
          {connecting && <ActivityIndicator color="#2B6841" style={styles.spinner} />}
        </View>

        <View style={styles.readingCard}>
          <Text style={styles.sectionTitle}>House 1</Text>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>TEMPERATURE</Text>
              <Text style={styles.metricValue}>{reading ? `${reading.temperatureC.toFixed(1)}°C` : '—'}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>HUMIDITY</Text>
              <Text style={styles.metricValue}>{reading ? `${reading.humidityPct.toFixed(1)}%` : '—'}</Text>
            </View>
          </View>
          <Text style={styles.supporting}>
            {reading ? `Sample age: ${Math.floor(sampleAgeMs / 1000)}s` : 'No reading received yet'}
            {stale ? ' · stale' : ''}
          </Text>
          <Text style={styles.demoLabel}>Wokwi simulated data · illustrative, unvalidated rule</Text>
        </View>

        <View style={styles.alertCard}>
          <Text style={styles.sectionTitle}>Inspection prompt</Text>
          {!alertRecord ? (
            <Text style={styles.supporting}>
              {baseline === null ? 'Waiting for the reference reading.' : `Reference: ${baseline.toFixed(1)}°C. Prompt at +${THRESHOLD_C.toFixed(1)}°C.`}
            </Text>
          ) : (
            <>
              <Text style={styles.alertTitle}>
                {alertRecord.recovered ? 'Reading recovered' : 'Temperature rise detected'}
              </Text>
              <Text style={styles.supporting}>
                {alertRecord.acknowledged ? 'Acknowledged' : 'Please inspect House 1'}
                {alertRecord.recovered ? ' · prompt retained' : ''}
              </Text>
              {!alertRecord.acknowledged && <Button title="Acknowledge" onPress={acknowledge} />}
            </>
          )}
        </View>

        <Button title="Reset demo" onPress={resetDemo} secondary />
        <Text style={styles.footer}>Prototype only · no physical sensor or farm validation</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7F3' },
  content: { padding: 20, gap: 14 },
  brand: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 8 },
  logo: { width: 44, height: 44 },
  wordmark: { width: 150, height: 48 },
  eyebrow: { color: '#42674C', fontSize: 11, fontWeight: '800', letterSpacing: 1, textAlign: 'center' },
  statusCard: { backgroundColor: '#E8F0E8', borderRadius: 14, padding: 16, gap: 5 },
  status: { color: '#173D28', fontSize: 15, fontWeight: '800' },
  supporting: { color: '#59675D', fontSize: 13, lineHeight: 19 },
  connectCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 10 },
  readingCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 12 },
  alertCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, gap: 10 },
  sectionTitle: { color: '#173D28', fontSize: 16, fontWeight: '800' },
  input: { minHeight: 48, borderColor: '#CBD5CC', borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, color: '#203629', fontSize: 14 },
  button: { minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, backgroundColor: '#27643D' },
  secondaryButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#AEBDB0' },
  disabledButton: { opacity: 0.55 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryButtonText: { color: '#254C32' },
  spinner: { marginTop: 4 },
  metrics: { flexDirection: 'row', gap: 12 },
  metric: { flex: 1, backgroundColor: '#F3F6F1', borderRadius: 12, padding: 14, gap: 6 },
  metricLabel: { color: '#627266', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  metricValue: { color: '#173D28', fontSize: 26, fontWeight: '800' },
  demoLabel: { color: '#7A5B23', fontSize: 11, fontWeight: '700', lineHeight: 16 },
  alertTitle: { color: '#8A4D12', fontSize: 17, fontWeight: '800' },
  footer: { color: '#718075', fontSize: 11, textAlign: 'center', paddingVertical: 8 },
});
