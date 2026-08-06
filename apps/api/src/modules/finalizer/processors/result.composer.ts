import { Injectable } from '@nestjs/common';
import type { IResultComposer } from '../contracts';
import type { ComposedResult, ValidatedResult } from '../models/finalizer.models';

/**
 * Result Composer — merge validated outputs into one result map.
 */
@Injectable()
export class ResultComposer implements IResultComposer {
  compose(validated: ValidatedResult): ComposedResult {
    const outputs: Record<string, string | number | boolean | null> = {};
    for (const output of validated.outputs) {
      outputs[output.key] = output.value;
    }
    return Object.freeze({
      outputs: Object.freeze(outputs),
      outputCount: Object.keys(outputs).length,
    });
  }
}
