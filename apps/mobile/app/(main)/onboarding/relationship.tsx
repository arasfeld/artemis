import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import type { RelationshipType } from '../../../types/onboarding';

const RELATIONSHIP_OPTIONS: {
  label: string;
  subtitle: string;
  value: RelationshipType;
}[] = [
  {
    label: 'Something serious',
    subtitle: 'Looking for a long-term relationship',
    value: 'serious',
  },
  {
    label: 'Something casual',
    subtitle: 'Open to seeing where things go',
    value: 'casual',
  },
  {
    label: 'New friends',
    subtitle: 'Just looking to meet new people',
    value: 'friendship',
  },
  {
    label: "I'm not sure yet",
    subtitle: "Still figuring out what I'm looking for",
    value: 'unsure',
  },
];

export default function RelationshipScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/(main)/onboarding/relationship');
  const { data, setCurrentStep, totalSteps, updateData } = useAppOnboarding();
  const [relationshipType, setRelationshipType] =
    useState<RelationshipType | null>(data.relationshipType);

  const isValid = relationshipType !== null;

  const handleContinue = () => {
    if (!isValid) return;

    updateData({ relationshipType });
    setCurrentStep(6);
    router.push('/(main)/onboarding/age-range');
  };

  return (
    <ScreenContainer onBack={safeBack}>
      <ProgressIndicator currentStep={5} totalSteps={totalSteps} />

      <View style={styles.content}>
        <Text variant="title" center>
          What are you looking for?
        </Text>
        <Text variant="subtitle" center>
          This helps us find better matches for you
        </Text>

        <View style={styles.optionList}>
          {RELATIONSHIP_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              title={option.label}
              subtitle={option.subtitle}
              selected={relationshipType === option.value}
              onPress={() => setRelationshipType(option.value)}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button onPress={handleContinue} disabled={!isValid} fullWidth>
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
  footer: {
    paddingBottom: spacing.xl,
  },
  optionList: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
