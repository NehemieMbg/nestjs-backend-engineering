import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './users/user.entity';
import { EmailModule } from './email/email.module';
import * as process from 'node:process';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    EmailModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres', // Adjust to your database type
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
      entities: [User],
      synchronize: true, // only in dev mode
      // logging: true, // Enable logging for debugging
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
