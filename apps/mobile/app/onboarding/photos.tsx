import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  ScreenContainer,
  Text,
  Button,
  ProgressIndicator,
  colors,
  borderRadius,
  shadow,
  spacing,
} from '@artemis/ui';
import { useAppOnboarding } from '../../hooks/useAppOnboarding';
import { useSafeBack } from '../../hooks/useOnboardingFlow';

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 2;

export default function PhotosScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/onboarding/photos');
  const { data, updateData, totalSteps } = useAppOnboarding();
  const [photos, setPhotos] = useState<string[]>(data.photos);

  const isValid = photos.length >= MIN_PHOTOS;

  const pickImage = async (index: number) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to add photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...photos];
      // If replacing an existing photo or adding at a specific index
      if (index < newPhotos.length) {
        newPhotos[index] = result.assets[0].uri;
      } else {
        // If adding a new photo, add it at the correct position
        newPhotos[index] = result.assets[0].uri;
      }
      setPhotos(newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleFinish = () => {
    if (!isValid) return;

    updateData({ photos });
    // Navigate to home after completing onboarding
    router.replace('/home');
  };

  const renderPhotoSlot = (index: number) => {
    const photo = photos[index];
    const isMainPhoto = index === 0;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.photoSlot, isMainPhoto && styles.mainPhotoSlot]}
        onPress={() => pickImage(index)}
        activeOpacity={0.8}
      >
        {photo && photo !== '' ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removePhoto(index)}
            >
              <Ionicons name="close-circle" size={24} color={colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptySlot}>
            <Ionicons name="add" size={32} color={colors.text.muted} />
            {isMainPhoto && (
              <Text variant="muted" color="dark" style={styles.mainLabel}>
                Main photo
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer onBack={safeBack}>
      <ProgressIndicator currentStep={7} totalSteps={totalSteps} />

      <View style={styles.content}>
        <Text variant="title" center>
          Add your photos
        </Text>
        <Text variant="subtitle" center>
          Add at least {MIN_PHOTOS} photos to continue
        </Text>

        <View style={styles.grid}>
          <View style={styles.mainColumn}>{renderPhotoSlot(0)}</View>
          <View style={styles.sideColumn}>
            {renderPhotoSlot(1)}
            {renderPhotoSlot(2)}
          </View>
        </View>

        <View style={styles.bottomRow}>
          {renderPhotoSlot(3)}
          {renderPhotoSlot(4)}
          {renderPhotoSlot(5)}
        </View>

        <Text variant="muted" center style={styles.photoCount}>
          {photos.length} of {MAX_PHOTOS} photos added
        </Text>
      </View>

      <View style={styles.footer}>
        <Button onPress={handleFinish} disabled={!isValid} fullWidth>
          Finish
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  mainColumn: {
    flex: 2,
  },
  sideColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 3 / 4,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadow.sm,
  },
  mainPhotoSlot: {
    aspectRatio: 3 / 4,
  },
  photoContainer: {
    flex: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptySlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLabel: {
    marginTop: spacing.xs,
    fontSize: 10,
  },
  photoCount: {
    marginTop: spacing.lg,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});
