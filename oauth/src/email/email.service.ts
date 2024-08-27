import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import * as process from 'node:process';

export interface ResendError {
  statusCode: number;
  message: string;
  name: string;
}

@Injectable()
export class EmailService {
  constructor(private readonly resend: Resend) {}

  async sendEmail(from: string, to: string, subject: string, text: string) {
    const { error } = await this.resend.emails.send({
      from: `${process.env.EMAIL_NAME} <${from}>`,
      to,
      subject,
      html: `<strong>${text}</strong>`,
    });

    if (error as ResendError) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
