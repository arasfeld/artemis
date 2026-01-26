import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ScreenContainer, spacing, Text } from '@artemis/ui';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  const handleJoin = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <ScreenContainer centered>
      <View style={styles.content}>
        <Text variant="title" center>
          Artemis
        </Text>
        <Text variant="subtitle" center>
          Dating for Animal Lovers
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button onPress={handleJoin} fullWidth>
          Join Artemis
        </Button>
        <View style={styles.spacer} />
        <Button variant="secondary" onPress={handleSignIn} fullWidth>
          Sign In
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  buttons: {
    paddingBottom: spacing.xl,
    width: '100%',
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
