const REDACTED = '[REDACTED]';

const SENSITIVE_PARTS = new Set([
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'apikey',
  'authorization',
  'auth',
  'cookie',
  'privatekey',
  'accesskey',
  'refreshtoken',
  'bearer',
  'credential',
  'jwt',
  'accesstoken',
  'idtoken',
]);

const SENSITIVE_VALUE =
  /\b(Bearer\s+[A-Za-z0-9\-._~+/]+=*|sk-[A-Za-z0-9]{8,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)\b/g;

export { REDACTED };

function isSensitiveKey(key: string): boolean {
  const normalized = key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  const parts = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const joined = parts.join('');
  if (
    SENSITIVE_PARTS.has(joined) ||
    joined.endsWith('secret') ||
    joined.endsWith('token') ||
    joined.endsWith('password') ||
    joined.endsWith('apikey')
  ) {
    return true;
  }
  return parts.some(
    (p) =>
      SENSITIVE_PARTS.has(p) ||
      p.endsWith('secret') ||
      p.endsWith('token') ||
      p.endsWith('password') ||
      p.endsWith('apikey'),
  );
}

function redactString(value: string): string {
  return value.replace(SENSITIVE_VALUE, REDACTED);
}

/**
 * Deep-redact secrets/tokens/passwords from log payloads.
 * Never throws — returns a safe structured clone-like object.
 */
export function redactForLogging(input: unknown, depth = 0): unknown {
  if (depth > 8) return '[MAX_DEPTH]';
  if (input == null) return input;
  if (typeof input === 'string') return redactString(input);
  if (typeof input === 'number' || typeof input === 'boolean') return input;
  if (typeof input === 'bigint') return input.toString();
  if (input instanceof Error) {
    return {
      name: input.name,
      message: redactString(input.message),
      stack: input.stack ? redactString(input.stack) : undefined,
    };
  }
  if (Array.isArray(input)) {
    return input.map((item) => redactForLogging(item, depth + 1));
  }
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        out[key] = REDACTED;
      } else {
        out[key] = redactForLogging(value, depth + 1);
      }
    }
    return out;
  }
  return String(input);
}
