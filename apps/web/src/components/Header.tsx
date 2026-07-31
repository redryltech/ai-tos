import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-bg-surface px-6 py-3">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-accent">AI-TOS</span>
        <span className="text-sm text-text-muted">Trading Operating System</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-md bg-bull/10 px-2 py-1 text-xs text-bull">Phase 0</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
