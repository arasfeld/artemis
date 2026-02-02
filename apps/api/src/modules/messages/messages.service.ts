import { ForbiddenException, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Match } from '../database/entities/match.entity';
import { Message } from '../database/entities/message.entity';
import { User } from '../database/entities/user.entity';
import { UserProfile } from '../database/entities/user-profile.entity';

export interface ConversationUser {
  firstName: string;
  id: string;
  photo: string | null;
}

export interface LastMessage {
  content: string;
  createdAt: string;
  isFromMe: boolean;
}

export interface ConversationData {
  createdAt: string;
  id: string;
  lastMessage: LastMessage | null;
  unreadCount: number;
  user: ConversationUser;
}

export interface MessageData {
  content: string;
  createdAt: string;
  id: string;
  isFromMe: boolean;
  readAt: string | null;
}

@Injectable()
export class MessagesService {
  constructor(private readonly em: EntityManager) {}

  /**
   * Get all conversations for a user with last message and unread count
   */
  async getConversations(userId: string): Promise<ConversationData[]> {
    // Find all matches involving this user
    const matches = await this.em.find(
      Match,
      {
        $or: [{ user1: { id: userId } }, { user2: { id: userId } }],
      },
      {
        orderBy: { createdAt: 'DESC' },
        populate: ['user1', 'user2'],
      }
    );

    const conversations: ConversationData[] = [];

    for (const match of matches) {
      const otherUser = match.user1.id === userId ? match.user2 : match.user1;

      // Get user profile and photo
      const profile = await this.em.findOne(
        UserProfile,
        { user: otherUser },
        { populate: ['photos'] }
      );

      const primaryPhoto = profile?.photos
        .getItems()
        .find((p) => p.displayOrder === 0);

      // Get last message for this conversation
      const lastMessage = await this.em.findOne(
        Message,
        { match },
        { orderBy: { createdAt: 'DESC' } }
      );

      // Count unread messages (messages from other user that haven't been read)
      const unreadCount = await this.em.count(Message, {
        match,
        readAt: null,
        sender: { id: { $ne: userId } },
      });

      conversations.push({
        createdAt: match.createdAt.toISOString(),
        id: match.id,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              createdAt: lastMessage.createdAt.toISOString(),
              isFromMe: lastMessage.sender.id === userId,
            }
          : null,
        unreadCount,
        user: {
          firstName: profile?.firstName || '',
          id: otherUser.id,
          photo: primaryPhoto?.url || null,
        },
      });
    }

    // Sort by last message time (most recent first), fallback to match creation time
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt || a.createdAt;
      const timeB = b.lastMessage?.createdAt || b.createdAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });

    return conversations;
  }

  /**
   * Get total unread message count for badge display
   */
  async getUnreadCount(userId: string): Promise<number> {
    // Get all match IDs where user is involved
    const matches = await this.em.find(Match, {
      $or: [{ user1: { id: userId } }, { user2: { id: userId } }],
    });

    if (matches.length === 0) {
      return 0;
    }

    // Count all unread messages across all conversations
    return this.em.count(Message, {
      match: { $in: matches },
      readAt: null,
      sender: { id: { $ne: userId } },
    });
  }

  /**
   * Get messages for a specific conversation (match)
   */
  async getMessages(
    userId: string,
    matchId: string,
    limit: number = 50,
    before?: string
  ): Promise<MessageData[]> {
    // Verify user is part of this match
    const match = await this.em.findOne(
      Match,
      { id: matchId },
      { populate: ['user1', 'user2'] }
    );

    if (!match) {
      throw new ForbiddenException('Match not found');
    }

    if (match.user1.id !== userId && match.user2.id !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    // Build query conditions
    const where: Record<string, unknown> = { match };
    if (before) {
      where.createdAt = { $lt: new Date(before) };
    }

    const messages = await this.em.find(Message, where, {
      limit,
      orderBy: { createdAt: 'DESC' },
      populate: ['sender'],
    });

    return messages.map((msg) => ({
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
      id: msg.id,
      isFromMe: msg.sender.id === userId,
      readAt: msg.readAt?.toISOString() || null,
    }));
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(
    userId: string,
    matchId: string,
    content: string
  ): Promise<MessageData> {
    // Verify user is part of this match
    const match = await this.em.findOne(
      Match,
      { id: matchId },
      { populate: ['user1', 'user2'] }
    );

    if (!match) {
      throw new ForbiddenException('Match not found');
    }

    if (match.user1.id !== userId && match.user2.id !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    const sender = await this.em.findOneOrFail(User, { id: userId });

    const message = new Message({
      content: content.trim(),
      match,
      sender,
    });

    this.em.persist(message);
    await this.em.flush();

    return {
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      id: message.id,
      isFromMe: true,
      readAt: null,
    };
  }

  /**
   * Mark all messages in a conversation as read
   */
  async markAsRead(userId: string, matchId: string): Promise<void> {
    // Verify user is part of this match
    const match = await this.em.findOne(
      Match,
      { id: matchId },
      { populate: ['user1', 'user2'] }
    );

    if (!match) {
      throw new ForbiddenException('Match not found');
    }

    if (match.user1.id !== userId && match.user2.id !== userId) {
      throw new ForbiddenException('You are not part of this conversation');
    }

    // Mark all unread messages from the other user as read
    await this.em.nativeUpdate(
      Message,
      {
        match,
        readAt: null,
        sender: { id: { $ne: userId } },
      },
      { readAt: new Date() }
    );
  }
}
