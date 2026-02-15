import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  Button,
  ScreenContainer,
  Text,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { uploadPhoto } from '@/lib/photo-upload';
import {
  useConfirmPetPhotoUploadMutation,
  useCreatePetMutation,
  useDeletePetPhotoMutation,
  useGetPetPhotoUploadUrlMutation,
  useGetPetTypesQuery,
  useGetPetsQuery,
  useUpdatePetMutation,
} from '@/store/api/apiSlice';

const MAX_PET_PHOTOS = 4;

export default function PetScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const isNew = petId === 'new';
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { data: petTypes = [] } = useGetPetTypesQuery();
  const { data: pets = [] } = useGetPetsQuery();
  const existingPet = useMemo(
    () => (isNew ? null : pets.find((p) => p.id === petId)),
    [isNew, petId, pets]
  );

  const [createPet, { isLoading: isCreating }] = useCreatePetMutation();
  const [updatePet, { isLoading: isUpdating }] = useUpdatePetMutation();
  const [getPetPhotoUploadUrl] = useGetPetPhotoUploadUrlMutation();
  const [confirmPetPhotoUpload] = useConfirmPetPhotoUploadMutation();
  const [deletePetPhoto] = useDeletePetPhotoMutation();

  const [name, setName] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [breed, setBreed] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Populate fields from existing pet
  useEffect(() => {
    if (existingPet) {
      setName(existingPet.name);
      setSelectedTypeId(existingPet.petType.id);
      setBreed(existingPet.breed || '');
    }
  }, [existingPet]);

  const isValid = name.trim().length > 0 && selectedTypeId.length > 0;
  const isSaving = isCreating || isUpdating;

  const handleSave = useCallback(async () => {
    if (!isValid) return;

    try {
      if (isNew) {
        await createPet({
          breed: breed.trim() || undefined,
          name: name.trim(),
          petTypeId: selectedTypeId,
        }).unwrap();
      } else {
        await updatePet({
          breed: breed.trim() || null,
          name: name.trim(),
          petId: petId!,
          petTypeId: selectedTypeId,
        }).unwrap();
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save pet. Please try again.');
    }
  }, [
    breed,
    createPet,
    isNew,
    isValid,
    name,
    petId,
    router,
    selectedTypeId,
    updatePet,
  ]);

  const handlePickPhoto = useCallback(async () => {
    if (isNew || !petId) {
      Alert.alert('Save First', 'Please save your pet before adding photos.');
      return;
    }

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
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploadingPhoto(true);
      try {
        const s3Key = await uploadPhoto(result.assets[0].uri, async (params) =>
          getPetPhotoUploadUrl({ petId, ...params }).unwrap()
        );
        await confirmPetPhotoUpload({ key: s3Key, petId }).unwrap();
      } catch {
        Alert.alert('Upload Failed', 'Failed to upload photo.');
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  }, [confirmPetPhotoUpload, getPetPhotoUploadUrl, isNew, petId]);

  const handleDeletePhoto = useCallback(
    (photoId: string) => {
      if (!petId) return;
      Alert.alert('Delete Photo', 'Remove this photo?', [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: () => deletePetPhoto({ petId, photoId }),
          style: 'destructive',
          text: 'Delete',
        },
      ]);
    },
    [deletePetPhoto, petId]
  );

  const photos = existingPet?.photos || [];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="close"
            size={28}
            color={theme.colors.foreground}
          />
        </TouchableOpacity>
        <Text variant="title" style={styles.headerTitle}>
          {isNew ? 'Add Pet' : 'Edit Pet'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setName}
            placeholder="Pet's name"
            placeholderTextColor={theme.colors.mutedForeground}
            style={styles.input}
            value={name}
          />
        </View>

        {/* Type Picker */}
        <View style={styles.field}>
          <Text style={styles.label}>Type *</Text>
          <View style={styles.typeGrid}>
            {petTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setSelectedTypeId(type.id)}
                style={[
                  styles.typeChip,
                  selectedTypeId === type.id && styles.typeChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    selectedTypeId === type.id && styles.typeChipTextSelected,
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Breed */}
        <View style={styles.field}>
          <Text style={styles.label}>Breed (optional)</Text>
          <TextInput
            autoCapitalize="words"
            onChangeText={setBreed}
            placeholder="e.g. Golden Retriever"
            placeholderTextColor={theme.colors.mutedForeground}
            style={styles.input}
            value={breed}
          />
        </View>

        {/* Photos (only for existing pets) */}
        {!isNew && (
          <View style={styles.field}>
            <Text style={styles.label}>
              Photos ({photos.length}/{MAX_PET_PHOTOS})
            </Text>
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoSlotWrapper}>
                  <Image
                    source={{ uri: photo.url }}
                    style={styles.photoImage}
                  />
                  <TouchableOpacity
                    onPress={() => handleDeletePhoto(photo.id)}
                    style={styles.removePhotoButton}
                  >
                    <Ionicons
                      name="close-circle"
                      size={22}
                      color={theme.colors.destructive}
                    />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < MAX_PET_PHOTOS && (
                <TouchableOpacity
                  disabled={isUploadingPhoto}
                  onPress={handlePickPhoto}
                  style={styles.addPhotoSlot}
                >
                  {isUploadingPhoto ? (
                    <ActivityIndicator color={theme.colors.mutedForeground} />
                  ) : (
                    <Ionicons
                      name="add"
                      size={28}
                      color={theme.colors.mutedForeground}
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          disabled={!isValid || isSaving}
          fullWidth
          loading={isSaving}
          onPress={handleSave}
          size="lg"
        >
          {isNew ? 'Add Pet' : 'Save Changes'}
        </Button>
      </View>
    </ScreenContainer>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    addPhotoSlot: {
      alignItems: 'center',
      backgroundColor: theme.colors.muted,
      borderRadius: theme.borderRadius.lg,
      height: 100,
      justifyContent: 'center',
      width: 100,
    },
    field: {
      marginBottom: theme.spacing.lg,
    },
    footer: {
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    headerSpacer: {
      width: 28,
    },
    headerTitle: {
      fontSize: 18,
    },
    input: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      color: theme.colors.foreground,
      fontSize: 16,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    label: {
      color: theme.colors.foreground,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    photoImage: {
      borderRadius: theme.borderRadius.lg,
      height: 100,
      width: 100,
    },
    photoSlotWrapper: {
      position: 'relative',
    },
    removePhotoButton: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      position: 'absolute',
      right: 4,
      top: 4,
    },
    scrollContent: {
      paddingBottom: theme.spacing.lg,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
    },
    typeChip: {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    typeChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    typeChipText: {
      color: theme.colors.foreground,
      fontSize: 14,
    },
    typeChipTextSelected: {
      color: theme.colors.primaryForeground,
      fontWeight: '600',
    },
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
  });
}
