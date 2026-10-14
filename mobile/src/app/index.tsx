import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return <SafeAreaView style={styles.safe}>
    <View style={styles.content}>
      <View style={styles.brand}>
        <Image source={require('../../assets/poultri-logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Official Poultri logo" />
        <Image source={require('../../assets/poultri-wordmark.png')} style={styles.wordmark} resizeMode="contain" accessibilityLabel="Poultri" />
      </View>
      <View style={styles.message}>
        <Text style={styles.title}>Mobile template</Text>
        <Text style={styles.body}>Wokwi integration will be defined in a future update.</Text>
      </View>
      <Text style={styles.footer}>POULTRI · EXPO / REACT NATIVE</Text>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'space-between', alignItems: 'center', padding: 24 },
  brand: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  logo: { width: 112, height: 112 },
  wordmark: { width: 224, height: 70 },
  message: { alignItems: 'center', gap: 8, paddingBottom: 48 },
  title: { color: '#173D28', fontSize: 22, fontWeight: '800' },
  body: { color: '#657267', fontSize: 14, lineHeight: 21, textAlign: 'center' },
  footer: { color: '#8A968B', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
});
