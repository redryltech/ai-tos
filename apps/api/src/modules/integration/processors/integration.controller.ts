import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '../../configuration/config.service';
import type { IConnectorAdapter } from '../adapters/connector.adapter';
import {
  CONNECTION_LIFECYCLE_MANAGER,
  CONNECTOR_ADAPTERS,
  INTEGRATION_RESOLVER,
  type IConnectionLifecycleManager,
  type IIntegrationController,
  type IIntegrationResolver,
} from '../contracts';
import type { IntegrationRequestDto } from '../dto/integration.dto';
import type {
  IntegrationRequest,
  IntegrationResult,
} from '../models/integration.models';

/**
 * Integration Controller — validate and start pipeline.
 * Never communicates with external systems directly.
 */
@Injectable()
export class IntegrationController implements IIntegrationController {
  private readonly adaptersByConnector: Map<string, IConnectorAdapter>;

  constructor(
    private readonly config: ConfigService,
    @Inject(INTEGRATION_RESOLVER) private readonly resolver: IIntegrationResolver,
    @Inject(CONNECTION_LIFECYCLE_MANAGER)
    private readonly lifecycle: IConnectionLifecycleManager,
    @Inject(CONNECTOR_ADAPTERS) adapters: IConnectorAdapter[],
  ) {
    this.adaptersByConnector = new Map(
      adapters.map((a) => [a.connectorId, a]),
    );
  }

  async execute(dto: IntegrationRequestDto): Promise<IntegrationResult> {
    const request = this.validate(dto);
    const resolved = this.resolver.resolve(
      request.connectorId,
      request.operation,
    );
    if (!resolved.available || !resolved.registration) {
      throw new Error(
        `Connector unavailable: ${request.connectorId} (${resolved.reason})`,
      );
    }

    const adapter = this.adaptersByConnector.get(request.connectorId);
    if (!adapter) {
      throw new Error(`Connector adapter missing: ${request.connectorId}`);
    }

    let session = this.lifecycle.getSession(request.connectorId);
    if (!session || session.state !== 'connected') {
      const auth = this.lifecycle.authenticate(
        request.connectorId,
        request.options?.authMode,
        `secret://${request.connectorId}`,
      );
      if (auth.state === 'error') {
        return Object.freeze({
          requestId: request.requestId,
          connectorId: request.connectorId,
          status: 'auth_failed',
          output: Object.freeze({ error: auth.lastError ?? 'auth_failed' }),
          metadata: Object.freeze({ lifecycle: true }),
          duration: 0,
          traceId: request.traceId,
        });
      }
      session = this.lifecycle.connect(request.connectorId);
      if (session.state !== 'connected') {
        return Object.freeze({
          requestId: request.requestId,
          connectorId: request.connectorId,
          status: 'auth_failed',
          output: Object.freeze({ error: session.lastError ?? 'connect_failed' }),
          metadata: Object.freeze({ lifecycle: true }),
          duration: 0,
          traceId: request.traceId,
        });
      }
    }

    const timeoutMs =
      request.options?.timeoutMs ??
      resolved.registration.descriptor.timeoutMs ??
      this.config.integration.defaultTimeoutMs;

    return this.withTimeout(adapter.execute(request), timeoutMs, request);
  }

  private validate(dto: IntegrationRequestDto): IntegrationRequest {
    if (!dto || typeof dto !== 'object') {
      throw new Error('IntegrationRequest is required');
    }
    if (!dto.connectorId || typeof dto.connectorId !== 'string') {
      throw new Error('IntegrationRequest.connectorId is required');
    }
    if (!dto.operation || typeof dto.operation !== 'string') {
      throw new Error('IntegrationRequest.operation is required');
    }
    if (!dto.input || typeof dto.input !== 'object') {
      throw new Error('IntegrationRequest.input is required');
    }

    return Object.freeze({
      requestId:
        typeof dto.requestId === 'string' && dto.requestId.trim()
          ? dto.requestId.trim()
          : randomUUID(),
      connectorId: dto.connectorId.trim(),
      operation: dto.operation.trim(),
      input: Object.freeze({ ...dto.input }),
      options: dto.options ? Object.freeze({ ...dto.options }) : undefined,
      metadata: Object.freeze({ ...(dto.metadata ?? {}) }),
      traceId:
        typeof dto.traceId === 'string' && dto.traceId.trim()
          ? dto.traceId.trim()
          : randomUUID(),
    });
  }

  private async withTimeout(
    promise: Promise<IntegrationResult>,
    timeoutMs: number,
    request: IntegrationRequest,
  ): Promise<IntegrationResult> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<IntegrationResult>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(new Error(`Integration timed out after ${timeoutMs}ms`)),
            timeoutMs,
          );
        }),
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return Object.freeze({
        requestId: request.requestId,
        connectorId: request.connectorId,
        status: message.includes('timed out') ? 'timeout' : 'failed',
        output: Object.freeze({ error: message }),
        metadata: Object.freeze({ controller: true }),
        duration: timeoutMs,
        traceId: request.traceId,
      });
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
