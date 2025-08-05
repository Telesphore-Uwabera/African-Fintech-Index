import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StatsCards } from './components/StatsCards';
import { AfricaMap } from './components/AfricaMap';
import { AfricaMapComplete } from './components/AfricaMapComplete';
import { SubComponentCards } from './components/SubComponentCards';
import { CountryTable } from './components/CountryTable';
import { FileUpload } from './components/FileUpload';
import { DataManagement } from './components/DataManagement';
import { AuthModal } from './components/AuthModal';
import { FinanceNews } from './components/FinanceNews';
import { InteractiveChart } from './components/InteractiveChart';
import { FintechStartups } from './components/FintechStartups';
import { mockCountryData, calculateDashboardStats, availableYears } from './data/mockData';
import { useDataPersistence } from './hooks/useDataPersistence';
import { CountryData } from './types';
import { getLocalShapefilePath } from './utils/shapefileProcessor';

function App() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [useNewMap, setUseNewMap] = useState(true); // Use the new map by default
  
  // Use persistent data hook
  const { data: countryData, isLoading, updateData, clearData, getDataInfo } = useDataPersistence(mockCountryData);

  // Filter data by selected year
  const currentData = countryData.filter(country => country.year === selectedYear);

  const handleDataUpdate = (newData: CountryData[]) => {
    if (currentUser?.role !== 'admin') {
      alert('Admin authentication required to update data');
      return;
    }
    updateData(newData);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const currentStats = calculateDashboardStats(currentData);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <Header 
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        availableYears={availableYears}
        currentUser={currentUser}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Overview */}
        <StatsCards stats={currentStats} />
        
        {/* Map Type Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useNewMap}
                onChange={(e) => setUseNewMap(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Use Enhanced Map (with shapefile support)
              </span>
            </label>
            
            {useNewMap && (
              <div className="text-sm text-gray-600">
                Shapefile: <code className="bg-gray-100 px-2 py-1 rounded">src/data/ne_110m_admin_0_countries.shp</code>
              </div>
            )}
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            <p>
              <strong>Status:</strong> {useNewMap 
                ? 'Using enhanced map with shapefile data support' 
                : 'Using original simplified map'
              }
            </p>
          </div>
        </div>
        
        {/* Admin Data Management */}
        {currentUser?.role === 'admin' && (
          <>
            <DataManagement 
              getDataInfo={getDataInfo}
              clearData={clearData}
              isAuthenticated={true}
            />
            
            <FileUpload 
              onDataUpdate={handleDataUpdate}
              currentYear={selectedYear}
            />
          </>
        )}
        
        {/* Sub-component Cards */}
        <SubComponentCards data={currentData} />
        
        {/* Interactive Analytics - Now includes selectedYear prop */}
        <InteractiveChart 
          data={currentData} 
          allYearsData={countryData} 
          selectedYear={selectedYear}
        />
        
        {/* Main Content Grid - Map and News with matching heights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map - Takes 2 columns with fixed height */}
          <div className="lg:col-span-2 h-[600px]">
            {useNewMap ? (
              <AfricaMapComplete 
                data={currentData}
                onCountryHover={setHoveredCountry}
                hoveredCountry={hoveredCountry}
                shapefilePath={getLocalShapefilePath()}
                width={800}
                height={600}
              />
            ) : (
              <AfricaMap 
                data={currentData}
                onCountryHover={setHoveredCountry}
                hoveredCountry={hoveredCountry}
              />
            )}
          </div>
          
          {/* Finance News - Takes 1 column with matching height */}
          <div className="lg:col-span-1 h-[600px]">
            <FinanceNews />
          </div>
        </div>
        
        {/* Fintech Startups */}
        <FintechStartups currentUser={currentUser} />
        
        {/* Country Rankings Table */}
        {currentData.length > 0 ? (
          <CountryTable data={currentData} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">
              {currentUser?.role === 'admin' 
                ? `Upload a CSV or Excel file to see country rankings for ${selectedYear}`
                : `Admin login required to upload data for ${selectedYear}`
              }
            </p>
            <p className="text-sm text-gray-500">Make sure to include year and fintech companies data in your file</p>
          </div>
        )}
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;