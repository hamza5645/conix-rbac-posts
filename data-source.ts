import 'reflect-metadata'; //Enables reflection api for TypeORM
import { DataSource, DataSourceOptions } from 'typeorm'; //Datasource class
import { config as loadEnv } from 'dotenv'; //import conifg and load env 
import { ConfigService } from '@nestjs/config'; //import config service
import { typeOrmConfig } from './src/config/typeorm.config'; //import typeorm config

loadEnv();

const configService = new ConfigService(); //construct config service instance
const baseOptions = typeOrmConfig(configService) as DataSourceOptions; //construct the typeorm options

const dataSource = new DataSource({ //construct the datasource instance
  ...baseOptions,
  migrationsTableName: baseOptions.migrationsTableName ?? 'migrations',
});

export default dataSource; //export the datasource instance
