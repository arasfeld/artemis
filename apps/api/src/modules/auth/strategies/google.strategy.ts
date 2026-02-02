import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import {
  Strategy,
  StrategyOptions,
  VerifyCallback,
} from 'passport-google-oauth20';
import { Request } from 'express';
import { createHmac } from 'crypto';
import { AuthService } from '../auth.service';

interface GoogleProfile {
  id: string;
  emails: Array<{ value: string }>;
  displayName: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly jwtSecret: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    const options: StrategyOptions = {
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
      state: false, // We handle state manually with signed tokens
    };
    super(options);
    this.jwtSecret = configService.get<string>('JWT_SECRET')!;
  }

  // Create a signed state token containing the redirect_uri
  private createSignedState(redirectUri?: string): string | undefined {
    if (!redirectUri) return undefined;

    const payload = JSON.stringify({
      redirectUri,
      exp: Date.now() + 5 * 60 * 1000, // 5 minute expiry
    });
    const signature = createHmac('sha256', this.jwtSecret)
      .update(payload)
      .digest('base64url');

    return `${Buffer.from(payload).toString('base64url')}.${signature}`;
  }

  // Verify and decode the signed state token
  private verifySignedState(state: string): { redirectUri?: string } | null {
    try {
      const [payloadB64, signature] = state.split('.');
      if (!payloadB64 || !signature) return null;

      const payload = Buffer.from(payloadB64, 'base64url').toString();
      const expectedSignature = createHmac('sha256', this.jwtSecret)
        .update(payload)
        .digest('base64url');

      if (signature !== expectedSignature) return null;

      const data = JSON.parse(payload);
      if (data.exp < Date.now()) return null; // Expired

      return { redirectUri: data.redirectUri };
    } catch {
      return null;
    }
  }

  // Override to inject our signed state into the OAuth flow
  authenticate(req: Request, options?: object) {
    const redirectUri = req.query.redirect_uri as string | undefined;
    const state = this.createSignedState(redirectUri);

    super.authenticate(req, { ...options, state });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
    done: VerifyCallback
  ) {
    try {
      const user = await this.authService.validateUser(profile);
      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  }

  // Extract redirect_uri from the signed state (called from controller)
  extractRedirectUri(state?: string): string | undefined {
    if (!state) return undefined;
    const data = this.verifySignedState(state);
    return data?.redirectUri;
  }
}
