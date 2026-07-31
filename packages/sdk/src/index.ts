/**
 * @ai-tos/sdk — typed client for the AI-TOS API.
 * Foundation: health + generic request. Expanded per service in later phases.
 */

import type { HealthCheck } from '@ai-tos/shared';

export interface ApiClientOptions {
  baseUrl: string;
  token?: string;
  fetchImpl?: typeof fetch;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly token?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: ApiClientOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.token = opts.token;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
        ...init.headers,
      },
    });
    if (!res.ok) {
      throw new Error(`AI-TOS API ${res.status} on ${path}`);
    }
    return (await res.json()) as T;
  }

  health(): Promise<HealthCheck> {
    return this.request<HealthCheck>('/health');
  }
}

export function createClient(baseUrl: string, token?: string): ApiClient {
  return new ApiClient({ baseUrl, token });
}
