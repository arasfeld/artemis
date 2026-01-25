import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  Text,
  Button,
  ProgressIndicator,
  OptionCard,
  spacing,
} from '@artemis/ui';
import { useAppOnboarding } from '../../hooks/useAppOnboarding';
import { useSafeBack } from '../../hooks/useOnboardingFlow';
import type { Gender, Seeking } from '../../types/onboarding';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Man' },
  { value: 'female', label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' },
];

const SEEKING_OPTIONS: { value: Seeking; label: string }[] = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'everyone', label: 'Everyone' },
];

export default function GenderScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/onboarding/gender');
  const { data, updateData, setCurrentStep, totalSteps } = useAppOnboarding();
  const [gender, setGender] = useState<Gender | null>(data.gender);
  const [seeking, setSeeking] = useState<Seeking | null>(data.seeking);

  const isValid = gender !== null && seeking !== null;

  const handleContinue = () => {
    if (!isValid) return;

    updateData({ gender, seeking });
    setCurrentStep(4);
    router.push('/onboarding/date-of-birth');
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  optionList: {
    gap: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
