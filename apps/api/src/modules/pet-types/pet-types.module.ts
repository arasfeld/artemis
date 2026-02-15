import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PetTypesController } from './pet-types.controller';
import { PetTypesService } from './pet-types.service';

@Module({
  imports: [DatabaseModule.register()],
  controllers: [PetTypesController],
  providers: [PetTypesService],
  exports: [PetTypesService],
})
export class PetTypesModule {}
