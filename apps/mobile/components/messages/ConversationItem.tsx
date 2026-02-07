import {
  Image,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, borderRadius, colors, spacing } from '@artemis/ui';
import type { ConversationData } from '@/types/api';

interface ConversationItemProps {
  conversation: ConversationData;
  onPress: () => void;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Today - show time
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    // Within a week - show day name
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    // Older - show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export function ConversationItem({
  conversation,
  onPress,
}: ConversationItemProps) {
  const { lastMessage, unreadCount, user } = conversation;
  const hasUnread = unreadCount > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.avatarContainer}>
        {user.photo ? (
          <Image source={{ uri: user.photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons color={colors.mutedForeground} name="person" size={24} />
          </View>
        )}
        {hasUnread && <View style={styles.unreadBadge} />}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            color="dark"
            style={[styles.name, hasUnread && styles.unreadText]}
            variant="body"
          >
            {user.firstName}
          </Text>
          {lastMessage && (
            <RNText style={styles.time}>
              {formatTime(lastMessage.createdAt)}
            </RNText>
          )}
        </View>

        <View style={styles.messageRow}>
          {lastMessage ? (
            <Text
              color="dark"
              numberOfLines={1}
              style={[styles.message, hasUnread && styles.unreadText]}
              variant="body"
            >
              {lastMessage.isFromMe ? 'You: ' : ''}
              {lastMessage.content}
            </Text>
          ) : (
            <Text color="dark" style={styles.noMessages} variant="body">
              No messages yet
            </Text>
          )}
          {hasUnread && (
            <View style={styles.unreadCountBadge}>
              <RNText style={styles.unreadCountText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </RNText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 28,
    height: 56,
    width: 56,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.muted,
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  message: {
    color: colors.mutedForeground,
    flex: 1,
  },
  messageRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  name: {
    fontWeight: '600',
  },
  noMessages: {
    color: colors.mutedForeground,
    fontStyle: 'italic',
  },
  pressed: {
    backgroundColor: colors.accent,
  },
  time: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderColor: colors.white,
    borderRadius: 6,
    borderWidth: 2,
    bottom: 2,
    height: 12,
    position: 'absolute',
    right: 2,
    width: 12,
  },
  unreadCountBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadCountText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  unreadText: {
    fontWeight: '600',
  },
});
