import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { buildDatabaseConfig } from './mikro-orm.config';

@Module({})
export class DatabaseModule {
  static async register(): Promise<DynamicModule> {
    const mikroOrm = await MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      driver: PostgreSqlDriver,
      useFactory: (configService: ConfigService) => {
        return {
          ...buildDatabaseConfig(
            configService.get<string>('POSTGRES_HOST'),
            configService.get<number>('POSTGRES_PORT'),
            configService.get<string>('POSTGRES_DB'),
            configService.get<string>('POSTGRES_USER'),
            configService.get<string>('POSTGRES_PASSWORD'),
          ),
        };
      },
    });

    return {
      module: DatabaseModule,
      imports: [mikroOrm],
      providers: [],
      exports: [mikroOrm],
    };
  }
}
