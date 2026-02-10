import { useMemo } from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import { Text, useTheme, type Theme } from '@artemis/ui';

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
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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

function createStyles(theme: Theme) {
  return StyleSheet.create({
    bubble: {
      borderRadius: theme.borderRadius.lg,
      maxWidth: '80%',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    bubbleFromMe: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    bubbleFromThem: {
      backgroundColor: theme.colors.muted,
      borderBottomLeftRadius: 4,
    },
    container: {
      marginVertical: 2,
      paddingHorizontal: theme.spacing.md,
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
      color: theme.colors.mutedForeground,
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
}
