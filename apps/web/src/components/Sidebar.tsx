const NAV = ['Dashboard', 'Analysis', 'Portfolio', 'Strategy Lab', 'Coach', 'Admin'];

export function Sidebar() {
  return (
    <aside className="w-56 border-r border-white/10 bg-bg-surface p-4 text-sm text-text-muted">
      <nav className="flex flex-col gap-1">
        {NAV.map((item, i) => (
          <span
            key={item}
            className={
              i === 0
                ? 'rounded-md bg-white/5 px-3 py-2 text-text-primary'
                : 'rounded-md px-3 py-2 hover:bg-white/5'
            }
          >
            {item}
          </span>
        ))}
      </nav>
    </aside>
  );
}
