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
import { borderRadius, colors, shadow, spacing, Text } from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { useGetProfileQuery } from '@/store/api/apiSlice';

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 2;

export default function EditPhotosScreen() {
  const router = useRouter();
  const { deletePhoto, isUploadingPhoto, syncError, uploadAndAddPhoto } =
    useAppOnboarding();
  const { data: profile } = useGetProfileQuery();

  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [localPreviews, setLocalPreviews] = useState<Record<number, string>>(
    {}
  );

  const photos = profile?.photos || [];
  const sortedPhotos = [...photos].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const handleCancel = () => {
    router.back();
  };

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

        setLocalPreviews((prev) => ({ ...prev, [index]: localUri }));
        setUploadingSlot(index);

        const success = await uploadAndAddPhoto(localUri, index);

        setUploadingSlot(null);
        if (success) {
          setLocalPreviews((prev) => {
            const next = { ...prev };
            delete next[index];
            return next;
          });
        } else {
          Alert.alert('Upload Failed', syncError || 'Failed to upload photo');
        }
      }
    },
    [uploadAndAddPhoto, syncError]
  );

  const handleRemovePhoto = useCallback(
    async (index: number) => {
      if (localPreviews[index]) {
        setLocalPreviews((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
        return;
      }

      const photo = sortedPhotos[index];
      if (photo) {
        Alert.alert(
          'Delete Photo',
          'Are you sure you want to delete this photo?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                await deletePhoto(photo.id);
              },
            },
          ]
        );
      }
    },
    [deletePhoto, localPreviews, sortedPhotos]
  );

  const renderPhotoSlot = (index: number) => {
    const serverPhoto = sortedPhotos[index];
    const localPreview = localPreviews[index];
    const photoUrl = localPreview || serverPhoto?.url;
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
        {photoUrl ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUrl }} style={styles.photo} />
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color={colors.white} size="large" />
              </View>
            )}
            {!isUploading && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <Ionicons color={colors.error} name="close-circle" size={24} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.emptySlot}>
            <Ionicons color={colors.text.muted} name="add" size={32} />
            {isMainPhoto && <Text style={styles.mainLabel}>Main photo</Text>}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons color={colors.text.primary} name="close" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Photos</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Add at least {MIN_PHOTOS} photos. Tap a photo to replace it.
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

        <Text style={styles.photoCount}>
          {sortedPhotos.length} of {MAX_PHOTOS} photos added
        </Text>

        {sortedPhotos.length < MIN_PHOTOS && (
          <Text style={styles.warningText}>
            You need at least {MIN_PHOTOS} photos for your profile to be visible
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  emptySlot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border.light,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerButton: {
    minWidth: 50,
    padding: spacing.xs,
  },
  mainColumn: {
    flex: 2,
  },
  mainLabel: {
    color: colors.text.muted,
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
    color: colors.text.muted,
    fontSize: 14,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  photoSlot: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    flex: 1,
    overflow: 'hidden',
    ...shadow.sm,
  },
  removeButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
  },
  sideColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  warningText: {
    color: colors.error,
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
