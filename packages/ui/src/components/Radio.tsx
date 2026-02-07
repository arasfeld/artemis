import React, { createContext, useCallback, useMemo, useContext } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

export type RadioSize = 'sm' | 'md' | 'lg';

const RADIO_SIZES: Record<RadioSize, { outer: number; inner: number }> = {
  sm: { outer: 16, inner: 8 },
  md: { outer: 20, inner: 10 },
  lg: { outer: 24, inner: 12 },
};

interface RadioGroupContextValue {
  disabled?: boolean;
  onValueChange: (value: string) => void;
  value: string | undefined;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

function useRadioGroup() {
  const ctx = useContext(RadioGroupContext);
  return ctx;
}

export interface RadioGroupProps extends ViewProps {
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  style?: ViewStyle;
  value?: string;
  /** Initial value when uncontrolled */
  defaultValue?: string;
}

export function RadioGroup({
  children,
  defaultValue,
  disabled = false,
  onValueChange,
  style,
  value: controlledValue,
  ...props
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    string | undefined
  >(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = useCallback(
    (v: string) => {
      if (!isControlled) setUncontrolledValue(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange]
  );

  const contextValue = useMemo<RadioGroupContextValue>(
    () => ({
      disabled,
      onValueChange: handleValueChange,
      value,
    }),
    [disabled, handleValueChange, value]
  );

  const { theme } = useTheme();
  const styles = useMemo(() => createGroupStyles(theme), [theme]);

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <View style={[styles.root, style]} {...props}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

function createGroupStyles(theme: Theme) {
  return StyleSheet.create({
    root: {
      gap: theme.spacing.sm,
      width: '100%',
    },
  });
}

export interface RadioGroupItemProps extends ViewProps {
  disabled?: boolean;
  size?: RadioSize;
  style?: ViewStyle;
  value: string;
}

export function RadioGroupItem({
  disabled: itemDisabled = false,
  size = 'md',
  style,
  value,
  ...props
}: RadioGroupItemProps) {
  const group = useRadioGroup();
  const { theme } = useTheme();
  const styles = useMemo(
    () => createItemStyles(theme, RADIO_SIZES[size]),
    [theme, size]
  );

  if (!group) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const disabled = group.disabled ?? itemDisabled;
  const selected = group.value === value;

  const handlePress = () => {
    if (disabled) return;
    group.onValueChange(value);
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.root,
        selected && styles.selected,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={value}
      {...props}
    >
      {selected ? <View style={styles.indicator} /> : null}
    </Pressable>
  );
}

function createItemStyles(
  theme: Theme,
  dimensions: { outer: number; inner: number }
) {
  const { colors } = theme;
  const { outer, inner } = dimensions;
  return StyleSheet.create({
    disabled: {
      opacity: 0.5,
    },
    indicator: {
      backgroundColor: colors.primary,
      borderRadius: inner / 2,
      height: inner,
      width: inner,
    },
    pressed: {
      opacity: 0.9,
    },
    root: {
      alignItems: 'center',
      aspectRatio: 1,
      backgroundColor: 'transparent',
      borderColor: colors.ring,
      borderRadius: outer / 2,
      borderWidth: 2,
      height: outer,
      justifyContent: 'center',
      width: outer,
    },
    selected: {
      borderColor: colors.primary,
    },
  });
}
