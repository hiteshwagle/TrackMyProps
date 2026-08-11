import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button, Field, Message } from '../../components/ui';
import { colours } from '../../theme';
import { optionalProfilePhoneSchema } from '../profile/profile-phone';

const signUpSchema = z.object({
  email: z.email('Enter a valid email address.'),
  name: z.string().trim().min(1, 'Enter your name.').max(100, 'Name is too long.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(128),
  phone: optionalProfilePhoneSchema,
  termsAccepted: z.boolean().refine((value) => value, {
    message: 'Accept the Terms and Conditions to continue.',
  }),
});

export type SignUpValues = z.infer<typeof signUpSchema>;

type SignUpFormProps = {
  configurationError: string | null;
  onSubmit: (values: SignUpValues) => Promise<string | null>;
  termsUrl: string;
};

export function SignUpForm({ configurationError, onSubmit, termsUrl }: SignUpFormProps) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<SignUpValues>({
    defaultValues: {
      email: '',
      name: '',
      password: '',
      phone: '',
      termsAccepted: false,
    },
    resolver: zodResolver(signUpSchema),
  });

  async function submit(values: SignUpValues) {
    const error = await onSubmit(values);
    if (error) {
      setError('root', { message: error });
    }
  }

  return (
    <View style={styles.form}>
      {configurationError ? <Message kind="error">{configurationError}</Message> : null}
      {errors.root?.message ? <Message kind="error">{errors.root.message}</Message> : null}

      <Controller
        control={control}
        name="name"
        render={({ field: { onBlur, onChange, value } }) => (
          <Field
            autoComplete="name"
            error={errors.name?.message}
            label="Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
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
        name="phone"
        render={({ field: { onBlur, onChange, value } }) => (
          <Field
            autoComplete="tel"
            error={errors.phone?.message}
            inputMode="tel"
            keyboardType="phone-pad"
            label="Phone (optional)"
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
            autoComplete="new-password"
            error={errors.password?.message}
            label="Password"
            onBlur={onBlur}
            onChangeText={onChange}
            secureTextEntry
            value={value}
          />
        )}
      />

      <Controller
        control={control}
        name="termsAccepted"
        render={({ field: { onChange, value } }) => (
          <View>
            <View style={styles.checkboxRow}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: value }}
                onPress={() => onChange(!value)}
                style={styles.checkboxControl}
              >
                <View style={[styles.checkbox, value ? styles.checkboxChecked : null]}>
                  <Text style={styles.checkmark}>{value ? '✓' : ''}</Text>
                </View>
                <Text style={styles.checkboxText}>I accept the</Text>
              </Pressable>
              <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(termsUrl)}>
                <Text style={styles.link}>Terms and Conditions</Text>
              </Pressable>
            </View>
            {errors.termsAccepted?.message ? (
              <Text style={styles.errorText}>{errors.termsAccepted.message}</Text>
            ) : null}
          </View>
        )}
      />

      <Button
        disabled={isSubmitting || Boolean(configurationError)}
        onPress={() => void handleSubmit(submit)()}
      >
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    backgroundColor: colours.white,
    borderColor: colours.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: colours.accent,
    borderColor: colours.accent,
  },
  checkboxControl: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  checkboxText: {
    color: colours.text,
    fontSize: 15,
    marginLeft: 10,
  },
  checkmark: {
    color: colours.white,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: colours.danger,
    fontSize: 14,
    marginTop: 4,
  },
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
