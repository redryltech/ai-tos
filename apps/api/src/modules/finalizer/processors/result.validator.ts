import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import type { IResultValidator } from '../contracts';
import type {
  CollectedResult,
  CompletedExecution,
  ValidatedResult,
} from '../models/finalizer.models';
import { FinalizationError } from '../models/finalizer.models';

/**
 * Result Validator — validate outputs and failure conditions.
 * Never executes or composes final status.
 */
@Injectable()
export class ResultValidator implements IResultValidator {
  constructor(private readonly config: ConfigService) {}

  validate(
    completed: CompletedExecution,
    collected: CollectedResult,
  ): ValidatedResult {
    const issues: string[] = [];
    const seenIds = new Set<string>();
    const seenKeys = new Set<string>();
    const outputs = [];

    for (const output of collected.outputs) {
      if (!output?.id || !output.key) {
        issues.push('Invalid output: missing id or key');
        continue;
      }
      if (seenIds.has(output.id)) {
        issues.push(`Duplicate output id: ${output.id}`);
        continue;
      }
      if (seenKeys.has(output.key)) {
        issues.push(`Duplicate output key: ${output.key}`);
        continue;
      }
      seenIds.add(output.id);
      seenKeys.add(output.key);
      outputs.push(output);
    }

    if (
      this.config.finalization.requireOutputs &&
      outputs.length === 0 &&
      collected.failedTaskIds.length === 0 &&
      collected.cancelledTaskIds.length === 0
    ) {
      issues.push('Missing outputs');
    }

    const hasPartialFailures =
      collected.failedTaskIds.length > 0 &&
      collected.completedTaskIds.length > 0;

    if (
      hasPartialFailures &&
      !this.config.finalization.allowPartial &&
      !completed.cancelled &&
      !completed.timedOut &&
      !completed.rolledBack
    ) {
      throw new FinalizationError(
        'Partial failures are not allowed by FINALIZATION_ALLOW_PARTIAL',
      );
    }

    const blockingMissing =
      this.config.finalization.requireOutputs &&
      outputs.length === 0 &&
      collected.failedTaskIds.length === 0 &&
      !completed.cancelled &&
      !completed.timedOut;

    return Object.freeze({
      outputs: Object.freeze(outputs),
      issues: Object.freeze(issues),
      hasPartialFailures,
      valid: !blockingMissing && !issues.some((i) => i.startsWith('Invalid')),
    });
  }
}
