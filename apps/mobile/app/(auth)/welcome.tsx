import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, spacing, Text } from '@artemis/ui';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

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

      <View style={styles.buttons}>
        <Button fullWidth onPress={handleSignIn} size="lg">
          Join Artemis
        </Button>
        <View style={styles.spacer} />
        <Button fullWidth onPress={handleSignIn} size="lg" variant="outline">
          Sign In
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttons: {
    width: '100%',
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  spacer: {
    height: spacing.md,
  },
});
