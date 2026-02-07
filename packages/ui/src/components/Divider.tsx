import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  variant?: 'light' | 'dark';
}

export function Divider({ style, color, variant = 'light' }: DividerProps) {
  const defaultColor =
    variant === 'light' ? colors.ringOnDark : colors.border;

  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: color || defaultColor },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
    marginVertical: spacing.md,
  },
});
