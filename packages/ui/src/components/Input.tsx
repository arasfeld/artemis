import React, { useCallback, useMemo, useState } from 'react';
import {
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
  type TextStyle,
} from 'react-native';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

interface InputProps extends RNTextInputProps {
  invalid?: boolean;
  style?: TextStyle;
}

export function Input({
  invalid = false,
  editable = true,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleFocus = useCallback(
    (e: Parameters<NonNullable<RNTextInputProps['onFocus']>>[0]) => {
      setIsFocused(true);
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: Parameters<NonNullable<RNTextInputProps['onBlur']>>[0]) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

  const inputStyle = useMemo(() => {
    const base: TextStyle[] = [styles.input];
    if (invalid) base.push(styles.invalid);
    else if (isFocused) base.push(styles.focused);
    if (!editable) base.push(styles.disabled);
    return base;
  }, [invalid, isFocused, editable, styles]);

  return (
    <RNTextInput
      editable={editable}
      placeholderTextColor={theme.colors.mutedForeground}
      style={[...inputStyle, style]}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
}

function createStyles(theme: Theme) {
  const { colors, typography } = theme;
  const isDark = theme.colorScheme === 'dark';

  return StyleSheet.create({
    disabled: {
      backgroundColor: isDark ? `${colors.input}CC` : `${colors.input}80`,
      opacity: 0.5,
    },
    focused: {
      borderColor: colors.ring,
      borderWidth: 2,
    },
    input: {
      backgroundColor: isDark ? `${colors.input}4D` : 'transparent',
      borderColor: colors.input,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      color: colors.foreground,
      fontSize: typography.fontSize.base,
      minHeight: 44,
      minWidth: 0,
      paddingHorizontal: 10,
      paddingVertical: 4,
      width: '100%',
    },
    invalid: {
      borderColor: isDark ? `${colors.destructive}80` : colors.destructive,
      borderWidth: 2,
    },
  });
}
