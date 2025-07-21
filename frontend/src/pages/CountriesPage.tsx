import React, { useState } from 'react';
import { CountryTable } from '../components/CountryTable';
import { AfricaMapComplete } from '../components/AfricaMapComplete';
import { mockCountryData, availableYears } from '../data/mockData';
import { getLocalShapefilePath } from '../utils/shapefileProcessor';
import type { CountryData } from '../types';

const CountriesPage: React.FC<{ selectedYear: number; onYearChange: (year: number) => void }> = ({ selectedYear, onYearChange }) => {
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const currentData = mockCountryData.filter(country => country.year === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full mt-20">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Countries</h1>
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
        {/* Map Card */}
        <div className="w-full flex items-center justify-center" style={{ minHeight: 600 }}>
          <AfricaMapComplete
            data={currentData}
            shapefilePath={getLocalShapefilePath()}
            width={1600}
            height={900}
            hoveredCountry={hoveredCountry}
            onCountryHover={setHoveredCountry}
          />
        </div>
        {/* Table Card */}
        <section className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-6 mx-auto max-w-full overflow-x-auto">
          <CountryTable data={currentData} />
        </section>
      </main>
    </div>
  );
};

export default CountriesPage; 