import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
  style?: ViewStyle;
}

export function ProgressIndicator({
  totalSteps,
  currentStep,
  style,
}: ProgressIndicatorProps) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[styles.dot, index < currentStep && styles.dotActive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ringOnDark,
  },
  dotActive: {
    backgroundColor: colors.background,
  },
});
