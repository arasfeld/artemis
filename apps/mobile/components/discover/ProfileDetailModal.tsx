import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
  ViewToken,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, colors } from "@artemis/ui";
import type { DiscoverProfile } from "@/types/api";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
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
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentPhotoIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (!profile) return null;

  const sortedPhotos = [...profile.photos].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  const genderText = profile.genders.map((g) => g.name).join(", ");
  const lookingForText =
    profile.relationshipTypes && profile.relationshipTypes.length > 0
      ? profile.relationshipTypes.map((r: any) => r.name).join(", ")
      : null;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      visible={visible}
    >
      <SafeAreaView style={styles.container}>
        {/* Close button */}
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons color={colors.text.primary} name="close" size={28} />
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
            <View style={[styles.photo, styles.placeholderPhoto]} />
          )}

          {/* Pagination dots */}
          {sortedPhotos.length > 1 && (
            <View style={styles.pagination}>
              {sortedPhotos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentPhotoIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Profile info */}
        <View style={styles.infoContainer}>
          <Text color="dark" style={styles.name} variant="title">
            {profile.firstName}, {profile.age}
          </Text>

          {genderText && (
            <View style={styles.infoRow}>
              <Ionicons
                color={colors.text.secondary}
                name="person-outline"
                size={20}
              />
              <Text color="dark" style={styles.infoText} variant="body">
                {genderText}
              </Text>
            </View>
          )}

          {lookingForText && (
            <View style={styles.infoRow}>
              <Ionicons
                color={colors.text.secondary}
                name="heart-outline"
                size={20}
              />
              <Text color="dark" style={styles.infoText} variant="body">
                {lookingForText}
              </Text>
            </View>
          )}

          {profile.location && (
            <View style={styles.infoRow}>
              <Ionicons
                color={colors.text.secondary}
                name="location-outline"
                size={20}
              />
              <Text color="dark" style={styles.infoText} variant="body">
                {profile.location}
              </Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            accessibilityLabel="Pass"
            onPress={onPass}
            style={[styles.actionButton, styles.passButton]}
          >
            <Ionicons color={colors.error} name="close" size={36} />
          </Pressable>
          <Pressable
            accessibilityLabel="Like"
            onPress={onLike}
            style={[styles.actionButton, styles.likeButton]}
          >
            <Ionicons color={colors.success} name="heart" size={36} />
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 35,
    elevation: 5,
    height: 70,
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 70,
  },
  buttonContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 30,
    justifyContent: "center",
    paddingBottom: 20,
    paddingTop: 16,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: colors.background.card,
    borderRadius: 20,
    elevation: 2,
    height: 40,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    top: 16,
    width: 40,
    zIndex: 10,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  infoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  infoText: {
    color: colors.text.secondary,
    flex: 1,
  },
  likeButton: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
  },
  pagination: {
    bottom: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
  },
  paginationDot: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  paginationDotActive: {
    backgroundColor: colors.white,
  },
  passButton: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  photo: {
    height: PHOTO_HEIGHT,
    width: SCREEN_WIDTH,
  },
  photoContainer: {
    height: PHOTO_HEIGHT,
    position: "relative",
  },
  placeholderPhoto: {
    backgroundColor: colors.border.light,
  },
});
