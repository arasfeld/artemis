import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  Checkbox,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
  ProgressIndicator,
  ScreenContainer,
  Text,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { useGetRelationshipTypesQuery } from '@/store/api/apiSlice';
import { RelationshipTypeData } from '@/types/api';

export default function RelationshipScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const handleBack = () => {
    router.replace('/(main)/onboarding/date-of-birth');
  };
  const { data, setCurrentStep, totalSteps, updateData } = useAppOnboarding();
  const [relationshipTypes, setRelationshipTypes] = useState<
    string[] | undefined
  >(data.relationshipTypes);

  const { data: options = [] } = useGetRelationshipTypesQuery();

  const isValid = (relationshipTypes && relationshipTypes.length > 0) ?? false;

  const handleToggle = useCallback(
    (optionId: string) => {
      const next = new Set(relationshipTypes || []);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      setRelationshipTypes(Array.from(next));
    },
    [relationshipTypes]
  );

  const handleContinue = useCallback(() => {
    if (!isValid) return;

    updateData({ relationshipTypes });
    setCurrentStep(6);
    router.push('/(main)/onboarding/age-range');
  }, [isValid, relationshipTypes, updateData, setCurrentStep, router]);

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

        <ItemGroup style={styles.optionList}>
          {options.map((option: RelationshipTypeData) => {
            const selected = relationshipTypes?.includes(option.id) ?? false;

            return (
              <Item asChild key={option.id} variant="outline">
                <Pressable onPress={() => handleToggle(option.id)}>
                  <ItemContent>
                    <ItemTitle>{option.name}</ItemTitle>
                    {option.description ? (
                      <ItemDescription>{option.description}</ItemDescription>
                    ) : null}
                  </ItemContent>
                  <ItemActions>
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => handleToggle(option.id)}
                    />
                  </ItemActions>
                </Pressable>
              </Item>
            );
          })}
        </ItemGroup>
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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.md,
    },
    footer: {
      paddingBottom: theme.spacing.xl,
    },
    optionList: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.xl,
    },
  });
}
