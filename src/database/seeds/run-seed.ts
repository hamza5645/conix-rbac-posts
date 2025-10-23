import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { typeOrmConfig } from '../../config/typeorm.config';
import { seedDatabase } from './seed';

loadEnv();

async function runSeed() {
  const configService = new ConfigService();
  const dataSourceOptions = typeOrmConfig(configService) as DataSourceOptions;
  
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');
    
    await seedDatabase(dataSource);
    
  } catch (error) {
    console.error('Error during Data Source initialization or seeding:', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeed();
