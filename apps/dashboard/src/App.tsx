import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/use-auth';
import { DashboardLayout } from './components/layout/dashboard-layout';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { OverviewPage } from './pages/overview';
import { AgentsPage } from './pages/agents';
import { PagesPage } from './pages/pages-stats';
import { ContentAnalysisPage } from './pages/content-analysis';
import { ReferralsPage } from './pages/referrals';
import { TimelinePage } from './pages/timeline';
import { SitesPage } from './pages/sites';
import { BillingPage } from './pages/billing';
import { OnboardingWizard } from './components/onboarding/onboarding-wizard';
import { useSites } from './hooks/use-sites';

function DashboardRoutes() {
  const { data: sitesData, isLoading } = useSites();
  const hasSites = (sitesData?.data?.length ?? 0) > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={hasSites ? <OverviewPage /> : <Navigate to="/onboarding" replace />} />
      <Route path="/agents" element={<AgentsPage />} />
      <Route path="/pages" element={<PagesPage />} />
      <Route path="/content-analysis" element={<ContentAnalysisPage />} />
      <Route path="/referrals" element={<ReferralsPage />} />
      <Route path="/timeline" element={<TimelinePage />} />
      <Route path="/sites" element={<SitesPage />} />
      <Route path="/billing" element={<BillingPage />} />
      <Route path="/onboarding" element={<OnboardingWizard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout>
      <DashboardRoutes />
    </DashboardLayout>
  );
}
