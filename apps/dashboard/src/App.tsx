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
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/pages" element={<PagesPage />} />
        <Route path="/content-analysis" element={<ContentAnalysisPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/sites" element={<SitesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
}
