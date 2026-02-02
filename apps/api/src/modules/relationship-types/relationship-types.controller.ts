import { Controller, Get } from '@nestjs/common';
import { RelationshipTypesService } from './relationship-types.service';

@Controller('relationship-types')
export class RelationshipTypesController {
  constructor(
    private readonly relationshipTypesService: RelationshipTypesService
  ) {}

  @Get()
  async findAll() {
    return this.relationshipTypesService.findAll();
  }
}
