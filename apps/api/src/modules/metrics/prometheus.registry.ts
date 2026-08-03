/** Prometheus-compatible metric primitives (Phase 2.1.4). */

export type MetricLabels = Record<string, string>;

function labelsKey(labels: MetricLabels): string {
  const keys = Object.keys(labels).sort();
  return keys.map((k) => `${k}=${labels[k]}`).join(',');
}

function formatLabels(labels: MetricLabels): string {
  const keys = Object.keys(labels).sort();
  if (keys.length === 0) return '';
  return `{${keys.map((k) => `${k}="${escapeLabel(labels[k])}"`).join(',')}}`;
}

function escapeLabel(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

export class Counter {
  private readonly values = new Map<string, { labels: MetricLabels; value: number }>();

  constructor(
    readonly name: string,
    readonly help: string,
  ) {}

  inc(labels: MetricLabels = {}, value = 1): void {
    if (value < 0) throw new Error('Counter can only increase');
    const key = labelsKey(labels);
    const prev = this.values.get(key);
    this.values.set(key, { labels, value: (prev?.value ?? 0) + value });
  }

  get(labels: MetricLabels = {}): number {
    return this.values.get(labelsKey(labels))?.value ?? 0;
  }

  reset(): void {
    this.values.clear();
  }

  render(): string {
    const lines = [`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} counter`];
    for (const entry of this.values.values()) {
      lines.push(`${this.name}${formatLabels(entry.labels)} ${entry.value}`);
    }
    if (this.values.size === 0) {
      lines.push(`${this.name} 0`);
    }
    return lines.join('\n');
  }
}

export class Gauge {
  private readonly values = new Map<string, { labels: MetricLabels; value: number }>();

  constructor(
    readonly name: string,
    readonly help: string,
  ) {}

  set(value: number, labels: MetricLabels = {}): void {
    this.values.set(labelsKey(labels), { labels, value });
  }

  get(labels: MetricLabels = {}): number {
    return this.values.get(labelsKey(labels))?.value ?? 0;
  }

  reset(): void {
    this.values.clear();
  }

  render(): string {
    const lines = [`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} gauge`];
    for (const entry of this.values.values()) {
      lines.push(`${this.name}${formatLabels(entry.labels)} ${entry.value}`);
    }
    if (this.values.size === 0) {
      lines.push(`${this.name} 0`);
    }
    return lines.join('\n');
  }
}

/**
 * Histogram with cumulative bucket counts (Prometheus exposition style).
 * `observe` increments every bucket where value <= le.
 */
export class Histogram {
  private readonly observations = new Map<
    string,
    { labels: MetricLabels; counts: number[]; sum: number; count: number }
  >();

  constructor(
    readonly name: string,
    readonly help: string,
    readonly buckets: readonly number[],
  ) {}

  observe(valueSeconds: number, labels: MetricLabels = {}): void {
    const key = labelsKey(labels);
    let entry = this.observations.get(key);
    if (!entry) {
      entry = { labels, counts: this.buckets.map(() => 0), sum: 0, count: 0 };
      this.observations.set(key, entry);
    }
    for (let i = 0; i < this.buckets.length; i += 1) {
      if (valueSeconds <= this.buckets[i]) {
        entry.counts[i] += 1;
      }
    }
    entry.sum += valueSeconds;
    entry.count += 1;
  }

  getCount(labels: MetricLabels = {}): number {
    return this.observations.get(labelsKey(labels))?.count ?? 0;
  }

  getSum(labels: MetricLabels = {}): number {
    return this.observations.get(labelsKey(labels))?.sum ?? 0;
  }

  reset(): void {
    this.observations.clear();
  }

  render(): string {
    const lines = [`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} histogram`];
    for (const entry of this.observations.values()) {
      for (let i = 0; i < this.buckets.length; i += 1) {
        lines.push(
          `${this.name}_bucket${formatLabels({ ...entry.labels, le: String(this.buckets[i]) })} ${entry.counts[i]}`,
        );
      }
      lines.push(
        `${this.name}_bucket${formatLabels({ ...entry.labels, le: '+Inf' })} ${entry.count}`,
      );
      lines.push(`${this.name}_sum${formatLabels(entry.labels)} ${entry.sum}`);
      lines.push(`${this.name}_count${formatLabels(entry.labels)} ${entry.count}`);
    }
    return lines.join('\n');
  }
}

/** Default latency buckets (seconds) — Prometheus-friendly. */
export const DEFAULT_LATENCY_BUCKETS = [
  0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
] as const;
