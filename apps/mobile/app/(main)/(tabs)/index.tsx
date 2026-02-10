import { useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ScreenContainer, Text, useTheme, type Theme } from '@artemis/ui';

import {
  CARD_HEIGHT,
  CARD_WIDTH,
  MatchModal,
  ProfileCard,
  ProfileDetailModal,
  SwipeOverlay,
} from '@/components/discover';
import {
  useGetDiscoverFeedQuery,
  useRecordSwipeMutation,
} from '@/store/api/apiSlice';
import type { MatchedUser, SwipeAction } from '@/types/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function DiscoverScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentMatchId, setCurrentMatchId] = useState<string | null>(null);
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const { data: profiles = [], isLoading, refetch } = useGetDiscoverFeedQuery();
  const [recordSwipe] = useRecordSwipeMutation();

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  // Animation values
  const likeOpacity = useSharedValue(0);
  const nopeOpacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Handle swipe completion
  const handleSwipe = useCallback(
    async (action: SwipeAction, userId: string) => {
      try {
        const result = await recordSwipe({ action, userId }).unwrap();

        // Check for match
        if (result.match) {
          setCurrentMatchId(result.match.id);
          setMatchedUser(result.match.user);
          setShowMatchModal(true);
        }

        // Move to next profile
        setCurrentIndex((prev) => prev + 1);

        // Reset animation values
        likeOpacity.value = 0;
        nopeOpacity.value = 0;
        translateX.value = 0;
        translateY.value = 0;
      } catch (error) {
        console.error('Failed to record swipe:', error);
      }
    },
    [likeOpacity, nopeOpacity, recordSwipe, translateX, translateY]
  );

  const handleSwipeComplete = useCallback(
    (direction: 'left' | 'right') => {
      if (!currentProfile) return;

      const action: SwipeAction = direction === 'right' ? 'like' : 'pass';
      handleSwipe(action, currentProfile.id);
    },
    [currentProfile, handleSwipe]
  );

  // Pan gesture
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      const progress = Math.abs(event.translationX) / SWIPE_THRESHOLD;
      if (event.translationX > 0) {
        likeOpacity.value = Math.min(progress, 1);
        nopeOpacity.value = 0;
      } else {
        nopeOpacity.value = Math.min(progress, 1);
        likeOpacity.value = 0;
      }
    })
    .onEnd((event) => {
      'worklet';
      const shouldSwipeRight =
        event.translationX > SWIPE_THRESHOLD ||
        (event.translationX > SWIPE_THRESHOLD * 0.7 && event.velocityX > 500);
      const shouldSwipeLeft =
        event.translationX < -SWIPE_THRESHOLD ||
        (event.translationX < -SWIPE_THRESHOLD * 0.7 && event.velocityX < -500);

      if (shouldSwipeRight) {
        translateX.value = withSpring(
          SCREEN_WIDTH * 1.5,
          { damping: 15, stiffness: 100 },
          () => {
            runOnJS(handleSwipeComplete)('right');
          }
        );
      } else if (shouldSwipeLeft) {
        translateX.value = withSpring(
          -SCREEN_WIDTH * 1.5,
          { damping: 15, stiffness: 100 },
          () => {
            runOnJS(handleSwipeComplete)('left');
          }
        );
      } else {
        // Spring back to center
        likeOpacity.value = withSpring(0, { damping: 20, stiffness: 100 });
        nopeOpacity.value = withSpring(0, { damping: 20, stiffness: 100 });
        translateX.value = withSpring(0, { damping: 20, stiffness: 100 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
      }
    });

  // Animated styles
  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const nextCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [0.9, 0.95, 0.9]
    );

    return {
      transform: [{ scale }],
    };
  });

  const handleButtonPress = useCallback(
    (action: SwipeAction) => {
      if (!currentProfile) return;

      const direction = action === 'like' ? 1 : -1;
      translateX.value = withSpring(
        direction * SCREEN_WIDTH * 1.5,
        { damping: 15 },
        () => {
          runOnJS(handleSwipeComplete)(action === 'like' ? 'right' : 'left');
        }
      );
    },
    [currentProfile, handleSwipeComplete, translateX]
  );

  const handleCardPress = useCallback(() => {
    setShowDetailModal(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setShowDetailModal(false);
  }, []);

  const handleCloseMatch = useCallback(() => {
    setCurrentMatchId(null);
    setMatchedUser(null);
    setShowMatchModal(false);
  }, []);

  const handleDetailLike = useCallback(() => {
    setShowDetailModal(false);
    handleButtonPress('like');
  }, [handleButtonPress]);

  const handleDetailPass = useCallback(() => {
    setShowDetailModal(false);
    handleButtonPress('pass');
  }, [handleButtonPress]);

  const handleSendMessage = useCallback(() => {
    if (currentMatchId) {
      router.push(`/chat/${currentMatchId}`);
    }
    setCurrentMatchId(null);
    setMatchedUser(null);
    setShowMatchModal(false);
  }, [currentMatchId, router]);

  // Loading state
  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Text variant="subtitle">Finding people near you...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Empty state
  if (!currentProfile) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <Ionicons
            color={theme.colors.mutedForeground}
            name="compass-outline"
            size={64}
          />
          <Text style={styles.emptyTitle} variant="title">
            No more profiles
          </Text>
          <Text center style={styles.emptySubtitle} variant="body">
            Check back later for new people in your area
          </Text>
          <Pressable onPress={() => refetch()} style={styles.refreshButton}>
            <Text style={styles.refreshText} variant="body">
              Refresh
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          {/* Next card (behind current) */}
          {nextProfile && (
            <Animated.View
              style={[styles.card, styles.nextCard, nextCardStyle]}
            >
              <ProfileCard profile={nextProfile} />
            </Animated.View>
          )}

          {/* Current card */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, cardStyle]}>
              <SwipeOverlay
                likeOpacity={likeOpacity}
                nopeOpacity={nopeOpacity}
              />
              <Pressable
                onPress={handleCardPress}
                style={styles.profileCardWrapper}
              >
                <ProfileCard profile={currentProfile} />
              </Pressable>
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            accessibilityLabel="Pass"
            onPress={() => handleButtonPress('pass')}
            style={[styles.actionButton, styles.passButton]}
          >
            <Ionicons color={theme.colors.destructive} name="close" size={32} />
          </Pressable>
          <Pressable
            accessibilityLabel="Like"
            onPress={() => handleButtonPress('like')}
            style={[styles.actionButton, styles.likeButton]}
          >
            <Ionicons color={theme.colors.chart2} name="heart" size={32} />
          </Pressable>
        </View>

        {/* Match Modal */}
        <MatchModal
          matchedUser={matchedUser}
          onClose={handleCloseMatch}
          onSendMessage={handleSendMessage}
          visible={showMatchModal}
        />

        {/* Profile Detail Modal */}
        <ProfileDetailModal
          onClose={handleCloseDetail}
          onLike={handleDetailLike}
          onPass={handleDetailPass}
          profile={currentProfile}
          visible={showDetailModal}
        />
      </View>
    </ScreenContainer>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    actionButton: {
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 30,
      elevation: 5,
      height: 60,
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      width: 60,
    },
    buttonContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 20,
      justifyContent: 'center',
      paddingBottom: 40,
    },
    card: {
      height: CARD_HEIGHT,
      position: 'absolute',
      width: CARD_WIDTH,
    },
    cardContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    centerContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    container: {
      flex: 1,
    },
    emptySubtitle: {
      marginBottom: 24,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      marginBottom: 8,
      marginTop: 16,
    },
    likeButton: {
      borderColor: theme.colors.chart2,
      borderWidth: 2,
    },
    nextCard: {
      transform: [{ scale: 0.95 }],
    },
    passButton: {
      borderColor: theme.colors.destructive,
      borderWidth: 2,
    },
    profileCardWrapper: {
      borderRadius: theme.borderRadius.xl,
      flex: 1,
      overflow: 'hidden',
    },
    refreshButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 25,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    refreshText: {
      color: theme.colors.primaryForeground,
      fontWeight: '600',
    },
  });
}
