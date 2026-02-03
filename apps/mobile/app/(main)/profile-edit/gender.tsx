import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, Text } from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { useGetGendersQuery } from '@/store/api/apiSlice';
import type { GenderData } from '@/types/api';

const MAX_GENDERS = 5;

export default function EditGenderScreen() {
  const router = useRouter();
  const { data: onboardingData, updateData } = useAppOnboarding();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    onboardingData.genderIds || []
  );

  const { data: genders = [], isLoading } = useGetGendersQuery();

  const handleSelect = useCallback((gender: GenderData) => {
    setSelectedIds((prev) => {
      if (prev.includes(gender.id)) {
        return prev.filter((id) => id !== gender.id);
      }
      if (prev.length >= MAX_GENDERS) {
        return prev;
      }
      return [...prev, gender.id];
    });
  }, []);

  const handleSave = useCallback(async () => {
    await updateData({ genderIds: selectedIds });
    router.back();
  }, [router, selectedIds, updateData]);

  const handleCancel = () => {
    router.back();
  };

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const canSubmit = selectedIds.length > 0;
  const atMaxGenders = selectedIds.length >= MAX_GENDERS;
  const hasChanges =
    JSON.stringify(selectedIds.sort()) !==
    JSON.stringify((onboardingData.genderIds || []).sort());

  const renderItem = useCallback(
    ({ item }: { item: GenderData }) => {
      const selected = isSelected(item.id);
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
              {item.name}
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
          <View
            style={[
              styles.checkbox,
              selected && styles.checkboxSelected,
              disabled && styles.checkboxDisabled,
            ]}
          >
            {selected && (
              <Ionicons color={colors.white} name="checkmark" size={16} />
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [atMaxGenders, handleSelect, isSelected]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerButton} />
          <Text style={styles.title}>Gender Identity</Text>
          <View style={styles.headerButton} />
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
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons color={colors.text.primary} name="close" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Gender Identity</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!canSubmit || !hasChanges}
          style={[
            styles.headerButton,
            (!canSubmit || !hasChanges) && styles.headerButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.saveText,
              (!canSubmit || !hasChanges) && styles.saveTextDisabled,
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.limitNotice}>
        <Text style={styles.limitText}>
          Select up to {MAX_GENDERS} ({selectedIds.length}/{MAX_GENDERS})
        </Text>
      </View>

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

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border.medium,
    borderRadius: 4,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxDisabled: {
    borderColor: colors.border.light,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  container: {
    backgroundColor: colors.white,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border.light,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerButton: {
    minWidth: 50,
    padding: spacing.xs,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  item: {
    alignItems: 'center',
    borderBottomColor: colors.border.light,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  itemContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemDescription: {
    color: colors.text.muted,
    fontSize: 13,
    marginTop: 2,
  },
  itemDescriptionDisabled: {
    color: colors.border.medium,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemLabel: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  itemLabelDisabled: {
    color: colors.text.muted,
  },
  itemLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  itemSelected: {
    backgroundColor: colors.selected.background,
  },
  limitNotice: {
    backgroundColor: colors.selected.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  limitText: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.text.muted,
    fontSize: 16,
  },
  saveText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  saveTextDisabled: {
    color: colors.text.muted,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
});
