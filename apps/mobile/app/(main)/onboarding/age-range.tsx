import { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  ProgressIndicator,
  ScreenContainer,
  spacing,
  Text,
  TextInput,
} from '@artemis/ui';
import { useAppOnboarding } from '../../../hooks/useAppOnboarding';
import { useSafeBack } from '../../../hooks/useOnboardingFlow';

const MIN_AGE = 18;
const MAX_AGE = 99;

export default function AgeRangeScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/(main)/onboarding/age-range');
  const { data, setCurrentStep, totalSteps, updateData } = useAppOnboarding();
  const [minAge, setMinAge] = useState(data.ageRange.min.toString());
  const [maxAge, setMaxAge] = useState(data.ageRange.max.toString());

  const handleMinChange = (value: string) => {
    // Allow empty input
    if (value === '') {
      setMinAge('');
      return;
    }

    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    setMinAge(numericValue);
  };

  const handleMaxChange = (value: string) => {
    // Allow empty input
    if (value === '') {
      setMaxAge('');
      return;
    }

    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    setMaxAge(numericValue);
  };

  const handleContinue = () => {
    const min = parseInt(minAge) || MIN_AGE;
    const max = parseInt(maxAge) || MAX_AGE;

    // Validate that min is less than max
    if (min >= max) {
      // You could show an alert here, but for now just swap them
      updateData({
        ageRange: { max: Math.max(min, max), min: Math.min(min, max) },
      });
    } else {
      updateData({ ageRange: { max, min } });
    }

    setCurrentStep(7);
    router.push('/(main)/onboarding/photos');
  };

  return (
    <ScreenContainer onBack={safeBack}>
      <ProgressIndicator currentStep={6} totalSteps={totalSteps} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Text variant="title" center>
            Age preferences
          </Text>
          <Text variant="subtitle" center>
            What age range are you interested in?
          </Text>

          <View style={styles.rangeDisplay}>
            <Text variant="title" center style={styles.rangeText}>
              {minAge || MIN_AGE} - {maxAge || MAX_AGE}
            </Text>
            <Text variant="muted" center>
              years old
            </Text>
          </View>

          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <Text variant="label">Minimum age</Text>
              <TextInput
                value={minAge}
                onChangeText={handleMinChange}
                keyboardType="number-pad"
                placeholder={`${MIN_AGE}`}
                maxLength={2}
                style={styles.ageInput}
                returnKeyType="next"
                onSubmitEditing={Keyboard.dismiss}
                showSoftInputOnFocus={true}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text variant="label">Maximum age</Text>
              <TextInput
                value={maxAge}
                onChangeText={handleMaxChange}
                keyboardType="number-pad"
                placeholder={`${MAX_AGE}`}
                maxLength={2}
                style={styles.ageInput}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                showSoftInputOnFocus={true}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.footer}>
        <Button onPress={handleContinue} fullWidth>
          Continue
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  ageInput: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
  inputWrapper: {
    flex: 1,
  },
  inputsContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  rangeDisplay: {
    marginBottom: spacing.xl,
    marginTop: spacing['2xl'],
  },
  rangeText: {
    fontSize: 56,
    marginBottom: 0,
  },
});
