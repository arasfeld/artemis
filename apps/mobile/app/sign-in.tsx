import { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, spacing, Text } from '@artemis/ui';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';

export default function SignInScreen() {
  const { clearError, error, isLoading, isAuthenticated, signInWithGoogle } =
    useAppAuth();
  const { navigate, destination } = useOnboardingFlow();

  // Redirect authenticated users to the appropriate screen
  useEffect(() => {
    if (isAuthenticated) {
      navigate();
    }
  }, [isAuthenticated, navigate, destination]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Sign In Error', error, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [clearError, error]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text variant="title" center>
          Artemis
        </Text>
        <Text variant="subtitle" center>
          Dating for Animal Lovers
        </Text>
      </View>

      <Button
        disabled={isLoading}
        loading={isLoading}
        onPress={signInWithGoogle}
        size="lg"
      >
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
