import { useState, useEffect, useCallback } from 'react';
import { usePortfolioStore } from '../../store/portfolioStore';
import Header from '../layout/Header';
import ErrorBanner from '../layout/ErrorBanner';
import MobileActionBar from '../layout/MobileActionBar';
import MetricsCards from './MetricsCards';
import TimeFilterBar from './TimeFilterBar';
import ChartTypeSelector from './ChartTypeSelector';
import ActionBar from './ActionBar';
import DataTable from './DataTable';
import PortfolioChart from '../charts/PortfolioChart';
import AddEntryForm from '../forms/AddEntryForm';

export default function Dashboard() {
  const { hasUnsavedChanges, isLoading } = usePortfolioStore();
  const [mobileAddOpen, setMobileAddOpen] = useState(false);

  // ── Warn on page leave if unsaved changes ──
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const toggleMobileAdd = useCallback(() => setMobileAddOpen((v) => !v), []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#64748b] text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-8">
      <Header />
      <ErrorBanner />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Action bar (desktop) */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <ActionBar />
        </div>

        {/* Metrics */}
        <MetricsCards />

        {/* Chart section */}
        <div className="bg-[#1a2235] border border-[#2a3548] rounded-xl p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-[#e2e8f0] uppercase tracking-wider">
              Performance
            </h2>
            <ChartTypeSelector />
          </div>
          <PortfolioChart />
        </div>

        {/* Time filters */}
        <TimeFilterBar />

        {/* Add entry form */}
        {/* Desktop: always visible. Mobile: toggle via bottom bar */}
        <div className="hidden lg:block">
          <AddEntryForm />
        </div>
        {mobileAddOpen && (
          <div className="lg:hidden">
            <AddEntryForm isOpen={mobileAddOpen} onClose={() => setMobileAddOpen(false)} />
          </div>
        )}

        {/* Data table */}
        <DataTable />
      </main>

      {/* Mobile bottom action bar */}
      <MobileActionBar onToggleAddEntry={toggleMobileAdd} />
    </div>
  );
}

