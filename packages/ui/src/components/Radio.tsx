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

const RADIO_SIZE = 16;
const RADIO_INNER_SIZE = 8;

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
  style?: ViewStyle;
  value: string;
}

export function RadioGroupItem({
  disabled: itemDisabled = false,
  style,
  value,
  ...props
}: RadioGroupItemProps) {
  const group = useRadioGroup();
  const { theme } = useTheme();
  const styles = useMemo(() => createItemStyles(theme), [theme]);

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

function createItemStyles(theme: Theme) {
  const { colors } = theme;
  return StyleSheet.create({
    disabled: {
      opacity: 0.5,
    },
    indicator: {
      backgroundColor: colors.primary,
      borderRadius: RADIO_INNER_SIZE / 2,
      height: RADIO_INNER_SIZE,
      width: RADIO_INNER_SIZE,
    },
    pressed: {
      opacity: 0.9,
    },
    root: {
      alignItems: 'center',
      aspectRatio: 1,
      backgroundColor: colors.input,
      borderColor: colors.input,
      borderRadius: RADIO_SIZE / 2,
      borderWidth: 1,
      height: RADIO_SIZE,
      justifyContent: 'center',
      width: RADIO_SIZE,
    },
    selected: {
      borderColor: colors.primary,
    },
  });
}
