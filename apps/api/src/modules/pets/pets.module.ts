import { Module } from '@nestjs/common';
import { CloudModule } from '../cloud/cloud.module';
import { DatabaseModule } from '../database/database.module';
import { PetsController } from './pets.controller';
import { PetsService } from './pets.service';

@Module({
  imports: [CloudModule.register(), DatabaseModule.register()],
  controllers: [PetsController],
  providers: [PetsService],
  exports: [PetsService],
})
export class PetsModule {}
