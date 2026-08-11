import { Linking, StyleSheet, Text } from 'react-native';
import { useState } from 'react';

import { BodyText, Button, Card, Message, Page, PageTitle } from '../../src/components/ui';
import { publicConfig, usesPlaceholderLinks } from '../../src/config/public-config';
import { useAuth } from '../../src/features/auth/auth-context';
import { profilePhoneFromMetadata } from '../../src/features/profile/profile-phone';
import { ProfilePhoneForm } from '../../src/features/profile/profile-phone-form';
import { buildDeletionEmailUrl } from '../../src/features/settings/deletion-email';
import { colours } from '../../src/theme';

export default function SettingsScreen() {
  const { session, signOut, updateProfilePhone } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function openTerms() {
    await Linking.openURL(publicConfig.termsUrl);
  }

  async function requestDeletion() {
    await Linking.openURL(buildDeletionEmailUrl(publicConfig.accountDeletionEmail));
  }

  async function submitSignOut() {
    setError(null);
    const result = await signOut();
    setError(result.error);
  }

  async function savePhone(phone: string): Promise<string | null> {
    setNotice(null);
    const result = await updateProfilePhone(phone);
    if (!result.error) {
      setNotice(phone ? 'Your phone number was updated.' : 'Your phone number was removed.');
    }
    return result.error;
  }

  return (
    <Page>
      <PageTitle>Settings</PageTitle>
      {usesPlaceholderLinks() ? (
        <Message>
          Terms and account-deletion contact details are placeholders in this development build.
        </Message>
      ) : null}
      {error ? <Message kind="error">{error}</Message> : null}
      {notice ? <Message>{notice}</Message> : null}
      <Card>
        <Text style={styles.heading}>Account</Text>
        <BodyText>{session?.user.email ?? 'Authenticated user'}</BodyText>
        <ProfilePhoneForm
          initialPhone={profilePhoneFromMetadata(session?.user.user_metadata)}
          onSubmit={savePhone}
        />
        <Button onPress={() => void openTerms()} variant="secondary">
          Terms and Conditions
        </Button>
        <Button onPress={() => void submitSignOut()}>Sign out</Button>
      </Card>
      <Card>
        <Text style={styles.dangerHeading}>Account and data deletion</Text>
        <BodyText>
          Send an email from your registered address. Your identity will be confirmed by email
          before live account data is deleted.
        </BodyText>
        <Button onPress={() => void requestDeletion()} variant="secondary">
          Email deletion request
        </Button>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  dangerHeading: {
    color: colours.danger,
    fontSize: 20,
    fontWeight: '700',
  },
  heading: {
    color: colours.text,
    fontSize: 20,
    fontWeight: '700',
  },
});
