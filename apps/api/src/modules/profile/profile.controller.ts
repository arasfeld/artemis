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
  AddPhotoDto,
  ConfirmPhotoUploadDto,
  GetPhotoUploadUrlDto,
  ProfileService,
  UpdateProfileDto,
} from './profile.service';

interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Req() req: AuthenticatedRequest) {
    const profile = await this.profileService.getProfile(req.user.id);
    return this.profileService.serializeProfileWithSignedUrls(profile);
  }

  @Patch()
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto
  ) {
    const profile = await this.profileService.updateProfile(req.user.id, dto);
    return this.profileService.serializeProfileWithSignedUrls(profile);
  }

  @Post('photos/upload-url')
  async getPhotoUploadUrl(
    @Req() req: AuthenticatedRequest,
    @Body() dto: GetPhotoUploadUrlDto
  ) {
    return this.profileService.getPhotoUploadUrl(req.user.id, dto);
  }

  @Post('photos/confirm')
  async confirmPhotoUpload(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ConfirmPhotoUploadDto
  ) {
    const profile = await this.profileService.confirmPhotoUpload(
      req.user.id,
      dto
    );
    return this.profileService.serializeProfileWithSignedUrls(profile);
  }

  @Post('photos')
  async addPhoto(@Req() req: AuthenticatedRequest, @Body() dto: AddPhotoDto) {
    const profile = await this.profileService.addPhoto(req.user.id, dto);
    return this.profileService.serializeProfileWithSignedUrls(profile);
  }

  @Delete('photos/:photoId')
  async deletePhoto(
    @Req() req: AuthenticatedRequest,
    @Param('photoId') photoId: string
  ) {
    const profile = await this.profileService.deletePhoto(req.user.id, photoId);
    return this.profileService.serializeProfileWithSignedUrls(profile);
  }

  @Patch('photos/reorder')
  async reorderPhotos(
    @Req() req: AuthenticatedRequest,
    @Body() body: { photoIds: string[] }
  ) {
    const profile = await this.profileService.reorderPhotos(
      req.user.id,
      body.photoIds
    );
    return this.profileService.serializeProfileWithSignedUrls(profile);
  }
}
