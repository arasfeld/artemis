import { memo, useCallback, useEffect, useMemo } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, useTheme } from '@artemis/ui';

import type { DiscoverProfile } from '@/types/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const CARD_WIDTH = SCREEN_WIDTH - 32;
export const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;

interface ProfileCardProps {
  onPrimaryPhotoLoad?: () => void;
  profile: DiscoverProfile;
}

export const ProfileCard = memo(function ProfileCard({
  onPrimaryPhotoLoad,
  profile,
}: ProfileCardProps) {
  const { theme } = useTheme();
  const primaryPhoto =
    profile.photos.find((p) => p.displayOrder === 0) || profile.photos[0];

  const handleImageLoad = useCallback(() => {
    onPrimaryPhotoLoad?.();
  }, [onPrimaryPhotoLoad]);

  // No photo: reveal immediately so the card doesn't stay hidden
  useEffect(() => {
    if (!primaryPhoto && onPrimaryPhotoLoad) {
      onPrimaryPhotoLoad();
    }
  }, [primaryPhoto, onPrimaryPhotoLoad]);

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.xl,
          elevation: 5,
          height: CARD_HEIGHT,
          overflow: 'hidden',
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          width: CARD_WIDTH,
        },
        placeholderImage: {
          backgroundColor: theme.colors.border,
        },
      }),
    [theme]
  );

  return (
    <View style={dynamicStyles.card}>
      {primaryPhoto ? (
        <Image
          key={primaryPhoto.url}
          onLoad={handleImageLoad}
          resizeMode="cover"
          source={{ uri: primaryPhoto.url }}
          style={styles.image}
        />
      ) : (
        <View style={[styles.image, dynamicStyles.placeholderImage]} />
      )}
      <LinearGradient
        colors={['transparent', theme.colors.overlay]}
        style={styles.gradient}
      />
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name} variant="title">
            {profile.firstName}, {profile.age}
          </Text>
          {profile.pets && profile.pets.length > 0 && (
            <Ionicons
              name="paw"
              size={20}
              color="white"
              style={styles.pawIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  gradient: {
    bottom: 0,
    height: '40%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  infoContainer: {
    bottom: 0,
    left: 0,
    padding: 20,
    position: 'absolute',
    right: 0,
  },
  name: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pawIcon: {
    opacity: 0.9,
  },
});
