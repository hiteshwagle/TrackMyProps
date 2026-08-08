import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { BodyText, Card, Message, Page, PageTitle } from '../../src/components/ui';
import { publicConfig } from '../../src/config/public-config';
import { useAuth } from '../../src/features/auth/auth-context';
import { SignUpForm, type SignUpValues } from '../../src/features/auth/sign-up-form';
import { colours } from '../../src/theme';

export default function SignUpScreen() {
  const { configurationError, signUp } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(values: SignUpValues) {
    setNotice(null);
    const result = await signUp({
      email: values.email.trim(),
      name: values.name.trim(),
      password: values.password,
      phone: values.phone.trim() || undefined,
    });

    if (result.requiresEmailVerification) {
      setNotice('Check your email to verify your account, then sign in.');
    }
    return result.error;
  }

  return (
    <Page>
      <PageTitle>Create your account</PageTitle>
      <BodyText>Each account receives its own private property portfolio.</BodyText>
      <Card>
        {notice ? <Message>{notice}</Message> : null}
        <SignUpForm
          configurationError={configurationError}
          onSubmit={submit}
          termsUrl={publicConfig.termsUrl}
        />
        <Text style={styles.footer}>
          Already registered?{' '}
          <Link href="/(auth)/sign-in" style={styles.link}>
            Sign in
          </Link>
        </Text>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  footer: {
    color: colours.muted,
    fontSize: 15,
    textAlign: 'center',
  },
  link: {
    color: colours.accent,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
