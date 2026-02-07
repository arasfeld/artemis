import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Text, borderRadius, colors } from '@artemis/ui';
import type { SharedValue } from 'react-native-reanimated';

interface SwipeOverlayProps {
  likeOpacity: SharedValue<number>;
  nopeOpacity: SharedValue<number>;
}

export function SwipeOverlay({ likeOpacity, nopeOpacity }: SwipeOverlayProps) {
  const likeStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: nopeOpacity.value,
  }));

  return (
    <View pointerEvents="none" style={styles.container}>
      <Animated.View style={[styles.overlay, styles.likeOverlay, likeStyle]}>
        <Text color="light" style={styles.overlayText}>
          LIKE
        </Text>
      </Animated.View>
      <Animated.View style={[styles.overlay, styles.nopeOverlay, nopeStyle]}>
        <Text color="light" style={styles.overlayText}>
          NOPE
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  likeOverlay: {
    borderColor: colors.chart2,
    left: 20,
    transform: [{ rotate: '-15deg' }],
  },
  nopeOverlay: {
    borderColor: colors.destructive,
    right: 20,
    transform: [{ rotate: '15deg' }],
  },
  overlay: {
    borderRadius: borderRadius.md,
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
