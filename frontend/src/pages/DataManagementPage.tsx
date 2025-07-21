import React, { useState } from 'react';
import { DataManagement } from '../components/DataManagement';
import { FileUpload } from '../components/FileUpload';
import { mockCountryData } from '../data/mockData';
import { useDataPersistence } from '../hooks/useDataPersistence';

const DataManagementPage: React.FC = () => {
  const [currentUser] = useState(() => {
    const stored = localStorage.getItem('fintechUser');
    return stored ? JSON.parse(stored) : null;
  });
  const { data, updateData, clearData, getDataInfo } = useDataPersistence(mockCountryData);
  const [selectedYear, setSelectedYear] = useState(2024);

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'editor')) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col"><main className="flex-1 px-4 sm:px-8 lg:px-16 py-10 space-y-10">You do not have access to this page.</main></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 px-4 sm:px-8 lg:px-16 py-10 space-y-10">
        <h1 className="text-2xl font-bold mb-4">Data Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DataManagement 
            getDataInfo={getDataInfo} 
            clearData={clearData} 
            isAuthenticated={true}
            data={data}
            updateData={updateData}
          />
          <FileUpload onDataUpdate={updateData} currentYear={selectedYear} />
        </div>
      </main>
    </div>
  );
};

export default DataManagementPage; 