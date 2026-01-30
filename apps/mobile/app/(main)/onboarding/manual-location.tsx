import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Button,
  ProgressIndicator,
  ScreenContainer,
  Select,
  spacing,
  Text,
  TextInput,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { useSafeBack } from '@/hooks/useSafeBack';

const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'US' },
  { label: 'Canada', value: 'CA' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'Australia', value: 'AU' },
  { label: 'Germany', value: 'DE' },
  { label: 'France', value: 'FR' },
  { label: 'Spain', value: 'ES' },
  { label: 'Italy', value: 'IT' },
  { label: 'Netherlands', value: 'NL' },
  { label: 'Belgium', value: 'BE' },
  { label: 'Austria', value: 'AT' },
  { label: 'Switzerland', value: 'CH' },
  { label: 'Sweden', value: 'SE' },
  { label: 'Norway', value: 'NO' },
  { label: 'Denmark', value: 'DK' },
  { label: 'Finland', value: 'FI' },
  { label: 'Ireland', value: 'IE' },
  { label: 'New Zealand', value: 'NZ' },
  { label: 'Japan', value: 'JP' },
  { label: 'South Korea', value: 'KR' },
  { label: 'Singapore', value: 'SG' },
  { label: 'Brazil', value: 'BR' },
  { label: 'Mexico', value: 'MX' },
  { label: 'Argentina', value: 'AR' },
];

export default function ManualLocationScreen() {
  const router = useRouter();
  const safeBack = useSafeBack('/(main)/onboarding/manual-location');
  const { setCurrentStep, totalSteps, updateData } = useAppOnboarding();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [zipCode, setZipCode] = useState('');

  const isValid = selectedCountry && zipCode.trim().length >= 3;

  const handleContinue = () => {
    if (!isValid) return;

    updateData({
      location: {
        country: selectedCountry,
        type: 'manual',
        zipCode: zipCode.trim(),
      },
    });
    setCurrentStep(3);
    router.push('/(main)/onboarding/gender');
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
  footer: {
    paddingBottom: spacing.xl,
  },
  inputContainer: {
    marginTop: spacing.xl,
  },
  selectContainer: {
    marginTop: spacing.xl,
  },
});
