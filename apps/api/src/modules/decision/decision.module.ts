import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration/configuration.module';
import { EventBusModule } from '../event-bus/event-bus.module';
import { HealthModule } from '../health/health.module';
import { LoggingModule } from '../logging/logging.module';
import { MetricsModule } from '../metrics/metrics.module';
import {
  COMMITMENT_MANAGER,
  CONSTRAINT_VALIDATOR,
  DECISION_SERVICE,
  EVIDENCE_VALIDATOR,
  JUDGMENT_CORE,
} from './contracts';
import { DecisionService } from './decision.service';
import { CommitmentManager } from './processors/commitment.manager';
import { ConstraintValidator } from './processors/constraint.validator';
import { EvidenceValidator } from './processors/evidence.validator';
import { JudgmentCore } from './processors/judgment.core';

/**
 * Decision Engine (Layer 3.3).
 * Public API: DECISION_SERVICE → IDecisionService.decide()
 */
@Module({
  imports: [
    ConfigurationModule,
    LoggingModule,
    MetricsModule,
    EventBusModule,
    HealthModule,
  ],
  providers: [
    EvidenceValidator,
    ConstraintValidator,
    JudgmentCore,
    CommitmentManager,
    DecisionService,
    { provide: EVIDENCE_VALIDATOR, useExisting: EvidenceValidator },
    { provide: CONSTRAINT_VALIDATOR, useExisting: ConstraintValidator },
    { provide: JUDGMENT_CORE, useExisting: JudgmentCore },
    { provide: COMMITMENT_MANAGER, useExisting: CommitmentManager },
    { provide: DECISION_SERVICE, useExisting: DecisionService },
  ],
  exports: [DECISION_SERVICE],
})
export class DecisionModule {}
