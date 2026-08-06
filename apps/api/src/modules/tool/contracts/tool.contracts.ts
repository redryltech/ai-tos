import type { ToolRequestDto } from '../dto/tool.dto';
import type {
  ToolDescriptor,
  ToolRegistration,
  ToolRequest,
  ToolResult,
} from '../models/tool.models';
import type { IToolAdapter } from '../adapters/tool.adapter';

export const TOOL_SERVICE = Symbol('TOOL_SERVICE');
export const TOOL_CONTROLLER = Symbol('TOOL_CONTROLLER');
export const TOOL_REGISTRY = Symbol('TOOL_REGISTRY');
export const TOOL_RESOLVER = Symbol('TOOL_RESOLVER');
export const TOOL_EXECUTOR = Symbol('TOOL_EXECUTOR');
export const TOOL_ADAPTERS = Symbol('TOOL_ADAPTERS');

export interface IToolRegistry {
  register(registration: ToolRegistration): void;
  unregister(toolId: string): boolean;
  get(toolId: string): ToolRegistration | undefined;
  list(): readonly ToolRegistration[];
  listDescriptors(): readonly ToolDescriptor[];
  setAvailable(toolId: string, available: boolean): void;
}

export interface IToolResolver {
  resolve(toolId: string, input: Readonly<Record<string, unknown>>): {
    readonly available: boolean;
    readonly registration?: ToolRegistration;
    readonly reason: string;
  };
}

export interface IToolExecutor {
  execute(request: ToolRequest, adapter: IToolAdapter): Promise<ToolResult>;
  cancel(cancelToken: string): boolean;
}

export interface IToolController {
  execute(dto: ToolRequestDto): Promise<ToolResult>;
}

/** Sole public Tool Service contract. */
export interface IToolService {
  execute(request: ToolRequestDto): Promise<ToolResult>;
}

export type { IToolAdapter };
