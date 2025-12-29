import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

const sendMailMock = jest.fn<Promise<unknown>, [SendMailOptions]>();

type MockTransport = {
  sendMail: typeof sendMailMock;
};

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(async () => {
    sendMailMock.mockResolvedValue({});

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    } as MockTransport);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GMAIL_USER') return 'test@gmail.com';
              if (key === 'GMAIL_PASS') return 'test-pass';
              return null;
            }),
          },
        },
      ],
    }).compile();

    emailService = module.get(EmailService);
  });

  it('should send invoice email with attachment', async () => {
    await emailService.sendInvoiceEmail(
      'customer@gmail.com',
      'Invoice',
      Buffer.from('pdf'),
    );

    expect(sendMailMock).toHaveBeenCalledTimes(1);
  });
});
