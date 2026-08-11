import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

import { Button, Field, Message } from '../../components/ui';
import { optionalProfilePhoneSchema } from './profile-phone';

const profilePhoneFormSchema = z.object({ phone: optionalProfilePhoneSchema });

type ProfilePhoneFormValues = z.infer<typeof profilePhoneFormSchema>;

export function ProfilePhoneForm({
  initialPhone,
  onSubmit,
}: {
  initialPhone: string;
  onSubmit: (phone: string) => Promise<string | null>;
}) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<ProfilePhoneFormValues>({
    defaultValues: { phone: initialPhone },
    resolver: zodResolver(profilePhoneFormSchema),
  });

  async function submit(values: ProfilePhoneFormValues) {
    const error = await onSubmit(values.phone.trim());
    if (error) {
      setError('root', { message: error });
    }
  }

  return (
    <View style={styles.form}>
      {errors.root?.message ? <Message kind="error">{errors.root.message}</Message> : null}
      <Controller
        control={control}
        name="phone"
        render={({ field: { onBlur, onChange, value }, fieldState }) => (
          <Field
            autoComplete="tel"
            error={fieldState.error?.message}
            inputMode="tel"
            keyboardType="phone-pad"
            label="Phone (optional)"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      <Button disabled={isSubmitting} onPress={() => void handleSubmit(submit)()}>
        {isSubmitting ? 'Saving phone…' : 'Save phone'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
});
