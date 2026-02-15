import { useCallback, useMemo } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  ScreenContainer,
  Text,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { useDeletePetMutation, useGetPetsQuery } from '@/store/api/apiSlice';

export default function EditPetsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: pets = [] } = useGetPetsQuery();
  const [deletePet] = useDeletePetMutation();

  const handleDeletePet = useCallback(
    (petId: string, petName: string) => {
      Alert.alert('Delete Pet', `Are you sure you want to remove ${petName}?`, [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: () => deletePet(petId),
          style: 'destructive',
          text: 'Delete',
        },
      ]);
    },
    [deletePet]
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={theme.colors.foreground} />
        </TouchableOpacity>
        <Text variant="title" style={styles.headerTitle}>
          My Pets
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {pets.map((pet) => (
          <View key={pet.id} style={styles.petItem}>
            <TouchableOpacity
              style={styles.petContent}
              onPress={() => router.push(`/(main)/pet/${pet.id}`)}
              activeOpacity={0.7}
            >
              {pet.photos.length > 0 ? (
                <Image
                  source={{ uri: pet.photos[0].url }}
                  style={styles.petThumbnail}
                />
              ) : (
                <View style={styles.petThumbnailPlaceholder}>
                  <Ionicons
                    name="paw"
                    size={24}
                    color={theme.colors.mutedForeground}
                  />
                </View>
              )}
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petType}>{pet.petType.name}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.mutedForeground}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeletePet(pet.id, pet.name)}
              style={styles.deleteButton}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={theme.colors.destructive}
              />
            </TouchableOpacity>
          </View>
        ))}

        {pets.length < 5 && (
          <Button
            fullWidth
            onPress={() => router.push('/(main)/pet/new')}
            size="lg"
            variant="outline"
          >
            Add a Pet
          </Button>
        )}
      </View>
    </ScreenContainer>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      flex: 1,
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    deleteButton: {
      padding: theme.spacing.sm,
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
    petContent: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    petInfo: {
      flex: 1,
    },
    petItem: {
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      padding: theme.spacing.md,
    },
    petName: {
      color: theme.colors.foreground,
      fontSize: 16,
      fontWeight: '600',
    },
    petThumbnail: {
      borderRadius: theme.borderRadius.md,
      height: 56,
      width: 56,
    },
    petThumbnailPlaceholder: {
      alignItems: 'center',
      backgroundColor: theme.colors.muted,
      borderRadius: theme.borderRadius.md,
      height: 56,
      justifyContent: 'center',
      width: 56,
    },
    petType: {
      color: theme.colors.mutedForeground,
      fontSize: 14,
      marginTop: 2,
    },
  });
}
