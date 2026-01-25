import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type TextStyle } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

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

const styles = StyleSheet.create({
  text: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  light: {
    color: colors.text.light,
  },
  dark: {
    color: colors.primary,
  },
});
