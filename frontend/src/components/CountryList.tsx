import React from 'react';
import type { CountryData } from '../types';

interface CountryListProps {
  data: CountryData[];
  selectedYear: number;
  selectedCountry?: string | null;
  onCountrySelect?: (countryId: string | null) => void;
}

export const CountryList: React.FC<CountryListProps> = ({ data, selectedYear, selectedCountry, onCountrySelect }) => {
  // Filter data based on selected country
  const filteredData = selectedCountry 
    ? data.filter(country => country.id === selectedCountry)
    : data;

  // Sort by final score in descending order
  const sortedData = [...filteredData].sort((a, b) => b.finalScore - a.finalScore);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {selectedCountry ? (
            <>
              <span className="text-green-600">Selected: </span>
              {data.find(c => c.id === selectedCountry)?.name}
            </>
          ) : (
            `Year: ${selectedYear}`
          )}
        </h3>
        {selectedCountry && (
          <button
            onClick={() => onCountrySelect?.(null)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Show All
          </button>
        )}
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedData.map((country) => (
          <div
            key={country.id}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
              selectedCountry === country.id 
                ? 'bg-green-50 border border-green-200' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onCountrySelect?.(country.id)}
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: selectedCountry === country.id 
                    ? '#10B981' 
                    : '#8B5CF6'
                }}
              />
              <span className={`text-sm font-medium ${
                selectedCountry === country.id 
                  ? 'text-green-700' 
                  : 'text-gray-700'
              }`}>
                {country.name}
              </span>
            </div>
            <span className={`text-sm font-semibold ${
              selectedCountry === country.id 
                ? 'text-green-700' 
                : 'text-gray-900'
            }`}>
              {country.finalScore.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
      
      {selectedCountry && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">
            <strong>Tip:</strong> Click "Show All" to view all countries again
          </p>
        </div>
      )}
    </div>
  );
}; 