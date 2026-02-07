import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type TextStyle,
} from 'react-native';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

interface LinkTextProps {
  children: string;
  onPress: () => void;
  style?: TextStyle;
  color?: 'light' | 'dark';
}

export function LinkText({
  children,
  onPress,
  style,
  color = 'light',
}: LinkTextProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Text
        style={[
          styles.text,
          color === 'light' ? styles.light : styles.dark,
          style,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    dark: {
      color: theme.colors.primary,
    },
    light: {
      color: theme.colors.primaryForeground,
    },
    text: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      textDecorationLine: 'underline',
    },
  });
}
