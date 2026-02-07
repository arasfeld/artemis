import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

const destructiveMuted = 'rgba(220, 38, 38, 0.1)';
const destructiveMutedPressed = 'rgba(220, 38, 38, 0.2)';

export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'ghost'
  | 'link'
  | 'outline'
  | 'secondary';

export type ButtonSize =
  | 'default'
  | 'xs'
  | 'sm'
  | 'lg'
  | 'icon'
  | 'icon-xs'
  | 'icon-sm'
  | 'icon-lg';

export interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  onPress: () => void;
  size?: ButtonSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: ButtonVariant;
}

function buildSizeStyles(theme: Theme): Record<
  ButtonSize,
  { container: ViewStyle; text: TextStyle; gap: number }
> {
  const { typography } = theme;
  return {
    default: {
      container: {
        height: 32,
        paddingHorizontal: 10,
        paddingVertical: 0,
        gap: 6,
      },
      text: { fontSize: typography.fontSize.sm },
      gap: 6,
    },
    xs: {
      container: {
        height: 24,
        paddingHorizontal: 8,
        paddingVertical: 0,
        gap: 4,
      },
      text: { fontSize: typography.fontSize.xs },
      gap: 4,
    },
    sm: {
      container: {
        height: 28,
        paddingHorizontal: 10,
        paddingVertical: 0,
        gap: 4,
      },
      text: { fontSize: 13 },
      gap: 4,
    },
    lg: {
      container: {
        height: 36,
        paddingHorizontal: 10,
        paddingVertical: 0,
        gap: 6,
      },
      text: { fontSize: typography.fontSize.sm },
      gap: 6,
    },
    icon: {
      container: {
        width: 32,
        height: 32,
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      text: {},
      gap: 0,
    },
    'icon-xs': {
      container: {
        width: 24,
        height: 24,
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      text: {},
      gap: 0,
    },
    'icon-sm': {
      container: {
        width: 28,
        height: 28,
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      text: {},
      gap: 0,
    },
    'icon-lg': {
      container: {
        width: 36,
        height: 36,
        paddingHorizontal: 0,
        paddingVertical: 0,
      },
      text: {},
      gap: 0,
    },
  };
}

export function Button({
  children,
  disabled = false,
  fullWidth = false,
  loading = false,
  onPress,
  size = 'default',
  style,
  textStyle,
  variant = 'default',
}: ButtonProps) {
  const { theme } = useTheme();
  const { colors } = theme;
  const sizeStyles = useMemo(() => buildSizeStyles(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDisabled = disabled || loading;
  const sizeConfig = sizeStyles[size];
  const isIconSize = size.startsWith('icon');

  const getContainerStyle = ({
    pressed,
  }: {
    pressed: boolean;
  }): ViewStyle[] => {
    const base: ViewStyle[] = [
      styles.base,
      sizeConfig.container,
      { borderRadius: theme.borderRadius.md },
      ...(fullWidth ? [styles.fullWidth] : []),
      ...(isDisabled ? [styles.disabled] : []),
    ];

    switch (variant) {
      case 'default':
        base.push({
          backgroundColor: pressed ? 'rgba(52, 52, 52, 0.8)' : colors.primary,
        });
        break;
      case 'outline':
        base.push({
          backgroundColor: pressed ? colors.muted : colors.background,
          borderColor: colors.border,
          borderWidth: 1,
        });
        break;
      case 'secondary':
        base.push({
          backgroundColor: pressed
            ? 'rgba(245, 245, 245, 0.8)'
            : colors.secondary,
        });
        break;
      case 'ghost':
        base.push({
          backgroundColor: pressed ? colors.muted : 'transparent',
        });
        break;
      case 'destructive':
        base.push({
          backgroundColor: pressed ? destructiveMutedPressed : destructiveMuted,
        });
        break;
      case 'link':
        base.push({ backgroundColor: 'transparent' });
        break;
    }

    return base;
  };

  const getTextStyle = (): TextStyle[] => {
    const base: TextStyle[] = [
      styles.textBase,
      sizeConfig.text,
      ...(!isIconSize ? [{ paddingVertical: 4 }] : []),
    ];

    switch (variant) {
      case 'default':
      case 'secondary':
        base.push({ color: colors.primaryForeground });
        break;
      case 'outline':
      case 'ghost':
        base.push({ color: colors.foreground });
        break;
      case 'destructive':
        base.push({ color: colors.destructive });
        break;
      case 'link':
        base.push({ color: colors.primary, textDecorationLine: 'underline' });
        break;
    }

    return base;
  };

  const spinnerColor =
    variant === 'default' || variant === 'secondary'
      ? colors.primaryForeground
      : variant === 'destructive'
        ? colors.destructive
        : variant === 'link'
          ? colors.primary
          : colors.foreground;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        ...getContainerStyle({ pressed }),
        ...(style ? [style] : []),
      ]}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <Text style={[...getTextStyle(), ...(textStyle ? [textStyle] : [])]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    disabled: {
      opacity: 0.5,
    },
    fullWidth: {
      width: '100%',
    },
    textBase: {
      fontWeight: theme.typography.fontWeight.medium,
    },
  });
}
