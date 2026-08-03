import { Injectable } from '@nestjs/common';
import type { HealthCheck } from '@ai-tos/shared';
import type { HealthComponentName } from '@ai-tos/config';
import { ConfigService } from '../configuration/config.service';
import {
  aggregateStatus,
  checkDatabase,
  checkHttpEndpoint,
  checkRedisUrl,
  checkTcpUrl,
  type CheckResult,
} from './health.checks';
import type { ComponentHealth, LivenessResult, ProbeResult } from './health.types';

/**
 * Enterprise health monitoring (Phase 2.1.5).
 * API · Database · Redis · Cache · AI Gateway · Event Bus.
 */
@Injectable()
export class HealthService {
  constructor(private readonly config: ConfigService) {}

  /** Kubernetes liveness — process is up. */
  getLiveness(): LivenessResult {
    return {
      status: 'ok',
      service: this.config.app.name,
      version: this.config.app.version,
      timestamp: new Date().toISOString(),
    };
  }

  /** Detailed health for operators (/health). */
  async getHealth(): Promise<HealthCheck> {
    const probe = await this.runChecks();
    return {
      status: probe.status,
      service: probe.service,
      version: probe.version,
      timestamp: probe.timestamp,
      details: {
        components: probe.components,
      },
    };
  }

  /** Kubernetes readiness — required components must be healthy. */
  async getReadiness(): Promise<ProbeResult & { ready: boolean }> {
    const probe = await this.runChecks();
    const required = new Set(this.config.health.readinessRequired);
    const failed = probe.components.filter(
      (c) => required.has(c.name) && c.status !== 'ok' && c.status !== 'skipped',
    );
    const ready = failed.length === 0;
    return {
      ...probe,
      status: ready ? 'ok' : 'error',
      ready,
    };
  }

  async runChecks(): Promise<ProbeResult> {
    const healthCfg = this.config.health;
    const timeoutMs = healthCfg.timeoutMs;
    const components: ComponentHealth[] = [];

    components.push({
      name: 'api',
      status: 'ok',
      latencyMs: 0,
      message: 'process up',
    });

    components.push(
      await this.runOptional(
        'database',
        healthCfg.checkDatabase,
        () => checkDatabase(timeoutMs),
      ),
    );

    components.push(
      await this.runOptional('redis', healthCfg.checkRedis, () =>
        checkRedisUrl(this.config.redis.url, timeoutMs),
      ),
    );

    components.push(
      await this.runOptional('cache', healthCfg.checkCache, () =>
        checkRedisUrl(healthCfg.redisCacheUrl || this.config.redis.url, timeoutMs),
      ),
    );

    components.push(
      await this.runOptional('ai_gateway', healthCfg.checkAiGateway, () =>
        checkHttpEndpoint(this.config.ai.serviceUrl, timeoutMs, '/health'),
      ),
    );

    if (!healthCfg.checkEventBus) {
      components.push({ name: 'event_bus', status: 'skipped', message: 'check disabled' });
    } else if (!healthCfg.eventBusUrl) {
      components.push({
        name: 'event_bus',
        status: 'error',
        message: 'EVENT_BUS_URL not configured',
      });
    } else {
      const url = healthCfg.eventBusUrl;
      const check =
        url.startsWith('http://') || url.startsWith('https://')
          ? () => checkHttpEndpoint(url, timeoutMs, '/health')
          : () => checkTcpUrl(url, timeoutMs);
      components.push(await this.runOptional('event_bus', true, check));
    }

    return {
      status: aggregateStatus(components),
      service: this.config.app.name,
      version: this.config.app.version,
      timestamp: new Date().toISOString(),
      components,
    };
  }

  private async runOptional(
    name: HealthComponentName,
    enabled: boolean,
    check: () => Promise<CheckResult>,
  ): Promise<ComponentHealth> {
    if (!enabled) {
      return { name, status: 'skipped', message: 'check disabled' };
    }
    const result = await check();
    return {
      name,
      status: result.ok ? 'ok' : 'error',
      latencyMs: result.latencyMs,
      message: result.message,
    };
  }
}
