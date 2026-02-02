import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
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
    <LinearGradient colors={['#83b59c', '#4f685b']} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Artemis</Text>
        <Text style={styles.subtitle}>Dating for Animal Lovers</Text>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={signInWithGoogle}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 3,
    paddingHorizontal: 40,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#4f685b',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    marginBottom: 60,
  },
  title: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
