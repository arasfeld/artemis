import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenContainer,
  Text,
  Button,
  LinkText,
  ProgressIndicator,
  colors,
  spacing,
} from '@artemis/ui';
import { useAppOnboarding } from '../../hooks/useAppOnboarding';
import { useSafeBack } from '../../hooks/useOnboardingFlow';

export default function LocationScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/onboarding/location');
  const { updateData, setCurrentStep, totalSteps } = useAppOnboarding();

  const handleEnableLocation = async () => {
    // Stub: In a real app, request location permissions here
    Alert.alert(
      'Location Services',
      'This would request location permissions. For now, we\'ll simulate success.',
      [
        {
          text: 'OK',
          onPress: () => {
            updateData({
              location: {
                type: 'automatic',
                coordinates: { lat: 37.7749, lng: -122.4194 },
              },
            });
            setCurrentStep(3);
            router.push('/onboarding/gender');
          },
        },
      ]
    );
  };

  const handleEnterManually = () => {
    router.push('/onboarding/manual-location');
  };

  return (
    <ScreenContainer onBack={safeBack}>
      <ProgressIndicator currentStep={2} totalSteps={totalSteps} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={64} color={colors.white} />
        </View>

        <Text variant="title" center>
          Enable Location
        </Text>
        <Text variant="body" center style={styles.description}>
          We use your location to show you potential matches nearby. Your exact
          location is never shared with other users.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button onPress={handleEnableLocation} fullWidth>
          Enable Location Services
        </Button>
        <View style={styles.linkContainer}>
          <LinkText onPress={handleEnterManually}>
            Enter location manually instead
          </LinkText>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  description: {
    marginTop: spacing.md,
    opacity: 0.9,
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
});
