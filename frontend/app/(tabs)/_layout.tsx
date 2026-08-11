import { Feather } from '@react-native-vector-icons/feather';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { BrandHeader } from '../../src/components/brand-header';
import { getTabIconName, type TabName } from '../../src/navigation/tab-icons';
import { colours } from '../../src/theme';

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
  size: number;
};

function TabIcon({ color, size, tabName }: TabIconProps & { tabName: TabName }) {
  return <Feather color={color} name={getTabIconName(tabName)} size={size} />;
}

function DashboardTabIcon(props: TabIconProps) {
  return <TabIcon {...props} tabName="dashboard" />;
}

function PropertiesTabIcon(props: TabIconProps) {
  return <TabIcon {...props} tabName="properties" />;
}

function AnalyticsTabIcon(props: TabIconProps) {
  return <TabIcon {...props} tabName="analytics" />;
}

function SettingsTabIcon(props: TabIconProps) {
  return <TabIcon {...props} tabName="settings" />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: true,
        headerStyle: { backgroundColor: colours.white },
        headerTitle: BrandHeader,
        headerTitleAlign: 'left',
        headerTintColor: colours.text,
        tabBarActiveTintColor: colours.accent,
        tabBarInactiveTintColor: colours.muted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colours.white,
          borderTopColor: colours.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ tabBarIcon: DashboardTabIcon, title: 'Dashboard' }}
      />
      <Tabs.Screen
        name="properties"
        options={{ tabBarIcon: PropertiesTabIcon, title: 'Properties' }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ tabBarIcon: AnalyticsTabIcon, title: 'Analytics' }}
      />
      <Tabs.Screen name="settings" options={{ tabBarIcon: SettingsTabIcon, title: 'Settings' }} />
    </Tabs>
  );
}
