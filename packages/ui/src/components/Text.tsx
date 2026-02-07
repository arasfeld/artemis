import React from 'react';
import {
  Text as RNText,
  StyleSheet,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type TextVariant = 'title' | 'subtitle' | 'body' | 'muted' | 'label';
type TextColor = 'light' | 'dark';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  center?: boolean;
}

export function Text({
  variant = 'body',
  color = 'light',
  center = false,
  style,
  children,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        styles.base,
        variantStyles[variant],
        colorStyles[color][variant],
        center && styles.center,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: undefined, // Use system font
  },
  center: {
    textAlign: 'center',
  },
});

const variantStyles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    marginBottom: 24,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  muted: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

const colorStyles: Record<TextColor, Record<TextVariant, TextStyle>> = {
  light: {
    title: { color: colors.foreground },
    subtitle: { color: colors.mutedForeground },
    body: { color: colors.foreground },
    muted: { color: colors.mutedForeground },
    label: { color: colors.mutedForeground },
  },
  dark: {
    title: { color: colors.foreground },
    subtitle: { color: colors.mutedForeground },
    body: { color: colors.foreground },
    muted: { color: colors.mutedForeground },
    label: { color: colors.mutedForeground },
  },
};
