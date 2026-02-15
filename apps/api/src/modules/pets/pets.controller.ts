import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '../database/entities/user.entity';
import {
  ConfirmPetPhotoUploadDto,
  CreatePetDto,
  GetPetPhotoUploadUrlDto,
  PetsService,
  UpdatePetDto,
} from './pets.service';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('pets')
@UseGuards(AuthGuard('jwt'))
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  async getUserPets(@Req() req: AuthenticatedRequest) {
    return this.petsService.getUserPets(req.user.id);
  }

  @Post()
  async createPet(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreatePetDto
  ) {
    return this.petsService.createPet(req.user.id, dto);
  }

  @Patch(':petId')
  async updatePet(
    @Req() req: AuthenticatedRequest,
    @Param('petId') petId: string,
    @Body() dto: UpdatePetDto
  ) {
    return this.petsService.updatePet(req.user.id, petId, dto);
  }

  @Delete(':petId')
  async deletePet(
    @Req() req: AuthenticatedRequest,
    @Param('petId') petId: string
  ) {
    await this.petsService.deletePet(req.user.id, petId);
    return { success: true };
  }

  @Post(':petId/photos/upload-url')
  async getPhotoUploadUrl(
    @Req() req: AuthenticatedRequest,
    @Param('petId') petId: string,
    @Body() dto: GetPetPhotoUploadUrlDto
  ) {
    return this.petsService.getPhotoUploadUrl(req.user.id, petId, dto);
  }

  @Post(':petId/photos/confirm')
  async confirmPhotoUpload(
    @Req() req: AuthenticatedRequest,
    @Param('petId') petId: string,
    @Body() dto: ConfirmPetPhotoUploadDto
  ) {
    return this.petsService.confirmPhotoUpload(req.user.id, petId, dto);
  }

  @Delete(':petId/photos/:photoId')
  async deletePhoto(
    @Req() req: AuthenticatedRequest,
    @Param('petId') petId: string,
    @Param('photoId') photoId: string
  ) {
    return this.petsService.deletePhoto(req.user.id, petId, photoId);
  }

  @Patch(':petId/photos/reorder')
  async reorderPhotos(
    @Req() req: AuthenticatedRequest,
    @Param('petId') petId: string,
    @Body() body: { photoIds: string[] }
  ) {
    return this.petsService.reorderPhotos(req.user.id, petId, body.photoIds);
  }
}
