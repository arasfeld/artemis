import { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, colors, spacing } from '@artemis/ui';
import { ConversationItem } from '@/components/messages';
import { useGetConversationsQuery } from '@/store/api/apiSlice';
import type { ConversationData } from '@/types/api';

export default function MessagesScreen() {
  const router = useRouter();
  const {
    data: conversations = [],
    isLoading,
    refetch,
  } = useGetConversationsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  const handleConversationPress = useCallback(
    (matchId: string) => {
      router.push(`/chat/${matchId}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: ConversationData }) => (
      <ConversationItem
        conversation={item}
        onPress={() => handleConversationPress(item.id)}
      />
    ),
    [handleConversationPress]
  );

  const keyExtractor = useCallback((item: ConversationData) => item.id, []);

  // Empty state
  if (!isLoading && conversations.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.emptyContainer}>
          <Ionicons
            color={colors.text.muted}
            name="chatbubbles-outline"
            size={64}
          />
          <Text color="dark" style={styles.emptyTitle} variant="title">
            No conversations yet
          </Text>
          <Text center color="dark" style={styles.emptySubtitle} variant="body">
            When you match with someone, you can start chatting here
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text color="dark" variant="title">
          Messages
        </Text>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={conversations}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={refetch}
            refreshing={isLoading}
            tintColor={colors.primary}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptySubtitle: {
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  header: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  listContent: {
    flexGrow: 1,
  },
});
