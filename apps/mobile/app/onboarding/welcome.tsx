import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer, Text, Button, spacing } from '@artemis/ui';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleJoin = () => {
    router.push('/onboarding/first-name');
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttons: {
    width: '100%',
    paddingBottom: spacing.xl,
  },
  spacer: {
    height: spacing.md,
  },
});
