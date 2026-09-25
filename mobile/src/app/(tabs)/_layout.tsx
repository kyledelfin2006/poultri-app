import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';
import { colors } from '../../components';

export default function TabLayout() {
  return <Tabs screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: colors.darkGreen,
    tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { height: 64, paddingTop: 6, paddingBottom: 5, borderTopColor: colors.line },
    tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
  }}>
    <Tabs.Screen name="index" options={{ title: 'Home', tabBarLabel: 'Home', tabBarIcon: ({ color }) => <TabIcon glyph="⌂" color={color} /> }} />
    <Tabs.Screen name="alerts" options={{ title: 'Alerts', tabBarIcon: ({ color }) => <TabIcon glyph="◉" color={color} /> }} />
    <Tabs.Screen name="records" options={{ title: 'Records', tabBarIcon: ({ color }) => <TabIcon glyph="▥" color={color} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <TabIcon glyph="●" color={color} /> }} />
  </Tabs>;
}

function TabIcon({ glyph, color }: { glyph: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 20, fontWeight: '700' }}>{glyph}</Text>;
}
