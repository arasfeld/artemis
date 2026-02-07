import React, { useMemo } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      marginBottom: theme.spacing.xl,
    },
    dot: {
      backgroundColor: theme.colors.ringOnDark,
      borderRadius: 4,
      height: 8,
      width: 8,
    },
    dotActive: {
      backgroundColor: theme.colors.background,
    },
  });
}
