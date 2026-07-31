import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { loadConfig } from '@ai-tos/config';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() _body: LoginDto): { accessToken: string } {
    // Phase 0 foundation: demo token only outside production.
    if (loadConfig().NODE_ENV === 'production') {
      throw new ForbiddenException('Demo login disabled in production');
    }
    return { accessToken: this.auth.issueDemoToken('admin') };
  }
}
