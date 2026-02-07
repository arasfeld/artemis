import React, { useMemo } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

const CHECKBOX_SIZE = 16;
const CHECK_ICON_SIZE = 14;

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
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
  style,
}: CheckboxProps) {
  const [uncontrolledChecked, setUncontrolledChecked] =
    React.useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : uncontrolledChecked;

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
          size={CHECK_ICON_SIZE}
        />
      ) : null}
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  const { colors } = theme;
  return StyleSheet.create({
    root: {
      alignItems: 'center',
      backgroundColor: colors.input,
      borderColor: colors.input,
      borderRadius: 4,
      borderWidth: 1,
      height: CHECKBOX_SIZE,
      justifyContent: 'center',
      width: CHECKBOX_SIZE,
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
