import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../database/entities/user.entity';
import { UserAuthentication } from '../database/entities/user-authentication.entity';
import { UserEmail } from '../database/entities/user-email.entity';

export interface JwtPayload {
  sub: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
  ) {}

  async validateUser(profile: {
    id: string;
    emails: Array<{ value: string }>;
    displayName: string;
  }): Promise<User> {
    const { id, emails } = profile;
    const email = emails[0]?.value;

    if (!email) {
      throw new UnauthorizedException('No email provided by Google');
    }

    let user = await this.findUserByGoogleId(id);

    if (!user) {
      user = await this.findUserByEmail(email);

      if (!user) {
        user = await this.createUser(email);
      }

      await this.linkGoogleAccount(user, id);
    }

    return user;
  }

  async login(user: User): Promise<{ access_token: string }> {
    const primaryEmail = await this.em.findOne(UserEmail, {
      user: user.id,
      isPrimary: true,
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: primaryEmail?.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async logout(userId: string): Promise<void> {
    // For stateless JWT, logout is handled client-side by deleting the token
    // This method exists for future token blacklisting or session invalidation
    // Could be used to revoke refresh tokens or update lastLogoutAt timestamp
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await this.em.findOne(User, { id: userId });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const primaryEmail = await this.em.findOne(UserEmail, {
      user: userId,
      isPrimary: true,
    });

    return {
      id: user.id,
      username: user.username,
      email: primaryEmail?.email,
      createdAt: user.createdAt,
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.em.findOne(User, { id: payload.sub });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async findUserByGoogleId(googleId: string): Promise<User | null> {
    const auth = await this.em.findOne(
      UserAuthentication,
      { service: 'google', identifier: googleId },
      { populate: ['user'] },
    );
    return auth?.user ?? null;
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    const userEmail = await this.em.findOne(
      UserEmail,
      { email },
      { populate: ['user'] },
    );
    return userEmail?.user ?? null;
  }

  private async createUser(email: string): Promise<User> {
    const user = new User({});
    this.em.persist(user);

    const userEmail = new UserEmail({
      user,
      email,
      isPrimary: true,
      isVerified: true, // Verified through Google OAuth
    });
    this.em.persist(userEmail);

    await this.em.flush();

    return user;
  }

  private async linkGoogleAccount(user: User, googleId: string): Promise<void> {
    const existingAuth = await this.em.findOne(UserAuthentication, {
      user: user.id,
      service: 'google',
    });

    if (!existingAuth) {
      const auth = new UserAuthentication({
        user,
        service: 'google',
        identifier: googleId,
      });
      await this.em.persistAndFlush(auth);
    }
  }
}
