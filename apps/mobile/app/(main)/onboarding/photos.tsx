import { useCallback, useMemo, useState } from 'react';
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
  Button,
  ProgressIndicator,
  ScreenContainer,
  Text,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 2;

export default function PhotosScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    data,
    deletePhoto,
    isUploadingPhoto,
    syncError,
    totalSteps,
    uploadAndAddPhoto,
  } = useAppOnboarding();

  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [localPreviews, setLocalPreviews] = useState<Record<number, string>>(
    {}
  );

  const photos = data.photos || [];
  const isValid = photos.length >= MIN_PHOTOS;

  const pickImage = useCallback(
    async (index: number) => {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library.'
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

        setLocalPreviews((p) => ({ ...p, [index]: localUri }));
        setUploadingSlot(index);

        const success = await uploadAndAddPhoto(localUri, index);

        setUploadingSlot(null);

        if (success) {
          setLocalPreviews((p) => {
            const next = { ...p };
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
        setLocalPreviews((p) => {
          const next = { ...p };
          delete next[index];
          return next;
        });
        return;
      }
      await deletePhoto(index);
    },
    [deletePhoto, localPreviews]
  );

  const renderPhotoSlot = (index: number) => {
    const photo = localPreviews[index] || photos[index];
    const isUploading = uploadingSlot === index;

    return (
      <View key={index} style={styles.slotWrapper}>
        <TouchableOpacity
          style={styles.photoSlot}
          onPress={() => pickImage(index)}
          activeOpacity={0.85}
          disabled={isUploadingPhoto}
        >
          {photo ? (
            <>
              <Image source={{ uri: photo }} style={styles.photo} />

              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}

              {!isUploading && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Ionicons
                    name="close-circle"
                    size={22}
                    color={theme.colors.destructive}
                  />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptySlot}>
              <Ionicons
                name="add"
                size={28}
                color={theme.colors.mutedForeground}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <ProgressIndicator currentStep={7} totalSteps={totalSteps} />

      <View style={styles.content}>
        <Text variant="title" center>
          Add your photos
        </Text>
        <Text variant="subtitle" center>
          Add at least {MIN_PHOTOS} photos to continue
        </Text>

        <View style={styles.grid}>
          {Array.from({ length: MAX_PHOTOS }).map((_, index) =>
            renderPhotoSlot(index)
          )}
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
          onPress={() => router.replace('/(main)/(tabs)')}
          size="lg"
        >
          Finish
        </Button>
      </View>
    </ScreenContainer>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
    },

    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xl,
    },

    slotWrapper: {
      width: '31.5%', // 3 columns + gap
      aspectRatio: 3 / 4,
    },

    photoSlot: {
      flex: 1,
      backgroundColor: theme.colors.muted,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },

    photo: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },

    emptySlot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    uploadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    removeButton: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
    },

    footer: {
      paddingBottom: theme.spacing.xl,
    },

    photoCount: {
      marginTop: theme.spacing.lg,
    },
  });
}
