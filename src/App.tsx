import { usePortfolioStore } from './store/portfolioStore';
import Dashboard from './components/dashboard/Dashboard';
import NewPortfolioForm from './components/forms/NewPortfolioForm';
import ErrorBanner from './components/layout/ErrorBanner';

export default function App() {
  const hasPortfolio = usePortfolioStore((s) => s.hasPortfolio);

  return (
    <>
      <ErrorBanner />
      {hasPortfolio ? <Dashboard /> : <NewPortfolioForm />}
    </>
  );
}
