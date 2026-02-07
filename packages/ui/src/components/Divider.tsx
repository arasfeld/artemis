import React, { useMemo } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

interface DividerProps {
  style?: ViewStyle;
  color?: string;
  variant?: 'light' | 'dark';
}

export function Divider({ style, color, variant = 'light' }: DividerProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const defaultColor =
    variant === 'light' ? theme.colors.ringOnDark : theme.colors.border;

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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    divider: {
      height: 1,
      marginVertical: theme.spacing.md,
      width: '100%',
    },
  });
}
