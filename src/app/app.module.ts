// import core decorators, config module, configuration helpers
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { RolesModule } from '../modules/roles/roles.module';
import { PermissionsModule } from '../modules/permissions/permissions.module';
import { PostsModule } from '../modules/posts/posts.module';

@Module({ //Module decorator
  imports: [ //imports the config module and the typeorm module
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => typeOrmConfig(config),
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    PostsModule,
  ],
})
export class AppModule {} //export the app module
