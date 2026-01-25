import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { BackButton } from './BackButton';

interface ScreenContainerProps {
  children: React.ReactNode;
  withGradient?: boolean;
  padding?: boolean;
  centered?: boolean;
  style?: ViewStyle;
  onBack?: () => void;
}

export function ScreenContainer({
  children,
  withGradient = true,
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

  if (withGradient) {
    return (
      <LinearGradient
        colors={[colors.gradient.start, colors.gradient.end]}
        style={styles.gradient}
      >
        {content}
      </LinearGradient>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
