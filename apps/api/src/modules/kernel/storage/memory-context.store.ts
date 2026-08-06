import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable } from '@nestjs/common';
import type { RuntimeContext } from '../context.types';
import type { IContextStore } from './kernel-store.contracts';

@Injectable()
export class MemoryContextStore implements IContextStore {
  private readonly als = new AsyncLocalStorage<RuntimeContext>();

  get(): RuntimeContext | undefined {
    return this.als.getStore();
  }

  run<T>(context: RuntimeContext, fn: () => T): T {
    return this.als.run(context, fn);
  }
}
