import React, { useState, useEffect } from 'react';
import { Footer } from './Footer';
import { StatsCards } from './StatsCards';
import { AfricaMap } from './AfricaMap';
import { AfricaMapComplete } from './AfricaMapComplete';
import { SubComponentCards } from './SubComponentCards';
import { CountryTable } from './CountryTable';
import { FileUpload } from './FileUpload';
import { DataManagement } from './DataManagement';
import { AuthModal } from './AuthModal';
import { FinanceNews } from './FinanceNews';
import { InteractiveChart } from './InteractiveChart';
import { FintechStartups } from './FintechStartups';
import { mockCountryData, calculateDashboardStats, availableYears } from '../data/mockData';
import { useDataPersistence } from '../hooks/useDataPersistence';
import type { CountryData } from '../types';
import { getLocalShapefilePath } from '../utils/shapefileProcessor';

interface DashboardProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ selectedYear, onYearChange }) => {
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [useNewMap, setUseNewMap] = useState(true);
  const [unverifiedUsers, setUnverifiedUsers] = useState<any[]>([]);
  const [loadingUnverified, setLoadingUnverified] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'viewer', isVerified: false });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    // Load user from localStorage on mount
    const stored = localStorage.getItem('fintechUser');
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  // Fetch unverified users if admin
  useEffect(() => {
    if (currentUser?.role === 'admin' && currentUser.token) {
      setLoadingUnverified(true);
      fetch('/api/users/unverified', {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
        .then(res => res.json())
        .then(data => {
          setUnverifiedUsers(data);
          setLoadingUnverified(false);
        })
        .catch(() => setLoadingUnverified(false));
    }
  }, [currentUser]);

  // Fetch all users if admin
  useEffect(() => {
    if (currentUser?.role === 'admin' && currentUser.token) {
      setLoadingUsers(true);
      fetch('/api/users', {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
        .then(res => res.json())
        .then(data => {
          setAllUsers(data);
          setLoadingUsers(false);
        })
        .catch(() => setLoadingUsers(false));
    }
  }, [currentUser]);

  const handleVerifyUser = async (userId: string) => {
    if (!currentUser?.token) return;
    if (window.confirm('Are you sure you want to verify this user?')) {
      try {
        await fetch(`/api/users/${userId}/verify`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        setUnverifiedUsers(users => users.filter(u => u._id !== userId));
        setNotification({ type: 'success', message: 'User verified and notified by email.' });
      } catch {
        setNotification({ type: 'error', message: 'Failed to verify user.' });
      }
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({ name: user.name, role: user.role, isVerified: user.isVerified });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditFormCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.checked });
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !currentUser?.token) return;
    try {
      await fetch(`/api/users/${editingUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify(editForm),
      });
      setEditingUser(null);
      setLoadingUsers(true);
      fetch('/api/users', {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
        .then(res => res.json())
        .then(data => {
          setAllUsers(data);
          setLoadingUsers(false);
          setNotification({ type: 'success', message: 'User updated.' });
        })
        .catch(() => {
          setLoadingUsers(false);
          setNotification({ type: 'error', message: 'Failed to update user.' });
        });
    } catch {
      setNotification({ type: 'error', message: 'Failed to update user.' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!currentUser?.token) return;
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        setAllUsers(users => users.filter(u => u._id !== userId));
        setNotification({ type: 'success', message: 'User deleted.' });
      } catch {
        setNotification({ type: 'error', message: 'Failed to delete user.' });
      }
    }
  };

  const { data: countryData, isLoading, updateData, clearData, getDataInfo } = useDataPersistence(mockCountryData);
  const currentData = countryData.filter(country => country.year === selectedYear);
  const currentStats = calculateDashboardStats(currentData);

  const handleDataUpdate = (newData: CountryData[]) => {
    if (currentUser?.role !== 'admin') {
      alert('Admin authentication required to update data');
      return;
    }
    updateData(newData);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('fintechUser', JSON.stringify(user));
  };
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fintechUser');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading fintech data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>
      
      <main className="flex-1 px-2 sm:px-4 md:px-8 pt-4 pb-8 space-y-10 relative z-10 w-full max-w-full min-w-0 overflow-x-hidden">
          {/* Stats Overview */}
          <StatsCards stats={currentStats} />
          {/* Admin Data Management */}
          {currentUser?.role === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full min-w-0 overflow-x-hidden">
              <DataManagement 
                getDataInfo={getDataInfo}
                clearData={clearData}
                isAuthenticated={true}
              />
              <FileUpload 
                onDataUpdate={handleDataUpdate}
                currentYear={selectedYear}
              />
            </div>
          )}
          {/* Sub-component Cards */}
          <SubComponentCards data={currentData} />
          {/* Interactive Analytics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-12 py-8 w-full max-w-full min-w-0 overflow-x-hidden">
            <InteractiveChart 
              data={currentData} 
              allYearsData={countryData} 
              selectedYear={selectedYear}
            />
          </div>
          {/* Main Content Grid - Map and News */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-full min-w-0 overflow-x-hidden">
            <div className="md:col-span-1 xl:col-span-2 flex items-center justify-center w-full max-w-full min-w-0 overflow-x-hidden">
              {useNewMap ? (
                <div className="w-full min-w-0 h-64 xl:h-96">
                  <AfricaMapComplete 
                    data={currentData}
                    onCountryHover={setHoveredCountry}
                    hoveredCountry={hoveredCountry}
                    shapefilePath={getLocalShapefilePath()}
                    width={undefined}
                    height={undefined}
                  />
                </div>
              ) : (
                <div className="w-full min-w-0 h-64 xl:h-96">
                  <AfricaMap 
                    data={currentData}
                    onCountryHover={setHoveredCountry}
                    hoveredCountry={hoveredCountry}
                  />
                </div>
              )}
            </div>
            <div className="md:col-span-1 xl:col-span-1 h-64 md:h-80 xl:h-96 bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 w-full max-w-full min-w-0 overflow-x-hidden">
              <FinanceNews />
            </div>
          </div>
          {/* Fintech Startups */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 w-full max-w-full min-w-0 overflow-x-hidden">
            <FintechStartups currentUser={currentUser} />
          </div>
          {/* Country Rankings Table */}
          {currentData.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <CountryTable data={currentData} />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {currentUser?.role === 'admin' 
                  ? `Upload a CSV or Excel file to see country rankings for ${selectedYear}`
                  : `Admin login required to upload data for ${selectedYear}`}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Make sure to include year and fintech companies data in your file</p>
            </div>
          )}
          {/* Admin: Unverified Users */}
          {currentUser?.role === 'admin' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-black">Unverified Users</h3>
              {loadingUnverified ? (
                <p>Loading...</p>
              ) : unverifiedUsers.length === 0 ? (
                <p>No unverified users.</p>
              ) : (
                <ul className="space-y-2">
                  {unverifiedUsers.map(user => (
                    <li key={user._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-2">
                      <span className="text-black text-sm sm:text-base">
                        {user.email} ({user.role})
                      </span>
                      <button
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm w-fit"
                        onClick={() => handleVerifyUser(user._id)}
                      >
                        Verify
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {/* Admin: All Users */}
          {currentUser?.role === 'admin' && (
            <div id="user-management" className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">All Users</h3>
              {/* Register New User Form */}
              <div className="mb-6">
                <h4 className="text-sm sm:text-md font-semibold mb-2">Register New User</h4>
                <form
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!currentUser?.token) return;
                    const form = e.target as HTMLFormElement;
                    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                    const role = (form.elements.namedItem('role') as HTMLSelectElement).value;
                    try {
                      const res = await fetch('/api/users', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${currentUser.token}`,
                        },
                        body: JSON.stringify({ name, email, password, role }),
                      });
                      if (!res.ok) throw new Error('Failed to register user');
                      setNotification({ type: 'success', message: 'User registered successfully.' });
                      setLoadingUsers(true);
                      fetch('/api/users', {
                        headers: { Authorization: `Bearer ${currentUser.token}` },
                      })
                        .then(res => res.json())
                        .then(data => {
                          setAllUsers(data);
                          setLoadingUsers(false);
                        })
                        .catch(() => setLoadingUsers(false));
                      form.reset();
                    } catch (err) {
                      setNotification({ type: 'error', message: (err as Error).message });
                    }
                  }}
                >
                  <input name="name" type="text" className="border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Full Name" required />
                  <input name="email" type="email" className="border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Email" required />
                  <input name="password" type="password" className="border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Password" required minLength={6} />
                  <select name="role" className="border border-gray-300 rounded px-3 py-2 text-sm" required defaultValue="viewer">
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button type="submit" className="col-span-1 sm:col-span-2 bg-blue-600 text-white rounded px-4 py-2 mt-2 hover:bg-blue-700 transition text-sm">Register</button>
                </form>
              </div>
              {loadingUsers ? (
                <p>Loading...</p>
              ) : allUsers.length === 0 ? (
                <p>No users found.</p>
              ) : (
                <ul className="space-y-2">
                  {notification && (
                    <div className={`mb-4 p-3 rounded text-sm ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{notification.message}</div>
                  )}
                  {/* User search/filter */}
                  <div className="mb-4">
                    <input
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="Search users by email or name..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                    />
                  </div>
                  {allUsers.filter(user =>
                    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                    (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase()))
                  ).map(user => (
                    <li key={user._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-2 gap-2">
                      <span className={`text-sm sm:text-base ${user.isVerified ? 'text-black' : 'text-gray-500'}`}>
                        {user.email} ({user.role}) {user.isVerified ? <span className="text-green-600">✔️</span> : <span className="text-red-600">❌</span>}
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {/* Edit Modal */}
              {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-96">
                    <h4 className="text-lg font-semibold mb-4">Edit User</h4>
                    <label className="block mb-2">Name
                      <input
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditFormChange}
                      />
                    </label>
                    <label className="block mb-2">Role
                      <select
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        name="role"
                        value={editForm.role}
                        onChange={handleEditFormChange}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </label>
                    <label className="block mb-4">Verified
                      <input
                        type="checkbox"
                        name="isVerified"
                        checked={!!editForm.isVerified}
                        onChange={handleEditFormCheckbox}
                        className="ml-2"
                      />
                    </label>
                    <div className="flex gap-2 justify-end">
                      <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => setEditingUser(null)}>Cancel</button>
                      <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={handleSaveEdit}>Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
          currentUser={currentUser}
        />
      </div>
    );
};

export default Dashboard; 