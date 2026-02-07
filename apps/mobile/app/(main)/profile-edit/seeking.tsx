import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox, Text, useTheme, type Theme } from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { pluralizeGender } from '@/lib/pluralize';
import { useGetGendersQuery } from '@/store/api/apiSlice';
import type { GenderData } from '@/types/api';

export default function EditSeekingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: onboardingData, updateData } = useAppOnboarding();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    onboardingData.seekingIds || []
  );

  const { data: genders = [], isLoading } = useGetGendersQuery();

  const handleSelect = useCallback((gender: GenderData) => {
    setSelectedIds((prev) => {
      if (prev.includes(gender.id)) {
        return prev.filter((id) => id !== gender.id);
      }
      return [...prev, gender.id];
    });
  }, []);

  const handleSave = useCallback(async () => {
    await updateData({ seekingIds: selectedIds });
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
  const hasChanges =
    JSON.stringify(selectedIds.sort()) !==
    JSON.stringify((onboardingData.seekingIds || []).sort());

  const renderItem = useCallback(
    ({ item }: { item: GenderData }) => {
      const selected = isSelected(item.id);
      const displayName = pluralizeGender(item.name);

      return (
        <TouchableOpacity
          style={[styles.item, selected && styles.itemSelected]}
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemContent}>
            <Text
              style={[styles.itemLabel, selected && styles.itemLabelSelected]}
            >
              {displayName}
            </Text>
            {item.description && (
              <Text style={styles.itemDescription}>{item.description}</Text>
            )}
          </View>
          <Checkbox
            checked={selected}
            onCheckedChange={() => handleSelect(item)}
          />
        </TouchableOpacity>
      );
    },
    [handleSelect, isSelected, styles]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerButton} />
          <Text style={styles.title}>Interested In</Text>
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
          <Ionicons color={theme.colors.foreground} name="close" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Interested In</Text>
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

      <View style={styles.subtitle}>
        <Text style={styles.subtitleText}>
          Select who you&apos;re interested in meeting
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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
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
    headerButton: {
      minWidth: 50,
      padding: theme.spacing.xs,
    },
    headerButtonDisabled: {
      opacity: 0.5,
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
    itemLabel: {
      color: theme.colors.foreground,
      fontSize: 16,
      fontWeight: '500',
    },
    itemLabelSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    itemSelected: {
      backgroundColor: theme.colors.accent,
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
    saveText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'right',
    },
    saveTextDisabled: {
      color: theme.colors.mutedForeground,
    },
    subtitle: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    subtitleText: {
      color: theme.colors.mutedForeground,
      fontSize: 14,
      textAlign: 'center',
    },
    title: {
      color: theme.colors.foreground,
      fontSize: 18,
      fontWeight: '600',
    },
  });
}
