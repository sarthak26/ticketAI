import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './components/layout/AppLayout';
import { useAuth } from './hooks/useAuth';
import { AISuggestionsPage } from './pages/AISuggestions';
import { DashboardPage } from './pages/Dashboard';
import { KnowledgeBasePage } from './pages/KnowledgeBase';
import { LoginPage } from './pages/Login';
import { SettingsPage } from './pages/Settings';
import { TicketsPage } from './pages/Tickets';

const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/ai-suggestions" element={<AISuggestionsPage />} />
        <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default App;
