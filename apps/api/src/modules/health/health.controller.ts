import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { HealthCheck } from '@ai-tos/shared';
import { HealthService } from './health.service';
import { Public } from '../auth/decorators/public.decorator';
import type { LivenessResult, ProbeResult } from './health.types';

/**
 * Kubernetes-friendly probes at /health, /ready, /live (excluded from global API prefix).
 */
@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get('health')
  async getHealth(): Promise<HealthCheck> {
    return this.health.getHealth();
  }

  @Public()
  @Get('ready')
  async getReady(
    @Res({ passthrough: true }) res: Response,
  ): Promise<ProbeResult & { ready: boolean }> {
    const result = await this.health.getReadiness();
    res.status(result.ready ? 200 : 503);
    return result;
  }

  @Public()
  @Get('live')
  getLive(): LivenessResult {
    return this.health.getLiveness();
  }
}
