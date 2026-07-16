import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { Pool } from 'mysql2/promise';
import mysql from 'mysql2/promise';
import { DATABASE_TOKEN } from './database.token';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_TOKEN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Pool => {
        return mysql.createPool({
          host: configService.getOrThrow<string>('DB_HOST_ISHTARI'),
          user: configService.getOrThrow<string>('DB_USER_ISHTARI'),
          password: configService.getOrThrow<string>('DB_PASSWORD_ISHTARI'),
          database: configService.getOrThrow<string>('DB_NAME_ISHTARI'),
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        });
      },
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
