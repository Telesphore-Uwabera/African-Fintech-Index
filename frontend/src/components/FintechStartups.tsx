import React, { useEffect, useState } from 'react';
import { Plus, Building2, Globe, Calendar, User, Search, Filter } from 'lucide-react';
import type { FintechStartup } from '../types';

interface FintechStartupsProps {
  currentUser: any;
}

export const FintechStartups: React.FC<FintechStartupsProps> = ({ currentUser }) => {
  const [startups, setStartups] = useState<FintechStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch startups from backend on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/startups')
      .then(res => res.json())
      .then(data => {
        setStartups(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch startups');
        setLoading(false);
      });
  }, []);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  
  const [newStartup, setNewStartup] = useState({
    name: '',
    country: '',
    sector: '',
    foundedYear: new Date().getFullYear(),
    description: '',
    website: ''
  });

  // Replace with a full list of African countries
  const countries = [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic',
    'Chad', 'Comoros', 'Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea',
    'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho',
    'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia',
    'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa',
    'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
  ];
  const sectors = ['Payments', 'Mobile Money', 'Lending', 'Insurance', 'Investment', 'Banking', 'Blockchain', 'RegTech'];

  // Add startup handler
  const handleAddStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please sign in to add startups');
      return;
    }

    const startup: FintechStartup = {
      id: Date.now().toString(),
      ...newStartup,
      addedBy: currentUser.name || currentUser.email,
      addedAt: Date.now()
    };

    try {
      const res = await fetch('/api/startups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(startup),
      });
      if (!res.ok) throw new Error('Failed to add startup');
      const newStartup = await res.json();
      setStartups(prev => [newStartup, ...prev]); // Show new startup immediately
    } catch {
      setError('Failed to add startup');
    }
    setNewStartup({
      name: '',
      country: '',
      sector: '',
      foundedYear: new Date().getFullYear(),
      description: '',
      website: ''
    });
    setShowAddForm(false);
  };

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !selectedCountry || startup.country === selectedCountry;
    const matchesSector = !selectedSector || startup.sector === selectedSector;
    
    return matchesSearch && matchesCountry && matchesSector;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fintech Startups</h2>
            <p className="text-sm text-gray-600">Discover and add fintech companies across Africa</p>
          </div>
        </div>

        {(currentUser && (currentUser.role === 'admin' || currentUser.role === 'editor' || currentUser.role === 'viewer')) && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Startup</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search startups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white bg-gray-900 placeholder-gray-300"
          />
        </div>

        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white bg-gray-900"
        >
          <option value="">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white bg-gray-900"
        >
          <option value="">All Sectors</option>
          {sectors.map(sector => (
            <option key={sector} value={sector}>{sector}</option>
          ))}
        </select>
      </div>

      {/* Add Startup Form */}
      {showAddForm && (
        <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Add New Fintech Startup</h3>
          <form onSubmit={handleAddStartup} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Startup Name"
              value={newStartup.name}
              onChange={(e) => setNewStartup({ ...newStartup, name: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white bg-gray-900 placeholder-gray-300"
              required
            />

            <select
              value={newStartup.country}
              onChange={(e) => setNewStartup({ ...newStartup, country: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white bg-gray-900"
              required
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={newStartup.sector}
              onChange={(e) => setNewStartup({ ...newStartup, sector: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white bg-gray-900"
              required
            >
              <option value="">Select Sector</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Founded Year"
              value={newStartup.foundedYear}
              onChange={(e) => setNewStartup({ ...newStartup, foundedYear: parseInt(e.target.value) })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white bg-gray-900 placeholder-gray-300"
              min="1990"
              max={new Date().getFullYear()}
              required
            />

            <input
              type="url"
              placeholder="Website (optional)"
              value={newStartup.website}
              onChange={(e) => setNewStartup({ ...newStartup, website: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white bg-gray-900 placeholder-gray-300"
            />

            <textarea
              placeholder="Description"
              value={newStartup.description}
              onChange={(e) => setNewStartup({ ...newStartup, description: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent col-span-1 sm:col-span-2 text-white bg-gray-900 placeholder-gray-300"
              rows={3}
              required
            />

            <div className="col-span-1 sm:col-span-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Startup
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Startups Grid */}
      {loading ? (
        <div>Loading startups...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full overflow-x-hidden">
        {filteredStartups.map((startup) => (
            <div key={startup.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow w-full max-w-full">
              <div className="flex items-start justify-between mb-3 w-full max-w-full">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex-1 min-w-0 mr-2 truncate">{startup.name}</h3>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex-shrink-0 truncate">
                {startup.sector}
              </span>
            </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 break-words">{startup.description}</p>
              <div className="space-y-2 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{startup.country}</span>
              </div>
              <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Founded {startup.foundedYear}</span>
              </div>
              <div className="flex items-center space-x-2">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Added by {startup.addedBy || 'Unknown'}</span>
                </div>
              </div>
            {startup.website && (
              <a
                href={startup.website}
                target="_blank"
                rel="noopener noreferrer"
                  className="inline-block mt-3 text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium truncate"
              >
                Visit Website →
              </a>
            )}
          </div>
        ))}
      </div>
      )}

      {filteredStartups.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No startups found matching your criteria</p>
          {currentUser && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-green-600 hover:text-green-700 font-medium"
            >
              Add the first startup
            </button>
          )}
        </div>
      )}
    </div>
  );
};