import { useMemo, useState } from 'react';
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  Field,
  FieldContent,
  Input,
  ProgressIndicator,
  ScreenContainer,
  Text,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';

export default function DateOfBirthScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const handleBack = () => {
    router.replace('/(main)/onboarding/gender');
  };
  const { data, setCurrentStep, totalSteps, updateData } = useAppOnboarding();

  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');

  // Initialize with existing data if available
  if (data.dateOfBirth && !month && !day && !year) {
    const date = new Date(data.dateOfBirth);
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
  const hasEnteredData =
    month.length > 0 && day.length > 0 && year.length === 4;

  const handleContinue = () => {
    if (!isValid) return;

    const m = parseInt(month);
    const d = parseInt(day);
    const y = parseInt(year);
    const birthDate = new Date(y, m - 1, d);

    updateData({ dateOfBirth: birthDate.toISOString().split('T')[0] });
    setCurrentStep(5);
    router.push('/(main)/onboarding/relationship');
  };

  return (
    <ScreenContainer onBack={handleBack}>
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
            <Field style={styles.inputContainer}>
              <FieldContent>
                <Input
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="MM"
                  returnKeyType="next"
                  showSoftInputOnFocus={true}
                  style={styles.dateInput}
                  value={month}
                  onChangeText={setMonth}
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Text variant="muted" style={styles.inputLabel}>
                  Month
                </Text>
              </FieldContent>
            </Field>

            <Field style={styles.inputContainer}>
              <FieldContent>
                <Input
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="DD"
                  returnKeyType="next"
                  showSoftInputOnFocus={true}
                  style={styles.dateInput}
                  value={day}
                  onChangeText={setDay}
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Text variant="muted" style={styles.inputLabel}>
                  Day
                </Text>
              </FieldContent>
            </Field>

            <Field style={styles.inputContainerYear}>
              <FieldContent>
                <Input
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="YYYY"
                  returnKeyType="done"
                  showSoftInputOnFocus={true}
                  style={styles.dateInput}
                  value={year}
                  onChangeText={setYear}
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Text variant="muted" style={styles.inputLabel}>
                  Year
                </Text>
              </FieldContent>
            </Field>
          </View>

          {age !== null && (
            <Text variant="muted" center>
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
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    dateInput: {
      fontWeight: '600',
      textAlign: 'center',
    },
    dateInputsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      justifyContent: 'space-between',
      marginTop: theme.spacing.xl,
    },
    errorText: {
      color: theme.colors.destructive,
      marginTop: theme.spacing.sm,
    },
    footer: {
      paddingBottom: theme.spacing.xl,
    },
    inputContainer: {
      alignItems: 'stretch',
      flex: 1,
      minWidth: 0,
    },
    inputContainerYear: {
      alignItems: 'stretch',
      flex: 1.4,
      minWidth: 0,
    },
    inputLabel: {
      fontSize: 12,
      marginTop: theme.spacing.xs,
    },
  });
}
