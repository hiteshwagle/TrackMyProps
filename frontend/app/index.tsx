import { Redirect } from 'expo-router';

import { useAuth } from '../src/features/auth/auth-context';

export default function IndexScreen() {
  const { session } = useAuth();

  return <Redirect href={session ? '/(tabs)/dashboard' : '/(auth)/sign-in'} />;
}
