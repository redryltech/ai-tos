import type {
  MemoryCollection,
  MemoryEvaluation,
  MemoryRecord,
} from '../models/memory.models';
import type {
  MemoryQueryDto,
  RememberMemoryDto,
  UpdateMemoryDto,
} from '../dto/memory.dto';
import type { IMemoryProvider } from '../providers/memory.provider';

export const MEMORY_PROVIDER = Symbol('MEMORY_PROVIDER');
export const MEMORY_EVALUATOR = Symbol('MEMORY_EVALUATOR');
export const SESSION_MEMORY = Symbol('SESSION_MEMORY');
export const LONG_TERM_MEMORY = Symbol('LONG_TERM_MEMORY');
export const EPISODIC_MEMORY = Symbol('EPISODIC_MEMORY');
export const MEMORY_CONTROLLER = Symbol('MEMORY_CONTROLLER');
export const MEMORY_SERVICE = Symbol('MEMORY_SERVICE');

export interface IMemoryEvaluator {
  evaluate(input: RememberMemoryDto): MemoryEvaluation;
}

export interface ISessionMemory {
  store(record: MemoryRecord): Promise<MemoryRecord>;
  recall(query: MemoryQueryDto): Promise<MemoryCollection>;
}

export interface ILongTermMemory {
  store(record: MemoryRecord): Promise<MemoryRecord>;
  recall(query: MemoryQueryDto): Promise<MemoryCollection>;
}

export interface IEpisodicMemory {
  store(record: MemoryRecord): Promise<MemoryRecord>;
  recall(query: MemoryQueryDto): Promise<MemoryCollection>;
}

export interface IMemoryController {
  remember(input: RememberMemoryDto): Promise<MemoryRecord | null>;
  recall(query: MemoryQueryDto): Promise<MemoryCollection>;
  update(input: UpdateMemoryDto): Promise<MemoryRecord>;
  forget(memoryId: string): Promise<void>;
  archive(memoryId: string): Promise<void>;
  search(query: MemoryQueryDto): Promise<MemoryCollection>;
}

/** Sole public Memory Service contract. */
export interface IMemoryService {
  remember(memory: RememberMemoryDto): Promise<MemoryRecord>;
  recall(query: MemoryQueryDto): Promise<MemoryCollection>;
  update(memory: UpdateMemoryDto): Promise<MemoryRecord>;
  forget(memoryId: string): Promise<void>;
  archive(memoryId: string): Promise<void>;
  search(query: MemoryQueryDto): Promise<MemoryCollection>;
}

export type { IMemoryProvider };
