import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox, Text, useTheme, type Theme } from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { pluralizeGender } from '@/lib/pluralize';
import { useGetGendersQuery } from '@/store/api/apiSlice';
import type { GenderData } from '@/types/api';

type SelectMode = 'gender' | 'seeking';

const MAX_GENDERS = 5;

export default function GenderSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode: SelectMode; title?: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: onboardingData, updateData } = useAppOnboarding();

  const mode: SelectMode = params.mode === 'seeking' ? 'seeking' : 'gender';
  const title =
    params.title || (mode === 'gender' ? 'I am a...' : 'Seeking...');

  // Initialize from onboarding data
  const [selectedIds, setSelectedIds] = useState<string[]>(
    mode === 'gender' ? onboardingData.genderIds : onboardingData.seekingIds
  );

  const { data: genders = [], isLoading } = useGetGendersQuery();

  const handleSelect = useCallback(
    (gender: GenderData) => {
      setSelectedIds((prev) => {
        if (prev.includes(gender.id)) {
          // Always allow deselection
          return prev.filter((id) => id !== gender.id);
        }
        // For gender mode, enforce max limit
        if (mode === 'gender' && prev.length >= MAX_GENDERS) {
          return prev; // Don't add more
        }
        return [...prev, gender.id];
      });
    },
    [mode]
  );

  const handleDone = useCallback(() => {
    if (mode === 'gender') {
      updateData({ genderIds: selectedIds });
    } else {
      updateData({ seekingIds: selectedIds });
    }
    router.back();
  }, [mode, router, selectedIds, updateData]);

  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.includes(id);
    },
    [selectedIds]
  );

  const canSubmit = selectedIds.length > 0;
  const atMaxGenders = mode === 'gender' && selectedIds.length >= MAX_GENDERS;

  const renderItem = useCallback(
    ({ item }: { item: GenderData }) => {
      const selected = isSelected(item.id);
      // Use plural for seeking, singular for gender
      const displayName =
        mode === 'seeking' ? pluralizeGender(item.name) : item.name;
      // Disable if at max and not already selected
      const disabled = atMaxGenders && !selected;

      return (
        <TouchableOpacity
          style={[
            styles.item,
            selected && styles.itemSelected,
            disabled && styles.itemDisabled,
          ]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <View style={styles.itemContent}>
            <Text
              style={[
                styles.itemLabel,
                selected && styles.itemLabelSelected,
                disabled && styles.itemLabelDisabled,
              ]}
            >
              {displayName}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.itemDescription,
                  disabled && styles.itemDescriptionDisabled,
                ]}
              >
                {item.description}
              </Text>
            )}
          </View>
          <Checkbox
            checked={selected}
            disabled={disabled}
            onCheckedChange={() => handleSelect(item)}
          />
        </TouchableOpacity>
      );
    },
    [atMaxGenders, handleSelect, isSelected, mode, styles]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.closeButton} />
          <Text style={styles.title}>{title}</Text>
          <View style={styles.doneButton} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={handleDone}
          disabled={!canSubmit}
          style={[styles.doneButton, !canSubmit && styles.doneButtonDisabled]}
        >
          <Text
            style={[styles.doneText, !canSubmit && styles.doneTextDisabled]}
          >
            Done
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'gender' && (
        <View style={styles.limitNotice}>
          <Text style={styles.limitText}>
            Select up to {MAX_GENDERS} ({selectedIds.length}/{MAX_GENDERS})
          </Text>
        </View>
      )}

      <FlatList
        data={genders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    closeButton: {
      minWidth: 40,
      padding: theme.spacing.xs,
    },
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    doneButton: {
      minWidth: 40,
      padding: theme.spacing.xs,
    },
    doneButtonDisabled: {
      opacity: 0.5,
    },
    doneText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    doneTextDisabled: {
      color: theme.colors.mutedForeground,
    },
    header: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    item: {
      alignItems: 'center',
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    itemContent: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    itemDescription: {
      color: theme.colors.mutedForeground,
      fontSize: 13,
      marginTop: 2,
    },
    itemDescriptionDisabled: {
      color: theme.colors.ring,
    },
    itemDisabled: {
      opacity: 0.5,
    },
    itemLabel: {
      color: theme.colors.foreground,
      fontSize: 16,
      fontWeight: '500',
    },
    itemLabelDisabled: {
      color: theme.colors.mutedForeground,
    },
    itemLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    itemSelected: {
      backgroundColor: theme.colors.accent,
    },
    limitNotice: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    limitText: {
      color: theme.colors.mutedForeground,
      fontSize: 14,
      textAlign: 'center',
    },
    listContent: {
      paddingBottom: theme.spacing.xl,
    },
    loadingContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    loadingText: {
      color: theme.colors.mutedForeground,
      fontSize: 16,
    },
    title: {
      color: theme.colors.foreground,
      fontSize: 18,
      fontWeight: '600',
    },
  });
}
