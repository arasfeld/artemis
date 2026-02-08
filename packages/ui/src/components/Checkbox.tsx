import React, { useMemo } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

export type CheckboxSize = 'sm' | 'md' | 'lg';

const CHECKBOX_SIZES: Record<CheckboxSize, { box: number; icon: number }> = {
  sm: { box: 16, icon: 14 },
  md: { box: 20, icon: 18 },
  lg: { box: 24, icon: 22 },
};

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  size?: CheckboxSize;
  style?: ViewStyle;
  /** When true, shows invalid/destructive border and ring styling */
  invalid?: boolean;
}

export function Checkbox({
  checked: controlledChecked,
  defaultChecked = false,
  disabled = false,
  invalid = false,
  onCheckedChange,
  size = 'md',
  style,
}: CheckboxProps) {
  const [uncontrolledChecked, setUncontrolledChecked] =
    React.useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : uncontrolledChecked;

  const { theme } = useTheme();
  const dimensions = CHECKBOX_SIZES[size];
  const styles = useMemo(
    () => createStyles(theme, CHECKBOX_SIZES[size]),
    [theme, size]
  );

  const handlePress = () => {
    if (disabled) return;
    const next = !checked;
    if (!isControlled) setUncontrolledChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.root,
        checked && styles.checked,
        invalid && !checked && styles.invalid,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel="Checkbox"
    >
      {checked ? (
        <Ionicons
          color={theme.colors.primaryForeground}
          name="checkmark"
          size={dimensions.icon}
        />
      ) : null}
    </Pressable>
  );
}

function createStyles(theme: Theme, dimensions: { box: number; icon: number }) {
  const { colors } = theme;
  const { box } = dimensions;
  return StyleSheet.create({
    root: {
      alignItems: 'center',
      backgroundColor:
        theme.colorScheme === 'dark' ? colors.input : 'transparent',
      borderColor: colors.input,
      borderRadius: 4,
      borderWidth: 1,
      height: box,
      justifyContent: 'center',
      width: box,
    },
    checked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    disabled: {
      opacity: 0.5,
    },
    invalid: {
      borderColor: colors.destructive,
    },
    pressed: {
      opacity: 0.9,
    },
  });
}
