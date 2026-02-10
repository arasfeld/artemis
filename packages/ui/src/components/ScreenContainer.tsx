import React, { useMemo } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';
import { BackButton } from './BackButton';

interface ScreenContainerProps {
  centered?: boolean;
  children: React.ReactNode;
  onBack?: () => void;
  padding?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({
  children,
  padding = true,
  centered = false,
  style,
  onBack,
}: ScreenContainerProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const content = (
    <SafeAreaView
      style={[
        styles.safeArea,
        padding && styles.padding,
        centered && styles.centered,
        style,
      ]}
    >
      {onBack && (
        <View style={styles.header}>
          <BackButton onPress={onBack} />
        </View>
      )}
      {children}
    </SafeAreaView>
  );

  return <View style={[styles.container, style]}>{content}</View>;
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    header: {
      marginBottom: theme.spacing.sm,
    },
    padding: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    safeArea: {
      flex: 1,
    },
  });
}
