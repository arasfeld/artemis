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
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { useGetRelationshipTypesQuery } from '@/store/api/apiSlice';
import { RelationshipTypeData } from '@/types/api';

export default function RelationshipScreen() {
  const router = useRouter();
  const handleBack = () => {
    router.replace('/(main)/onboarding/date-of-birth');
  };
  const { data, setCurrentStep, totalSteps, updateData } = useAppOnboarding();
  const [relationshipTypes, setRelationshipTypes] = useState<
    string[] | undefined
  >(data.relationshipTypes);

  const { data: options = [] } = useGetRelationshipTypesQuery();

  const isValid = (relationshipTypes && relationshipTypes.length > 0) ?? false;

  const handleContinue = () => {
    if (!isValid) return;

    updateData({ relationshipTypes });
    setCurrentStep(6);
    router.push('/(main)/onboarding/age-range');
  };

  return (
    <ScreenContainer onBack={handleBack}>
      <ProgressIndicator currentStep={5} totalSteps={totalSteps} />

      <View style={styles.content}>
        <Text variant="title" center>
          What are you looking for?
        </Text>
        <Text variant="subtitle" center>
          This helps us find better matches for you
        </Text>

        <View style={styles.optionList}>
          {options.map((option: RelationshipTypeData) => {
            const selected = relationshipTypes?.includes(option.id) ?? false;
            return (
              <OptionCard
                key={option.id}
                title={option.name}
                subtitle={option.description}
                selected={selected}
                onPress={() => {
                  const next = new Set(relationshipTypes || []);
                  if (next.has(option.id)) {
                    next.delete(option.id);
                  } else {
                    next.add(option.id);
                  }
                  setRelationshipTypes(Array.from(next));
                }}
              />
            );
          })}
        </View>
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
