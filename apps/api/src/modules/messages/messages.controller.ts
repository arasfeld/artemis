import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../database/entities/user.entity';
import { MessagesService } from './messages.service';

class SendMessageDto {
  content!: string;
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  async getConversations(@CurrentUser() user: User) {
    return this.messagesService.getConversations(user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.messagesService.getUnreadCount(user.id);
    return { count };
  }

  @Get(':matchId')
  async getMessages(
    @CurrentUser() user: User,
    @Param('matchId') matchId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string
  ) {
    return this.messagesService.getMessages(
      user.id,
      matchId,
      limit ? parseInt(limit, 10) : undefined,
      before
    );
  }

  @Post(':matchId')
  async sendMessage(
    @CurrentUser() user: User,
    @Param('matchId') matchId: string,
    @Body() dto: SendMessageDto
  ) {
    return this.messagesService.sendMessage(user.id, matchId, dto.content);
  }

  @Patch(':matchId/read')
  async markAsRead(
    @CurrentUser() user: User,
    @Param('matchId') matchId: string
  ) {
    await this.messagesService.markAsRead(user.id, matchId);
    return { success: true };
  }
}
