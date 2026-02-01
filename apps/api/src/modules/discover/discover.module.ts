import { Module } from '@nestjs/common';
import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';

@Module({
  controllers: [DiscoverController],
  exports: [DiscoverService],
  providers: [DiscoverService],
})
export class DiscoverModule {}
