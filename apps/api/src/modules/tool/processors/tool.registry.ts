import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IToolRegistry } from '../contracts';
import type { ToolDescriptor, ToolRegistration } from '../models/tool.models';

/** Tool Registry — discovery/metadata/lifecycle. Never executes. */
@Injectable()
export class ToolRegistry implements IToolRegistry {
  private readonly tools = new Map<string, ToolRegistration>();

  constructor(private readonly config: ConfigService) {}

  register(registration: ToolRegistration): void {
    if (!this.config.tool.registrationEnabled) {
      throw new Error('Tool registration is disabled');
    }
    this.tools.set(
      registration.descriptor.toolId,
      Object.freeze({
        descriptor: registration.descriptor,
        adapterId: registration.adapterId,
        available: registration.available,
      }),
    );
  }

  unregister(toolId: string): boolean {
    return this.tools.delete(toolId);
  }

  get(toolId: string): ToolRegistration | undefined {
    return this.tools.get(toolId);
  }

  list(): readonly ToolRegistration[] {
    return Object.freeze([...this.tools.values()]);
  }

  listDescriptors(): readonly ToolDescriptor[] {
    return Object.freeze([...this.tools.values()].map((t) => t.descriptor));
  }

  setAvailable(toolId: string, available: boolean): void {
    const existing = this.tools.get(toolId);
    if (!existing) return;
    this.tools.set(
      toolId,
      Object.freeze({
        ...existing,
        available,
      }),
    );
  }
}
