import { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  OptionCard,
  ProgressIndicator,
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

  // Check if a primary gender is selected (for radio button display)
  const isPrimarySelected = (genderId: string) => {
    // If user has only one gender selected and it's this primary one
    return data.genderIds.length === 1 && data.genderIds[0] === genderId;
  };

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
          <View style={styles.optionList}>
            {primaryGenders.map((gender) => (
              <OptionCard
                key={gender.id}
                title={gender.name}
                selected={isPrimarySelected(gender.id)}
                onPress={() => handlePrimaryGenderSelect(gender.id)}
              />
            ))}

            {/* Show non-primary selected genders or multi-selection summary */}
            {(nonPrimarySelectedGenders.length > 0 ||
              data.genderIds.length > 1) && (
              <TouchableOpacity
                style={[styles.summaryCard, styles.summaryCardSelected]}
                onPress={handleViewMoreGender}
                activeOpacity={0.8}
              >
                <Text style={styles.summaryLabel}>{genderLabels}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={handleViewMoreGender}
            >
              <Text style={styles.viewMoreText}>View more options</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Seeking Selection */}
        <View style={styles.section}>
          <Text variant="label" style={styles.sectionLabel}>
            Seeking...
          </Text>
          <View style={styles.optionList}>
            {primaryGenders.map((gender) => {
              const isSelected = data.seekingIds.includes(gender.id);

              return (
                <TouchableOpacity
                  key={gender.id}
                  style={[
                    styles.checkboxCard,
                    isSelected && styles.checkboxCardSelected,
                  ]}
                  onPress={() => handleSeekingToggle(gender.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.checkboxLabel,
                      isSelected && styles.checkboxLabelSelected,
                    ]}
                  >
                    {pluralizeGender(gender.name)}
                  </Text>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={theme.colors.white}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Show summary of other selected genders */}
            {data.seekingIds.some(
              (id) => !primaryGenders.find((g) => g.id === id)
            ) && (
              <TouchableOpacity
                style={[styles.summaryCard, styles.summaryCardSelected]}
                onPress={handleViewMoreSeeking}
                activeOpacity={0.8}
              >
                <Text style={styles.summaryLabel}>{seekingLabels}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.viewMoreButton}
              onPress={handleViewMoreSeeking}
            >
              <Text style={styles.viewMoreText}>View more options</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
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
    checkbox: {
      alignItems: 'center',
      borderColor: theme.colors.ring,
      borderRadius: 4,
      borderWidth: 2,
      height: 24,
      justifyContent: 'center',
      width: 24,
    },
    checkboxCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderColor: 'transparent',
      borderRadius: 12,
      borderWidth: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      shadowColor: theme.colors.black,
      shadowOffset: { height: 1, width: 0 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    checkboxCardSelected: {
      borderColor: theme.colors.primary,
    },
    checkboxLabel: {
      color: theme.colors.foreground,
      fontSize: 16,
      fontWeight: '500',
    },
    checkboxLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    checkboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    footer: {
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    optionList: {
      gap: theme.spacing.sm,
    },
    otherSeekingContainer: {
      backgroundColor: theme.colors.accent,
      borderRadius: 8,
      padding: theme.spacing.sm,
    },
    otherSeekingText: {
      color: theme.colors.white,
      fontSize: 14,
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
    summaryCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.white,
      borderColor: 'transparent',
      borderRadius: 12,
      borderWidth: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      shadowColor: theme.colors.black,
      shadowOffset: { height: 1, width: 0 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    summaryCardSelected: {
      borderColor: theme.colors.primary,
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
