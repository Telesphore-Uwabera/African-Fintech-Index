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

  // Fetch data from MongoDB database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/country-data`);
        if (response.ok) {
          const data = await response.json();
          setCountryData(data);
        } else {
          console.error('Failed to fetch country data');
        }
      } catch (error) {
        console.error('Error fetching country data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/country-data`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        });
        
        if (response.ok) {
          setCountryData([]);
          alert('All data has been cleared from the database.');
        } else {
          alert('Failed to clear data from the database.');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Error clearing data from the database.');
      }
    }
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'editor')) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col"><main className="flex-1 px-2 sm:px-6 lg:px-12 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full mt-20">You do not have access to this page.</main></div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        <main className="flex-1 px-2 sm:px-6 lg:px-12 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full mt-20">
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
      <main className="flex-1 px-2 sm:px-6 lg:px-12 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full mt-20">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Data Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DataManagement 
            getDataInfo={getDataInfo} 
            clearData={clearData} 
            isAuthenticated={true}
            data={countryData}
            updateData={updateData}
          />
          <FileUpload onDataUpdate={updateData} currentYear={selectedYear} />
        </div>
      </main>
    </div>
  );
};

export default DataManagementPage; 