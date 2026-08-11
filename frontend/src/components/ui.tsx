import type { ChangeEvent, CSSProperties, PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextInputProps,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colours } from '../theme';

export function Page({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <View style={styles.pageContent}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function Card({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function PageTitle({ children }: PropsWithChildren) {
  return (
    <Text accessibilityRole="header" style={styles.pageTitle}>
      {children}
    </Text>
  );
}

export function BodyText({ children }: PropsWithChildren) {
  return <Text style={styles.body}>{children}</Text>;
}

type FieldProps = Omit<TextInputProps, 'onBlur'> & {
  error?: string;
  label: string;
  onBlur?: () => void;
  webInputType?: 'date';
};

const webDateInputStyle: CSSProperties = {
  backgroundColor: colours.white,
  borderColor: colours.border,
  borderRadius: 12,
  borderStyle: 'solid',
  borderWidth: 1,
  boxSizing: 'border-box',
  color: colours.text,
  fontFamily: 'system-ui, sans-serif',
  fontSize: 16,
  minHeight: 48,
  padding: '11px 14px',
  width: '100%',
};

export function Field({
  editable,
  error,
  label,
  onBlur,
  onChangeText,
  value,
  webInputType,
  ...inputProps
}: FieldProps) {
  const input =
    Platform.OS === 'web' && webInputType === 'date' ? (
      <input
        aria-label={label}
        disabled={editable === false}
        onBlur={onBlur}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChangeText?.(event.currentTarget.value)
        }
        style={error ? { ...webDateInputStyle, borderColor: colours.danger } : webDateInputStyle}
        type="date"
        value={value ?? ''}
      />
    ) : (
      <TextInput
        accessibilityLabel={label}
        editable={editable}
        onBlur={onBlur}
        onChangeText={onChangeText}
        placeholderTextColor={colours.muted}
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        {...inputProps}
      />
    );

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {input}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

type ButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

export function Button({ children, disabled = false, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.secondaryButton : styles.primaryButton,
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          style={variant === 'secondary' ? styles.secondaryButtonText : styles.primaryButtonText}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function LoadingScreen() {
  return (
    <SafeAreaView style={styles.loadingScreen}>
      <ActivityIndicator color={colours.accent} size="large" />
      <Text style={styles.body}>Loading TrackMyProps…</Text>
    </SafeAreaView>
  );
}

export function Message({
  children,
  kind = 'info',
}: PropsWithChildren<{ kind?: 'error' | 'info' }>) {
  return (
    <View style={[styles.message, kind === 'error' ? styles.errorMessage : null]}>
      <Text style={kind === 'error' ? styles.errorText : styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colours.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  card: {
    backgroundColor: colours.card,
    borderColor: colours.border,
    borderRadius: 24,
    borderWidth: 1,
    boxShadow: '0 12px 28px rgba(24, 53, 47, 0.08)',
    gap: 18,
    padding: 24,
  },
  errorMessage: {
    backgroundColor: '#FFF2F2',
    borderColor: '#E8BBBB',
  },
  errorText: {
    color: colours.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  field: {
    gap: 7,
  },
  flex: {
    flex: 1,
  },
  input: {
    backgroundColor: colours.white,
    borderColor: colours.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colours.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  inputError: {
    borderColor: colours.danger,
  },
  label: {
    color: colours.text,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: colours.background,
    flex: 1,
    gap: 14,
    justifyContent: 'center',
  },
  message: {
    backgroundColor: '#E5F2EE',
    borderColor: colours.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  page: {
    alignItems: 'center',
    flexGrow: 1,
    padding: 24,
    paddingVertical: 48,
  },
  pageContent: {
    gap: 20,
    maxWidth: 760,
    width: '100%',
  },
  pageTitle: {
    color: colours.text,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  primaryButton: {
    backgroundColor: colours.accent,
  },
  primaryButtonText: {
    color: colours.white,
    fontSize: 16,
    fontWeight: '700',
  },
  safeArea: {
    backgroundColor: colours.background,
    flex: 1,
  },
  secondaryButton: {
    backgroundColor: colours.white,
    borderColor: colours.border,
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: colours.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});
