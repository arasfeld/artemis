import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  return (
    <LinearGradient colors={['#83b59c', '#4f685b']} style={styles.background}>
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    alignItems: 'center',
    backgroundColor: '#83b59c',
    flex: 1,
    justifyContent: 'center',
  },
});
