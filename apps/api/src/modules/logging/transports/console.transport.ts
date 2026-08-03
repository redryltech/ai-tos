import type { LogTransport, StructuredLogRecord } from '../log.types';

/** Console JSON transport — stdout for info/debug, stderr for warn/error. */
export class ConsoleLogTransport implements LogTransport {
  readonly name = 'console';

  write(record: StructuredLogRecord): void {
    const line = JSON.stringify(record);
    if (record.level === 'error' || record.level === 'warn') {
      process.stderr.write(`${line}\n`);
    } else {
      process.stdout.write(`${line}\n`);
    }
  }
}
