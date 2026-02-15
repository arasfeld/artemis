import { Controller, Get } from '@nestjs/common';
import { PetTypesService } from './pet-types.service';

@Controller('pet-types')
export class PetTypesController {
  constructor(private readonly petTypesService: PetTypesService) {}

  @Get()
  async findAll() {
    return this.petTypesService.findAll();
  }
}
