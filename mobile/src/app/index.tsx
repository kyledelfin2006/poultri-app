import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemo } from '../demo';
import { colors } from '../components';

export default function WelcomeScreen() {
  const { ready, data, updateFarm } = useDemo();
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Image source={require('../../assets/poultri-logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Official Poultri logo" />
        <Image source={require('../../assets/poultri-wordmark.png')} style={styles.wordmark} resizeMode="contain" accessibilityLabel="Poultri" />
        <Text style={styles.tagline}>Poultry, guiding every flock,{ '\n' }connecting every farm.</Text>
      </View>
      <View style={styles.loginCard}>
        <Text style={styles.eyebrow}>DEMO ACCESS</Text>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.description}>Explore a simulated layer farm monitoring experience.</Text>
        <View style={styles.accountField}>
          <Text style={styles.fieldLabel}>Farm name</Text>
          <TextInput accessibilityLabel="Demo farm name" editable={ready} value={data.farmName} onChangeText={(farmName) => updateFarm({ farmName })} placeholder="Enter your farm name" maxLength={60} returnKeyType="done" style={styles.fieldInput} />
        </View>
        <Pressable accessibilityRole="button" disabled={!ready} onPress={() => router.replace('/(tabs)')} style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }, !ready && { opacity: 0.5 }]}>
          <Text style={styles.buttonText}>Continue as demo farmer</Text>
        </Pressable>
        <Text style={styles.footnote}>No account or password needed. All farm readings are simulated.</Text>
      </View>
      <Text style={styles.footer}>EARLY WARNING FOR LAYER FARMS</Text>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white }, content: { flexGrow: 1, justifyContent: 'space-between', padding: 24, gap: 24 },
  hero: { alignItems: 'center', paddingTop: 26, gap: 10 }, logo: { width: 116, height: 116 }, wordmark: { width: 230, height: 72 },
  tagline: { color: colors.darkGreen, textAlign: 'center', lineHeight: 22, fontSize: 15, fontWeight: '600' },
  loginCard: { backgroundColor: '#F8FAF6', borderColor: colors.line, borderWidth: 1, borderRadius: 22, padding: 22, gap: 12 },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }, heading: { fontSize: 24, fontWeight: '900', color: colors.ink }, description: { color: colors.muted, lineHeight: 20, fontSize: 14 },
  accountField: { backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1, borderRadius: 12, padding: 12, gap: 4, marginTop: 5 }, fieldLabel: { color: colors.muted, fontSize: 11 }, fieldInput: { color: colors.ink, fontSize: 14, fontWeight: '700', padding: 0, minHeight: 24 },
  button: { backgroundColor: colors.green, minHeight: 49, alignItems: 'center', justifyContent: 'center', borderRadius: 12 }, buttonText: { color: colors.white, fontWeight: '800', fontSize: 14 }, footnote: { color: colors.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
  footer: { textAlign: 'center', fontSize: 10, letterSpacing: 1, color: '#929B8D', fontWeight: '700' },
});
