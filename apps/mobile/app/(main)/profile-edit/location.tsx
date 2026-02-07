import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Select,
  Text,
  TextInput,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';
import { getCurrentLocation } from '@/lib/location';

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

export default function EditLocationScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, updateData } = useAppOnboarding();

  const [selectedCountry, setSelectedCountry] = useState(
    data.location?.country || ''
  );
  const [zipCode, setZipCode] = useState(data.location?.zipCode || '');
  const [isDetecting, setIsDetecting] = useState(false);

  const isValid = selectedCountry && zipCode.trim().length >= 3;
  const hasChanges =
    selectedCountry !== (data.location?.country || '') ||
    zipCode.trim() !== (data.location?.zipCode || '');

  const handleSave = async () => {
    if (!isValid) return;
    await updateData({
      location: {
        country: selectedCountry,
        type: 'manual',
        zipCode: zipCode.trim(),
      },
    });
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDetectLocation = async () => {
    setIsDetecting(true);

    try {
      const locationResult = await getCurrentLocation();

      if (locationResult) {
        await updateData({
          location: {
            city: locationResult.city,
            coordinates: locationResult.coordinates,
            country: locationResult.country,
            isoCountryCode: locationResult.isoCountryCode,
            region: locationResult.region,
            type: 'automatic',
            zipCode: locationResult.zipCode,
          },
        });
        router.back();
      } else {
        Alert.alert(
          'Location Error',
          'Unable to get your location. Please make sure location services are enabled and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch {
      Alert.alert(
        'Location Error',
        'Failed to access location services. Please enable location permissions and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Ionicons color={theme.colors.foreground} name="close" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Location</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isValid || !hasChanges}
          style={[
            styles.headerButton,
            (!isValid || !hasChanges) && styles.headerButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.saveText,
              (!isValid || !hasChanges) && styles.saveTextDisabled,
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Auto-detect option */}
        <TouchableOpacity
          style={styles.detectButton}
          onPress={handleDetectLocation}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <ActivityIndicator color={theme.colors.primary} size="small" />
          ) : (
            <Ionicons color={theme.colors.primary} name="location" size={24} />
          )}
          <Text style={styles.detectText}>
            {isDetecting ? 'Detecting location...' : 'Use my current location'}
          </Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or enter manually</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Manual entry */}
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

        {data.location?.type === 'automatic' && (
          <Text style={styles.currentLocation}>
            Currently using automatic location detection
          </Text>
        )}
      </KeyboardAvoidingView>
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
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    currentLocation: {
      color: theme.colors.mutedForeground,
      fontSize: 13,
      marginTop: theme.spacing.lg,
      textAlign: 'center',
    },
    detectButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.accent,
      borderRadius: 12,
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    detectText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    divider: {
      alignItems: 'center',
      flexDirection: 'row',
      marginVertical: theme.spacing.xl,
    },
    dividerLine: {
      backgroundColor: theme.colors.muted,
      flex: 1,
      height: 1,
    },
    dividerText: {
      color: theme.colors.mutedForeground,
      fontSize: 14,
      paddingHorizontal: theme.spacing.md,
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
    inputContainer: {
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
    selectContainer: {
      marginTop: theme.spacing.sm,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
    },
  });
}
