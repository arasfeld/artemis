import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { InteractionType } from '../database/entities/interaction.entity';
import { DiscoverService } from './discover.service';

class InteractionDto {
  action!: 'like' | 'pass';
  userId!: string;
}

@Controller('discover')
@UseGuards(JwtAuthGuard)
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Get()
  async getDiscoveryFeed(@CurrentUser() user: User) {
    return this.discoverService.getDiscoveryFeed(user.id);
  }

  @Post('swipe')
  async recordInteraction(
    @CurrentUser() user: User,
    @Body() dto: InteractionDto
  ) {
    const interactionType =
      dto.action === 'like' ? InteractionType.LIKE : InteractionType.PASS;
    return this.discoverService.recordInteraction(
      user.id,
      dto.userId,
      interactionType
    );
  }

  @Get('matches')
  async getMatches(@CurrentUser() user: User) {
    return this.discoverService.getMatches(user.id);
  }
}
