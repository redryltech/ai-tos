import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ConfigService } from '../configuration/config.service';
import { EventBusService } from '../event-bus/event-bus.service';
import { HealthService } from '../health/health.service';
import { LoggerService } from '../logging/logger.service';
import { MetricsService } from '../metrics/metrics.service';
import type { ExecutionBlueprint } from '../planning/models/execution-blueprint.models';
import { OUTPUT_EVENTS } from './events/output.events';
import type { ExecutionIntent } from './models/execution-intent.models';
import { OutputService } from './output.service';
import { CapabilityResolver } from './processors/capability.resolver';
import { ExecutionContractBuilder } from './processors/execution-contract.builder';
import { IntentConsolidator } from './processors/intent.consolidator';
import { TransitionValidator } from './processors/transition.validator';

function sampleBlueprint(
  overrides: Partial<ExecutionBlueprint> = {},
): ExecutionBlueprint {
  const taskA = {
    id: 'task-a',
    groupId: 'g1',
    kind: 'prepare' as const,
    title: 'prepare_context',
    description: 'Prepare context',
    order: 1,
  };
  const taskB = {
    id: 'task-b',
    groupId: 'g2',
    kind: 'execute' as const,
    title: 'enact_selected_action',
    description: 'Enact selected action',
    order: 2,
  };

  return {
    requestId: 'req-api-out',
    userId: 'u1',
    organizationId: 'org1',
    goal: 'understand:analysis_request',
    strategy: {
      strategyId: 'strat-1',
      name: 'strategy:goal_aligned_reasoning',
      summary: 'Design execution strategy',
      selectedActionId: 'act-1',
      selectedActionTitle: 'goal_aligned_reasoning',
      objectives: [
        { id: 'obj-1', description: 'Realize action', priority: 'normal' },
      ],
      milestones: [],
      successCriteria: ['Ready for handoff'],
      failureCriteria: ['Blocked'],
      constraints: [],
      metadata: {},
    },
    objectives: [
      { id: 'obj-1', description: 'Realize action', priority: 'normal' },
    ],
    milestones: [],
    tasks: [taskA, taskB],
    dependencyGraph: {
      edges: [
        {
          id: 'e1',
          fromTaskId: 'task-a',
          toTaskId: 'task-b',
          type: 'sequence',
        },
      ],
      prerequisites: { 'task-b': ['task-a'] },
      parallelGroups: [],
      sequentialChains: [['task-a', 'task-b']],
      executionConstraints: ['no_runtime_scheduling'],
    },
    constraints: ['no_runtime_scheduling'],
    successCriteria: ['Ready for handoff'],
    failureCriteria: ['Blocked'],
    metadata: {
      schemaVersion: '1.0.0',
      plannedAt: new Date().toISOString(),
      taskCount: 2,
      groupCount: 2,
      edgeCount: 1,
      commitmentLevel: 'standard',
      approvalRequired: false,
      extras: {},
    },
    ...overrides,
  };
}

function assertIntentContract(intent: ExecutionIntent): void {
  assert.deepEqual(Object.keys(intent).sort(), [
    'capabilities',
    'constraints',
    'dependencyGraph',
    'failureCriteria',
    'goal',
    'metadata',
    'objectives',
    'organizationId',
    'priority',
    'requestId',
    'strategy',
    'successCriteria',
    'tasks',
    'traceId',
    'userId',
  ]);
  assert.equal(intent.metadata.schemaVersion, '1.0.0');
  assert.equal(intent.metadata.transitionReady, true);
  assert.equal(intent.metadata.executionReady, true);
  assert.ok(intent.capabilities.names.includes('reasoning'));
}

function createService(): { service: OutputService; events: string[] } {
  const config = new ConfigService();
  const bus = new EventBusService(config);
  bus.clear();
  const events: string[] = [];
  bus.subscribe('output.#', (e) => {
    events.push(e.topic);
  });

  const service = new OutputService(
    config,
    new LoggerService(config),
    new MetricsService(config),
    bus,
    new HealthService(config),
    new IntentConsolidator(config),
    new CapabilityResolver(),
    new ExecutionContractBuilder(),
    new TransitionValidator(),
  );
  return { service, events };
}

describe('OutputService public API', () => {
  let service: OutputService;
  let events: string[];

  beforeEach(() => {
    ({ service, events } = createService());
  });

  it('buildOutput returns ExecutionIntent and emits started/completed', async () => {
    const intent = await service.buildOutput(sampleBlueprint());
    assertIntentContract(intent);
    assert.equal(intent.requestId, 'req-api-out');
    assert.ok(events.includes(OUTPUT_EVENTS.started));
    assert.ok(events.includes(OUTPUT_EVENTS.completed));
  });

  it('accepts BuildOutputInputDto with hints', async () => {
    const intent = await service.buildOutput({
      blueprint: sampleBlueprint(),
      outputHints: {
        priority: 'high',
        traceId: 'trace-hint',
        extraCapabilities: ['tools'],
      },
    });
    assertIntentContract(intent);
    assert.equal(intent.priority, 'high');
    assert.equal(intent.traceId, 'trace-hint');
    assert.ok(intent.capabilities.names.includes('tools'));
  });

  it('emits failed and rethrows on invalid blueprint', async () => {
    await assert.rejects(
      () => service.buildOutput({ requestId: '' } as never),
      /required/i,
    );
    assert.ok(events.includes(OUTPUT_EVENTS.failed));
  });
});

describe('Output pipeline contract', () => {
  it('keeps identical top-level ExecutionIntent structure', async () => {
    const { service } = createService();
    const a = await service.buildOutput(sampleBlueprint());
    const b = await service.buildOutput(
      sampleBlueprint({
        requestId: 'req-2',
        metadata: {
          ...sampleBlueprint().metadata,
          approvalRequired: true,
        },
      }),
    );
    assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
    assert.deepEqual(Object.keys(a.metadata).sort(), Object.keys(b.metadata).sort());
  });
});
