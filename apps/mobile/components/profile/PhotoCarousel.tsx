import { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
  ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@artemis/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Photo {
  displayOrder: number;
  id: string;
  url: string;
}

interface PhotoCarouselProps {
  editable?: boolean;
  height?: number;
  onEditPress?: () => void;
  photos: Photo[];
}

export function PhotoCarousel({
  editable = false,
  height = SCREEN_WIDTH * 1.2,
  onEditPress,
  photos,
}: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const sortedPhotos = [...photos].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={[styles.container, { height }]}>
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
              style={[styles.photo, { height }]}
            />
          )}
          showsHorizontalScrollIndicator={false}
          viewabilityConfig={viewabilityConfig}
        />
      ) : (
        <View style={[styles.photo, styles.placeholderPhoto, { height }]}>
          <Ionicons color={colors.text.muted} name="person" size={64} />
        </View>
      )}

      {/* Pagination dots */}
      {sortedPhotos.length > 1 && (
        <View style={styles.pagination}>
          {sortedPhotos.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Edit button overlay */}
      {editable && onEditPress && (
        <Pressable onPress={onEditPress} style={styles.editButton}>
          <Ionicons color={colors.white} name="camera" size={20} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: SCREEN_WIDTH,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    bottom: 24,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    width: 40,
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
  paginationDotActive: {
    backgroundColor: colors.white,
  },
  photo: {
    width: SCREEN_WIDTH,
  },
  placeholderPhoto: {
    alignItems: 'center',
    backgroundColor: colors.border.light,
    justifyContent: 'center',
  },
});
