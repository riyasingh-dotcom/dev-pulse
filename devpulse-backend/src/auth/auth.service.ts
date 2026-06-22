import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class AuthService {
  private readonly dashboardPin: string;

  constructor(private readonly config: ConfigService) {
    const pin = this.config.get<string>('DASHBOARD_PIN');
    if (!pin) {
      throw new Error(
        'DASHBOARD_PIN is not set. Add it to your .env file before starting the server.',
      );
    }
    this.dashboardPin = pin;
  }

  verifyPin(submitted: string): boolean {
    const submittedBuf = Buffer.from(submitted, 'utf8');
    const storedBuf = Buffer.from(this.dashboardPin, 'utf8');
    if (submittedBuf.length !== storedBuf.length) {
      return false;
    }
    return timingSafeEqual(submittedBuf, storedBuf);
  }
}
