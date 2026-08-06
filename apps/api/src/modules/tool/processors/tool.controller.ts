import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IToolAdapter } from '../adapters/tool.adapter';
import {
  TOOL_ADAPTERS,
  TOOL_EXECUTOR,
  TOOL_RESOLVER,
  type IToolController,
  type IToolExecutor,
  type IToolResolver,
} from '../contracts';
import type { ToolRequestDto } from '../dto/tool.dto';
import type { ToolRequest, ToolResult } from '../models/tool.models';

/**
 * Tool Controller — validate request and start pipeline.
 * Never executes tools itself.
 */
@Injectable()
export class ToolController implements IToolController {
  private readonly adaptersByTool: Map<string, IToolAdapter>;

  constructor(
    @Inject(TOOL_RESOLVER) private readonly resolver: IToolResolver,
    @Inject(TOOL_EXECUTOR) private readonly executor: IToolExecutor,
    @Inject(TOOL_ADAPTERS) adapters: IToolAdapter[],
  ) {
    this.adaptersByTool = new Map(adapters.map((a) => [a.toolId, a]));
  }

  async execute(dto: ToolRequestDto): Promise<ToolResult> {
    const request = this.validate(dto);
    const resolved = this.resolver.resolve(request.toolId, request.input);
    if (!resolved.available || !resolved.registration) {
      throw new Error(`Tool unavailable: ${request.toolId} (${resolved.reason})`);
    }

    const adapter = this.adaptersByTool.get(request.toolId);
    if (!adapter) {
      throw new Error(`Tool adapter missing: ${request.toolId}`);
    }

    return this.executor.execute(request, adapter);
  }

  private validate(dto: ToolRequestDto): ToolRequest {
    if (!dto || typeof dto !== 'object') {
      throw new Error('ToolRequest is required');
    }
    if (!dto.toolId || typeof dto.toolId !== 'string') {
      throw new Error('ToolRequest.toolId is required');
    }
    if (!dto.input || typeof dto.input !== 'object') {
      throw new Error('ToolRequest.input is required');
    }

    return Object.freeze({
      requestId:
        typeof dto.requestId === 'string' && dto.requestId.trim()
          ? dto.requestId.trim()
          : randomUUID(),
      toolId: dto.toolId.trim(),
      input: Object.freeze({ ...dto.input }),
      options: dto.options ? Object.freeze({ ...dto.options }) : undefined,
      constraints: dto.constraints
        ? Object.freeze({ ...dto.constraints })
        : undefined,
      metadata: Object.freeze({ ...(dto.metadata ?? {}) }),
      traceId:
        typeof dto.traceId === 'string' && dto.traceId.trim()
          ? dto.traceId.trim()
          : randomUUID(),
    });
  }
}
