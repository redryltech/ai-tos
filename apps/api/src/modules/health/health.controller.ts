import { Controller, Get } from '@nestjs/common';
import type { HealthCheck } from '@ai-tos/shared';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  get(): HealthCheck {
    return this.health.getHealth();
  }
}
