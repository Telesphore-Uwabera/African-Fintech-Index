import React, { useEffect, useState } from 'react';
import { Footer } from './Footer';
import { StatsCards } from './StatsCards';
import { AfricaMap } from './AfricaMap';
import { AfricaMapComplete } from './AfricaMapComplete';
import { SubComponentCards } from './SubComponentCards';
import { CountryTable } from './CountryTable';
import { AuthModal } from './AuthModal';
import { FinanceNews } from './FinanceNews';
import { InteractiveChart } from './InteractiveChart';
import { FintechStartups } from './FintechStartups';
import type { CountryData } from '../types';
import { getLocalShapefilePath } from '../utils/shapefileProcessor';

interface DashboardProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
}

const Dashboard: React.FC<DashboardProps> = ({ selectedYear, onYearChange, availableYears }) => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
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
  const [startups, setStartups] = useState<any[]>([]);

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
      fetch(`${apiUrl}/users/unverified`, {
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
      fetch(`${apiUrl}/users`, {
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

  // Fetch startups data for fintech companies calculation
  useEffect(() => {
    // Fetch ALL startups (including pending) for stats calculation if admin
    if (currentUser?.role === 'admin' && currentUser.token) {
      fetch(`${apiUrl}/startups/all`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      })
        .then(res => res.json())
        .then(data => {
          setStartups(data.startups || data || []);
        })
        .catch(() => {
          console.error('Failed to fetch all startups for stats calculation');
          // Fallback to verified startups only if all startups fetch fails
          fetch(`${apiUrl}/startups`)
            .then(res => res.json())
            .then(data => {
              setStartups(data);
            })
            .catch(() => {
              console.error('Failed to fetch verified startups as fallback');
            });
        });
    } else {
      // For non-admin users, fetch verified startups only
      fetch(`${apiUrl}/startups`)
        .then(res => res.json())
        .then(data => {
          setStartups(data);
        })
        .catch(() => {
          console.error('Failed to fetch verified startups');
        });
    }
  }, [apiUrl, currentUser]);

  const handleVerifyUser = async (userId: string) => {
    if (!currentUser?.token) return;
    if (window.confirm('Are you sure you want to verify this user?')) {
      try {
        await fetch(`${apiUrl}/users/${userId}/verify`, {
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
      await fetch(`${apiUrl}/users/${editingUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser.token}` },
        body: JSON.stringify(editForm),
      });
      setEditingUser(null);
      setLoadingUsers(true);
      fetch(`${apiUrl}/users`, {
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
        await fetch(`${apiUrl}/users/${userId}`, {
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

  // Fetch all years' country data once
  const [countryData, setCountryData] = useState<CountryData[]>([]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    fetch(`${apiUrl}/country-data`)
      .then(res => res.json())
      .then(data => {
        const isoA3toA2 = {
          DZA: 'DZ', AGO: 'AO', BEN: 'BJ', BWA: 'BW', BFA: 'BF', BDI: 'BI', CMR: 'CM', CPV: 'CV', CAF: 'CF', TCD: 'TD',
          COM: 'KM', COG: 'CG', COD: 'CD', DJI: 'DJ', EGY: 'EG', GNQ: 'GQ', ERI: 'ER', ETH: 'ET', GAB: 'GA', GMB: 'GM',
          GHA: 'GH', GIN: 'GN', GNB: 'GW', CIV: 'CI', KEN: 'KE', LSO: 'LS', LBR: 'LR', LBY: 'LY', MDG: 'MG', MWI: 'MW',
          MLI: 'ML', MRT: 'MR', MUS: 'MU', MAR: 'MA', MOZ: 'MZ', NAM: 'NA', NER: 'NE', NGA: 'NG', RWA: 'RW', STP: 'ST',
          SEN: 'SN', SYC: 'SC', SLE: 'SL', SOM: 'SO', ZAF: 'ZA', SSD: 'SS', SDN: 'SD', SWZ: 'SZ', TZA: 'TZ', TGO: 'TG',
          TUN: 'TN', UGA: 'UG', ZMB: 'ZM', ZWE: 'ZW'
        };
        const mapped = data.map((item: any) => ({
          ...item,
          id: isoA3toA2[item.id as keyof typeof isoA3toA2] || item.id
        }));
        setCountryData(mapped);
      })
      .catch(() => setCountryData([]));
  }, []);

  // Filter for the selected year
  const currentData = countryData.filter(country => country.year === selectedYear);
  const getYearData = (year: number) => countryData.filter(c => c.year === year);
  const prevYear = selectedYear - 1;
  const prevYearData = getYearData(prevYear);
  const prevAvgScore = prevYearData.length > 0 ? prevYearData.reduce((sum, c) => sum + (c.finalScore || 0), 0) / prevYearData.length : 0;
  const avgScore = currentData.length > 0 ? currentData.reduce((sum, c) => sum + (c.finalScore || 0), 0) / currentData.length : 0;
  const yearOverYearChange = prevAvgScore !== 0 ? parseFloat((((avgScore - prevAvgScore) / prevAvgScore) * 100).toFixed(1)) : 0;
  const topPerformerObj = currentData.length > 0 ? currentData.reduce((top, c) => c.finalScore > top.finalScore ? c : top, currentData[0]) : null;
  const topPerformer = topPerformerObj ? `${topPerformerObj.name} (${topPerformerObj.finalScore.toFixed(1)})` : 'N/A';
  
  // Calculate fintech companies from actual startups data
  const totalFintechCompanies = startups.length;
  const averageFintechCompanies = currentData.length > 0 ? totalFintechCompanies / currentData.length : 0;

  const currentStats = {
    totalCountries: currentData.length,
    averageScore: avgScore,
    topPerformer,
    yearOverYearChange,
    totalFintechCompanies,
    averageFintechCompanies,
  };

  const handleDataUpdate = (newData: CountryData[]) => {
    setCountryData(newData);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('fintechUser', JSON.stringify(user));
  };
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fintechUser');
  };

  if (countryData.length === 0) { // Changed from isLoading to countryData.length
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
      
              <main className="flex-1 px-2 sm:px-1 pb-6 sm:pb-8 space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10 relative z-10 w-full max-w-full min-w-0 overflow-hidden">
          {/* Stats Overview */}
          <div className="w-full max-w-full min-w-0 overflow-hidden">
            <StatsCards stats={currentStats} />
          </div>
          
          {/* Sub-component Cards */}
          <div className="w-full max-w-full min-w-0 overflow-hidden">
            <SubComponentCards data={currentData} />
          </div>
          
          {/* Interactive Analytics */}
          <div className="w-full max-w-full min-w-0 overflow-hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-6 w-full max-w-full min-w-0 overflow-hidden">
              <InteractiveChart 
                data={currentData} 
                allYearsData={countryData} 
                selectedYear={selectedYear}
              />
            </div>
          </div>
          
          {/* Main Content - Map (Full Width) */}
          <div className="w-full max-w-full min-w-0 overflow-hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-6 w-full max-w-full min-w-0 overflow-hidden">
              {useNewMap ? (
                <div className="w-full min-w-0 h-64 sm:h-80 md:h-96 lg:h-[600px] xl:h-[700px] 2xl:h-[800px] overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full max-w-6xl mx-auto">
                    <AfricaMapComplete 
                      data={currentData}
                      shapefilePath={getLocalShapefilePath()}
                      hoveredCountry={hoveredCountry}
                      onCountryHover={setHoveredCountry}
                      selectedYear={selectedYear}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full min-w-0 h-64 sm:h-80 md:h-96 lg:h-[600px] xl:h-[700px] 2xl:h-[800px] overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full max-w-6xl mx-auto">
                    <AfricaMap 
                      data={currentData}
                      onCountryHover={setHoveredCountry}
                      hoveredCountry={hoveredCountry}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Finance News (Beneath Map) */}
          <div className="w-full max-w-full min-w-0 overflow-hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-6 w-full max-w-full min-w-0 overflow-hidden">
              <FinanceNews />
            </div>
          </div>
          
          {/* Fintech Startups */}
          <div className="w-full max-w-full min-w-0 overflow-hidden">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-6 w-full max-w-full min-w-0 overflow-hidden">
              <FintechStartups currentUser={currentUser} selectedYear={selectedYear} />
            </div>
          </div>
          
          {/* Country Rankings Table */}
          {currentData.length > 0 ? (
            <div className="w-full max-w-full min-w-0 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-6 w-full max-w-full min-w-0 overflow-hidden">
                <CountryTable data={currentData} selectedYear={selectedYear} />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-full min-w-0 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-12 text-center w-full max-w-full min-w-0 overflow-hidden">
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
            </div>
          )}
          {/* Admin: Unverified Users */}
          {currentUser?.role === 'admin' && (
            <div className="w-full max-w-full min-w-0 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
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
            </div>
          )}
          {/* Admin: All Users */}
          {currentUser?.role === 'admin' && (
            <div id="user-management" className="w-full max-w-full min-w-0 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
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
                        const res = await fetch(`${apiUrl}/users`, {
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
                        fetch(`${apiUrl}/users`, {
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