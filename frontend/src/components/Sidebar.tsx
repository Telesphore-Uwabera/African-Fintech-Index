import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaGlobeAfrica, FaChartBar, FaTable, FaBuilding, FaUsers, FaSignOutAlt, FaSignInAlt, FaDatabase, FaBars, FaTimes } from 'react-icons/fa';

interface SidebarProps {
  currentUser: any;
  onSignIn: () => void;
  onSignOut: () => void;
  onSidebarToggle?: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onSignIn, onSignOut, onSidebarToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const role = currentUser?.role;

  // Don't render sidebar if no user is signed in
  if (!currentUser) {
    return null;
  }

  // Close sidebar on mobile when clicking outside or on a link
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false); // Close mobile sidebar on desktop
      }
      if (window.innerWidth >= 1280) {
        setIsCollapsed(false); // Expand sidebar on large screens
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(true); // Collapse sidebar on medium screens
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for sidebar-toggle event from Header
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('sidebar-toggle', handler);
    return () => window.removeEventListener('sidebar-toggle', handler);
  }, []);

  // Notify parent component when sidebar state changes
  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(isCollapsed);
    }
  }, [isCollapsed, onSidebarToggle]);

  // Close sidebar when clicking on backdrop
  const handleBackdropClick = () => {
    setIsOpen(false);
  };

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems = [
    { to: '/', icon: FaChartBar, label: 'Dashboard', show: true },
    { to: '/analytics', icon: FaTable, label: 'Analytics', show: role === 'admin' || role === 'editor' || role === 'viewer' },
    { to: '/countries', icon: FaGlobeAfrica, label: 'Countries', show: true },
    { to: '/startups', icon: FaBuilding, label: 'Startups', show: role === 'admin' || role === 'editor' || role === 'viewer' },
    { to: '/data-management', icon: FaDatabase, label: 'Data Management', show: role === 'admin' || role === 'editor' },
    { to: '/user-management', icon: FaUsers, label: 'User Management', show: role === 'admin' },
  ].filter(item => item.show);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white shadow-xl border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center space-x-3">
          <FaGlobeAfrica className="text-xl text-white" />
          {!isCollapsed && (
            <span className="text-sm font-semibold text-white whitespace-nowrap">
              Navigation
            </span>
          )}
        </div>
        {/* Close button for mobile */}
        <button
          className="lg:hidden bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-2 transition-all duration-200 hover:scale-105 shadow-sm border border-white/30"
          onClick={() => setIsOpen(false)}
          aria-label="Close sidebar"
        >
          <FaTimes className="w-5 h-5 text-white" />
        </button>
        {/* Collapse button for desktop */}
        <button
          className="hidden lg:block bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-1.5 transition-all duration-200 hover:scale-105 shadow-sm border border-white/30"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <FaBars className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
              }`
            }
          >
            <item.icon className={`text-lg flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && (
              <span className="font-medium whitespace-nowrap">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-200">
        {currentUser ? (
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${
              currentUser.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              {currentUser.email.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.email}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {currentUser.role}
                </div>
              </div>
            )}
            <button
              onClick={onSignOut}
              className={`text-gray-500 hover:text-red-600 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
              title="Sign Out"
            >
              <FaSignOutAlt className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onSignIn}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <FaSignInAlt className="w-4 h-4" />
            {!isCollapsed && <span>Sign In</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block fixed top-16 lg:top-20 left-0 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={handleBackdropClick}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {SidebarContent}
      </aside>
    </>
  );
}; 