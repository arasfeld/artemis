import { Module } from '@nestjs/common';
import { CloudModule } from '../cloud/cloud.module';
import { DatabaseModule } from '../database/database.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [CloudModule.register(), DatabaseModule.register()],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
