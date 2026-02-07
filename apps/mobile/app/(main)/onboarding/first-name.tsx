import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  ProgressIndicator,
  ScreenContainer,
  Text,
  TextInput,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';

export default function FirstNameScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, setCurrentStep, totalSteps, updateData } = useAppOnboarding();
  const [firstName, setFirstName] = useState(data.firstName || '');
  const [error, setError] = useState('');

  const isValid = firstName.trim().length >= 2;

  const handleContinue = () => {
    if (!isValid) {
      setError('Name must be at least 2 characters');
      return;
    }
    updateData({ firstName: firstName.trim() });
    setCurrentStep(2);
    router.push('/(main)/onboarding/location');
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ProgressIndicator currentStep={1} totalSteps={totalSteps} />

        <View style={styles.content}>
          <Text variant="title" center>
            What&apos;s your first name?
          </Text>
          <Text variant="subtitle" center>
            This is how you&apos;ll appear on Artemis
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
          <Button
            disabled={!isValid}
            fullWidth
            onPress={handleContinue}
            size="lg"
          >
            Continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    footer: {
      paddingBottom: theme.spacing.xl,
    },
  });
}
