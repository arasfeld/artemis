export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailAddress | EmailAddress[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: EmailAddress;
}

export interface TemplatedEmailOptions {
  to: EmailAddress | EmailAddress[];
  template: string;
  data: Record<string, unknown>;
  replyTo?: EmailAddress;
}

export interface SendResult {
  messageId: string;
  success: boolean;
}

export interface IEmailService {
  send(options: EmailOptions): Promise<SendResult>;
  sendTemplated(options: TemplatedEmailOptions): Promise<SendResult>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');
