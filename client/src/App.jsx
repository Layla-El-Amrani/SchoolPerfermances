import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './services/auth';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AnalyseCommune from './pages/AnalyseCommune';
import AnalyseEtablissement from './pages/AnalyseEtablissement';
import ImportDonnees from './pages/ImportDonnees';
import Rapports from './pages/Rapports';
import Parametres from './pages/Parametres';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Navbar from './components/Navbar';
import { LanguageProvider } from './contexts/LanguageContext';
import { YearProvider } from './contexts/YearContext';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import { useYear } from './contexts/YearContext';
import './App.css';

// Composant pour protéger les routes
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { globalLoading } = useYear();
  
  // Afficher le PageLoader uniquement pendant le chargement global (changement d'année)
  if (globalLoading) {
    return <PageLoader isLoading={true} />;
  }

  return (
    <>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <>
              <Navbar />
              <div className="content" style={{
                marginLeft: '250px',
                marginTop: '64px',
                padding: '20px',
                backgroundColor: '#f5f5f5',
                minHeight: '100vh'
              }}>
                <ErrorBoundary>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<Dashboard />} />
                      <Route path="analyse-commune" element={<AnalyseCommune />} />
                      <Route path="analyse-etablissement" element={<AnalyseEtablissement />} />
                      <Route path="import-donnees" element={<ImportDonnees />} />
                      <Route path="rapports" element={<Rapports />} />
                      <Route path="parametres" element={<Parametres />} />
                    </Routes>
                  </DashboardLayout>
                </ErrorBoundary>
              </div>
            </>
          </PrivateRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <YearProvider>
          <div className="app-container">
            <AppContent />
          </div>
        </YearProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
