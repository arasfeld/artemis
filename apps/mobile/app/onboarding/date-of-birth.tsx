import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  Text,
  Button,
  ProgressIndicator,
  TextInput,
  colors,
  spacing,
} from '@artemis/ui';
import { useAppOnboarding } from '../../hooks/useAppOnboarding';
import { useSafeBack } from '../../hooks/useOnboardingFlow';

export default function DateOfBirthScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/onboarding/date-of-birth');
  const { data, updateData, setCurrentStep, totalSteps } = useAppOnboarding();

  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');

  // Initialize with existing data if available
  if (data.dateOfBirth && !month && !day && !year) {
    const date = data.dateOfBirth;
    setMonth((date.getMonth() + 1).toString());
    setDay(date.getDate().toString());
    setYear(date.getFullYear().toString());
  }

  const calculateAgeFromInputs = (): number | null => {
    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);

    // Don't calculate age if any field is empty
    if (!month || !day || !year) {
      return null;
    }

    if (!m || !d || !y || m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > new Date().getFullYear()) {
      return null;
    }

    const birthDate = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAgeFromInputs();
  const isValid = age !== null && age >= 18;
  const hasEnteredData = month.length > 0 || day.length > 0 || year.length > 0;

  const handleContinue = () => {
    if (!isValid) return;

    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);
    const birthDate = new Date(y, m - 1, d);

    updateData({ dateOfBirth: birthDate });
    setCurrentStep(5);
    router.push('/onboarding/relationship');
  };

  return (
    <ScreenContainer onBack={safeBack}>
      <ProgressIndicator currentStep={4} totalSteps={totalSteps} />

      <View style={styles.content}>
        <Text variant="title" center>
          When's your birthday?
        </Text>
        <Text variant="subtitle" center>
          You must be at least 18 to use Artemis
        </Text>

        <View style={styles.dateInputsContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              value={month}
              onChangeText={setMonth}
              placeholder="MM"
              keyboardType="numeric"
              maxLength={2}
              style={styles.dateInput}
            />
            <Text variant="muted" style={styles.inputLabel}>Month</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={day}
              onChangeText={setDay}
              placeholder="DD"
              keyboardType="numeric"
              maxLength={2}
              style={styles.dateInput}
            />
            <Text variant="muted" style={styles.inputLabel}>Day</Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={year}
              onChangeText={setYear}
              placeholder="YYYY"
              keyboardType="numeric"
              maxLength={4}
              style={styles.dateInput}
            />
            <Text variant="muted" style={styles.inputLabel}>Year</Text>
          </View>
        </View>

        {age !== null && (
          <Text variant="body" center style={styles.ageText}>
            You are {age} years old
          </Text>
        )}

        {!isValid && hasEnteredData && (
          <Text variant="muted" center style={styles.errorText}>
            You must be at least 18 years old
          </Text>
        )}
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
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  dateInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  inputContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dateInput: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  inputLabel: {
    marginTop: spacing.xs,
    fontSize: 12,
  },
  ageText: {
    marginTop: spacing.lg,
  },
  errorText: {
    marginTop: spacing.sm,
    color: colors.error,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});
