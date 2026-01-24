import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      getUserProfile: jest.fn(),
      logout: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('artemis://auth'),
    };

    const mockGoogleStrategy = {
      extractRedirectUri: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: GoogleStrategy,
          useValue: mockGoogleStrategy,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuth', () => {
    it('should redirect to Google', () => {
      expect(() => controller.googleAuth()).not.toThrow();
    });
  });
});
