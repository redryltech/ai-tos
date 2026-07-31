import { Injectable } from '@nestjs/common';
import type { HealthCheck } from '@ai-tos/shared';

@Injectable()
export class HealthService {
  getHealth(): HealthCheck {
    return {
      status: 'ok',
      service: 'api',
      version: '0.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
