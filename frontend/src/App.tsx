import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CountriesPage from './pages/CountriesPage';
import StartupsPage from './pages/StartupsPage';
import UserManagementPage from './pages/UserManagementPage';
import DataManagementPage from './pages/DataManagementPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import type { User } from './types';
import { AuthModal } from './components/AuthModal';
import { mockCountryData, availableYears } from './data/mockData';

export const AuthContext = createContext<any>(null);

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const userStr = localStorage.getItem('fintechUser');
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);
  // Use a custom hook to access navigate inside App
  function WithNavigate() {
    const navigate = useNavigate();
    useEffect(() => {
      // If user is signed out, redirect to dashboard
      if (!currentUser) {
        navigate('/');
      }
    }, [currentUser, navigate]);
    return null;
  }

  useEffect(() => {
    const stored = localStorage.getItem('fintechUser');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const handleSignIn = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fintechUser', JSON.stringify(user));
  };
  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('fintechUser');
    // navigate('/') will be triggered by WithNavigate effect
  };
  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fintechUser', JSON.stringify(user));
    setShowAuthModal(false);
  };

  return (
    <AuthContext.Provider value={{ currentUser, onSignIn: handleSignIn, onSignOut: handleSignOut }}>
      <Router>
        <WithNavigate />
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
          </div>
          <Header
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            availableYears={availableYears}
            currentUser={currentUser}
            onAuthClick={openAuthModal}
            onLogout={handleSignOut}
          />
          <div className="flex flex-row flex-1 relative z-10 w-full max-w-full min-w-0 overflow-x-hidden">
            {currentUser && (
              <Sidebar currentUser={currentUser} onSignIn={openAuthModal} onSignOut={handleSignOut} />
            )}
            <main className={`flex-1 min-w-0 w-full max-w-full overflow-x-hidden p-8 text-black ${currentUser ? 'lg:ml-64' : ''}`}>
              <Routes>
                <Route path="/" element={<DashboardPage selectedYear={selectedYear} onYearChange={setSelectedYear} />} />
                <Route path="/analytics" element={<AnalyticsPage selectedYear={selectedYear} onYearChange={setSelectedYear} />} />
                <Route path="/countries" element={<CountriesPage selectedYear={selectedYear} onYearChange={setSelectedYear} />} />
                <Route path="/startups" element={<StartupsPage />} />
                <Route path="/user-management" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="/data-management" element={
                  <ProtectedRoute allowedRoles={['admin', 'editor']}>
                    <DataManagementPage />
                  </ProtectedRoute>
                } />
              </Routes>
              <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} onAuthSuccess={handleAuthSuccess} currentUser={currentUser} />
            </main>
      </div>
      </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
