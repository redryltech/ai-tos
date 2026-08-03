import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { LoggerService } from './logger.service';
import { FileLogTransport } from './transports/file.transport';
import type { StructuredLogRecord } from './log.types';

class CaptureTransport {
  readonly name = 'capture';
  records: StructuredLogRecord[] = [];
  write(record: StructuredLogRecord): void {
    this.records.push(record);
  }
}

describe('LoggerService', () => {
  let logger: LoggerService;
  let capture: CaptureTransport;
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'ai-tos-logs-'));
    process.env.LOG_TRANSPORTS = 'console';
    const config = new ConfigService();
    logger = new LoggerService(config);
    capture = new CaptureTransport();
    (logger as unknown as { transports: CaptureTransport[] }).transports = [capture];
    (logger as unknown as { minLevel: string }).minLevel = 'debug';
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    delete process.env.LOG_TRANSPORTS;
  });

  it('emits structured JSON fields', () => {
    logger.runWithContext(
      {
        requestId: 'req-1',
        correlationId: 'corr-1',
        aiRequestId: 'ai-1',
        organizationId: 'org-1',
        userId: 'user-1',
        workerId: 'worker-1',
      },
      () => {
        logger.info('hello');
      },
    );

    assert.equal(capture.records.length, 1);
    const r = capture.records[0];
    assert.equal(r.level, 'info');
    assert.equal(r.message, 'hello');
    assert.ok(r.timestamp);
    assert.equal(r.requestId, 'req-1');
    assert.equal(r.correlationId, 'corr-1');
    assert.equal(r.aiRequestId, 'ai-1');
    assert.equal(r.organizationId, 'org-1');
    assert.equal(r.userId, 'user-1');
    assert.equal(r.workerId, 'worker-1');
  });

  it('never logs secrets in context', () => {
    logger.info('login', { password: 'super-secret', token: 'abc', userId: 'u9' });
    const r = capture.records[0];
    assert.equal(r.userId, 'u9');
    assert.equal((r.context as Record<string, unknown>).password, '[REDACTED]');
    assert.equal((r.context as Record<string, unknown>).token, '[REDACTED]');
    assert.doesNotMatch(JSON.stringify(r), /super-secret/);
  });

  it('respects configured log level', () => {
    (logger as unknown as { minLevel: string }).minLevel = 'warn';
    logger.debug('skip');
    logger.info('skip');
    logger.warn('keep');
    assert.equal(capture.records.length, 1);
    assert.equal(capture.records[0].level, 'warn');
  });

  it('writes JSON lines to file transport', async () => {
    const path = join(dir, 'app.log');
    const file = new FileLogTransport(path);
    file.write({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'file-line',
      service: 'ai-tos',
      environment: 'development',
      requestId: null,
      correlationId: null,
      aiRequestId: null,
      organizationId: null,
      userId: null,
      workerId: '1',
    });
    await file.flush();
    const body = readFileSync(path, 'utf8');
    assert.match(body, /file-line/);
    assert.ok(JSON.parse(body.trim()));
  });
});
