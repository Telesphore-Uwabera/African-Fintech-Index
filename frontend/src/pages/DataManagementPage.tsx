import React, { useState, useEffect } from 'react';
import { DataManagement } from '../components/DataManagement';
import { FileUpload } from '../components/FileUpload';
import type { CountryData } from '../types';

const DataManagementPage: React.FC = () => {
  const [currentUser] = useState(() => {
    const stored = localStorage.getItem('fintechUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [selectedYear, setSelectedYear] = useState(2024);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || '/api';

  // Fetch data from MongoDB database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/country-data`);
        if (response.ok) {
          const data = await response.json();
          setCountryData(data);
        } else {
          console.error('Failed to fetch country data:', response.status, response.statusText);
          // Set empty array to prevent errors
          setCountryData([]);
        }
      } catch (error) {
        console.error('Error fetching country data:', error);
        // Set empty array to prevent errors
        setCountryData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl]);

  // Create getDataInfo function that works with MongoDB data
  const getDataInfo = () => {
    if (countryData.length === 0) {
      return null;
    }
    
    const years = [...new Set(countryData.map(d => d.year))].sort((a, b) => b - a);
    return {
      recordCount: countryData.length,
      years: years,
      lastUpdated: new Date(), // You might want to add a timestamp field to your MongoDB documents
      updatedBy: 'Database'
    };
  };

  // Create updateData function that updates MongoDB
  const updateData = async (newData: CountryData[]) => {
    // This would need to be implemented to update the MongoDB database
    // For now, just update the local state
    setCountryData(newData);
  };

  // Create clearData function that clears MongoDB data
  const clearData = async () => {
    if (window.confirm('Are you sure you want to clear all data from the database? This action cannot be undone.')) {
      try {
        console.log('🔍 Attempting to clear all data');
        console.log('🔍 API URL:', `${apiUrl}/country-data`);
        console.log('🔍 User token exists:', !!currentUser?.token);
        console.log('🔍 User role:', currentUser?.role);
        console.log('🔍 Token preview:', currentUser?.token ? `${currentUser.token.substring(0, 20)}...` : 'No token');
        console.log('🔍 Full user object:', currentUser);
        
        const response = await fetch(`${apiUrl}/country-data`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Delete response from backend:', result);
          setCountryData([]);
          alert(`All data has been cleared from the database. ${result.deletedCount} records deleted. Before: ${result.beforeCount}, After: ${result.afterCount}`);
        } else {
          console.error('❌ Delete request failed:', response.status, response.statusText);
          let errorMessage = 'Unknown error';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || 'Unknown error';
          } catch (e) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          
          if (response.status === 401) {
            console.error('❌ 401 Unauthorized - Authentication issue');
            errorMessage = 'Authentication failed. Please try refreshing the page and signing in again.';
          }
          
          alert(`Failed to clear data from the database: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        alert(`Error clearing data from the database: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'editor')) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col"><main className="flex-1 px-2 sm:px-4 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full">You do not have access to this page.</main></div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        <main className="flex-1 px-2 sm:px-4 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Data Management</h1>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading data from database...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
              <main className="flex-1 px-1 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Data Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DataManagement 
            getDataInfo={getDataInfo} 
            clearData={clearData} 
            isAuthenticated={true}
            data={countryData}
            updateData={updateData}
            currentUser={currentUser}
          />
          <FileUpload onDataUpdate={updateData} currentYear={selectedYear} />
        </div>
      </main>
    </div>
  );
};

export default DataManagementPage; 