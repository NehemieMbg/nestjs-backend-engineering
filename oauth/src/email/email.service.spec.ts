import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';

type ResendMock = {
  emails: {
    send: jest.Mock;
  };
};

describe('EmailService', () => {
  let service: EmailService;
  let resendMock: ResendMock;

  beforeEach(async () => {
    resendMock = {
      emails: {
        send: jest.fn().mockResolvedValue({ error: null }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService, { provide: Resend, useValue: resendMock }],
    }).compile();

    service = module.get(EmailService);
  });

  it('should send email successfully', async () => {
    await expect(
      service.sendEmail(
        'from@example.com',
        'to@example.com',
        'Subject',
        'Text',
      ),
    ).resolves.not.toThrow();
  });

  it('should throw InternalServerErrorException on error', async () => {
    resendMock.emails.send = jest.fn().mockResolvedValue({
      error: { statusCode: 500, message: 'Error', name: 'ResendError' },
    });

    await expect(
      service.sendEmail(
        'from@example.com',
        'to@example.com',
        'Subject',
        'Text',
      ),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
