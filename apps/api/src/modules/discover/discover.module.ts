import { Module } from '@nestjs/common';
import { CloudModule } from '../cloud/cloud.module';
import { PetsModule } from '../pets/pets.module';
import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';

@Module({
  controllers: [DiscoverController],
  exports: [DiscoverService],
  imports: [CloudModule.register(), PetsModule],
  providers: [DiscoverService],
})
export class DiscoverModule {}
