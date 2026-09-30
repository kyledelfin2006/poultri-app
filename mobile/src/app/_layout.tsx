import { router, Stack, useRootNavigationState } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoProvider, useDemo, type RemoteAlert } from '../demo';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

function NotificationBridge() {
  const { ready, applyPushAlert } = useDemo();
  const navigation = useRootNavigationState();
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!ready || !navigation?.key) return;
    const alertFrom = (notification: Notifications.Notification) => {
      const data = notification.request.content.data;
      if (data?.type !== 'poultri-simulator-alert' || !data.alert || typeof data.alert !== 'object') return null;
      const alert = data.alert as RemoteAlert;
      if (typeof alert.id !== 'string') return null;
      return alert;
    };
    const received = Notifications.addNotificationReceivedListener((notification) => {
      const alert = alertFrom(notification);
      if (alert) applyPushAlert(alert);
    });
    const open = (response: Notifications.NotificationResponse) => {
      const alert = alertFrom(response.notification);
      if (!alert || handled.current === response.notification.request.identifier) return;
      handled.current = response.notification.request.identifier;
      applyPushAlert(alert);
      Notifications.clearLastNotificationResponse();
      router.push({ pathname: '/alert/[id]', params: { id: alert.id } });
    };
    const tapped = Notifications.addNotificationResponseReceivedListener(open);
    const last = Notifications.getLastNotificationResponse();
    if (last) open(last);
    return () => { received.remove(); tapped.remove(); };
  }, [ready, navigation?.key, applyPushAlert]);
  return null;
}

export default function RootLayout() {
  return <SafeAreaProvider>
    <DemoProvider>
      <StatusBar style="dark" />
      <NotificationBridge />
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
