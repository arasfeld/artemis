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
import { Text, useTheme, type Theme } from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { useGetProfileQuery } from '@/store/api/apiSlice';

const MAX_PHOTOS = 6;
const MIN_PHOTOS = 2;

export default function EditPhotosScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
        const uri = result.assets[0].uri;

        setLocalPreviews((p) => ({ ...p, [index]: uri }));
        setUploadingSlot(index);

        const success = await uploadAndAddPhoto(uri, index);

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

      const photo = sortedPhotos[index];
      if (!photo) return;

      Alert.alert('Delete Photo', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => deletePhoto(photo.id),
        },
      ]);
    },
    [deletePhoto, localPreviews, sortedPhotos]
  );

  const renderPhotoSlot = (index: number) => {
    const photo = localPreviews[index] || sortedPhotos[index]?.url;
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Photos</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Add at least {MIN_PHOTOS} photos. Tap a photo to replace it.
        </Text>

        <View style={styles.grid}>
          {Array.from({ length: MAX_PHOTOS }).map((_, index) =>
            renderPhotoSlot(index)
          )}
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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.foreground,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
    },
    subtitle: {
      textAlign: 'center',
      fontSize: 14,
      color: theme.colors.mutedForeground,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    sideColumn: {
      flex: 1,
      gap: theme.spacing.sm,
    },
    bottomRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    photoSlot: {
      flex: 1,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: theme.colors.card,
      overflow: 'hidden',
    },
    photoContainer: {
      flex: 1,
      position: 'relative',
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
    mainLabel: {
      marginTop: theme.spacing.xs,
      fontSize: 10,
      color: theme.colors.mutedForeground,
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
    photoCount: {
      marginTop: theme.spacing.lg,
      fontSize: 14,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
    },
    slotWrapper: {
      width: '31.5%', // 3 columns with gap
      aspectRatio: 3 / 4,
    },
    warningText: {
      marginTop: theme.spacing.sm,
      fontSize: 13,
      color: theme.colors.destructive,
      textAlign: 'center',
    },
  });
}
