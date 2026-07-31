export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-white/10 bg-bg-surface p-12 text-center">
      <h2 className="text-lg font-medium text-text-primary">Dashboard ready</h2>
      <p className="mt-2 max-w-md text-sm text-text-muted">
        Foundation is healthy. Trading intelligence, strategies, and agent workflows arrive in later
        phases. Nothing is computed yet — by design.
      </p>
    </div>
  );
}
