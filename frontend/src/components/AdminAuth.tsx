import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, Shield, UserPlus } from 'lucide-react';

interface AdminAuthProps {
  onAuthSuccess: (isAdmin: boolean) => void;
  isAuthenticated: boolean;
}

interface AdminCredentials {
  username: string;
  password: string;
  confirmPassword?: string;
}

interface StoredUser {
  username: string;
  password: string;
  createdAt: number;
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthSuccess, isAuthenticated }) => {
  const [credentials, setCredentials] = useState<AdminCredentials>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [success, setSuccess] = useState('');

  // Demo admin credentials - in production, this would be handled by a secure backend
  const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'fintech2024'
  };

  useEffect(() => {
    // Check if user is already authenticated from localStorage
    const savedAuth = localStorage.getItem('fintechAdminAuth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      if (authData.isAdmin && authData.timestamp > Date.now() - 24 * 60 * 60 * 1000) { // 24 hour session
        onAuthSuccess(true);
      } else {
        localStorage.removeItem('fintechAdminAuth');
      }
    }
  }, [onAuthSuccess]);

  const getStoredUsers = (): StoredUser[] => {
    try {
      const users = localStorage.getItem('fintechAdminUsers');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  const saveUser = (user: StoredUser) => {
    const users = getStoredUsers();
    users.push(user);
    localStorage.setItem('fintechAdminUsers', JSON.stringify(users));
  };

  const validateCredentials = (username: string, password: string): boolean => {
    // Check default admin
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      return true;
    }

    // Check stored users
    const users = getStoredUsers();
    return users.some(user => user.username === username && user.password === password);
  };

  const userExists = (username: string): boolean => {
    if (username === DEFAULT_ADMIN.username) return true;
    const users = getStoredUsers();
    return users.some(user => user.username === username);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (credentials.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (userExists(credentials.username)) {
      setError('Username already exists');
      setIsLoading(false);
      return;
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Save new user
    const newUser: StoredUser = {
      username: credentials.username,
      password: credentials.password,
      createdAt: Date.now()
    };

    saveUser(newUser);
    setSuccess('Account created successfully! You can now sign in.');
    setIsRegisterMode(false);
    setCredentials({ username: credentials.username, password: '' });
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (validateCredentials(credentials.username, credentials.password)) {
      // Save authentication state
      const authData = {
        isAdmin: true,
        timestamp: Date.now(),
        username: credentials.username
      };
      localStorage.setItem('fintechAdminAuth', JSON.stringify(authData));
      
      onAuthSuccess(true);
    } else {
      setError('Invalid credentials. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('fintechAdminAuth');
    onAuthSuccess(false);
    setCredentials({ username: '', password: '' });
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setCredentials({ username: '', password: '' });
    setError('');
    setSuccess('');
  };

  if (isAuthenticated) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Admin Access Granted</p>
              <p className="text-xs text-green-600">You can now upload and modify data</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
          {isRegisterMode ? <UserPlus className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />}
        </div>
      </div>
      
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isRegisterMode ? 'Create Admin Account' : 'Admin Authentication Required'}
        </h3>
        <p className="text-sm text-gray-600">
          {isRegisterMode 
            ? 'Register a new admin account to manage fintech data'
            : 'Please sign in to upload and modify fintech data'
          }
        </p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter username"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
              required
              minLength={isRegisterMode ? 6 : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isRegisterMode && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={credentials.confirmPassword || ''}
                onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{isRegisterMode ? 'Creating Account...' : 'Signing in...'}</span>
            </div>
          ) : (
            isRegisterMode ? 'Create Admin Account' : 'Sign In as Admin'
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={toggleMode}
          className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
        >
          {isRegisterMode 
            ? 'Already have an account? Sign in' 
            : 'Need an account? Register as admin'
          }
        </button>
      </div>

      {!isRegisterMode && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Demo Credentials:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> fintech2024</p>
          </div>
        </div>
      )}
    </div>
  );
};