import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '../../configuration/config.service';
import {
  POLICY_PROVIDER,
  type IPolicyProvider,
  type IPolicyRegistry,
} from '../contracts';
import type {
  PolicyDocument,
  PolicyScopeLevel,
} from '../models/policy.models';

/** Policy Registry — discovery/versioning/lifecycle. Never resolves. */
@Injectable()
export class PolicyRegistry implements IPolicyRegistry {
  constructor(
    private readonly config: ConfigService,
    @Inject(POLICY_PROVIDER) private readonly provider: IPolicyProvider,
  ) {}

  register(document: PolicyDocument): void {
    if (!this.config.policy.registrationEnabled) {
      throw new Error('Policy registration is disabled');
    }
    const existing = this.provider.get(document.policyId);
    this.provider.save(document);
    if (existing && existing.version !== document.version) {
      // version retention is observational metadata only
      void this.config.policy.versionRetention;
    }
  }

  unregister(policyId: string): boolean {
    return this.provider.remove(policyId);
  }

  get(policyId: string): PolicyDocument | undefined {
    return this.provider.get(policyId);
  }

  list(scopeLevel?: PolicyScopeLevel): readonly PolicyDocument[] {
    return this.provider.list(scopeLevel);
  }

  setLifecycle(
    policyId: string,
    lifecycle: PolicyDocument['lifecycle'],
  ): void {
    const existing = this.provider.get(policyId);
    if (!existing) return;
    this.provider.save(
      Object.freeze({
        ...existing,
        lifecycle,
      }),
    );
  }
}
