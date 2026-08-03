import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { LogTransport, StructuredLogRecord } from '../log.types';

/**
 * Append-only JSONL file transport.
 * Uses sync append under a process-local mutex queue for predictable ordering.
 */
export class FileLogTransport implements LogTransport {
  readonly name = 'file';
  private queue: Promise<void> = Promise.resolve();
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
    mkdirSync(dirname(filePath), { recursive: true });
  }

  write(record: StructuredLogRecord): void {
    const line = `${JSON.stringify(record)}\n`;
    this.queue = this.queue.then(() => {
      appendFileSync(this.filePath, line, 'utf8');
    });
  }

  /** Flush pending writes (tests / graceful shutdown). */
  async flush(): Promise<void> {
    await this.queue;
  }
}
