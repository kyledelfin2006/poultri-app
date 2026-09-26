import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoProvider } from '../demo';

export default function RootLayout() {
  return <SafeAreaProvider>
    <DemoProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="simulator" />
        <Stack.Screen name="house/[id]" />
        <Stack.Screen name="alert/[id]" />
      </Stack>
    </DemoProvider>
  </SafeAreaProvider>;
}
