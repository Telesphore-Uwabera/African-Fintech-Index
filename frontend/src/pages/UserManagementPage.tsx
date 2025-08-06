import React, { useEffect, useState } from 'react';
import type { User } from '../types';

const UserManagementPage: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '/api';
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [unverifiedUsers, setUnverifiedUsers] = useState<any[]>([]);
  const [loadingUnverified, setLoadingUnverified] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', role: 'viewer', isVerified: false });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    organization: '',
    jobTitle: '',
    phoneNumber: '',
    role: 'viewer'
  });
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const countries = [
    'Nigeria', 'South Africa', 'Kenya', 'Egypt', 'Ghana', 'Morocco', 'Ethiopia', 'Tanzania',
    'Uganda', 'Rwanda', 'Senegal', 'Ivory Coast', 'Tunisia', 'Algeria', 'Cameroon', 'Zimbabwe',
    'Zambia', 'Botswana', 'Namibia', 'Mauritius', 'Mali', 'Burkina Faso', 'Niger', 'Chad',
    'Central African Republic', 'Democratic Republic of Congo', 'Republic of Congo', 'Gabon',
    'Equatorial Guinea', 'São Tomé and Príncipe', 'Angola', 'Mozambique', 'Madagascar',
    'Malawi', 'Lesotho', 'Eswatini', 'Comoros', 'Seychelles', 'Mauritania', 'Western Sahara',
    'Libya', 'Sudan', 'South Sudan', 'Eritrea', 'Djibouti', 'Somalia', 'Other'
  ];

  const sortedCountries = countries.slice().sort((a, b) => a.localeCompare(b));
  const filteredCountries = sortedCountries.filter(country => country.toLowerCase().includes(countrySearch.toLowerCase()));

  useEffect(() => {
    const stored = localStorage.getItem('fintechUser');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
              <main className="flex-1 px-1 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600 text-lg">Manage user accounts and permissions</p>
          </div>
        </div>
        {/* Unverified Users */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Unverified Users</h3>
              <p className="text-gray-600 text-sm">Users pending verification</p>
            </div>
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {unverifiedUsers.length} pending
            </div>
          </div>
          {loadingUnverified ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading unverified users...</span>
            </div>
          ) : unverifiedUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">✓</div>
              <p className="text-gray-600 text-lg">All users are verified!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unverifiedUsers.map(user => (
                <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                    onClick={() => handleVerifyUser(user._id)}
                  >
                    Verify User
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* All Users */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">All Users</h3>
              <p className="text-gray-600 text-sm">Manage existing users and register new ones</p>
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {allUsers.length} total users
            </div>
          </div>
          
          {/* Register New User Form */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-sm">+</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Register New User</h4>
            </div>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!currentUser?.token) return;
                
                // Validation
                if (registerForm.password !== registerForm.confirmPassword) {
                  setNotification({ type: 'error', message: 'Passwords do not match' });
                  return;
                }
                if (!registerForm.firstName || !registerForm.lastName || !registerForm.country) {
                  setNotification({ type: 'error', message: 'Please fill in all required fields' });
                  return;
                }
                
                try {
                  const res = await fetch(`${apiUrl}/users`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${currentUser.token}`,
                    },
                    body: JSON.stringify({
                      name: registerForm.firstName + ' ' + registerForm.lastName,
                      email: registerForm.email,
                      password: registerForm.password,
                      role: registerForm.role,
                      country: registerForm.country,
                      organization: registerForm.organization,
                      jobTitle: registerForm.jobTitle,
                      phoneNumber: registerForm.phoneNumber,
                    }),
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
                  // Reset form
                  setRegisterForm({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    country: '',
                    organization: '',
                    jobTitle: '',
                    phoneNumber: '',
                    role: 'viewer'
                  });
                } catch (err) {
                  setNotification({ type: 'error', message: (err as Error).message });
                }
              }}
            >
              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>



              {/* Country and Organization */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={e => {
                        setCountrySearch(e.target.value);
                        setRegisterForm({ ...registerForm, country: '' });
                        setCountryDropdownOpen(true);
                      }}
                      onFocus={() => setCountryDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setCountryDropdownOpen(false), 100)}
                      placeholder="Search for a country..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      autoComplete="off"
                      required
                    />
                    {countryDropdownOpen && filteredCountries.length > 0 && (
                      <ul className="absolute left-0 right-0 mt-1 max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                        {filteredCountries.map(country => (
                          <li
                            key={country}
                            className="px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors"
                            onMouseDown={() => {
                              setCountrySearch(country);
                              setRegisterForm({ ...registerForm, country });
                              setCountryDropdownOpen(false);
                            }}
                          >
                            {country}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={registerForm.organization}
                    onChange={(e) => setRegisterForm({ ...registerForm, organization: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Company or organization"
                  />
                </div>
              </div>

              {/* Job Title and Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={registerForm.jobTitle}
                    onChange={(e) => setRegisterForm({ ...registerForm, jobTitle: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Your role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={registerForm.phoneNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {/* Password fields and Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter password"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Confirm password"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={registerForm.role}
                    onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="bg-blue-600 text-white rounded-lg px-8 py-3 hover:bg-blue-700 transition-colors font-semibold text-base shadow-sm">
                Register User
              </button>
            </form>
          </div>
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <p className="text-gray-600 text-lg">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notification && (
                <div className={`p-4 rounded-lg border ${
                  notification.type === 'success' 
                    ? 'bg-green-50 text-green-800 border-green-200' 
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {notification.type === 'success' ? '✓' : '✕'}
                    </span>
                    {notification.message}
                  </div>
                </div>
              )}
              
              <div className="relative">
                <input
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search users by email or name..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {allUsers.filter(user =>
                  user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                  (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase()))
                ).map(user => (
                  <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user.isVerified ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <span className={`font-semibold text-sm ${
                          user.isVerified ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.email}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 capitalize">{user.role}</span>
                          {user.isVerified ? (
                            <span className="text-green-600 text-sm">✓ Verified</span>
                          ) : (
                            <span className="text-red-600 text-sm">✕ Unverified</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
      </main>
    </div>
  );
};

export default UserManagementPage; 