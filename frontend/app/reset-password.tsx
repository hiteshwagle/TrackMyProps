import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';

import { Button, Card, Field, Message, Page, PageTitle } from '../src/components/ui';
import { useAuth } from '../src/features/auth/auth-context';

const resetSchema = z
  .object({
    confirmPassword: z.string(),
    password: z.string().min(8, 'Use at least 8 characters.').max(128),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const { configurationError, updatePassword } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<ResetValues>({
    defaultValues: { confirmPassword: '', password: '' },
    resolver: zodResolver(resetSchema),
  });

  async function submit(values: ResetValues) {
    setNotice(null);
    const result = await updatePassword(values.password);
    if (result.error) {
      setError('root', { message: result.error });
      return;
    }

    setNotice('Your password has been updated.');
    router.replace('/(tabs)/dashboard');
  }

  return (
    <Page>
      <PageTitle>Reset password</PageTitle>
      <Card>
        {configurationError ? <Message kind="error">{configurationError}</Message> : null}
        {errors.root?.message ? <Message kind="error">{errors.root.message}</Message> : null}
        {notice ? <Message>{notice}</Message> : null}
        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value } }) => (
            <Field
              autoComplete="new-password"
              error={errors.password?.message}
              label="New password"
              onBlur={onBlur}
              onChangeText={onChange}
              secureTextEntry
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onBlur, onChange, value } }) => (
            <Field
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              label="Confirm new password"
              onBlur={onBlur}
              onChangeText={onChange}
              secureTextEntry
              value={value}
            />
          )}
        />
        <Button
          disabled={isSubmitting || Boolean(configurationError)}
          onPress={() => void handleSubmit(submit)()}
        >
          {isSubmitting ? 'Updating password…' : 'Update password'}
        </Button>
      </Card>
    </Page>
  );
}
