/** Secret kinds managed by the AI OS Secrets Service (Phase 2.1.2). */
export type SecretKind =
  | 'api_key'
  | 'encryption_key'
  | 'jwt_secret'
  | 'ai_provider_secret';

export interface SecretRef {
  kind: SecretKind;
  /** Logical name, e.g. `access`, `refresh`, `api_keys`, `openai`. */
  name: string;
}

export function secretKey(ref: SecretRef): string {
  return `${ref.kind}:${ref.name}`;
}

/** Opaque wrapper — never serializes plaintext into logs/JSON. */
export class SecretValue {
  constructor(
    private readonly plaintext: string,
    readonly version: number,
    readonly kind: SecretKind,
    readonly name: string,
  ) {}

  /** Reveal plaintext for trusted internal callers only. */
  reveal(): string {
    return this.plaintext;
  }

  get last4(): string {
    const v = this.plaintext;
    if (v.length <= 4) return '****';
    return v.slice(-4);
  }

  toString(): string {
    return `[REDACTED:${this.kind}:${this.name}:v${this.version}:**${this.last4}]`;
  }

  toJSON(): string {
    return this.toString();
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.toString();
  }
}

export interface SecretMetadata {
  kind: SecretKind;
  name: string;
  version: number;
  last4: string;
  rotatedAt: string | null;
  source: 'env' | 'runtime';
}

export interface SecretProvider {
  readonly id: string;
  get(ref: SecretRef): Promise<string | null>;
  /** Optional write path for rotation overlays / future vault backends. */
  put?(ref: SecretRef, value: string): Promise<void>;
  list?(kind?: SecretKind): Promise<Array<{ kind: SecretKind; name: string; source: 'env' | 'runtime' }>>;
}

export function redactForLogs(value: string | null | undefined): string {
  if (value == null || value.length === 0) return '[empty]';
  if (value.length <= 4) return '****';
  return `****${value.slice(-4)}`;
}
