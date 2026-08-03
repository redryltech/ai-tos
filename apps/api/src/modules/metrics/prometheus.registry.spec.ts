import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Counter, Gauge, Histogram } from './prometheus.registry';

describe('prometheus.registry', () => {
  it('renders counters in Prometheus format', () => {
    const c = new Counter('demo_total', 'Demo counter');
    c.inc({ method: 'GET' }, 2);
    const text = c.render();
    assert.match(text, /# TYPE demo_total counter/);
    assert.match(text, /demo_total\{method="GET"\} 2/);
  });

  it('renders histogram buckets cumulatively', () => {
    const h = new Histogram('lat_seconds', 'Latency', [0.1, 0.5, 1]);
    h.observe(0.05);
    h.observe(0.4);
    const text = h.render();
    assert.match(text, /lat_seconds_bucket\{le="0.1"\} 1/);
    assert.match(text, /lat_seconds_bucket\{le="0.5"\} 2/);
    assert.match(text, /lat_seconds_bucket\{le="\+Inf"\} 2/);
    assert.match(text, /lat_seconds_count 2/);
  });

  it('renders gauges', () => {
    const g = new Gauge('mem_bytes', 'Memory');
    g.set(1024);
    assert.match(g.render(), /mem_bytes 1024/);
  });
});
