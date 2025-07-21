import React, { useState } from 'react';
import { BarChart3, Globe, User, LogOut, ChevronDown, Menu, X } from 'lucide-react';

interface HeaderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
  currentUser?: any;
  onAuthClick: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  selectedYear, 
  onYearChange, 
  availableYears, 
  currentUser,
  onAuthClick,
  onLogout
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {/* Top Banner - Partnership Information */}
      {/* <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between py-3 text-sm">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-2 lg:mb-0">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-center sm:text-left">
                  Partnership: Carnegie Mellon University • Carnegie Mellon Africa • University of the Witwatersrand
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">Funded by AFRETEC NETWORK</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <a href="#research" className="hover:text-blue-200 transition-colors whitespace-nowrap">Research</a>
              <a href="#methodology" className="hover:text-blue-200 transition-colors whitespace-nowrap">Methodology</a>
              <a href="#contact" className="hover:text-blue-200 transition-colors whitespace-nowrap">Contact</a>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-lg border-b border-blue-500/20 fixed top-0 left-0 right-0 z-50 h-20 flex items-center w-full backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4 min-w-0 w-full">
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="African Fintech Index Logo"
                  className="w-14 h-14 object-contain rounded-xl shadow-lg bg-white/10 backdrop-blur-sm border-2 border-white/20 flex-shrink-0 transition-transform hover:scale-105"
                  style={{ background: 'white' }}
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              </div>
              {/* Responsive Title and Tagline */}
              <div className="flex flex-col items-start sm:items-start w-full">
                <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-0 sm:mb-0 text-left w-full bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                  African Fintech Index
                </h1>
                <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-medium text-blue-100 leading-snug mt-0 sm:mt-0 text-left w-full drop-shadow-md">
                  Financial Technology Development Across Africa
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Year Selector */}
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-sm text-gray-600 whitespace-nowrap">Year:</span>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(Number(e.target.value))}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 text-black"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year} className="text-black">{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {/* User Menu */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${
                      currentUser.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                    }`}>
                      {currentUser.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{currentUser.email}</div>
                      <div className="text-xs text-gray-500 capitalize">{currentUser.role}</div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium bg-white text-black rounded px-2 py-1 truncate">{currentUser.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{currentUser.role} Account</p>
                      </div>
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
            {/* Mobile/Tablet Controls */}
            <div className="lg:hidden flex items-center space-x-3">
              {/* Sidebar Hamburger for Mobile */}
              <button
                className="block lg:hidden bg-white rounded-full p-2 shadow border border-gray-200 mr-2"
                onClick={() => window.dispatchEvent(new CustomEvent('sidebar-toggle'))}
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6 text-blue-700" />
              </button>
              {/* Year Selector for Mobile */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year} className="text-black">{year}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-4">
              {/* Only show year selector and user menu in mobile menu, no nav links */}
            </div>
          </div>
        )}
      </header>
    </>
  );
};