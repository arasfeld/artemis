import { useCallback, useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  ProgressIndicator,
  ScreenContainer,
  Text,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { useGetPetsQuery } from '@/store/api/apiSlice';

export default function PetsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { totalSteps } = useAppOnboarding();
  const { data: pets = [] } = useGetPetsQuery();

  const handleAddPet = useCallback(() => {
    router.push('/(main)/pet/new');
  }, [router]);

  const handleFinish = useCallback(() => {
    router.replace('/(main)/(tabs)');
  }, [router]);

  return (
    <ScreenContainer>
      <ProgressIndicator currentStep={8} totalSteps={totalSteps} />

      <View style={styles.content}>
        <Text variant="title" center>
          Do you have any pets?
        </Text>
        <Text variant="subtitle" center>
          Show off your furry (or scaly) friends
        </Text>

        {pets.length > 0 && (
          <View style={styles.petList}>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petItem}
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
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPet}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
          <Text style={styles.addButtonText}>Add a Pet</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Button fullWidth onPress={handleFinish} size="lg">
          {pets.length > 0 ? 'Finish' : 'Skip'}
        </Button>
      </View>
    </ScreenContainer>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    addButton: {
      alignItems: 'center',
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.lg,
      borderStyle: 'dashed',
      borderWidth: 2,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    addButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
    },
    footer: {
      paddingBottom: theme.spacing.xl,
    },
    petInfo: {
      flex: 1,
    },
    petItem: {
      alignItems: 'center',
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
      gap: theme.spacing.md,
      padding: theme.spacing.md,
    },
    petList: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xl,
    },
    petName: {
      color: theme.colors.foreground,
      fontSize: 16,
      fontWeight: '600',
    },
    petThumbnail: {
      borderRadius: theme.borderRadius.md,
      height: 48,
      width: 48,
    },
    petThumbnailPlaceholder: {
      alignItems: 'center',
      backgroundColor: theme.colors.muted,
      borderRadius: theme.borderRadius.md,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    petType: {
      color: theme.colors.mutedForeground,
      fontSize: 14,
      marginTop: 2,
    },
  });
}
