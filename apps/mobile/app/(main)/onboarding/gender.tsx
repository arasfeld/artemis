import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  OptionCard,
  ProgressIndicator,
  ScreenContainer,
  spacing,
  Text,
} from '@artemis/ui';
import { useAppOnboarding } from '../../../hooks/useAppOnboarding';
import { useSafeBack } from '../../../hooks/useOnboardingFlow';
import type { Gender, Seeking } from '../../../types/onboarding';

const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: 'Man', value: 'male' },
  { label: 'Woman', value: 'female' },
  { label: 'Non-binary', value: 'non-binary' },
];

const SEEKING_OPTIONS: { label: string; value: Seeking }[] = [
  { label: 'Men', value: 'male' },
  { label: 'Women', value: 'female' },
  { label: 'Everyone', value: 'everyone' },
];

export default function GenderScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/(main)/onboarding/gender');
  const { data, setCurrentStep, totalSteps, updateData } = useAppOnboarding();
  const [gender, setGender] = useState<Gender | null>(data.gender);
  const [seeking, setSeeking] = useState<Seeking | null>(data.seeking);

  const isValid = gender !== null && seeking !== null;

  const handleContinue = () => {
    if (!isValid) return;

    updateData({ gender, seeking });
    setCurrentStep(4);
    router.push('/(main)/onboarding/date-of-birth');
  };

  return (
    <ScreenContainer onBack={safeBack}>
      <ProgressIndicator currentStep={3} totalSteps={totalSteps} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="title" center>
          About you
        </Text>

        <View style={styles.section}>
          <Text variant="label" style={styles.sectionLabel}>
            I am a...
          </Text>
          <View style={styles.optionList}>
            {GENDER_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                title={option.label}
                selected={gender === option.value}
                onPress={() => setGender(option.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="label" style={styles.sectionLabel}>
            Seeking...
          </Text>
          <View style={styles.optionList}>
            {SEEKING_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                title={option.label}
                selected={seeking === option.value}
                onPress={() => setSeeking(option.value)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={handleContinue} disabled={!isValid} fullWidth>
          Continue
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  optionList: {
    gap: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
});
