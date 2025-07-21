import React from 'react';
import { InteractiveChart } from '../components/InteractiveChart';
import { mockCountryData, availableYears } from '../data/mockData';
import { useDataPersistence } from '../hooks/useDataPersistence';

const AnalyticsPage: React.FC<{ selectedYear: number; onYearChange: (year: number) => void }> = ({ selectedYear, onYearChange }) => {
  const { data: countryData } = useDataPersistence(mockCountryData);
  const currentData = countryData.filter(country => country.year === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 px-4 sm:px-8 lg:px-16 py-10 space-y-10">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        <div className="mb-4">
          <label className="mr-2 font-medium">Year:</label>
          <select
            value={selectedYear}
            onChange={e => onYearChange(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <InteractiveChart
          data={currentData}
          allYearsData={countryData}
          selectedYear={selectedYear}
        />
      </main>
    </div>
  );
};

export default AnalyticsPage; 