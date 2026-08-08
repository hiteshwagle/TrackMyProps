import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { BodyText, Card, Page, PageTitle } from '../../src/components/ui';
import { useAuth } from '../../src/features/auth/auth-context';
import { SignInForm, type SignInValues } from '../../src/features/auth/sign-in-form';
import { colours } from '../../src/theme';

export default function SignInScreen() {
  const { configurationError, requestPasswordReset, signIn } = useAuth();

  async function submit(values: SignInValues) {
    const result = await signIn(values.email.trim(), values.password);
    return result.error;
  }

  async function forgotPassword(email: string) {
    const result = await requestPasswordReset(email);
    return result.error;
  }

  return (
    <Page>
      <PageTitle>TrackMyProps</PageTitle>
      <BodyText>Your private property portfolio, in one clear place.</BodyText>
      <Card>
        <Text style={styles.heading}>Sign in</Text>
        <SignInForm
          configurationError={configurationError}
          onForgotPassword={forgotPassword}
          onSubmit={submit}
        />
        <Text style={styles.footer}>
          New to TrackMyProps?{' '}
          <Link href="/(auth)/sign-up" style={styles.link}>
            Create an account
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
  heading: {
    color: colours.text,
    fontSize: 24,
    fontWeight: '700',
  },
  link: {
    color: colours.accent,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
