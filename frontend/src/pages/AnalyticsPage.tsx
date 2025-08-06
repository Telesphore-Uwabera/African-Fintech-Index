import React from 'react';
import { InteractiveChart } from '../components/InteractiveChart';
import { CountryList } from '../components/CountryList';
import { useEffect, useState } from 'react';
import { useDataPersistence } from '../hooks/useDataPersistence';

const AnalyticsPage: React.FC<{ selectedYear: number; onYearChange: (year: number) => void; availableYears: number[] }> = ({ selectedYear, onYearChange, availableYears }) => {
  const [countryData, setCountryData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    fetch(`${apiUrl}/country-data`)
      .then(res => res.json())
      .then(data => setCountryData(data))
      .catch(() => setCountryData([]));
  }, []);
  
  const currentData = countryData.filter((country: any) => country.year === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 px-1 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full mt-20">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Analytics</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-4">
          <label className="font-medium text-base sm:text-lg">Year:</label>
          <select
            value={selectedYear}
            onChange={e => onYearChange(Number(e.target.value))}
            className="border rounded px-2 py-1 sm:px-3 sm:py-2 text-base sm:text-lg"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full max-w-full min-w-0 overflow-hidden">
          {/* Chart - Takes up 3/4 of the space */}
          <div className="lg:col-span-3">
            <InteractiveChart
              data={currentData}
              allYearsData={countryData}
              selectedYear={selectedYear}
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
            />
          </div>
          
          {/* Country List - Takes up 1/4 of the space */}
          <div className="lg:col-span-1">
            <CountryList
              data={currentData}
              selectedYear={selectedYear}
              selectedCountry={selectedCountry}
              onCountrySelect={setSelectedCountry}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage; 