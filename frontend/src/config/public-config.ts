const placeholderTermsUrl = 'https://example.invalid/terms';
const placeholderDeletionEmail = 'delete@example.invalid';

export const publicConfig = {
  accountDeletionEmail:
    process.env.EXPO_PUBLIC_ACCOUNT_DELETION_EMAIL?.trim() || placeholderDeletionEmail,
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL?.trim().replace(/\/$/, '') || '',
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || '',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '') || '',
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL?.trim() || placeholderTermsUrl,
} as const;

const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

export function getPublicServiceUrlError(urlValue: string, serviceName: string): string | null {
  if (!urlValue) {
    return `${serviceName} development configuration is missing.`;
  }

  try {
    const url = new URL(urlValue);
    if (url.protocol === 'https:') {
      return null;
    }
    if (url.protocol === 'http:' && loopbackHosts.has(url.hostname)) {
      return null;
    }
  } catch {
    return `The ${serviceName} URL is invalid.`;
  }

  return `The ${serviceName} URL must use HTTPS unless it targets the local loopback interface.`;
}

export function getAuthConfigurationError(): string | null {
  if (
    !publicConfig.supabaseUrl ||
    !publicConfig.supabasePublishableKey ||
    publicConfig.supabasePublishableKey === 'your-local-publishable-key'
  ) {
    return 'Supabase development configuration is missing. Add the frontend-safe project URL and publishable key to frontend/.env.';
  }

  return getPublicServiceUrlError(publicConfig.supabaseUrl, 'Supabase');
}

export function usesPlaceholderLinks(): boolean {
  return (
    publicConfig.termsUrl === placeholderTermsUrl ||
    publicConfig.accountDeletionEmail === placeholderDeletionEmail
  );
}
