import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  borderRadius,
  Button,
  colors,
  ProgressIndicator,
  ScreenContainer,
  shadow,
  spacing,
  Text,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 2;

export default function PhotosScreen() {
  const router = useRouter();
  const handleBack = () => {
    router.replace('/(main)/onboarding/age-range');
  };
  const {
    data,
    deletePhoto,
    isUploadingPhoto,
    syncError,
    totalSteps,
    uploadAndAddPhoto,
  } = useAppOnboarding();

  // Track which slot is currently uploading
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  // Local preview URIs while upload is in progress
  const [localPreviews, setLocalPreviews] = useState<Record<number, string>>(
    {}
  );

  // Merge server photos with local previews
  const photos = data.photos || [];
  const isValid = photos.length >= MIN_PHOTOS;

  const pickImage = useCallback(
    async (index: number) => {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to add photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [3, 4],
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;

        // Show local preview immediately
        setLocalPreviews((prev) => ({ ...prev, [index]: localUri }));
        setUploadingSlot(index);

        // Upload to S3
        const success = await uploadAndAddPhoto(localUri, index);

        // Clear local preview state
        setUploadingSlot(null);
        if (success) {
          setLocalPreviews((prev) => {
            const next = { ...prev };
            delete next[index];
            return next;
          });
        } else {
          // Keep preview if failed, show error
          Alert.alert('Upload Failed', syncError || 'Failed to upload photo');
        }
      }
    },
    [uploadAndAddPhoto, syncError]
  );

  const handleRemovePhoto = useCallback(
    async (index: number) => {
      // If there's a local preview, just clear it
      if (localPreviews[index]) {
        setLocalPreviews((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
        return;
      }

      // Delete from server
      await deletePhoto(index);
    },
    [deletePhoto, localPreviews]
  );

  const handleFinish = () => {
    if (!isValid) return;
    // Photos are already uploaded, just navigate
    router.replace('/(main)/(tabs)');
  };

  const renderPhotoSlot = (index: number) => {
    const serverPhoto = photos[index];
    const localPreview = localPreviews[index];
    const photo = localPreview || serverPhoto;
    const isMainPhoto = index === 0;
    const isUploading = uploadingSlot === index;

    return (
      <TouchableOpacity
        key={index}
        style={[styles.photoSlot, isMainPhoto && styles.mainPhotoSlot]}
        onPress={() => pickImage(index)}
        activeOpacity={0.8}
        disabled={isUploadingPhoto}
      >
        {photo && photo !== '' ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color={colors.white} />
              </View>
            )}
            {!isUploading && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={colors.destructive}
                />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptySlot}>
            <Ionicons name="add" size={32} color={colors.mutedForeground} />
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
    <ScreenContainer onBack={handleBack}>
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
        <Button
          disabled={!isValid || isUploadingPhoto}
          fullWidth
          loading={isUploadingPhoto}
          onPress={handleFinish}
          size="lg"
        >
          {isUploadingPhoto ? 'Uploading...' : 'Finish'}
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  bottomRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  emptySlot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  mainColumn: {
    flex: 2,
  },
  mainLabel: {
    fontSize: 10,
    marginTop: spacing.xs,
  },
  mainPhotoSlot: {
    aspectRatio: 3 / 4,
  },
  photo: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  photoContainer: {
    flex: 1,
  },
  photoCount: {
    marginTop: spacing.lg,
  },
  photoSlot: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    flex: 1,
    overflow: 'hidden',
    ...shadow.sm,
  },
  removeButton: {
    backgroundColor: colors.background,
    borderRadius: 12,
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
  },
  sideColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
});
