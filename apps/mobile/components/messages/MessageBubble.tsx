import { StyleSheet, Text as RNText, View } from 'react-native';
import { Text, borderRadius, colors, spacing } from '@artemis/ui';
import type { MessageData } from '@/types/api';

interface MessageBubbleProps {
  message: MessageData;
  showTime?: boolean;
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function MessageBubble({
  message,
  showTime = false,
}: MessageBubbleProps) {
  const { content, createdAt, isFromMe } = message;

  return (
    <View
      style={[styles.container, isFromMe ? styles.fromMe : styles.fromThem]}
    >
      <View
        style={[
          styles.bubble,
          isFromMe ? styles.bubbleFromMe : styles.bubbleFromThem,
        ]}
      >
        <Text
          color={isFromMe ? 'light' : 'dark'}
          style={styles.text}
          variant="body"
        >
          {content}
        </Text>
      </View>
      {showTime && (
        <RNText
          style={[
            styles.time,
            isFromMe ? styles.timeFromMe : styles.timeFromThem,
          ]}
        >
          {formatMessageTime(createdAt)}
        </RNText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: borderRadius.lg,
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleFromMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleFromThem: {
    backgroundColor: colors.muted,
    borderBottomLeftRadius: 4,
  },
  container: {
    marginVertical: 2,
    paddingHorizontal: spacing.md,
  },
  fromMe: {
    alignItems: 'flex-end',
  },
  fromThem: {
    alignItems: 'flex-start',
  },
  text: {
    lineHeight: 20,
  },
  time: {
    color: colors.mutedForeground,
    fontSize: 11,
    marginTop: 2,
  },
  timeFromMe: {
    marginRight: 4,
  },
  timeFromThem: {
    marginLeft: 4,
  },
});
