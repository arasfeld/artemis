import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderColor: 'transparent',
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      flexDirection: 'row',
      padding: theme.spacing.md,
      ...theme.shadow.sm,
    },
    containerSelected: {
      borderColor: theme.colors.primary,
    },
    content: {
      flex: 1,
    },
    iconContainer: {
      marginRight: theme.spacing.md,
    },
    radio: {
      alignItems: 'center',
      borderColor: theme.colors.ring,
      borderRadius: 12,
      borderWidth: 2,
      height: 24,
      justifyContent: 'center',
      width: 24,
    },
    radioInner: {
      backgroundColor: theme.colors.primary,
      borderRadius: 6,
      height: 12,
      width: 12,
    },
    radioSelected: {
      borderColor: theme.colors.primary,
    },
    subtitle: {
      color: theme.colors.mutedForeground,
      fontSize: theme.typography.fontSize.sm,
      marginTop: 2,
    },
    title: {
      color: theme.colors.foreground,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
    },
    titleSelected: {
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.semibold,
    },
  });
}
