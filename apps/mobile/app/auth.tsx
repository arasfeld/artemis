import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, error, signInWithGoogle, clearError } =
    useAuth();

  // Redirect to home when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, router]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Sign In Error', error, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [error, clearError]);

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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 60,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f685b',
  },
});
