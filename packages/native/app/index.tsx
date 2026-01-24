import { StyleSheet, Text, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Use setTimeout to ensure navigation happens after mount
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/home');
      } else {
        router.replace('/auth');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, router]);

  return (
    <LinearGradient colors={['#83b59c', '#4f685b']} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Artemis</Text>
        <ActivityIndicator size="large" color="white" style={styles.spinner} />
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
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
});
