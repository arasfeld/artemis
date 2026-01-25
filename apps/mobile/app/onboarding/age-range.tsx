import { useState } from "react";
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useRouter } from "expo-router";
import {
  ScreenContainer,
  Text,
  Button,
  ProgressIndicator,
  TextInput,
  spacing,
} from "@artemis/ui";
import { useAppOnboarding } from "@/hooks/useAppOnboarding";
import { useSafeBack } from "@/hooks/useOnboardingFlow";

const MIN_AGE = 18;
const MAX_AGE = 99;

export default function AgeRangeScreen() {
  const router = useRouter();
  const safeBack = useSafeBack("/onboarding/age-range");
  const { data, updateData, setCurrentStep, totalSteps } = useAppOnboarding();
  const [minAge, setMinAge] = useState(data.ageRange.min.toString());
  const [maxAge, setMaxAge] = useState(data.ageRange.max.toString());

  const handleMinChange = (value: string) => {
    // Allow empty input or valid numbers
    if (value === '') {
      setMinAge('');
      return;
    }
    
    const newMin = parseInt(value);
    // Only update if it's a valid number within bounds
    if (!isNaN(newMin) && newMin >= MIN_AGE && newMin <= MAX_AGE) {
      setMinAge(newMin.toString());
    }
  };

  const handleMaxChange = (value: string) => {
    // Allow empty input or valid numbers
    if (value === '') {
      setMaxAge('');
      return;
    }
    
    const newMax = parseInt(value);
    // Only update if it's a valid number within bounds
    if (!isNaN(newMax) && newMax >= MIN_AGE && newMax <= MAX_AGE) {
      setMaxAge(newMax.toString());
    }
  };

  const handleContinue = () => {
    const min = parseInt(minAge) || MIN_AGE;
    const max = parseInt(maxAge) || MAX_AGE;
    updateData({ ageRange: { min, max } });
    setCurrentStep(7);
    router.push("/onboarding/photos");
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
                keyboardType="numeric"
                placeholder={`${MIN_AGE}`}
                maxLength={2}
                style={styles.ageInput}
                returnKeyType="next"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text variant="label">Maximum age</Text>
              <TextInput
                value={maxAge}
                onChangeText={handleMaxChange}
                keyboardType="numeric"
                placeholder={`${MAX_AGE}`}
                maxLength={2}
                style={styles.ageInput}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  rangeDisplay: {
    marginTop: spacing["2xl"],
    marginBottom: spacing.xl,
  },
  rangeText: {
    fontSize: 56,
    marginBottom: 0,
  },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  inputWrapper: {
    flex: 1,
  },
  ageInput: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});
