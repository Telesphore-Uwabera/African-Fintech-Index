import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CountriesPage from './pages/CountriesPage';
import StartupsPage from './pages/StartupsPage';
import UserManagementPage from './pages/UserManagementPage';
import DataManagementPage from './pages/DataManagementPage';
import { AuthModal } from './components/AuthModal';
import type { User } from './types';

// Simple protected route component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const userStr = localStorage.getItem('fintechUser');
  const user = userStr ? JSON.parse(userStr) : null;
  if (!user || !allowedRoles.includes(user.role)) {
    return <div>Access denied. Please log in with appropriate permissions.</div>;
  }
  return <>{children}</>;
};

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('fintechUser');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    fetch(`${apiUrl}/country-data/years`, {
      signal: controller.signal
    })
      .then(res => {
        clearTimeout(timeoutId);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(years => {
        setAvailableYears(years);
        if (years.length > 0 && selectedYear === null) {
          setSelectedYear(years[0]); // Default to latest year
        }
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error('Failed to fetch years:', error);
        setAvailableYears([]);
        // Set a default year if fetch fails
        if (selectedYear === null) {
          setSelectedYear(2024);
        }
      });
      
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [selectedYear]);

  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  const handleSignIn = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fintechUser', JSON.stringify(user));
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('fintechUser');
  };

  const openAuthModal = () => setShowAuthModal(true);
  const closeAuthModal = () => setShowAuthModal(false);
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('fintechUser', JSON.stringify(user));
    setShowAuthModal(false);
  };

  return (
    <Router>
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
        </div>
        <Header
          selectedYear={selectedYear || 2024}
          onYearChange={setSelectedYear}
          availableYears={availableYears}
          currentUser={currentUser}
          onAuthClick={openAuthModal}
          onLogout={handleSignOut}
          apiUrl={import.meta.env.VITE_API_URL || '/api'}
        />
        
        {/* Sidebar - Only render when user is signed in */}
        {currentUser && (
          <Sidebar 
            currentUser={currentUser} 
            onSignIn={openAuthModal} 
            onSignOut={handleSignOut}
            onSidebarToggle={handleSidebarToggle}
          />
        )}
        
        <div className="flex flex-row flex-1 relative z-10 w-full max-w-full min-w-0 overflow-hidden pt-20 lg:pt-24">
          <main className={`flex-1 min-w-0 w-full max-w-full overflow-hidden px-2 sm:px-4 md:px-6 lg:px-8 pt-4 pb-6 text-black transition-all duration-300 ${
            currentUser ? (sidebarCollapsed ? 'lg:ml-16 xl:ml-16' : 'lg:ml-64 xl:ml-64') : ''
          }`}>
            <div className="w-full max-w-full min-w-0 overflow-hidden">
              <Routes>
                <Route path="/" element={<DashboardPage selectedYear={selectedYear || 2024} onYearChange={setSelectedYear} availableYears={availableYears} />} />
                <Route path="/analytics" element={<AnalyticsPage selectedYear={selectedYear || 2024} onYearChange={setSelectedYear} availableYears={availableYears} />} />
                <Route path="/countries" element={<CountriesPage selectedYear={selectedYear || 2024} onYearChange={setSelectedYear} availableYears={availableYears} />} />
                <Route path="/startups" element={<StartupsPage selectedYear={selectedYear || 2024} onYearChange={setSelectedYear} availableYears={availableYears} currentUser={currentUser} />} />
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
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
