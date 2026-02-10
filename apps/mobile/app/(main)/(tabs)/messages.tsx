import { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Text, useTheme, type Theme } from '@artemis/ui';

import { ConversationItem } from '@/components/messages';
import { useGetConversationsQuery } from '@/store/api/apiSlice';
import type { ConversationData } from '@/types/api';

export default function MessagesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
            color={theme.colors.mutedForeground}
            name="chatbubbles-outline"
            size={64}
          />
          <Text style={styles.emptyTitle} variant="title">
            No conversations yet
          </Text>
          <Text center style={styles.emptySubtitle} variant="body">
            When you match with someone, you can start chatting here
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="title">
          Messages
        </Text>
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={conversations}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            colors={[theme.colors.primary]}
            onRefresh={refetch}
            refreshing={isLoading}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    emptyContainer: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    emptySubtitle: {
      paddingHorizontal: theme.spacing.xl,
    },
    emptyTitle: {
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    header: {
      paddingBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
    },
    listContent: {
      flexGrow: 1,
    },
  });
}
