import { useCallback, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSubmitEditingEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius, colors, shadow, spacing } from '@artemis/ui';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ disabled = false, onSend }: ChatInputProps) {
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
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          value={text}
        />
        <Pressable
          disabled={!canSend}
          onPress={handleSend}
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
        >
          <Ionicons
            color={canSend ? colors.primaryForeground : colors.mutedForeground}
            name="send"
            size={20}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  input: {
    color: colors.foreground,
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputContainer: {
    alignItems: 'flex-end',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    ...shadow.sm,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderRadius: borderRadius.full,
    height: 36,
    justifyContent: 'center',
    marginBottom: 4,
    marginRight: 4,
    width: 36,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
});
