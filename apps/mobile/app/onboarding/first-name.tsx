import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  Text,
  TextInput,
  Button,
  ProgressIndicator,
  spacing,
} from '@artemis/ui';
import { useOnboarding } from '../../context/OnboardingContext';
import { useSafeBack } from '../../hooks/useOnboardingFlow';

export default function FirstNameScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/onboarding/first-name');
  const { data, updateData, setCurrentStep, totalSteps } = useOnboarding();
  const [firstName, setFirstName] = useState(data.firstName);
  const [error, setError] = useState('');

  const isValid = firstName.trim().length >= 2;

  const handleContinue = () => {
    if (!isValid) {
      setError('Name must be at least 2 characters');
      return;
    }
    updateData({ firstName: firstName.trim() });
    setCurrentStep(2);
    router.push('/onboarding/location');
  };

  return (
    <ScreenContainer onBack={safeBack}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ProgressIndicator currentStep={1} totalSteps={totalSteps} />

        <View style={styles.content}>
          <Text variant="title" center>
            What's your first name?
          </Text>
          <Text variant="subtitle" center>
            This is how you'll appear on Artemis
          </Text>

          <TextInput
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              setError('');
            }}
            placeholder="First name"
            autoCapitalize="words"
            autoFocus
            error={error}
          />
        </View>

        <View style={styles.footer}>
          <Button onPress={handleContinue} disabled={!isValid} fullWidth>
            Continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});
