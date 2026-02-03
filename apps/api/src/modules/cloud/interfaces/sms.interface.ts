export interface SmsOptions {
  to: string;
  message: string;
}

export interface SmsResult {
  messageId: string;
  success: boolean;
}

export interface ISmsService {
  send(options: SmsOptions): Promise<SmsResult>;
}

export const SMS_SERVICE = Symbol('SMS_SERVICE');
