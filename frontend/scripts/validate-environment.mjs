const selectedEnvironment = process.argv[2];
const requiredVariables = [
  'EXPO_PUBLIC_APP_ENV',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'EXPO_PUBLIC_BACKEND_URL',
  'EXPO_PUBLIC_TERMS_URL',
  'EXPO_PUBLIC_ACCOUNT_DELETION_EMAIL',
];
const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

function fail(message) {
  console.error(`Environment validation failed: ${message}`);
  process.exit(1);
}

if (!['development', 'production'].includes(selectedEnvironment)) {
  fail('the command must select development or production.');
}

for (const variableName of requiredVariables) {
  if (!process.env[variableName]?.trim()) {
    fail(`${variableName} is missing.`);
  }
}

if (process.env.EXPO_PUBLIC_APP_ENV !== selectedEnvironment) {
  fail('EXPO_PUBLIC_APP_ENV does not match the selected command.');
}

if (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.startsWith('your-')) {
  fail('the Supabase publishable key is still a placeholder.');
}

for (const variableName of [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_BACKEND_URL',
  'EXPO_PUBLIC_TERMS_URL',
]) {
  let url;
  try {
    url = new URL(process.env[variableName]);
  } catch {
    fail(`${variableName} is not a valid URL.`);
  }

  if (selectedEnvironment === 'production') {
    if (url.protocol !== 'https:' || loopbackHosts.has(url.hostname)) {
      fail(`${variableName} must use a non-loopback HTTPS URL in production.`);
    }
    if (url.hostname.endsWith('.invalid')) {
      fail(`${variableName} is still a production placeholder.`);
    }
  }
}

if (
  selectedEnvironment === 'production' &&
  process.env.EXPO_PUBLIC_ACCOUNT_DELETION_EMAIL.endsWith('@example.invalid')
) {
  fail('EXPO_PUBLIC_ACCOUNT_DELETION_EMAIL is still a production placeholder.');
}

console.log(`${selectedEnvironment} environment configuration is valid.`);
