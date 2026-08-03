import { Injectable } from '@nestjs/common';
import { ConfigService } from '../configuration/config.service';
import {
  Counter,
  DEFAULT_LATENCY_BUCKETS,
  Gauge,
  Histogram,
  type MetricLabels,
} from './prometheus.registry';

/**
 * Centralized metrics collection (Phase 2.1.4).
 * Prometheus-ready counters/histograms/gauges for API, AI, workers, pipelines, cache, process.
 */
@Injectable()
export class MetricsService {
  private readonly enabled: boolean;
  private readonly prefix: string;

  readonly requestCount: Counter;
  readonly requestDuration: Histogram;
  readonly aiResponseTime: Histogram;
  readonly workerExecutionTime: Histogram;
  readonly pipelineDuration: Histogram;
  readonly cacheHits: Counter;
  readonly cacheMisses: Counter;
  readonly errorCount: Counter;
  readonly processCpuUsageRatio: Gauge;
  readonly processMemoryBytes: Gauge;

  private lastCpuUsage = process.cpuUsage();
  private lastCpuSampleAt = process.hrtime.bigint();

  constructor(private readonly config: ConfigService) {
    this.enabled = config.monitoring.metricsEnabled;
    this.prefix = config.monitoring.metricsPrefix;
    const p = this.prefix;

    this.requestCount = new Counter(`${p}_http_requests_total`, 'Total HTTP/API requests');
    this.requestDuration = new Histogram(
      `${p}_http_request_duration_seconds`,
      'HTTP/API request duration in seconds',
      DEFAULT_LATENCY_BUCKETS,
    );
    this.aiResponseTime = new Histogram(
      `${p}_ai_response_duration_seconds`,
      'AI provider/response duration in seconds',
      DEFAULT_LATENCY_BUCKETS,
    );
    this.workerExecutionTime = new Histogram(
      `${p}_worker_execution_duration_seconds`,
      'Worker execution duration in seconds',
      DEFAULT_LATENCY_BUCKETS,
    );
    this.pipelineDuration = new Histogram(
      `${p}_pipeline_duration_seconds`,
      'Pipeline duration in seconds',
      DEFAULT_LATENCY_BUCKETS,
    );
    this.cacheHits = new Counter(`${p}_cache_hits_total`, 'Cache hit count');
    this.cacheMisses = new Counter(`${p}_cache_misses_total`, 'Cache miss count');
    this.errorCount = new Counter(`${p}_errors_total`, 'Application error count');
    this.processCpuUsageRatio = new Gauge(
      `${p}_process_cpu_usage_ratio`,
      'Approximate process CPU usage ratio since last sample (0-1+)',
    );
    this.processMemoryBytes = new Gauge(
      `${p}_process_resident_memory_bytes`,
      'Process resident set size in bytes',
    );
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  recordRequest(durationMs: number, labels: MetricLabels = {}): void {
    if (!this.enabled) return;
    this.requestCount.inc(labels);
    this.requestDuration.observe(durationMs / 1000, labels);
  }

  recordAiResponseTime(durationMs: number, labels: MetricLabels = {}): void {
    if (!this.enabled) return;
    this.aiResponseTime.observe(durationMs / 1000, labels);
  }

  recordWorkerExecutionTime(durationMs: number, labels: MetricLabels = {}): void {
    if (!this.enabled) return;
    this.workerExecutionTime.observe(durationMs / 1000, labels);
  }

  recordPipelineDuration(durationMs: number, labels: MetricLabels = {}): void {
    if (!this.enabled) return;
    this.pipelineDuration.observe(durationMs / 1000, labels);
  }

  recordCacheHit(labels: MetricLabels = {}): void {
    if (!this.enabled) return;
    this.cacheHits.inc(labels);
  }

  recordCacheMiss(labels: MetricLabels = {}): void {
    if (!this.enabled) return;
    this.cacheMisses.inc(labels);
  }

  recordError(labels: MetricLabels = {}): void {
    if (!this.enabled) return;
    this.errorCount.inc(labels);
  }

  /** Refresh CPU/memory gauges from the current process. */
  sampleProcessMetrics(): void {
    if (!this.enabled) return;

    const mem = process.memoryUsage();
    this.processMemoryBytes.set(mem.rss);

    const now = process.hrtime.bigint();
    const cpuDiff = process.cpuUsage(this.lastCpuUsage);
    const elapsedNs = Number(now - this.lastCpuSampleAt);
    const elapsedUs = elapsedNs / 1000;
    const cpuUs = cpuDiff.user + cpuDiff.system;
    const ratio = elapsedUs > 0 ? cpuUs / elapsedUs : 0;
    this.processCpuUsageRatio.set(ratio);
    this.lastCpuUsage = {
      user: this.lastCpuUsage.user + cpuDiff.user,
      system: this.lastCpuUsage.system + cpuDiff.system,
    };
    this.lastCpuSampleAt = now;
  }

  /** Prometheus text exposition format. */
  renderPrometheus(): string {
    this.sampleProcessMetrics();
    if (!this.enabled) {
      return '# metrics disabled\n';
    }
    return [
      this.requestCount.render(),
      this.requestDuration.render(),
      this.aiResponseTime.render(),
      this.workerExecutionTime.render(),
      this.pipelineDuration.render(),
      this.cacheHits.render(),
      this.cacheMisses.render(),
      this.errorCount.render(),
      this.processCpuUsageRatio.render(),
      this.processMemoryBytes.render(),
      '',
    ].join('\n\n');
  }

  /** Test helper — clear series (not for production scrape paths). */
  resetForTests(): void {
    this.requestCount.reset();
    this.requestDuration.reset();
    this.aiResponseTime.reset();
    this.workerExecutionTime.reset();
    this.pipelineDuration.reset();
    this.cacheHits.reset();
    this.cacheMisses.reset();
    this.errorCount.reset();
    this.processCpuUsageRatio.reset();
    this.processMemoryBytes.reset();
  }
}
