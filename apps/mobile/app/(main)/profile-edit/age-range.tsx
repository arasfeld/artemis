import { useMemo, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, TextInput, useTheme, type Theme } from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';

const MIN_AGE = 18;
const MAX_AGE = 99;

export default function EditAgeRangeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, updateData } = useAppOnboarding();
  const [minAge, setMinAge] = useState(data.ageRangeMin.toString());
  const [maxAge, setMaxAge] = useState(data.ageRangeMax.toString());

  const handleMinChange = (value: string) => {
    if (value === '') {
      setMinAge('');
      return;
    }
    const numericValue = value.replace(/[^0-9]/g, '');
    setMinAge(numericValue);
  };

  const handleMaxChange = (value: string) => {
    if (value === '') {
      setMaxAge('');
      return;
    }
    const numericValue = value.replace(/[^0-9]/g, '');
    setMaxAge(numericValue);
  };

  const parsedMin = parseInt(minAge) || MIN_AGE;
  const parsedMax = parseInt(maxAge) || MAX_AGE;
  const hasChanges =
    parsedMin !== data.ageRangeMin || parsedMax !== data.ageRangeMax;

  const handleSave = async () => {
    const min = Math.max(MIN_AGE, Math.min(parsedMin, parsedMax));
    const max = Math.min(MAX_AGE, Math.max(parsedMin, parsedMax));
    await updateData({ ageRangeMin: min, ageRangeMax: max });
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons color={theme.colors.foreground} name="close" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Age Preferences</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges}
          style={[
            styles.headerButton,
            !hasChanges && styles.headerButtonDisabled,
          ]}
        >
          <Text
            style={[styles.saveText, !hasChanges && styles.saveTextDisabled]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            What age range are you interested in?
          </Text>

          <View style={styles.rangeDisplay}>
            <Text style={styles.rangeText}>
              {minAge || MIN_AGE} - {maxAge || MAX_AGE}
            </Text>
            <Text style={styles.rangeLabel}>years old</Text>
          </View>

          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Minimum age</Text>
              <TextInput
                value={minAge}
                onChangeText={handleMinChange}
                keyboardType="number-pad"
                placeholder={`${MIN_AGE}`}
                maxLength={2}
                style={styles.ageInput}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Maximum age</Text>
              <TextInput
                value={maxAge}
                onChangeText={handleMaxChange}
                keyboardType="number-pad"
                placeholder={`${MAX_AGE}`}
                maxLength={2}
                style={styles.ageInput}
                returnKeyType="done"
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    ageInput: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    container: {
      backgroundColor: theme.colors.white,
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
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
    inputLabel: {
      color: theme.colors.mutedForeground,
      fontSize: 14,
      textAlign: 'center',
    },
    inputWrapper: {
      flex: 1,
    },
    inputsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      justifyContent: 'space-between',
      marginTop: theme.spacing.xl,
    },
    rangeDisplay: {
      alignItems: 'center',
      marginTop: spacing['2xl'],
    },
    rangeLabel: {
      color: theme.colors.mutedForeground,
      fontSize: 16,
      marginTop: theme.spacing.xs,
    },
    rangeText: {
      color: theme.colors.foreground,
      fontSize: 48,
      fontWeight: 'bold',
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
