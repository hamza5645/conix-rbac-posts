import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

type SupportedDriver = 'postgres' | 'mysql'; //type for the supported drivers

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => { //a helper function to parse the boolean values
  if (value === undefined) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
};

const resolveDriver = (raw: string | undefined): SupportedDriver => { //
  if (raw && raw.toLowerCase() === 'mysql') {
    return 'mysql';
  }
  return 'postgres';
};

export const typeOrmConfig = (
  config: ConfigService,
): TypeOrmModuleOptions => {
  const type = resolveDriver(config.get<string>('DB_TYPE'));
  const defaultPort = type === 'mysql' ? 3306 : 5432;

  return {
    type,
    host: config.getOrThrow<string>('DB_HOST'),
    port: parseInt(config.get<string>('DB_PORT') ?? String(defaultPort), 10),
    username: config.getOrThrow<string>('DB_USERNAME'),
    password: config.getOrThrow<string>('DB_PASSWORD'),
    database: config.getOrThrow<string>('DB_NAME'),
    entities: [join(__dirname, '/../modules/**/*.entity.{ts,js}')],
    migrations: [join(__dirname, '/../database/migrations/*.{ts,js}')],
    synchronize: parseBoolean(config.get('DB_SYNC'), false),
    logging: parseBoolean(config.get('DB_LOGGING'), true),
  };
};
