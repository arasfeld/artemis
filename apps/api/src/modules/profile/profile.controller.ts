import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService, UpdateProfileDto, AddPhotoDto } from './profile.service';
import { User } from '../database/entities/user.entity';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.profileService.getProfile(req.user.id);
  }

  @Patch()
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(req.user.id, dto);
  }

  @Post('photos')
  async addPhoto(@Req() req: AuthenticatedRequest, @Body() dto: AddPhotoDto) {
    return this.profileService.addPhoto(req.user.id, dto);
  }

  @Delete('photos/:photoId')
  async deletePhoto(
    @Req() req: AuthenticatedRequest,
    @Param('photoId') photoId: string,
  ) {
    return this.profileService.deletePhoto(req.user.id, photoId);
  }

  @Patch('photos/reorder')
  async reorderPhotos(
    @Req() req: AuthenticatedRequest,
    @Body() body: { photoIds: string[] },
  ) {
    return this.profileService.reorderPhotos(req.user.id, body.photoIds);
  }
}
