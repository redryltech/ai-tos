'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function HealthCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
    refetchInterval: 10_000,
  });

  const status = isLoading ? '...' : isError ? 'error' : data?.status ?? 'unknown';

  return (
    <div className="rounded-md border border-white/10 bg-bg-surface p-4">
      <div className="text-sm text-text-muted">API Health</div>
      <div className="mt-1 text-2xl font-semibold text-bull">{status}</div>
      {data ? <div className="mt-1 text-xs text-text-muted">{data.service} · {data.version}</div> : null}
    </div>
  );
}
