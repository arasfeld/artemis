import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { GendersController } from './genders.controller';
import { GendersService } from './genders.service';

@Module({
  imports: [DatabaseModule.register()],
  controllers: [GendersController],
  providers: [GendersService],
  exports: [GendersService],
})
export class GendersModule {}
