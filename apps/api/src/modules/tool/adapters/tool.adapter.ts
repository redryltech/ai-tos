import type {
  ToolDescriptor,
  ToolRegistration,
  ToolRequest,
  ToolResult,
} from '../models/tool.models';

/**
 * Tool Adapter interface — deterministic tool implementations only.
 * Never reasons, never calls AI models, never connects to enterprise SaaS.
 */
export interface IToolAdapter {
  readonly adapterId: string;
  readonly toolId: string;
  supports(toolId: string): boolean;
  execute(request: ToolRequest): Promise<ToolResult>;
  descriptor(): ToolDescriptor;
}

export type { ToolDescriptor, ToolRegistration };
