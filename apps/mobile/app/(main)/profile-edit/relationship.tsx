import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  OptionCard,
  Text,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { useGetRelationshipTypesQuery } from '@/store/api/apiSlice';
import type { RelationshipTypeData } from '@/types/api';

export default function EditRelationshipScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, updateData } = useAppOnboarding();
  const [relationshipTypes, setRelationshipTypes] = useState<string[]>(
    data.relationshipTypes || []
  );

  const { data: options = [], isLoading } = useGetRelationshipTypesQuery();

  const canSubmit = relationshipTypes.length > 0;
  const hasChanges =
    JSON.stringify(relationshipTypes.sort()) !==
    JSON.stringify((data.relationshipTypes || []).sort());

  const handleSave = async () => {
    if (!canSubmit) return;
    await updateData({ relationshipTypes });
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const handleToggle = (id: string) => {
    setRelationshipTypes((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerButton} />
          <Text style={styles.title}>Looking For</Text>
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
        <Text style={styles.title}>Looking For</Text>
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          What type of relationship are you looking for?
        </Text>

        <View style={styles.optionList}>
          {options.map((option: RelationshipTypeData) => {
            const selected = relationshipTypes.includes(option.id);
            return (
              <OptionCard
                key={option.id}
                title={option.name}
                subtitle={option.description}
                selected={selected}
                onPress={() => handleToggle(option.id)}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.white,
      flex: 1,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
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
    loadingContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    loadingText: {
      color: theme.colors.mutedForeground,
      fontSize: 16,
    },
    optionList: {
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
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
      color: theme.colors.mutedForeground,
      fontSize: 16,
      textAlign: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
    },
  });
}
