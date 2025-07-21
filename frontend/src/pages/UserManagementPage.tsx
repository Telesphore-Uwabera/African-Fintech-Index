import React, { useEffect, useState } from 'react';
import type { User } from '../types';

const UserManagementPage: React.FC = () => {
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
      fetch('/api/users/unverified', {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      })
        .then(res => res.json())
        .then(data => {
          setUnverifiedUsers(data);
          setLoadingUnverified(false);
        })
        .catch(() => setLoadingUnverified(false));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 px-4 sm:px-8 lg:px-16 py-10 space-y-10">
        <h1 className="text-2xl font-bold mb-4 text-black">User Management</h1>
        {/* Unverified Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 w-full">
          <h3 className="text-lg font-semibold mb-4 text-black">Unverified Users</h3>
          {loadingUnverified ? (
            <p>Loading...</p>
          ) : unverifiedUsers.length === 0 ? (
            <p>No unverified users.</p>
          ) : (
            <ul className="space-y-2">
              {unverifiedUsers.map(user => (
                <li key={user._id} className="flex items-center justify-between border-b pb-2">
                  <span className="text-black">
                    {user.email} ({user.role})
                  </span>
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => handleVerifyUser(user._id)}
                  >
                    Verify
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* All Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 w-full">
          <h3 className="text-lg font-semibold mb-4 text-black">All Users</h3>
          {/* Register New User Form */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-2">Register New User</h4>
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
                  const res = await fetch('/api/users', {
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
                  fetch('/api/users', {
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerForm.firstName}
                    onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerForm.lastName}
                    onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    placeholder="Search country..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoComplete="off"
                    required
                  />
                  {countryDropdownOpen && filteredCountries.length > 0 && (
                    <ul className="absolute left-0 right-0 mt-1 max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                      {filteredCountries.map(country => (
                        <li
                          key={country}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-100"
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

              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <input
                  type="text"
                  value={registerForm.organization}
                  onChange={(e) => setRegisterForm({ ...registerForm, organization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company or organization"
                />
              </div>

              {/* Job Title and Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={registerForm.jobTitle}
                    onChange={(e) => setRegisterForm({ ...registerForm, jobTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={registerForm.phoneNumber}
                    onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              {/* Password fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition">
                Register User
              </button>
            </form>
          </div>
          {loadingUsers ? (
            <p>Loading...</p>
          ) : allUsers.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <ul className="space-y-2">
              {notification && (
                <div className={`mb-4 p-3 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{notification.message}</div>
              )}
              <div className="mb-4">
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Search users by email or name..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
              </div>
              {allUsers.filter(user =>
                user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                (user.name && user.name.toLowerCase().includes(userSearch.toLowerCase()))
              ).map(user => (
                <li key={user._id} className="flex items-center justify-between border-b pb-2">
                  <span className={user.isVerified ? 'text-black' : 'text-gray-500'}>
                    {user.email} ({user.role}) {user.isVerified ? <span className="text-green-600">✔️</span> : <span className="text-red-600">❌</span>}
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {/* Edit Modal ... unchanged ... */}
        </div>
      </main>
    </div>
  );
};

export default UserManagementPage; 