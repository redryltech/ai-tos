import type { LogLevel } from '@ai-tos/config';

/** Correlation fields for every structured log line. */
export interface LogContext {
  requestId?: string;
  correlationId?: string;
  aiRequestId?: string;
  organizationId?: string;
  userId?: string;
  workerId?: string;
  [key: string]: unknown;
}

export interface StructuredLogRecord {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  requestId: string | null;
  correlationId: string | null;
  aiRequestId: string | null;
  organizationId: string | null;
  userId: string | null;
  workerId: string | null;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LogTransport {
  readonly name: string;
  write(record: StructuredLogRecord): void | Promise<void>;
}

export const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};
