import { Migrator } from '@mikro-orm/migrations';
import { defineConfig } from '@mikro-orm/postgresql';

export function buildDatabaseConfig(
  host: string | undefined,
  port: number | undefined,
  dbName: string | undefined,
  user: string | undefined,
  password: string | undefined
) {
  // load from env file if not passed in
  if (!host || !port || !dbName || !user || !password) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('dotenv').config();

    host = process.env.POSTGRES_HOST ?? 'localhost';
    port = parseInt(process.env.POSTGRES_PORT || '', 10) || 5432;
    dbName = process.env.POSTGRES_DB ?? 'artemis';
    user = process.env.POSTGRES_USER;
    password = process.env.POSTGRES_PASSWORD;
  }

  return defineConfig({
    host,
    port,
    dbName,
    user,
    password,
    strict: true,
    forceUtcTimezone: true,
    entities: ['dist/**/entities/*.js'],
    entitiesTs: ['src/**/entities/*.ts'],
    migrations: {
      path: 'dist/modules/database/migrations',
      pathTs: 'src/modules/database/migrations',
      tableName: 'migrations',
      transactional: true,
    },
    extensions: [Migrator],
  });
}

export default buildDatabaseConfig(
  undefined,
  undefined,
  undefined,
  undefined,
  undefined
);
