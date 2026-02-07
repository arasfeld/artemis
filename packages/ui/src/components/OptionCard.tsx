import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadow, spacing } from '../theme/spacing';

interface OptionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function OptionCard({
  title,
  subtitle,
  icon,
  selected = false,
  onPress,
  style,
}: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <View style={styles.content}>
        <Text style={[styles.title, selected && styles.titleSelected]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadow.sm,
  },
  containerSelected: {
    borderColor: colors.primary,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.foreground,
  },
  titleSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.ring,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});
