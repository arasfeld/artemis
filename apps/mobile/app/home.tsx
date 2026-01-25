import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useOnboardingFlow } from '../hooks/useOnboardingFlow';

export default function HomeScreen() {
  const { isLoading, user, signOut } = useAuth();
  const { reset: resetOnboarding } = useOnboarding();
  const { isAuthenticated, navigate } = useOnboardingFlow();

  // Redirect based on flow state if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate();
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSignOut = async () => {
    await signOut();
    resetOnboarding();
  };

  if (isLoading || !user) {
    return (
      <LinearGradient colors={['#83b59c', '#4f685b']} style={styles.background}>
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#83b59c', '#4f685b']} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome!</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Profile</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>User ID:</Text>
            <Text style={styles.value}>{user.id.slice(0, 8)}...</Text>
          </View>
          {user.username && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Username:</Text>
              <Text style={styles.value}>@{user.username}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Member since:</Text>
            <Text style={styles.value}>
              {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  loadingText: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  welcome: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  signOutButton: {
    marginTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
