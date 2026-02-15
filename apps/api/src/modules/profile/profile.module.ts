import { Module } from '@nestjs/common';
import { CloudModule } from '../cloud/cloud.module';
import { DatabaseModule } from '../database/database.module';
import { PetsModule } from '../pets/pets.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [CloudModule.register(), DatabaseModule.register(), PetsModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
