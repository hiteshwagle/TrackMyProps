import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { AppState, Platform } from 'react-native';

import { getAuthConfigurationError, publicConfig } from '../../config/public-config';
import { getSupabaseClient } from '../../lib/supabase';

type AuthResult = {
  error: string | null;
};

type SignUpInput = {
  email: string;
  name: string;
  password: string;
  phone?: string;
};

type SignUpResult = AuthResult & {
  requiresEmailVerification: boolean;
};

type AuthContextValue = {
  configurationError: string | null;
  isLoading: boolean;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function unavailableResult(): AuthResult {
  return {
    error:
      getAuthConfigurationError() ||
      'Authentication is not available. Check the selected environment configuration.',
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const configurationError = getAuthConfigurationError();
  const supabase = getSupabaseClient();
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isActive = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (isActive) {
        setSession(data.session);
        setIsLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
      setSession(nextSession);
      setIsLoading(false);
    });

    const appStateSubscription =
      Platform.OS === 'web'
        ? null
        : AppState.addEventListener('change', (state) => {
            if (state === 'active') {
              supabase.auth.startAutoRefresh();
            } else {
              supabase.auth.stopAutoRefresh();
            }
          });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
      appStateSubscription?.remove();
    };
  }, [queryClient, supabase]);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    if (!supabase) {
      return unavailableResult();
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(input: SignUpInput): Promise<SignUpResult> {
    if (!supabase) {
      return { ...unavailableResult(), requiresEmailVerification: false };
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.name,
          phone: input.phone || null,
          terms_accepted_at: new Date().toISOString(),
          terms_url: publicConfig.termsUrl,
        },
      },
    });

    return {
      error: error?.message ?? null,
      requiresEmailVerification: !error && data.session === null,
    };
  }

  async function requestPasswordReset(email: string): Promise<AuthResult> {
    if (!supabase) {
      return unavailableResult();
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL('/reset-password'),
    });
    return { error: error?.message ?? null };
  }

  async function updatePassword(password: string): Promise<AuthResult> {
    if (!supabase) {
      return unavailableResult();
    }

    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  }

  async function signOut(): Promise<AuthResult> {
    if (!supabase) {
      return unavailableResult();
    }

    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  }

  return (
    <AuthContext.Provider
      value={{
        configurationError,
        isLoading,
        requestPasswordReset,
        session,
        signIn,
        signOut,
        signUp,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}
