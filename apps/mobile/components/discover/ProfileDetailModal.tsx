import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, useTheme } from '@artemis/ui';

import type { DiscoverProfile } from '@/types/api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PHOTO_HEIGHT = SCREEN_HEIGHT * 0.55;

interface ProfileDetailModalProps {
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
  profile: DiscoverProfile | null;
  visible: boolean;
}

export function ProfileDetailModal({
  onClose,
  onLike,
  onPass,
  profile,
  visible,
}: ProfileDetailModalProps) {
  const { theme } = useTheme();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentPhotoIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        actionButton: {
          alignItems: 'center',
          backgroundColor: theme.colors.card,
          borderRadius: 35,
          elevation: 5,
          height: 70,
          justifyContent: 'center',
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          width: 70,
        },
        closeButton: {
          alignItems: 'center',
          backgroundColor: theme.colors.card,
          borderRadius: 20,
          elevation: 2,
          height: 40,
          justifyContent: 'center',
          position: 'absolute',
          right: 16,
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          top: 16,
          width: 40,
          zIndex: 10,
        },
        container: {
          backgroundColor: theme.colors.background,
          flex: 1,
        },
        infoText: {
          color: theme.colors.mutedForeground,
          flex: 1,
        },
        likeButton: {
          borderColor: theme.colors.chart2,
          borderWidth: 2,
        },
        paginationDotActive: {
          backgroundColor: theme.colors.white,
        },
        passButton: {
          borderColor: theme.colors.destructive,
          borderWidth: 2,
        },
        placeholderPhoto: {
          backgroundColor: theme.colors.border,
        },
      }),
    [theme.colorScheme],
  );

  if (!profile) return null;

  const sortedPhotos = [...profile.photos].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const genderText = profile.genders.map((g) => g.name).join(', ');
  const lookingForText =
    profile.relationshipTypes && profile.relationshipTypes.length > 0
      ? profile.relationshipTypes.map((r: any) => r.name).join(', ')
      : null;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <SafeAreaView style={dynamicStyles.container}>
        {/* Close button */}
        <Pressable onPress={onClose} style={dynamicStyles.closeButton}>
          <Ionicons color={theme.colors.foreground} name="close" size={28} />
        </Pressable>

        {/* Photo carousel */}
        <View style={styles.photoContainer}>
          {sortedPhotos.length > 0 ? (
            <FlatList
              ref={flatListRef}
              data={sortedPhotos}
              horizontal
              keyExtractor={(item) => item.id}
              onViewableItemsChanged={onViewableItemsChanged}
              pagingEnabled
              renderItem={({ item }) => (
                <Image
                  resizeMode="cover"
                  source={{ uri: item.url }}
                  style={styles.photo}
                />
              )}
              showsHorizontalScrollIndicator={false}
              viewabilityConfig={viewabilityConfig}
            />
          ) : (
            <View style={[styles.photo, dynamicStyles.placeholderPhoto]} />
          )}

          {/* Pagination dots */}
          {sortedPhotos.length > 1 && (
            <View style={styles.pagination}>
              {sortedPhotos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentPhotoIndex && dynamicStyles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Profile info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} variant="title">
            {profile.firstName}, {profile.age}
          </Text>

          {genderText && (
            <View style={styles.infoRow}>
              <Ionicons
                color={theme.colors.mutedForeground}
                name="person-outline"
                size={20}
              />
              <Text style={dynamicStyles.infoText} variant="body">
                {genderText}
              </Text>
            </View>
          )}

          {lookingForText && (
            <View style={styles.infoRow}>
              <Ionicons
                color={theme.colors.mutedForeground}
                name="heart-outline"
                size={20}
              />
              <Text style={dynamicStyles.infoText} variant="body">
                {lookingForText}
              </Text>
            </View>
          )}

          {profile.location && (
            <View style={styles.infoRow}>
              <Ionicons
                color={theme.colors.mutedForeground}
                name="location-outline"
                size={20}
              />
              <Text style={dynamicStyles.infoText} variant="body">
                {profile.location}
              </Text>
            </View>
          )}

          {profile.pets && profile.pets.length > 0 && (
            <View style={styles.infoRow}>
              <Ionicons
                color={theme.colors.mutedForeground}
                name="paw"
                size={20}
              />
              <Text style={dynamicStyles.infoText} variant="body">
                {profile.pets
                  .map((p) => `${p.name} (${p.petType.name})`)
                  .join(', ')}
              </Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            accessibilityLabel="Pass"
            onPress={onPass}
            style={[dynamicStyles.actionButton, dynamicStyles.passButton]}
          >
            <Ionicons color={theme.colors.destructive} name="close" size={36} />
          </Pressable>
          <Pressable
            accessibilityLabel="Like"
            onPress={onLike}
            style={[dynamicStyles.actionButton, dynamicStyles.likeButton]}
          >
            <Ionicons color={theme.colors.chart2} name="heart" size={36} />
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 30,
    justifyContent: 'center',
    paddingBottom: 20,
    paddingTop: 16,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  pagination: {
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  paginationDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  photo: {
    height: PHOTO_HEIGHT,
    width: SCREEN_WIDTH,
  },
  photoContainer: {
    height: PHOTO_HEIGHT,
    position: 'relative',
  },
});
