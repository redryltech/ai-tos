/** Abstract ports — Capability Service consumes these; services are NOT implemented here. */

export interface IMemoryPort {
  recall?(query: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export interface IKnowledgePort {
  retrieve?(query: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export interface IModelPort {
  invoke?(request: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export interface IToolPort {
  invoke?(request: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export interface IIntegrationPort {
  call?(request: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export interface IPolicyPort {
  evaluate?(request: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export class NoopMemoryPort implements IMemoryPort {
  async recall(): Promise<unknown> {
    return null;
  }
}

export class NoopKnowledgePort implements IKnowledgePort {
  async retrieve(): Promise<unknown> {
    return null;
  }
}

export class NoopModelPort implements IModelPort {
  async invoke(): Promise<unknown> {
    return null;
  }
}

export class NoopToolPort implements IToolPort {
  async invoke(): Promise<unknown> {
    return null;
  }
}

export class NoopIntegrationPort implements IIntegrationPort {
  async call(): Promise<unknown> {
    return null;
  }
}

export class NoopPolicyPort implements IPolicyPort {
  async evaluate(): Promise<unknown> {
    return { allowed: true };
  }
}
