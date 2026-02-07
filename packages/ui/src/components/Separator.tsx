import { useMemo } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import type { Theme } from '../theme/ThemeContext';
import { useTheme } from '../theme/ThemeContext';

type Orientation = 'horizontal' | 'vertical';

interface SeparatorProps extends Omit<ViewProps, 'style'> {
  decorative?: boolean;
  orientation?: Orientation;
  style?: ViewStyle;
}

export function Separator({
  decorative = true,
  orientation = 'horizontal',
  style,
  ...props
}: SeparatorProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no' : 'auto'}
      style={[
        styles.base,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        style,
      ]}
      {...props}
    />
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      backgroundColor: theme.colors.border,
      flexShrink: 0,
    },
    horizontal: {
      height: 1,
      width: '100%',
    },
    vertical: {
      alignSelf: 'stretch',
      width: 1,
    },
  });
}
