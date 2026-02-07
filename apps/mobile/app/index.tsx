import { StyleSheet, Text, ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';

export default function Index() {
  const { isLoading, navigate, destination } = useOnboardingFlow();

  useEffect(() => {
    if (isLoading) return;

    // Use setTimeout to ensure navigation happens after mount
    const timer = setTimeout(() => {
      navigate();
    }, 0);

    return () => clearTimeout(timer);
  }, [isLoading, navigate, destination]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Artemis</Text>
      <ActivityIndicator size="large" color="white" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
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
