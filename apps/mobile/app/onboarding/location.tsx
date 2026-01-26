import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
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
import { getCurrentLocation } from '../../utils/location';

export default function LocationScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/onboarding/location');
  const { updateData, setCurrentStep, totalSteps } = useAppOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableLocation = async () => {
    setIsLoading(true);
    
    try {
      const locationResult = await getCurrentLocation();
      
      if (locationResult) {
        updateData({
          location: {
            type: 'automatic',
            coordinates: locationResult.coordinates,
            country: locationResult.country,
            zipCode: locationResult.zipCode,
          },
        });
        setCurrentStep(3);
        router.push('/onboarding/gender');
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your location. Please make sure location services are enabled and try again.',
          [
            {
              text: 'Try Again',
              onPress: handleEnableLocation,
            },
            {
              text: 'Enter Manually',
              onPress: handleEnterManually,
            },
          ]
        );
      }
    } catch {
      Alert.alert(
        'Location Error',
        'Failed to access location services. Please enable location permissions and try again.',
        [
          {
            text: 'Try Again',
            onPress: handleEnableLocation,
          },
          {
            text: 'Enter Manually',
            onPress: handleEnterManually,
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
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
        <Button onPress={handleEnableLocation} fullWidth disabled={isLoading}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.loadingText}>
                Getting Location...
              </Text>
            </View>
          ) : (
            'Enable Location Services'
          )}
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.white,
  },
});
