import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSubmitEditingEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type Theme } from '@artemis/ui';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ disabled = false, onSend }: ChatInputProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [text, setText] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText('');
    }
  }, [disabled, onSend, text]);

  const handleSubmitEditing = useCallback(
    (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
      e.preventDefault();
      handleSend();
    },
    [handleSend]
  );

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          editable={!disabled}
          multiline
          onChangeText={setText}
          onSubmitEditing={handleSubmitEditing}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.mutedForeground}
          style={styles.input}
          value={text}
        />
        <Pressable
          disabled={!canSend}
          onPress={handleSend}
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
        >
          <Ionicons
            color={canSend ? theme.colors.primaryForeground : theme.colors.mutedForeground}
            name="send"
            size={20}
          />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      borderTopColor: theme.colors.border,
      borderTopWidth: 1,
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    input: {
      color: theme.colors.foreground,
      flex: 1,
      fontSize: 16,
      maxHeight: 100,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    inputContainer: {
      alignItems: 'flex-end',
      backgroundColor: theme.colors.accent,
      borderRadius: theme.borderRadius.xl,
      flexDirection: 'row',
      ...theme.shadow.sm,
    },
    sendButton: {
      alignItems: 'center',
      backgroundColor: theme.colors.muted,
      borderRadius: theme.borderRadius.full,
      height: 36,
      justifyContent: 'center',
      marginBottom: 4,
      marginRight: 4,
      width: 36,
    },
    sendButtonActive: {
      backgroundColor: theme.colors.primary,
    },
  });
}
