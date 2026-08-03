import { Controller, Get } from '@nestjs/common';
import type { HealthCheck } from '@ai-tos/shared';
import { HealthService } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get()
  get(): HealthCheck {
    return this.health.getHealth();
  }
}
