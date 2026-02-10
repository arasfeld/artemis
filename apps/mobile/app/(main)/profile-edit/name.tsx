import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Text,
  useTheme,
  type Theme,
} from '@artemis/ui';
import { useAppOnboarding } from '@/hooks/useAppOnboarding';

export default function EditNameScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, updateData } = useAppOnboarding();
  const [firstName, setFirstName] = useState(data.firstName || '');
  const [error, setError] = useState('');

  const isValid = firstName.trim().length >= 2;
  const hasChanges = firstName.trim() !== (data.firstName || '').trim();

  const handleSave = async () => {
    if (!isValid) {
      setError('Name must be at least 2 characters');
      return;
    }
    await updateData({ firstName: firstName.trim() });
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
        <Text style={styles.title}>Edit Name</Text>
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
        <Field invalid={!!error}>
          <FieldLabel>First Name</FieldLabel>
          <FieldContent>
            <Input
              autoCapitalize="words"
              autoFocus
              invalid={!!error}
              placeholder="First name"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setError('');
              }}
            />
            <FieldDescription>
              This is how you&apos;ll appear on Artemis
            </FieldDescription>
            {error && <FieldError>{error}</FieldError>}
          </FieldContent>
        </Field>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
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
    saveText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'right',
    },
    saveTextDisabled: {
      color: theme.colors.mutedForeground,
    },
    title: {
      color: theme.colors.foreground,
      fontSize: 18,
      fontWeight: '600',
    },
  });
}
