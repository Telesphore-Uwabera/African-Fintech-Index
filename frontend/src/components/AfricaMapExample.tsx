import React, { useState } from 'react';
import { AfricaMapComplete } from './AfricaMapComplete';
import { CountryData } from '../types';
import { getLocalShapefilePath } from '../utils/shapefileProcessor';

// Example country data
const exampleCountryData: CountryData[] = [
  {
    id: 'NG',
    name: 'Nigeria',
    literacyRate: 62.0,
    digitalInfrastructure: 45.0,
    investment: 35.0,
    finalScore: 47.3,
    year: 2024,
    population: 206139589,
    gdp: 448120000000,
    fintechCompanies: 250
  },
  {
    id: 'ZA',
    name: 'South Africa',
    literacyRate: 87.0,
    digitalInfrastructure: 75.0,
    investment: 65.0,
    finalScore: 75.7,
    year: 2024,
    population: 59308690,
    gdp: 301900000000,
    fintechCompanies: 490
  },
  {
    id: 'KE',
    name: 'Kenya',
    literacyRate: 78.0,
    digitalInfrastructure: 60.0,
    investment: 45.0,
    finalScore: 61.0,
    year: 2024,
    population: 53771296,
    gdp: 98500000000,
    fintechCompanies: 180
  },
  {
    id: 'EG',
    name: 'Egypt',
    literacyRate: 71.0,
    digitalInfrastructure: 55.0,
    investment: 40.0,
    finalScore: 55.3,
    year: 2024,
    population: 102334404,
    gdp: 363070000000,
    fintechCompanies: 120
  },
  {
    id: 'GH',
    name: 'Ghana',
    literacyRate: 76.0,
    digitalInfrastructure: 50.0,
    investment: 35.0,
    finalScore: 53.7,
    year: 2024,
    population: 31072940,
    gdp: 72400000000,
    fintechCompanies: 90
  },
  {
    id: 'MA',
    name: 'Morocco',
    literacyRate: 73.0,
    digitalInfrastructure: 65.0,
    investment: 50.0,
    finalScore: 62.7,
    year: 2024,
    population: 36910560,
    gdp: 119700000000,
    fintechCompanies: 85
  },
  {
    id: 'ET',
    name: 'Ethiopia',
    literacyRate: 52.0,
    digitalInfrastructure: 30.0,
    investment: 25.0,
    finalScore: 35.7,
    year: 2024,
    population: 114963588,
    gdp: 107500000000,
    fintechCompanies: 45
  },
  {
    id: 'TZ',
    name: 'Tanzania',
    literacyRate: 68.0,
    digitalInfrastructure: 40.0,
    investment: 30.0,
    finalScore: 46.0,
    year: 2024,
    population: 59734218,
    gdp: 63200000000,
    fintechCompanies: 60
  }
];

export const AfricaMapExample: React.FC = () => {
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [useShapefile, setUseShapefile] = useState(true); // Default to true since we have the shapefile

  const shapefilePath = getLocalShapefilePath();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Africa Fintech Index Map
          </h1>
          <p className="text-gray-600">
            Interactive map showing fintech development across African countries
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useShapefile}
                onChange={(e) => setUseShapefile(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Use Shapefile Data
              </span>
            </label>
            
            {useShapefile && (
              <div className="text-sm text-gray-600">
                Shapefile: <code className="bg-gray-100 px-2 py-1 rounded">src/data/ne_110m_admin_0_countries.shp</code>
              </div>
            )}
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <p>
              <strong>Status:</strong> Shapefile data is available in <code className="bg-gray-100 px-1 rounded">src/data/</code> directory. 
              The map is currently using simplified geometry data as a fallback since the shapefile parsing library isn't installed.
            </p>
          </div>
        </div>

        {/* Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96">
              <AfricaMapComplete
                data={exampleCountryData}
                onCountryHover={setHoveredCountry}
                hoveredCountry={hoveredCountry}
                shapefilePath={useShapefile ? shapefilePath : undefined}
                width={800}
                height={400}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Country Info */}
            {hoveredCountry && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {hoveredCountry.name}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fintech Index Score:</span>
                    <span className="font-semibold text-blue-600">
                      {hoveredCountry.finalScore.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Population:</span>
                    <span className="font-semibold">
                      {hoveredCountry.population?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GDP:</span>
                    <span className="font-semibold">
                      ${hoveredCountry.gdp?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fintech Companies:</span>
                    <span className="font-semibold">
                      {hoveredCountry.fintechCompanies || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Data Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Data Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Countries:</span>
                  <span className="font-semibold">{exampleCountryData.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Score:</span>
                  <span className="font-semibold">
                    {(exampleCountryData.reduce((sum, c) => sum + c.finalScore, 0) / exampleCountryData.length).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Top Performer:</span>
                  <span className="font-semibold">
                    {exampleCountryData.reduce((max, c) => c.finalScore > max.finalScore ? c : max).name}
                  </span>
                </div>
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Next Steps</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>✅ Shapefile files are in place</p>
                <p>🔄 Currently using simplified data</p>
                <p>📦 To use actual shapefile parsing:</p>
                <code className="block bg-blue-100 px-2 py-1 rounded text-xs">
                  npm install shapefile d3-geo d3-projection
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 