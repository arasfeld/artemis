import { useMemo } from 'react';
import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
} from 'react-native';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

type TextVariant = 'title' | 'subtitle' | 'body' | 'muted' | 'label';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  center?: boolean;
}

export function Text({
  variant = 'body',
  center = false,
  style,
  children,
  ...props
}: TextProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <RNText
      style={[styles.base, styles[variant], center && styles.center, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

function createStyles(theme: Theme) {
  const { colors, typography } = theme;
  return StyleSheet.create({
    base: {
      fontFamily: undefined, // Use system font
    },
    center: {
      textAlign: 'center',
    },
    title: {
      color: colors.foreground,
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      marginBottom: 8,
    },
    subtitle: {
      color: colors.mutedForeground,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.normal,
      marginBottom: 24,
    },
    body: {
      color: colors.foreground,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.normal,
      lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    },
    muted: {
      color: colors.mutedForeground,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.normal,
    },
    label: {
      color: colors.mutedForeground,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
  });
}
