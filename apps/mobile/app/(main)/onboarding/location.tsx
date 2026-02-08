import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
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
import { getCurrentLocation } from '@/lib/location';

export default function LocationScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const handleBack = () => {
    router.replace('/(main)/onboarding/first-name');
  };
  const { setCurrentStep, totalSteps, updateData } = useAppOnboarding();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableLocation = async () => {
    setIsLoading(true);

    try {
      const locationResult = await getCurrentLocation();

      if (locationResult) {
        updateData({
          location: {
            city: locationResult.city,
            coordinates: locationResult.coordinates,
            country: locationResult.country,
            isoCountryCode: locationResult.isoCountryCode,
            region: locationResult.region,
            type: 'automatic',
            zipCode: locationResult.zipCode,
          },
        });
        setCurrentStep(3);
        router.push('/(main)/onboarding/gender');
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your location. Please make sure location services are enabled and try again.',
          [
            {
              onPress: handleEnableLocation,
              text: 'Try Again',
            },
            {
              onPress: handleEnterManually,
              text: 'Enter Manually',
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
            onPress: handleEnableLocation,
            text: 'Try Again',
          },
          {
            onPress: handleEnterManually,
            text: 'Enter Manually',
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnterManually = () => {
    router.push('/(main)/onboarding/manual-location');
  };

  return (
    <ScreenContainer onBack={handleBack}>
      <ProgressIndicator currentStep={2} totalSteps={totalSteps} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="location" size={64} color={theme.colors.foreground} />
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
        <Button
          disabled={isLoading}
          fullWidth
          loading={isLoading}
          onPress={handleEnableLocation}
          size="lg"
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.white} />
              <Text style={styles.loadingText}>Getting Location...</Text>
            </View>
          ) : (
            'Enable Location Services'
          )}
        </Button>
        <View style={styles.linkContainer}>
          <Button onPress={handleEnterManually} variant="link">
            Enter location manually instead
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    description: {
      marginTop: theme.spacing.md,
      opacity: 0.9,
      paddingHorizontal: theme.spacing.lg,
    },
    footer: {
      paddingBottom: theme.spacing.xl,
    },
    iconContainer: {
      marginBottom: theme.spacing.lg,
    },
    linkContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    loadingContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
    },
    loadingText: {
      color: theme.colors.white,
    },
  });
}
