import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: spacing.sm,
  },
});
