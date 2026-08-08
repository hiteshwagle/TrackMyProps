const placeholderTermsUrl = 'https://example.invalid/terms';
const placeholderDeletionEmail = 'delete@example.invalid';

export const publicConfig = {
  accountDeletionEmail:
    process.env.EXPO_PUBLIC_ACCOUNT_DELETION_EMAIL?.trim() || placeholderDeletionEmail,
  appEnvironment: process.env.EXPO_PUBLIC_APP_ENV?.trim() || '',
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL?.trim().replace(/\/$/, '') || '',
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || '',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '') || '',
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL?.trim() || placeholderTermsUrl,
} as const;

const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
const publishableKeyPlaceholders = new Set([
  'your-development-publishable-key',
  'your-local-publishable-key',
  'your-production-publishable-key',
]);

function isLoopbackUrl(urlValue: string): boolean {
  try {
    return loopbackHosts.has(new URL(urlValue).hostname);
  } catch {
    return false;
  }
}

export function getEnvironmentConfigurationError(
  appEnvironment: string,
  supabaseUrl: string,
  backendUrl: string,
): string | null {
  if (appEnvironment !== 'development' && appEnvironment !== 'production') {
    return 'The application environment must be development or production.';
  }
  if (
    appEnvironment === 'production' &&
    (isLoopbackUrl(supabaseUrl) || isLoopbackUrl(backendUrl))
  ) {
    return 'Production configuration cannot use loopback service URLs.';
  }
  return null;
}

export function getPublicServiceUrlError(urlValue: string, serviceName: string): string | null {
  if (!urlValue) {
    return `${serviceName} configuration is missing.`;
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
  const environmentError = getEnvironmentConfigurationError(
    publicConfig.appEnvironment,
    publicConfig.supabaseUrl,
    publicConfig.backendUrl,
  );
  if (environmentError) {
    return environmentError;
  }
  if (
    !publicConfig.supabaseUrl ||
    !publicConfig.supabasePublishableKey ||
    publishableKeyPlaceholders.has(publicConfig.supabasePublishableKey)
  ) {
    return 'Supabase configuration is missing. Add the frontend-safe URL and publishable key to the selected environment file.';
  }

  return getPublicServiceUrlError(publicConfig.supabaseUrl, 'Supabase');
}

export function usesPlaceholderLinks(): boolean {
  return (
    publicConfig.termsUrl === placeholderTermsUrl ||
    publicConfig.accountDeletionEmail === placeholderDeletionEmail
  );
}
