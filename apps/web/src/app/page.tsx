import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HealthCard } from '@/components/HealthCard';
import { EmptyState } from '@/components/EmptyState';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="mb-4 text-xl font-semibold text-text-primary">Dashboard</h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <HealthCard />
            <div className="rounded-md border border-white/10 bg-bg-surface p-4">
              <div className="text-sm text-text-muted">Mode</div>
              <div className="mt-1 text-2xl font-semibold text-text-primary">Learn</div>
            </div>
            <div className="rounded-md border border-white/10 bg-bg-surface p-4">
              <div className="text-sm text-text-muted">Services</div>
              <div className="mt-1 text-2xl font-semibold text-text-primary">7 online</div>
            </div>
          </div>
          <div className="mt-6">
            <EmptyState />
          </div>
        </main>
      </div>
    </div>
  );
}
