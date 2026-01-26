import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScreenContainer, Text, Button, spacing } from '@artemis/ui';
import { useAppAuth } from '../../hooks/useAppAuth';
import { useOnboardingFlow } from '../../hooks/useOnboardingFlow';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppAuth();
  const { navigate } = useOnboardingFlow();

  // Redirect authenticated users away from welcome screen
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate();
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleJoin = () => {
    router.push('/onboarding/first-name');
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <ScreenContainer centered>
        <View style={styles.content}>
          <Text variant="title" center>
            Artemis
          </Text>
          <Text variant="subtitle" center>
            Dating for Animal Lovers
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Don't render welcome screen if authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <ScreenContainer centered>
      <View style={styles.content}>
        <Text variant="title" center>
          Artemis
        </Text>
        <Text variant="subtitle" center>
          Dating for Animal Lovers
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button onPress={handleJoin} fullWidth>
          Join Artemis
        </Button>
        <View style={styles.spacer} />
        <Button variant="secondary" onPress={handleSignIn} fullWidth>
          Sign In
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    width: '100%',
    paddingBottom: spacing.xl,
  },
  spacer: {
    height: spacing.md,
  },
});
