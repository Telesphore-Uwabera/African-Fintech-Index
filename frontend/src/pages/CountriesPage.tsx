import React, { useEffect, useState } from 'react';
import { CountryTable } from '../components/CountryTable';
import { AfricaMapComplete } from '../components/AfricaMapComplete';
import { getLocalShapefilePath } from '../utils/shapefileProcessor';
import type { CountryData } from '../types';

const CountriesPage: React.FC<{ selectedYear: number; onYearChange: (year: number) => void; availableYears: number[] }> = ({ selectedYear, onYearChange, availableYears }) => {
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    fetch(`${apiUrl}/country-data?year=${selectedYear}`)
      .then(res => res.json())
      .then(data => {
        // Map country data to ensure 'id' is ISO_A2 code (convert from ISO_A3 if needed)
        const isoA3toA2 = {
          DZA: 'DZ', AGO: 'AO', BEN: 'BJ', BWA: 'BW', BFA: 'BF', BDI: 'BI', CMR: 'CM', CPV: 'CV', CAF: 'CF', TCD: 'TD',
          COM: 'KM', COG: 'CG', COD: 'CD', DJI: 'DJ', EGY: 'EG', GNQ: 'GQ', ERI: 'ER', ETH: 'ET', GAB: 'GA', GMB: 'GM',
          GHA: 'GH', GIN: 'GN', GNB: 'GW', CIV: 'CI', KEN: 'KE', LSO: 'LS', LBR: 'LR', LBY: 'LY', MDG: 'MG', MWI: 'MW',
          MLI: 'ML', MRT: 'MR', MUS: 'MU', MAR: 'MA', MOZ: 'MZ', NAM: 'NA', NER: 'NE', NGA: 'NG', RWA: 'RW', STP: 'ST',
          SEN: 'SN', SYC: 'SC', SLE: 'SL', SOM: 'SO', ZAF: 'ZA', SSD: 'SS', SDN: 'SD', SWZ: 'SZ', TZA: 'TZ', TGO: 'TG',
          TUN: 'TN', UGA: 'UG', ZMB: 'ZM', ZWE: 'ZW'
        };
        const mapped = data.map((item: any) => ({
          ...item,
          id: isoA3toA2[item.id as keyof typeof isoA3toA2] || item.id // Convert ISO_A3 to ISO_A2 if possible
        }));
        setCountryData(mapped);
      })
      .catch(() => setCountryData([]));
  }, [selectedYear]);
  const currentData = countryData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
              <main className="flex-1 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full">
        <div className="px-1">
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
        </div>
        {/* Map - Full Width */}
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <div className="w-full flex items-center justify-center" style={{ minHeight: 600 }}>
            <AfricaMapComplete
              data={currentData}
              shapefilePath={getLocalShapefilePath()}
              width={1600}
              height={900}
              hoveredCountry={hoveredCountry}
              onCountryHover={setHoveredCountry}
              selectedYear={selectedYear}
            />
          </div>
        </div>
        {/* Table Card */}
        <div className="px-1 w-full max-w-full min-w-0 overflow-hidden">
          <CountryTable data={currentData} selectedYear={selectedYear} />
        </div>
      </main>
    </div>
  );
};

export default CountriesPage; 