import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable } from '@nestjs/common';
import type { LogLevel } from '@ai-tos/config';
import { ConfigService } from '../configuration/config.service';
import { redactForLogging } from './log-redact';
import {
  LOG_LEVEL_ORDER,
  type LogContext,
  type LogTransport,
  type StructuredLogRecord,
} from './log.types';
import { ConsoleLogTransport } from './transports/console.transport';
import { FileLogTransport } from './transports/file.transport';

const logContextStorage = new AsyncLocalStorage<LogContext>();

/**
 * Centralized enterprise logger (Phase 2.1.3).
 * Structured JSON · configurable level/transports · secret redaction · ALS context.
 */
@Injectable()
export class LoggerService {
  private readonly transports: LogTransport[];
  private readonly minLevel: LogLevel;
  private readonly service: string;
  private readonly environment: string;
  private readonly defaultWorkerId: string;

  constructor(private readonly config: ConfigService) {
    this.minLevel = config.app.logLevel;
    this.service = config.app.name;
    this.environment = config.app.environment;
    this.defaultWorkerId = process.env.WORKER_ID ?? String(process.pid);
    this.transports = this.buildTransports();
  }

  /** Run work with request/correlation context bound to the async chain. */
  runWithContext<T>(context: LogContext, fn: () => T): T {
    const parent = logContextStorage.getStore() ?? {};
    return logContextStorage.run({ ...parent, ...context }, fn);
  }

  /** Merge additional fields into the current ALS context. */
  setContext(partial: LogContext): void {
    const store = logContextStorage.getStore();
    if (store) {
      Object.assign(store, partial);
    }
  }

  getContext(): LogContext {
    return { ...(logContextStorage.getStore() ?? {}) };
  }

  debug(message: string, context?: LogContext): void {
    this.write('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.write('warn', message, context);
  }

  error(message: string, context?: LogContext, err?: unknown): void {
    this.write('error', message, context, err);
  }

  child(context: LogContext): LoggerService {
    const baseCtx = { ...context };
    const childLogger = Object.create(this) as LoggerService;
    childLogger.debug = (message, ctx) => this.debug(message, { ...baseCtx, ...ctx });
    childLogger.info = (message, ctx) => this.info(message, { ...baseCtx, ...ctx });
    childLogger.warn = (message, ctx) => this.warn(message, { ...baseCtx, ...ctx });
    childLogger.error = (message, ctx, err) => this.error(message, { ...baseCtx, ...ctx }, err);
    return childLogger;
  }

  private write(
    level: LogLevel,
    message: string,
    context?: LogContext,
    err?: unknown,
  ): void {
    if (LOG_LEVEL_ORDER[level] < LOG_LEVEL_ORDER[this.minLevel]) {
      return;
    }

    const merged = {
      ...(logContextStorage.getStore() ?? {}),
      ...(context ?? {}),
    };
    const safe = redactForLogging(merged) as Record<string, unknown>;

    const {
      requestId,
      correlationId,
      aiRequestId,
      organizationId,
      userId,
      workerId,
      ...rest
    } = safe;

    const record: StructuredLogRecord = {
      timestamp: new Date().toISOString(),
      level,
      message: String(redactForLogging(message)),
      service: this.service,
      environment: this.environment,
      requestId: (requestId as string | undefined) ?? null,
      correlationId: (correlationId as string | undefined) ?? null,
      aiRequestId: (aiRequestId as string | undefined) ?? null,
      organizationId: (organizationId as string | undefined) ?? null,
      userId: (userId as string | undefined) ?? null,
      workerId: (workerId as string | undefined) ?? this.defaultWorkerId,
    };

    if (Object.keys(rest).length > 0) {
      record.context = rest;
    }

    if (err != null) {
      const redacted = redactForLogging(err) as {
        name?: string;
        message?: string;
        stack?: string;
      };
      if (err instanceof Error) {
        record.error = {
          name: err.name,
          message: String(redacted.message ?? err.message),
          stack: redacted.stack,
        };
      } else {
        record.error = {
          name: 'Error',
          message: String(redactForLogging(String(err))),
        };
      }
    }

    for (const transport of this.transports) {
      try {
        void transport.write(record);
      } catch {
        // Never let logging failures crash the process.
      }
    }
  }

  private buildTransports(): LogTransport[] {
    const transports: LogTransport[] = [];
    for (const name of this.config.app.logTransports) {
      if (name === 'console') {
        transports.push(new ConsoleLogTransport());
      } else if (name === 'file') {
        const path = this.config.app.logFilePath;
        if (!path) {
          throw new Error('LOG_FILE_PATH is required when LOG_TRANSPORTS includes file');
        }
        transports.push(new FileLogTransport(path));
      }
    }
    if (transports.length === 0) {
      transports.push(new ConsoleLogTransport());
    }
    return transports;
  }
}
