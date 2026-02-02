import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RelationshipTypesController } from './relationship-types.controller';
import { RelationshipTypesService } from './relationship-types.service';

@Module({
  imports: [DatabaseModule.register()],
  controllers: [RelationshipTypesController],
  providers: [RelationshipTypesService],
  exports: [RelationshipTypesService],
})
export class RelationshipTypesModule {}
