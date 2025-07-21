import React, { useState } from 'react';
import { X, Mail, Lock, User, Shield, CheckCircle, AlertCircle, Building, MapPin, Phone, ChevronDown } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
  currentUser?: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, currentUser }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'admin-create'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organization: '',
    country: '',
    phoneNumber: '',
    jobTitle: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [registerRole, setRegisterRole] = useState<'editor' | 'viewer'>('viewer');

  const countries = [
    'Nigeria', 'South Africa', 'Kenya', 'Egypt', 'Ghana', 'Morocco', 'Ethiopia', 'Tanzania',
    'Uganda', 'Rwanda', 'Senegal', 'Ivory Coast', 'Tunisia', 'Algeria', 'Cameroon', 'Zimbabwe',
    'Zambia', 'Botswana', 'Namibia', 'Mauritius', 'Mali', 'Burkina Faso', 'Niger', 'Chad',
    'Central African Republic', 'Democratic Republic of Congo', 'Republic of Congo', 'Gabon',
    'Equatorial Guinea', 'São Tomé and Príncipe', 'Angola', 'Mozambique', 'Madagascar',
    'Malawi', 'Lesotho', 'Eswatini', 'Comoros', 'Seychelles', 'Mauritania', 'Western Sahara',
    'Libya', 'Sudan', 'South Sudan', 'Eritrea', 'Djibouti', 'Somalia', 'Other'
  ];

  // Sort countries alphabetically
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const sortedCountries = countries.slice().sort((a, b) => a.localeCompare(b));
  const filteredCountries = sortedCountries.filter(country => country.toLowerCase().includes(countrySearch.toLowerCase()));

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      organization: '',
      country: '',
      phoneNumber: '',
      jobTitle: ''
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (mode === 'register') {
        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.country) {
          setMessage({ type: 'error', text: 'Please fill in all required fields' });
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match' });
          setLoading(false);
          return;
        }
        // Call backend register API
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.firstName + ' ' + formData.lastName,
            role: registerRole,
            isVerified: false,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          setMessage({ type: 'error', text: data.message || 'Registration failed' });
          setLoading(false);
          return;
        }
        setMessage({ type: 'success', text: 'Registration successful! Your account requires admin verification before you can log in.' });
        setMode('login');
        setLoading(false);
        return;
      }
      // Login
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: 'error', text: data.message || 'Login failed' });
          setLoading(false);
          return;
        }
        // Store JWT and user info
        localStorage.setItem('fintechUser', JSON.stringify({ ...data.user, token: data.token }));
        onAuthSuccess({ ...data.user, token: data.token });
        onClose();
        resetForm();
        setLoading(false);
        return;
      }
      // ... existing code for admin-create ...
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-xl">
          <h2 className="text-lg font-semibold">
            {mode === 'login' && 'Sign In'}
            {mode === 'register' && 'Create Account'}
            {mode === 'admin-create' && 'Create Admin Account'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-gray-900 placeholder-gray-300"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Name fields for registration */}
          {(mode === 'register' || mode === 'admin-create') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-gray-900 placeholder-gray-300"
                    placeholder="First name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-gray-900 placeholder-gray-300"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>
          )}

          {/* Additional fields for registration */}
          {(mode === 'register' || mode === 'admin-create') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={e => {
                      setCountrySearch(e.target.value);
                      setFormData({ ...formData, country: '' });
                      setCountryDropdownOpen(true);
                    }}
                    onFocus={() => setCountryDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setCountryDropdownOpen(false), 100)}
                    placeholder="Search country..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black mb-2 bg-white"
                    autoComplete="off"
                    required
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  {countryDropdownOpen && filteredCountries.length > 0 && (
                    <ul className="absolute left-0 right-0 mt-1 max-h-48 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                      {filteredCountries.map(country => (
                        <li
                          key={country}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-black"
                          onMouseDown={() => {
                            setCountrySearch(country);
                            setFormData({ ...formData, country });
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company or organization"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-gray-900 placeholder-gray-300"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Confirm Password */}
          {(mode === 'register' || mode === 'admin-create') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white bg-gray-900 placeholder-gray-300"
                  placeholder="Confirm password"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Register as</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={registerRole}
                onChange={e => setRegisterRole(e.target.value as 'editor' | 'viewer')}
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>
          )}

          {message.text && (
            <div className={`p-3 rounded-lg flex items-start space-x-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? 
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : 
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              }
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Processing...' : 
              mode === 'login' ? 'Sign In' : 
              mode === 'register' ? 'Create Account' : 
              mode === 'admin-create' ? 'Create Admin Account' : 'Submit'
            }
          </button>

          {mode === 'login' && (
            <div className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{' '}
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => setMode('register')}
              >
                Create one
              </span>
            </div>
          )}
          {mode === 'register' && (
            <div className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => setMode('login')}
              >
                Sign In
              </span>
            </div>
          )}
          {mode === 'admin-create' && (
            <div className="text-center text-sm text-gray-600 mt-4">
              Back to{' '}
              <span
                className="text-blue-600 cursor-pointer hover:underline"
                onClick={() => setMode('login')}
              >
                Sign In
              </span>
        </div>
          )}
        </form>
      </div>
    </div>
  );
};