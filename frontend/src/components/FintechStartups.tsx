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

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [displayCount, setDisplayCount] = useState(6);
  const [showUploadGuide, setShowUploadGuide] = useState(false);

  // Fetch startups from backend on mount and when filters change
  useEffect(() => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    
    // Build query parameters
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCountry && selectedCountry !== 'All Countries') params.append('country', selectedCountry);
    if (selectedSector && selectedSector !== 'All Sectors') params.append('sector', selectedSector);
    
    const queryString = params.toString();
    const url = queryString ? `${apiUrl}/startups?${queryString}` : `${apiUrl}/startups`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Log what sectors are received from backend
        console.log('🔍 Frontend received startups from backend:', {
          totalCount: data.length,
          sampleSectors: data.slice(0, 3).map((s: any) => ({
            name: s.name,
            sector: s.sector,
            parsedSectors: parseSectors(s.sector),
            sectorsCount: parseSectors(s.sector).length,
            hasMultipleSectors: parseSectors(s.sector).length > 1
          }))
        });
        
        setStartups(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching startups:', err);
        setError('Failed to fetch startups');
        setLoading(false);
      });
  }, [searchTerm, selectedCountry, selectedSector]); // Refetch when filters change

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(6);
  }, [searchTerm, selectedCountry, selectedSector]);
  
  const [newStartup, setNewStartup] = useState({
    name: '',
    country: '',
    sector: '',
    foundedYear: new Date().getFullYear(),
    description: '',
    website: ''
  });

  // Helper function to parse sectors (handle both single and multiple sectors)
  const parseSectors = (sectorData: string | string[]): string[] => {
    if (Array.isArray(sectorData)) {
      return sectorData;
    }
    if (typeof sectorData === 'string') {
      // Handle comma-separated sectors, semicolon-separated, or single sector
      return sectorData.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  };

  // Get all unique sectors from all startups for filtering
  const allSectors = React.useMemo(() => {
    const sectorSet = new Set<string>();
    startups.forEach(startup => {
      const sectors = parseSectors(startup.sector);
      sectors.forEach(sector => sectorSet.add(sector));
    });
    return Array.from(sectorSet).sort();
  }, [startups]);

  // Update sectors array to use dynamic sectors from data
  const sectors = allSectors;

  // Replace with a full list of African countries
  const countries = [
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 'Central African Republic',
    'Chad', 'Comoros', 'Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea',
    'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho',
    'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia',
    'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa',
    'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
  ];

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
    
    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      setUploadStatus('❌ Invalid file format! Please upload only Excel (.xlsx, .xls) or CSV files.');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('❌ File too large! Maximum size is 10MB.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate required fields
        const requiredFields = ['Organization Name', 'Headquarters Location', 'Industries', 'Founded Date'];
        const missingFields = requiredFields.filter(field => !Object.keys(json[0] || {}).some(col => 
          col.toLowerCase().includes(field.toLowerCase().replace(/\s+/g, '')) ||
          col.toLowerCase().includes(field.toLowerCase().split(' ')[0])
        ));
        
        if (missingFields.length > 0) {
          setUploadStatus(`❌ Missing required fields: ${missingFields.join(', ')}. Please check the upload guide for required column names.`);
          return;
        }
        
        // POST to backend
        setUploadStatus('Uploading...');
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        
        const requestBody = { data: json };
        
        const res = await fetch(`${apiUrl}/startups/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Backend error response:', errorData);
          throw new Error(errorData.error || 'Bulk upload failed');
        }
        
        const result = await res.json();
        setUploadStatus(`✅ Successfully uploaded ${result.insertedCount} startups!`);
        // Refresh startups list
        fetch(`${apiUrl}/startups`)
          .then(res => res.json())
          .then(data => setStartups(data));
      } catch (err) {
        console.error('Bulk upload error:', err);
        setUploadStatus(`❌ Bulk upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Filtering is now handled by the backend API
  const filteredStartups = startups;

  // Show startups in batches of 6
  const displayedStartups = filteredStartups.slice(0, displayCount);
  const hasMoreStartups = filteredStartups.length > displayCount;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-6 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">Fintech Startups</h2>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              {filteredStartups.length} startups across Africa
            </p>
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
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm">
                <span>Bulk Upload (.xlsx, .csv)</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  style={{ display: 'none' }}
                  onChange={handleBulkUpload}
                />
              </label>
              <button
                onClick={() => setShowUploadGuide(true)}
                className="flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                title="View upload requirements"
              >
                <span>📋 Guide</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {uploadStatus && (
        <div className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded text-xs sm:text-sm ${uploadStatus.startsWith('✅') || uploadStatus.startsWith('❌') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
              <input
                type="text"
                placeholder="Sectors (e.g., Payments, Mobile Money, Lending)"
                value={newStartup.sector}
                onChange={(e) => setNewStartup({ ...newStartup, sector: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white placeholder-gray-400"
                required
              />
              <p className="text-xs text-gray-500 mt-1">💡 Separate multiple sectors with commas (e.g., "Payments, Mobile Money, Lending")</p>
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
          {displayedStartups.map((startup, index) => (
              <div key={startup.id || `startup-${index}-${startup.name}`} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow w-full max-w-full min-w-0 overflow-hidden bg-white">
                <div className="flex items-start justify-between mb-2 sm:mb-3 w-full max-w-full min-w-0 overflow-hidden">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 flex-1 min-w-0 mr-2 break-words leading-tight">{startup.name}</h3>
                  <div className="flex flex-wrap gap-1 ml-2">
                    {(() => {
                      const sectors = parseSectors(startup.sector);
                      
                      // Log what sectors are being rendered for this startup
                      console.log(`🔍 Rendering sectors for ${startup.name}:`, {
                        originalSector: startup.sector,
                        parsedSectors: sectors,
                        sectorsCount: sectors.length,
                        hasMultipleSectors: sectors.length > 1
                      });
                      
                      // Color palette for different sectors
                      const sectorColors = [
                        'bg-blue-100 text-blue-800',
                        'bg-green-100 text-green-800', 
                        'bg-purple-100 text-purple-800',
                        'bg-orange-100 text-orange-800',
                        'bg-pink-100 text-pink-800',
                        'bg-indigo-100 text-indigo-800',
                        'bg-teal-100 text-teal-800',
                        'bg-yellow-100 text-yellow-800'
                      ];
                      
                      // If no sectors, show a placeholder
                      if (sectors.length === 0) {
                        return (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex-shrink-0 font-medium">
                            No Sector
                          </span>
                        );
                      }
                      
                      return sectors.map((sector, index) => (
                        <span 
                          key={index} 
                          className={`px-2 py-1 text-xs rounded-full flex-shrink-0 font-medium ${
                            sectorColors[index % sectorColors.length]
                          }`}
                          title={sector}
                        >
                          {sector}
                        </span>
                      ));
                    })()}
                  </div>
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
        {hasMoreStartups && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={() => setDisplayCount(prev => prev + 6)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
            >
              View More ({Math.min(6, filteredStartups.length - displayCount)} more)
            </button>
          </div>
        )}
        
        {/* Show Less Button */}
        {displayCount > 6 && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={() => setDisplayCount(6)}
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

      {/* Upload Guide Modal */}
      {showUploadGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">📋 Bulk Upload Guide</h3>
                <button
                  onClick={() => setShowUploadGuide(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* File Requirements */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">📁 File Requirements</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-gray-700"><strong>Supported formats:</strong> Excel (.xlsx, .xls) or CSV</p>
                    <p className="text-sm text-gray-700"><strong>Maximum size:</strong> 10MB</p>
                    <p className="text-sm text-gray-700"><strong>Sheet:</strong> First sheet will be processed</p>
                  </div>
                </div>

                {/* Required Columns */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">🔴 Required Columns</h4>
                  <div className="bg-red-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="font-semibold text-red-800">Organization Name</p>
                        <p className="text-sm text-red-700">Company/startup name</p>
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">Headquarters Location</p>
                        <p className="text-sm text-red-700">City, Country (e.g., "Lagos, Nigeria")</p>
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">Industries</p>
                        <p className="text-sm text-red-700">Sectors separated by commas (e.g., "Payments, Mobile Money, Lending")</p>
                      </div>
                      <div>
                        <p className="font-semibold text-red-800">Founded Date</p>
                        <p className="text-sm text-red-700">Year founded (e.g., 2020)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Columns */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">🟡 Optional Columns</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="font-semibold text-yellow-800">Description</p>
                        <p className="text-sm text-yellow-700">Company description</p>
                      </div>
                      <div>
                        <p className="font-semibold text-yellow-800">Website</p>
                        <p className="text-sm text-yellow-700">Company website URL</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Example */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">📝 Example Row</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-blue-200">
                            <th className="text-left p-2 text-blue-800">Organization Name</th>
                            <th className="text-left p-2 text-blue-800">Headquarters Location</th>
                            <th className="text-left p-2 text-blue-800">Industries</th>
                            <th className="text-left p-2 text-blue-800">Founded Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 text-blue-700">Teletech</td>
                            <td className="p-2 text-blue-700">Congo</td>
                            <td className="p-2 text-blue-700">Payments, Mobile Money, Lending</td>
                            <td className="p-2 text-blue-700">2025</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">💡 Tips</h4>
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-green-700">• Multiple sectors can be separated by commas or semicolons</p>
                    <p className="text-sm text-green-700">• Only African countries are accepted</p>
                    <p className="text-sm text-green-700">• Founded date should be a year (1900-2024)</p>
                    <p className="text-sm text-green-700">• Column names are case-insensitive</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowUploadGuide(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};