import React from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadow, spacing } from '../theme/spacing';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function TextInput({
  label,
  error,
  containerStyle,
  style,
  ...props
}: TextInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <RNTextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.text.muted}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.light,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadow.sm,
  },
  input: {
    paddingVertical: 16,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  inputError: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
