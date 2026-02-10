import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Text, useTheme, type Theme } from '@artemis/ui';

import type { SharedValue } from 'react-native-reanimated';

interface SwipeOverlayProps {
  likeOpacity: SharedValue<number>;
  nopeOpacity: SharedValue<number>;
}

export function SwipeOverlay({ likeOpacity, nopeOpacity }: SwipeOverlayProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const likeStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: nopeOpacity.value,
  }));

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View style={[styles.overlay, styles.likeOverlay, likeStyle]}>
        <Text style={styles.overlayText}>LIKE</Text>
      </Animated.View>
      <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeStyle]}>
        <Text style={styles.overlayText}>NOPE</Text>
      </Animated.View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 10,
    },
    likeOverlay: {
      borderColor: theme.colors.chart2,
      left: 20,
      transform: [{ rotate: '-15deg' }],
    },
    nopeOverlay: {
      borderColor: theme.colors.destructive,
      right: 20,
      transform: [{ rotate: '15deg' }],
    },
    overlay: {
      borderRadius: theme.borderRadius.md,
      borderWidth: 4,
      paddingHorizontal: 16,
      paddingVertical: 8,
      position: 'absolute',
      top: 40,
    },
    overlayText: {
      fontSize: 32,
      fontWeight: 'bold',
    },
  });
}
