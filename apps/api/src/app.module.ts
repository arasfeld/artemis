import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '../../.env' }),
    DatabaseModule.register(),
    AuthModule,
    ProfileModule,
  ],
})
export class AppModule {}
