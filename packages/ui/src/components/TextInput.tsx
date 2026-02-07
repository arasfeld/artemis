import React, { useMemo } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <RNTextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.mutedForeground}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
    },
    error: {
      color: theme.colors.destructive,
      fontSize: theme.typography.fontSize.sm,
      marginTop: theme.spacing.xs,
    },
    input: {
      color: theme.colors.foreground,
      fontSize: theme.typography.fontSize.base,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 16,
    },
    inputError: {
      borderColor: theme.colors.destructive,
      borderWidth: 2,
    },
    inputWrapper: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadow.sm,
    },
    label: {
      color: theme.colors.primaryForeground,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      marginBottom: theme.spacing.sm,
    },
  });
}
