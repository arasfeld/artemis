import { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme, type Theme } from '@artemis/ui';

import { ChatInput, MessageBubble } from '@/components/messages';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useMarkMessagesAsReadMutation,
  useSendMessageMutation,
} from '@/store/api/apiSlice';
import type { MessageData } from '@/types/api';

export default function ChatScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();

  const { data: conversations = [] } = useGetConversationsQuery();
  const { data: messages = [], isLoading } = useGetMessagesQuery(
    { matchId: matchId! },
    {
      pollingInterval: 5000, // Poll every 5 seconds while viewing
      skip: !matchId,
    }
  );
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [markAsRead] = useMarkMessagesAsReadMutation();

  // Find the conversation to get user info
  const conversation = useMemo(
    () => conversations.find((c) => c.id === matchId),
    [conversations, matchId]
  );

  // Mark messages as read when entering the chat
  useEffect(() => {
    if (matchId) {
      markAsRead(matchId);
    }
  }, [markAsRead, matchId]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!matchId) return;
      try {
        await sendMessage({ content, matchId }).unwrap();
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [matchId, sendMessage]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderMessage = useCallback(
    ({ item, index }: { item: MessageData; index: number }) => {
      // Show time if it's the last message or time gap > 5 minutes from next
      const nextMessage = messages[index + 1];
      const showTime =
        !nextMessage ||
        new Date(item.createdAt).getTime() -
          new Date(nextMessage.createdAt).getTime() >
          5 * 60 * 1000;

      return <MessageBubble message={item} showTime={showTime} />;
    },
    [messages]
  );

  const keyExtractor = useCallback((item: MessageData) => item.id, []);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Text center variant="body">
          No messages yet. Say hi!
        </Text>
      </View>
    ),
    []
  );

  return (
    <>
      <Stack.Screen
        options={{
          header: () => (
            <View style={[styles.header, { paddingTop: insets.top }]}>
              <Pressable onPress={handleBack} style={styles.backButton}>
                <Ionicons
                  color={theme.colors.foreground}
                  name="chevron-back"
                  size={28}
                />
              </Pressable>
              <View style={styles.headerContent}>
                {conversation?.user.photo ? (
                  <Image
                    source={{ uri: conversation.user.photo }}
                    style={styles.headerAvatar}
                  />
                ) : (
                  <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                    <Ionicons
                      color={theme.colors.mutedForeground}
                      name="person"
                      size={16}
                    />
                  </View>
                )}
                <Text style={styles.headerName} variant="subtitle">
                  {conversation?.user.firstName || 'Chat'}
                </Text>
              </View>
              <View style={styles.headerSpacer} />
            </View>
          ),
          headerShown: true,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        style={styles.container}
      >
        <FlatList
          contentContainerStyle={styles.messageList}
          data={messages}
          inverted
          keyExtractor={keyExtractor}
          ListEmptyComponent={!isLoading ? ListEmptyComponent : null}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
        />
        <ChatInput disabled={isSending} onSend={handleSend} />
      </KeyboardAvoidingView>
    </>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    avatarPlaceholder: {
      alignItems: 'center',
      backgroundColor: theme.colors.muted,
      justifyContent: 'center',
    },
    backButton: {
      padding: theme.spacing.sm,
    },
    container: {
      backgroundColor: theme.colors.background,
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      padding: theme.spacing.xl,
      transform: [{ scaleY: -1 }], // Flip because list is inverted
    },
    header: {
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderBottomColor: theme.colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      paddingBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    headerAvatar: {
      borderRadius: 18,
      height: 36,
      marginRight: theme.spacing.sm,
      width: 36,
    },
    headerContent: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    headerName: {
      fontWeight: '600',
    },
    headerSpacer: {
      width: 44, // Match back button width for centering
    },
    messageList: {
      flexGrow: 1,
      paddingVertical: theme.spacing.md,
    },
  });
}
