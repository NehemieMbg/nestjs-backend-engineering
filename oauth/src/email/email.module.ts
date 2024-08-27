import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { Resend } from 'resend';
import * as process from 'node:process';

@Module({
  imports: [
    ConfigModule, // Ensure ConfigModule is imported
  ],
  providers: [
    EmailService,
    {
      provide: Resend,
      useFactory: () => new Resend(process.env.RESEND_API_KEY as string),
    },
  ],
  exports: [EmailService], // Export EmailService to make it available
})
export class EmailModule {}
