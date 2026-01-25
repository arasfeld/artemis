import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  Text,
  TextInput,
  Button,
  ProgressIndicator,
  Select,
  spacing,
} from '@artemis/ui';
import { useAppOnboarding } from '../../hooks/useAppOnboarding';
import { useSafeBack } from '../../hooks/useOnboardingFlow';

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'ES', label: 'Spain' },
  { value: 'IT', label: 'Italy' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'AT', label: 'Austria' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'IE', label: 'Ireland' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'SG', label: 'Singapore' },
  { value: 'BR', label: 'Brazil' },
  { value: 'MX', label: 'Mexico' },
  { value: 'AR', label: 'Argentina' },
];

export default function ManualLocationScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/onboarding/manual-location');
  const { updateData, setCurrentStep, totalSteps } = useAppOnboarding();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [zipCode, setZipCode] = useState('');

  const isValid = selectedCountry && zipCode.trim().length >= 3;

  const handleContinue = () => {
    if (!isValid) return;

    updateData({
      location: {
        type: 'manual',
        country: selectedCountry,
        zipCode: zipCode.trim(),
      },
    });
    setCurrentStep(3);
    router.push('/onboarding/gender');
  };

  return (
    <ScreenContainer onBack={safeBack}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ProgressIndicator currentStep={2} totalSteps={totalSteps} />

        <View style={styles.content}>
          <Text variant="title" center>
            Where are you located?
          </Text>
          <Text variant="subtitle" center>
            Select your country and enter your postal code
          </Text>

          <View style={styles.selectContainer}>
            <Select
              label="Country"
              placeholder="Select your country"
              options={COUNTRY_OPTIONS}
              value={selectedCountry}
              onChange={setSelectedCountry}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="ZIP / Postal Code"
              value={zipCode}
              onChangeText={setZipCode}
              placeholder="Enter your postal code"
              keyboardType="default"
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button onPress={handleContinue} disabled={!isValid} fullWidth>
            Continue
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  selectContainer: {
    marginTop: spacing.xl,
  },
  inputContainer: {
    marginTop: spacing.xl,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});
