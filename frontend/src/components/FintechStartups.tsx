import React, { useEffect, useState } from 'react';
import { Plus, Building2, Globe, Calendar, User, Search, Filter } from 'lucide-react';
import type { FintechStartup } from '../types';
import * as XLSX from 'xlsx';

interface FintechStartupsProps {
  currentUser: any;
  selectedYear?: number;
}

export const FintechStartups: React.FC<FintechStartupsProps> = ({ currentUser, selectedYear }) => {
  const [startups, setStartups] = useState<FintechStartup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Fetch startups from backend on mount
  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    fetch(`${apiUrl}/startups`)
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
  const [showAllStartups, setShowAllStartups] = useState(false);
  
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
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const res = await fetch(`${apiUrl}/startups`, {
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

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Excel data parsed:', {
        sheetName,
        rowCount: json.length,
        columns: Object.keys(json[0] || {}),
        firstRow: json[0]
      });
      
      // POST to backend
      try {
        setUploadStatus('Uploading...');
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        console.log('Sending request to:', `${apiUrl}/startups/bulk`);
        console.log('API URL:', apiUrl);
        
        const requestBody = { data: json };
        console.log('Request body sample:', {
          dataLength: json.length,
          firstRow: json[0]
        });
        
        const res = await fetch(`${apiUrl}/startups/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Backend error response:', errorData);
          throw new Error(errorData.error || 'Bulk upload failed');
        }
        
        const result = await res.json();
        console.log('Backend success response:', result);
        setUploadStatus(`Successfully uploaded ${result.insertedCount} startups!`);
        // Refresh startups list
        fetch(`${apiUrl}/startups`)
          .then(res => res.json())
          .then(data => setStartups(data));
      } catch (err) {
        console.error('Bulk upload error:', err);
        setUploadStatus(`Bulk upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !selectedCountry || startup.country === selectedCountry;
    const matchesSector = !selectedSector || startup.sector === selectedSector;
    const matchesYear = !selectedYear || startup.foundedYear === selectedYear;
    
    return matchesSearch && matchesCountry && matchesSector && matchesYear;
  });

  // Limit to 6 startups initially, show all if showAllStartups is true
  const displayedStartups = showAllStartups ? filteredStartups : filteredStartups.slice(0, 6);
  const hasMoreStartups = filteredStartups.length > 6;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-6 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">Fintech Startups</h2>
            <p className="text-xs sm:text-sm text-gray-600 truncate">Discover and add fintech companies across Africa</p>
          </div>
        </div>

        {(currentUser && (currentUser.role === 'admin' || currentUser.role === 'editor' || currentUser.role === 'viewer')) && (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Add Startup</span>
            </button>
            <label className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm">
              <span>Bulk Upload (.xlsx)</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                onChange={handleBulkUpload}
              />
            </label>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded text-xs sm:text-sm ${uploadStatus.startsWith('Successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {uploadStatus}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search startups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
          />
        </div>

        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white appearance-none cursor-pointer"
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white appearance-none cursor-pointer"
          >
            <option value="">All Sectors</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Add Startup Form */}
      {showAddForm && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Add New Fintech Startup</h3>
          <form onSubmit={handleAddStartup} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div className="sm:col-span-1">
              <input
                type="text"
                placeholder="Startup Name"
                value={newStartup.name}
                onChange={(e) => setNewStartup({ ...newStartup, name: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
                required
              />
            </div>

            <div className="sm:col-span-1">
              <select
                value={newStartup.country}
                onChange={(e) => setNewStartup({ ...newStartup, country: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                required
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <select
                value={newStartup.sector}
                onChange={(e) => setNewStartup({ ...newStartup, sector: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                required
              >
                <option value="">Select Sector</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1">
              <input
                type="number"
                placeholder="Founded Year"
                value={newStartup.foundedYear}
                onChange={(e) => setNewStartup({ ...newStartup, foundedYear: parseInt(e.target.value) })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
                min="1990"
                max={new Date().getFullYear()}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <input
                type="url"
                placeholder="Website (optional)"
                value={newStartup.website}
                onChange={(e) => setNewStartup({ ...newStartup, website: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
              />
            </div>

            <div className="sm:col-span-2">
              <textarea
                placeholder="Description"
                value={newStartup.description}
                onChange={(e) => setNewStartup({ ...newStartup, description: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
                rows={3}
                required
              />
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Add Startup
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Startups Grid */}
      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading startups...</p>
        </div>
      ) : error ? (
        <div className="text-red-600 text-sm p-4 text-center">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full max-w-full min-w-0 overflow-hidden">
          {displayedStartups.map((startup) => (
              <div key={startup.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow w-full max-w-full min-w-0 overflow-hidden bg-white">
                <div className="flex items-start justify-between mb-2 sm:mb-3 w-full max-w-full min-w-0">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 flex-1 min-w-0 mr-2 break-words leading-tight">{startup.name}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex-shrink-0 truncate ml-2">
                  {startup.sector}
                </span>
              </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3 break-words leading-relaxed">{startup.description}</p>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate font-medium">{startup.country}</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" />
                  <span>Founded {startup.foundedYear}</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate text-xs">Added by {startup.addedBy || 'Unknown'}</span>
                  </div>
                </div>
              {startup.website && (
                <a
                  href={startup.website}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="inline-block mt-3 sm:mt-4 text-green-600 hover:text-green-700 text-xs sm:text-sm font-medium truncate border-t border-gray-100 pt-2 sm:pt-3"
                >
                  Visit Website →
                </a>
              )}
            </div>
          ))}
        </div>
        
        {/* View More Button */}
        {hasMoreStartups && !showAllStartups && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={() => setShowAllStartups(true)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
            >
              View All {filteredStartups.length} Startups
            </button>
          </div>
        )}
        
        {/* Show Less Button */}
        {showAllStartups && hasMoreStartups && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={() => setShowAllStartups(false)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base font-medium"
            >
              Show Less
            </button>
          </div>
        )}
        </>
      )}

      {displayedStartups.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <Building2 className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-gray-600 mb-2">No startups found matching your criteria</p>
          {currentUser && (
            <button
              onClick={() => setShowAddForm(true)}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Add the first startup
            </button>
          )}
        </div>
      )}
    </div>
  );
};