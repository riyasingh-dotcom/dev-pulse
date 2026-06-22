import { Body, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifyPinDto } from './verify-pin.dto';

type VerifyPinResponse = { success: true };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-pin')
  @HttpCode(200)
  verifyPin(@Body() dto: VerifyPinDto): VerifyPinResponse {
    if (!this.authService.verifyPin(dto.pin)) {
      throw new UnauthorizedException('Invalid PIN');
    }
    return { success: true };
  }
}
