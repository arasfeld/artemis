import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

interface BackButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

export function BackButton({
  onPress,
  color,
  size = 28,
  style,
}: BackButtonProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={size} color={color ?? theme.colors.foreground} />
    </TouchableOpacity>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      marginLeft: -theme.spacing.xs,
      padding: theme.spacing.xs,
    },
  });
}
