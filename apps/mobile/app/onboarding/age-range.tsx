import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import {
  ScreenContainer,
  Text,
  Button,
  ProgressIndicator,
  colors,
  spacing,
} from '@artemis/ui';
import { useOnboarding } from '../../context/OnboardingContext';
import { useSafeBack } from '../../hooks/useOnboardingFlow';

const MIN_AGE = 18;
const MAX_AGE = 99;

export default function AgeRangeScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/onboarding/age-range');
  const { data, updateData, setCurrentStep, totalSteps } = useOnboarding();
  const [minAge, setMinAge] = useState(data.ageRange.min);
  const [maxAge, setMaxAge] = useState(data.ageRange.max);

  const handleMinChange = (value: number) => {
    const newMin = Math.round(value);
    if (newMin <= maxAge) {
      setMinAge(newMin);
    }
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.round(value);
    if (newMax >= minAge) {
      setMaxAge(newMax);
    }
  };

  const handleContinue = () => {
    updateData({ ageRange: { min: minAge, max: maxAge } });
    setCurrentStep(7);
    router.push('/onboarding/photos');
  };

  return (
    <ScreenContainer onBack={safeBack}>
      <ProgressIndicator currentStep={6} totalSteps={totalSteps} />

      <View style={styles.content}>
        <Text variant="title" center>
          Age preferences
        </Text>
        <Text variant="subtitle" center>
          What age range are you interested in?
        </Text>

        <View style={styles.rangeDisplay}>
          <Text variant="title" center style={styles.rangeText}>
            {minAge} - {maxAge}
          </Text>
          <Text variant="muted" center>
            years old
          </Text>
        </View>

        <View style={styles.sliderContainer}>
          <Text variant="label">Minimum age: {minAge}</Text>
          <Slider
            style={styles.slider}
            minimumValue={MIN_AGE}
            maximumValue={MAX_AGE}
            value={minAge}
            onValueChange={handleMinChange}
            minimumTrackTintColor={colors.white}
            maximumTrackTintColor={colors.border.onDark}
            thumbTintColor={colors.white}
          />
        </View>

        <View style={styles.sliderContainer}>
          <Text variant="label">Maximum age: {maxAge}</Text>
          <Slider
            style={styles.slider}
            minimumValue={MIN_AGE}
            maximumValue={MAX_AGE}
            value={maxAge}
            onValueChange={handleMaxChange}
            minimumTrackTintColor={colors.white}
            maximumTrackTintColor={colors.border.onDark}
            thumbTintColor={colors.white}
          />
        </View>
      </View>

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
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  rangeText: {
    fontSize: 56,
    marginBottom: 0,
  },
  sliderContainer: {
    marginTop: spacing.xl,
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});
