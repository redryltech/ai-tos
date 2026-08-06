import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import {
  TOOL_REGISTRY,
  type IToolRegistry,
  type IToolResolver,
} from '../contracts';

/**
 * Tool Resolver — validate availability, parameters, constraints.
 * Never executes tools.
 */
@Injectable()
export class ToolResolver implements IToolResolver {
  constructor(
    private readonly config: ConfigService,
    @Inject(TOOL_REGISTRY) private readonly registry: IToolRegistry,
  ) {}

  resolve(
    toolId: string,
    input: Readonly<Record<string, unknown>>,
  ): {
    readonly available: boolean;
    readonly registration?: ReturnType<IToolRegistry['get']>;
    readonly reason: string;
  } {
    if (!toolId || typeof toolId !== 'string') {
      return Object.freeze({ available: false, reason: 'toolId_required' });
    }
    if (!input || typeof input !== 'object') {
      return Object.freeze({ available: false, reason: 'input_required' });
    }

    const registration = this.registry.get(toolId);
    if (!registration) {
      return Object.freeze({ available: false, reason: 'not_registered' });
    }
    if (!registration.available) {
      return Object.freeze({
        available: false,
        registration,
        reason: 'unavailable',
      });
    }
    if (registration.descriptor.lifecycle === 'disabled') {
      return Object.freeze({
        available: false,
        registration,
        reason: 'disabled',
      });
    }
    if (toolId === 'shell' && !this.config.tool.allowShell) {
      return Object.freeze({
        available: false,
        registration,
        reason: 'shell_disabled_by_policy',
      });
    }

    return Object.freeze({
      available: true,
      registration,
      reason: 'ok',
    });
  }
}
