import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import { getAuthConfigurationError, publicConfig } from '../config/public-config';

let client: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) {
    return client;
  }

  if (getAuthConfigurationError()) {
    client = null;
    return client;
  }

  client = createClient(publicConfig.supabaseUrl, publicConfig.supabasePublishableKey, {
    auth: {
      ...(Platform.OS === 'web' ? {} : { storage: AsyncStorage }),
      autoRefreshToken: true,
      detectSessionInUrl: Platform.OS === 'web',
      lock: processLock,
      persistSession: true,
    },
  });

  return client;
}
