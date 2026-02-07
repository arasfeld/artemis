import { Alert, StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { Button, spacing, Text } from '@artemis/ui';
import { useAppAuth } from '@/hooks/useAppAuth';

export default function SignInScreen() {
  const { clearError, error, isLoading, signInWithGoogle } = useAppAuth();

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Sign In Error', error, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [clearError, error]);

  return (
    <View style={styles.container}>
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
    </View>
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
