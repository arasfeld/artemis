import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { User } from '../database/entities/user.entity';

interface AuthenticatedRequest extends Request {
  user: User;
}

// Allowed redirect URI patterns for security
const ALLOWED_REDIRECT_PATTERNS = [
  /^artemis:\/\/auth$/, // Custom scheme for standalone/dev builds
  /^exp:\/\/.*\/--\/auth$/, // Expo Go development
  /^https?:\/\/localhost(:\d+)?\/auth$/, // Local web development
];

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly googleStrategy: GoogleStrategy,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Passport redirects to Google
    // The redirect_uri is passed via the state parameter in GoogleStrategy
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Query('state') state?: string,
  ) {
    try {
      const { user } = req;

      if (!user) {
        return this.redirectWithError(res, 'Authentication failed');
      }

      const token = await this.authService.login(user);

      // Extract redirect URI from signed state token
      const clientRedirectUri = this.googleStrategy.extractRedirectUri(state);
      const redirectUri = this.getValidatedRedirectUri(clientRedirectUri);

      // Redirect to mobile app with token
      res.redirect(`${redirectUri}?token=${token.access_token}`);
    } catch (error) {
      return this.redirectWithError(
        res,
        error instanceof Error ? error.message : 'Authentication failed',
      );
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.authService.getUserProfile(req.user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: AuthenticatedRequest) {
    // For JWT-based auth, logout is primarily client-side (delete token)
    // Server-side we can implement token blacklisting if needed
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }

  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  async verifyToken(@Req() req: AuthenticatedRequest) {
    // Simple endpoint to verify if the current token is valid
    return { valid: true, userId: req.user.id };
  }

  private getDefaultRedirectUri(): string {
    // Default to artemis:// scheme for mobile app
    return this.configService.get<string>(
      'MOBILE_REDIRECT_URI',
      'artemis://auth',
    );
  }

  private isAllowedRedirectUri(uri: string): boolean {
    return ALLOWED_REDIRECT_PATTERNS.some((pattern) => pattern.test(uri));
  }

  private getValidatedRedirectUri(clientRedirectUri?: string): string {
    // If client provided a redirect URI and it's allowed, use it
    if (clientRedirectUri && this.isAllowedRedirectUri(clientRedirectUri)) {
      return clientRedirectUri;
    }

    // Fall back to default
    return this.getDefaultRedirectUri();
  }

  private redirectWithError(
    res: Response,
    message: string,
    redirectUri?: string,
  ) {
    const uri = this.getValidatedRedirectUri(redirectUri);
    const encodedError = encodeURIComponent(message);
    res.redirect(`${uri}?error=${encodedError}`);
  }
}
