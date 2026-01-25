import React from 'react';
import { TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface BackButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

export function BackButton({
  onPress,
  color = colors.white,
  size = 28,
  style,
}: BackButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
});
