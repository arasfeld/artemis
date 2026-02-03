import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CloudModule } from './modules/cloud/cloud.module';
import { DatabaseModule } from './modules/database/database.module';
import { DiscoverModule } from './modules/discover/discover.module';
import { GendersModule } from './modules/genders/genders.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RelationshipTypesModule } from './modules/relationship-types/relationship-types.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '../../.env' }),
    CloudModule.register(),
    DatabaseModule.register(),
    AuthModule,
    DiscoverModule,
    GendersModule,
    MessagesModule,
    ProfileModule,
    RelationshipTypesModule,
  ],
})
export class AppModule {}
