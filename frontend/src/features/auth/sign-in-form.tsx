import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button, Field, Message } from '../../components/ui';
import { colours } from '../../theme';

const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export type SignInValues = z.infer<typeof signInSchema>;

type SignInFormProps = {
  configurationError: string | null;
  onForgotPassword: (email: string) => Promise<string | null>;
  onSubmit: (values: SignInValues) => Promise<string | null>;
};

export function SignInForm({ configurationError, onForgotPassword, onSubmit }: SignInFormProps) {
  const {
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    setError,
  } = useForm<SignInValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(signInSchema),
  });
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(values: SignInValues) {
    setNotice(null);
    const error = await onSubmit(values);
    if (error) {
      setError('root', { message: error });
    }
  }

  async function forgotPassword() {
    setNotice(null);
    const email = getValues('email').trim();
    if (!z.email().safeParse(email).success) {
      setError('email', { message: 'Enter your email before requesting a reset.' });
      return;
    }

    const error = await onForgotPassword(email);
    if (error) {
      setError('root', { message: error });
      return;
    }
    setNotice('Check your email for a password reset link.');
  }

  return (
    <View style={styles.form}>
      {configurationError ? <Message kind="error">{configurationError}</Message> : null}
      {errors.root?.message ? <Message kind="error">{errors.root.message}</Message> : null}
      {notice ? <Message>{notice}</Message> : null}

      <Controller
        control={control}
        name="email"
        render={({ field: { onBlur, onChange, value } }) => (
          <Field
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email?.message}
            inputMode="email"
            keyboardType="email-address"
            label="Email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onBlur, onChange, value } }) => (
          <Field
            autoCapitalize="none"
            autoComplete="current-password"
            error={errors.password?.message}
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            secureTextEntry
            value={value}
          />
        )}
      />

      <Pressable accessibilityRole="button" onPress={() => void forgotPassword()}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>

      <Button
        disabled={isSubmitting || Boolean(configurationError)}
        onPress={() => void handleSubmit(submit)()}
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 18,
  },
  link: {
    color: colours.accent,
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
