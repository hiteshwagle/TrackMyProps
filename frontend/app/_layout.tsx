import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { BrandHeader } from '../src/components/brand-header';
import { LoadingScreen } from '../src/components/ui';
import { AuthProvider, useAuth } from '../src/features/auth/auth-context';
import { ServerStateProvider } from '../src/lib/query-client';
import { colours } from '../src/theme';

function RootNavigator() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(session)}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="property/[propertyId]"
          options={{
            headerBackTitle: 'Properties',
            headerShown: true,
            headerStyle: { backgroundColor: colours.white },
            headerTintColor: colours.text,
            headerTitle: BrandHeader,
            headerTitleAlign: 'left',
          }}
        />
      </Stack.Protected>
      <Stack.Screen
        name="reset-password"
        options={{ headerShown: true, title: 'Reset password' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ServerStateProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AuthProvider>
    </ServerStateProvider>
  );
}
