import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  Text,
  Button,
  ProgressIndicator,
  OptionCard,
  spacing,
} from '@artemis/ui';
import { useOnboarding } from '../../context/OnboardingContext';
import { useSafeBack } from '../../hooks/useOnboardingFlow';
import type { RelationshipType } from '../../types/onboarding';

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string; subtitle: string }[] = [
  {
    value: 'serious',
    label: 'Something serious',
    subtitle: 'Looking for a long-term relationship',
  },
  {
    value: 'casual',
    label: 'Something casual',
    subtitle: 'Open to seeing where things go',
  },
  {
    value: 'friendship',
    label: 'New friends',
    subtitle: 'Just looking to meet new people',
  },
  {
    value: 'unsure',
    label: "I'm not sure yet",
    subtitle: "Still figuring out what I'm looking for",
  },
];

export default function RelationshipScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/onboarding/relationship');
  const { data, updateData, setCurrentStep, totalSteps } = useOnboarding();
  const [relationshipType, setRelationshipType] = useState<RelationshipType | null>(
    data.relationshipType
  );

  const isValid = relationshipType !== null;

  const handleContinue = () => {
    if (!isValid) return;

    updateData({ relationshipType });
    setCurrentStep(6);
    router.push('/onboarding/age-range');
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
  optionList: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});
