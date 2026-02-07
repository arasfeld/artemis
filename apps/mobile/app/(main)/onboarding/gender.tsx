import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  Checkbox,
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemTitle,
  ProgressIndicator,
  RadioGroup,
  RadioGroupItem,
  ScreenContainer,
  Text,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { pluralizeGender } from '@/lib/pluralize';
import { useGetGendersQuery } from '@/store/api/apiSlice';

export default function GenderScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const handleBack = () => {
    router.replace('/(main)/onboarding/manual-location');
  };
  const { data, setCurrentStep, totalSteps, updateData } = useAppOnboarding();
  const { data: genders = [] } = useGetGendersQuery();

  // Separate primary and non-primary genders
  const primaryGenders = useMemo(
    () => genders.filter((g) => g.isPrimary),
    [genders]
  );

  // Find selected gender objects for display
  const selectedGenders = useMemo(
    () => genders.filter((g) => data.genderIds.includes(g.id)),
    [genders, data.genderIds]
  );

  // Check if any selected gender is non-primary
  const nonPrimarySelectedGenders = selectedGenders.filter((g) => !g.isPrimary);

  // Get singular labels for own gender display
  const genderLabels = useMemo(() => {
    return selectedGenders.map((g) => g.name).join(', ');
  }, [selectedGenders]);

  // Get plural labels for seeking display
  const seekingLabels = useMemo(() => {
    return data.seekingIds
      .map((id) => {
        const gender = genders.find((g) => g.id === id);
        return gender ? pluralizeGender(gender.name) : null;
      })
      .filter(Boolean)
      .join(', ');
  }, [data.seekingIds, genders]);

  const isValid = data.genderIds.length > 0 && data.seekingIds.length > 0;

  // For primary options on main screen, toggle like radio (select one deselects others)
  const handlePrimaryGenderSelect = useCallback(
    (genderId: string) => {
      // If already selected, do nothing (can't deselect from main screen)
      if (data.genderIds.includes(genderId)) return;
      // Replace all selections with just this one
      updateData({ genderIds: [genderId] });
    },
    [data.genderIds, updateData]
  );

  const handleSeekingToggle = useCallback(
    (genderId: string) => {
      const newSeekingIds = data.seekingIds.includes(genderId)
        ? data.seekingIds.filter((id) => id !== genderId)
        : [...data.seekingIds, genderId];
      updateData({ seekingIds: newSeekingIds });
    },
    [data.seekingIds, updateData]
  );

  const handleViewMoreGender = useCallback(() => {
    router.push({
      pathname: './gender-select',
      params: { mode: 'gender', title: 'I am a...' },
    });
  }, [router]);

  const handleViewMoreSeeking = useCallback(() => {
    router.push({
      pathname: './gender-select',
      params: { mode: 'seeking', title: 'Seeking...' },
    });
  }, [router]);

  const handleContinue = useCallback(() => {
    if (!isValid) return;
    setCurrentStep(4);
    router.push('/(main)/onboarding/date-of-birth');
  }, [isValid, router, setCurrentStep]);

  return (
    <ScreenContainer onBack={handleBack}>
      <ProgressIndicator currentStep={3} totalSteps={totalSteps} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="title" center>
          About you
        </Text>

        {/* Gender Selection */}
        <View style={styles.section}>
          <Text variant="label" style={styles.sectionLabel}>
            I am a...
          </Text>
          <RadioGroup
            onValueChange={handlePrimaryGenderSelect}
            value={
              data.genderIds.length === 1 ? data.genderIds[0] : undefined
            }
          >
            <ItemGroup>
              {primaryGenders.map((gender) => (
                <Item asChild key={gender.id} variant="outline">
                  <Pressable
                    onPress={() => handlePrimaryGenderSelect(gender.id)}
                  >
                    <ItemContent>
                      <ItemTitle>{gender.name}</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <RadioGroupItem value={gender.id} />
                    </ItemActions>
                  </Pressable>
                </Item>
              ))}

              {/* Show non-primary selected genders or multi-selection summary */}
              {(nonPrimarySelectedGenders.length > 0 ||
                data.genderIds.length > 1) && (
                <Item asChild variant="outline">
                  <Pressable onPress={handleViewMoreGender}>
                    <ItemContent>
                      <ItemTitle>
                        <Text style={styles.summaryLabel}>
                          {genderLabels}
                        </Text>
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.colors.primary}
                      />
                    </ItemActions>
                  </Pressable>
                </Item>
              )}
            </ItemGroup>
          </RadioGroup>

          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={handleViewMoreGender}
          >
            <Text style={styles.viewMoreText}>View more options</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Seeking Selection */}
        <View style={styles.section}>
          <Text variant="label" style={styles.sectionLabel}>
            Seeking...
          </Text>
          <ItemGroup>
            {primaryGenders.map((gender) => {
              const isSelected = data.seekingIds.includes(gender.id);

              return (
                <Item asChild key={gender.id} variant="outline">
                  <Pressable
                    onPress={() => handleSeekingToggle(gender.id)}
                  >
                    <ItemContent>
                      <ItemTitle>
                        {pluralizeGender(gender.name)}
                      </ItemTitle>
                    </ItemContent>
                    <ItemActions>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          handleSeekingToggle(gender.id)
                        }
                      />
                    </ItemActions>
                  </Pressable>
                </Item>
              );
            })}

            {/* Show summary of other selected genders */}
            {data.seekingIds.some(
              (id) => !primaryGenders.find((g) => g.id === id)
            ) && (
              <Item asChild variant="outline">
                <Pressable onPress={handleViewMoreSeeking}>
                  <ItemContent>
                    <ItemTitle>
                      <Text style={styles.summaryLabel}>
                        {seekingLabels}
                      </Text>
                    </ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.white}
                    />
                  </ItemActions>
                </Pressable>
              </Item>
            )}
          </ItemGroup>

          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={handleViewMoreSeeking}
          >
            <Text style={styles.viewMoreText}>View more options</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    footer: {
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    scrollContent: {
      paddingBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      marginTop: theme.spacing.xl,
    },
    sectionLabel: {
      marginBottom: theme.spacing.sm,
    },
    summaryLabel: {
      color: theme.colors.primary,
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
    },
    viewMoreButton: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
    },
    viewMoreText: {
      color: theme.colors.white,
      fontSize: 15,
      fontWeight: '500',
      marginRight: theme.spacing.xs,
    },
  });
}
