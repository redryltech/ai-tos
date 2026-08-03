import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let metrics: MetricsService;

  beforeEach(() => {
    metrics = new MetricsService(new ConfigService());
    metrics.resetForTests();
  });

  it('tracks request count and duration', () => {
    metrics.recordRequest(100, { method: 'GET', route: '/health' });
    metrics.recordRequest(50, { method: 'GET', route: '/health' });
    assert.equal(metrics.requestCount.get({ method: 'GET', route: '/health' }), 2);
    assert.equal(metrics.requestDuration.getCount({ method: 'GET', route: '/health' }), 2);
    assert.ok(Math.abs(metrics.requestDuration.getSum({ method: 'GET', route: '/health' }) - 0.15) < 1e-9);
  });

  it('tracks AI, worker, and pipeline durations', () => {
    metrics.recordAiResponseTime(200, { provider: 'openai' });
    metrics.recordWorkerExecutionTime(300, { worker: 'ingest' });
    metrics.recordPipelineDuration(400, { pipeline: 'trade' });
    assert.equal(metrics.aiResponseTime.getCount({ provider: 'openai' }), 1);
    assert.equal(metrics.workerExecutionTime.getCount({ worker: 'ingest' }), 1);
    assert.equal(metrics.pipelineDuration.getCount({ pipeline: 'trade' }), 1);
  });

  it('tracks cache hits/misses and errors', () => {
    metrics.recordCacheHit({ cache: 'session' });
    metrics.recordCacheMiss({ cache: 'session' });
    metrics.recordCacheMiss({ cache: 'session' });
    metrics.recordError({ type: 'ValidationError' });
    assert.equal(metrics.cacheHits.get({ cache: 'session' }), 1);
    assert.equal(metrics.cacheMisses.get({ cache: 'session' }), 2);
    assert.equal(metrics.errorCount.get({ type: 'ValidationError' }), 1);
  });

  it('samples CPU and memory gauges', () => {
    metrics.sampleProcessMetrics();
    assert.ok(metrics.processMemoryBytes.get() > 0);
    assert.ok(metrics.processCpuUsageRatio.get() >= 0);
  });

  it('exports Prometheus exposition text', () => {
    metrics.recordRequest(10, { method: 'GET' });
    metrics.recordError({ type: 'boom' });
    const text = metrics.renderPrometheus();
    assert.match(text, /# TYPE ai_tos_http_requests_total counter/);
    assert.match(text, /ai_tos_http_requests_total\{method="GET"\} 1/);
    assert.match(text, /ai_tos_errors_total\{type="boom"\} 1/);
    assert.match(text, /ai_tos_process_resident_memory_bytes/);
    assert.match(text, /ai_tos_process_cpu_usage_ratio/);
  });

  it('reads metricsEnabled from ConfigService', () => {
    assert.equal(typeof metrics.isEnabled, 'boolean');
  });
});
