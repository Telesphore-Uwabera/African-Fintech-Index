import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaGlobeAfrica, FaChartBar, FaTable, FaBuilding, FaUsers, FaSignOutAlt, FaSignInAlt, FaDatabase, FaBars, FaTimes } from 'react-icons/fa';

interface SidebarProps {
  currentUser: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onSignIn, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const role = currentUser?.role;

  // Helper to close sidebar on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 1024) setOpen(false);
  };

  // Listen for sidebar-toggle event from Header
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('sidebar-toggle', handler);
    return () => window.removeEventListener('sidebar-toggle', handler);
  }, []);

  // Sidebar content
  const SidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-blue-50 to-purple-50">
      <div className="flex items-center justify-center h-24 border-b border-gray-100 px-6 relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-700/90 backdrop-blur-sm"></div>
        <span className="text-2xl font-black text-white flex items-center gap-3 tracking-tight relative z-10 drop-shadow-lg">
          <FaGlobeAfrica className="text-3xl drop-shadow-md" />
          <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">African Fintech Index</span>
        </span>
        {/* Close button for mobile only */}
        <button
          className="block lg:hidden absolute right-4 top-4 text-white hover:text-blue-200 transition-colors z-20"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <FaTimes className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <NavLink to="/" onClick={handleNavClick} className={({ isActive }) => isActive ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg transform scale-105 transition-all duration-200' : 'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 font-medium transition-all duration-200 hover:scale-105'} end>
          <FaChartBar className="text-lg" /> Dashboard
        </NavLink>
        {(role === 'admin' || role === 'editor' || role === 'viewer') && (
          <NavLink to="/analytics" onClick={handleNavClick} className={({ isActive }) => isActive ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg transform scale-105 transition-all duration-200' : 'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 font-medium transition-all duration-200 hover:scale-105'}>
            <FaTable className="text-lg" /> Analytics
          </NavLink>
        )}
        <NavLink to="/countries" onClick={handleNavClick} className={({ isActive }) => isActive ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg transform scale-105 transition-all duration-200' : 'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 font-medium transition-all duration-200 hover:scale-105'}>
          <FaGlobeAfrica className="text-lg" /> Countries
        </NavLink>
        {(role === 'admin' || role === 'editor' || role === 'viewer') && (
          <NavLink to="/startups" onClick={handleNavClick} className={({ isActive }) => isActive ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg transform scale-105 transition-all duration-200' : 'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 font-medium transition-all duration-200 hover:scale-105'}>
            <FaBuilding className="text-lg" /> Startups
          </NavLink>
        )}
        {(role === 'admin' || role === 'editor') && (
          <NavLink to="/data-management" onClick={handleNavClick} className={({ isActive }) => isActive ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg transform scale-105 transition-all duration-200' : 'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 font-medium transition-all duration-200 hover:scale-105'}>
            <FaDatabase className="text-lg" /> Data Management
          </NavLink>
        )}
        {role === 'admin' && (
          <NavLink to="/user-management" onClick={handleNavClick} className={({ isActive }) => isActive ? 'flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-lg transform scale-105 transition-all duration-200' : 'flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 font-medium transition-all duration-200 hover:scale-105'}>
            <FaUsers className="text-lg" /> User Management
          </NavLink>
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Sidebar for large screens (always visible) */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-gradient-to-b from-white via-blue-50 to-purple-50 shadow-2xl z-40 flex flex-col fixed top-0 left-0 h-screen border-r border-gray-200/50 min-w-0">
        {SidebarContent}
      </aside>
      {/* Sidebar overlay for mobile only */}
      <aside
        className={`block lg:hidden fixed top-0 left-0 h-full w-64 flex-shrink-0 bg-gradient-to-b from-white via-blue-50 to-purple-50 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ minHeight: '100vh' }}
      >
        {SidebarContent}
      </aside>
    </>
  );
}; 