import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppAuth } from '../../../hooks/useAppAuth';
import { useAppOnboarding } from '../../../hooks/useAppOnboarding';

export default function ProfileScreen() {
  const { isLoading, signOut, user } = useAppAuth();
  const { reset: resetOnboarding } = useAppOnboarding();

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
        <Text style={styles.welcome}>Your Profile</Text>
        <Text style={styles.email}>{user.email}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Info</Text>
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
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 4,
    maxWidth: 400,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: '100%',
  },
  cardTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    padding: 20,
    paddingTop: 80,
  },
  email: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    marginBottom: 40,
  },
  infoRow: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    color: '#666',
    fontSize: 14,
  },
  loadingText: {
    color: 'white',
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 25,
    borderWidth: 1,
    marginTop: 40,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  welcome: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
