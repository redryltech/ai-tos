import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CAPABILITY_ORCHESTRATOR,
  type ICapabilityController,
  type ICapabilityOrchestrator,
} from '../contracts/capability.contracts';
import type { CapabilityRequestDto } from '../dto/capability.dto';
import type {
  CapabilityRequest,
  CapabilityResult,
} from '../models/capability.models';

/**
 * Capability Controller — validate request and start execution pipeline.
 * Never performs execution itself.
 */
@Injectable()
export class CapabilityController implements ICapabilityController {
  constructor(
    @Inject(CAPABILITY_ORCHESTRATOR)
    private readonly orchestrator: ICapabilityOrchestrator,
  ) {}

  async execute(dto: CapabilityRequestDto): Promise<CapabilityResult> {
    const request = this.validate(dto);
    return this.orchestrator.execute(request);
  }

  private validate(dto: CapabilityRequestDto): CapabilityRequest {
    if (!dto || typeof dto !== 'object') {
      throw new Error('CapabilityRequest is required');
    }
    if (!dto.capability || typeof dto.capability !== 'string') {
      throw new Error('CapabilityRequest.capability is required');
    }
    if (!dto.input || typeof dto.input !== 'object') {
      throw new Error('CapabilityRequest.input is required');
    }

    return Object.freeze({
      requestId:
        typeof dto.requestId === 'string' && dto.requestId.trim()
          ? dto.requestId.trim()
          : randomUUID(),
      capability: dto.capability,
      input: Object.freeze({ ...dto.input }),
      constraints: dto.constraints
        ? Object.freeze({ ...dto.constraints })
        : undefined,
      options: dto.options ? Object.freeze({ ...dto.options }) : undefined,
      metadata: Object.freeze({ ...(dto.metadata ?? {}) }),
      traceId:
        typeof dto.traceId === 'string' && dto.traceId.trim()
          ? dto.traceId.trim()
          : randomUUID(),
    });
  }
}
