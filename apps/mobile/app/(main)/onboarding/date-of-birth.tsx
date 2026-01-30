import { useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  colors,
  ProgressIndicator,
  ScreenContainer,
  spacing,
  Text,
  TextInput,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { useSafeBack } from '@/hooks/useSafeBack';

export default function DateOfBirthScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/(main)/onboarding/date-of-birth');
  const { data, setCurrentStep, totalSteps, updateData } = useAppOnboarding();

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

    if (
      !m ||
      !d ||
      !y ||
      m < 1 ||
      m > 12 ||
      d < 1 ||
      d > 31 ||
      y < 1900 ||
      y > new Date().getFullYear()
    ) {
      return null;
    }

    const birthDate = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
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
    router.push('/(main)/onboarding/relationship');
  };

  return (
    <ScreenContainer onBack={safeBack}>
      <ProgressIndicator currentStep={4} totalSteps={totalSteps} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.content}>
          <Text variant="title" center>
            When&apos;s your birthday?
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
                keyboardType="number-pad"
                maxLength={2}
                style={styles.dateInput}
                returnKeyType="next"
                onSubmitEditing={Keyboard.dismiss}
                showSoftInputOnFocus={true}
              />
              <Text variant="muted" style={styles.inputLabel}>
                Month
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                value={day}
                onChangeText={setDay}
                placeholder="DD"
                keyboardType="number-pad"
                maxLength={2}
                style={styles.dateInput}
                returnKeyType="next"
                onSubmitEditing={Keyboard.dismiss}
                showSoftInputOnFocus={true}
              />
              <Text variant="muted" style={styles.inputLabel}>
                Day
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                value={year}
                onChangeText={setYear}
                placeholder="YYYY"
                keyboardType="number-pad"
                maxLength={4}
                style={styles.dateInput}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                showSoftInputOnFocus={true}
              />
              <Text variant="muted" style={styles.inputLabel}>
                Year
              </Text>
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
      </TouchableWithoutFeedback>

      <View style={styles.footer}>
        <Button onPress={handleContinue} disabled={!isValid} fullWidth>
          Continue
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  ageText: {
    marginTop: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  dateInput: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  dateInputsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
  inputContainer: {
    alignItems: 'center',
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
