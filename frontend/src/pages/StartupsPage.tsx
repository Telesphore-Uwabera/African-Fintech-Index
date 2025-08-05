import React from 'react';
import { FintechStartups } from '../components/FintechStartups';
import { useContext } from 'react';
import { AuthContext } from '../App';

const StartupsPage: React.FC<{ selectedYear: number; onYearChange: (year: number) => void; availableYears: number[] }> = ({ selectedYear, onYearChange, availableYears }) => {
  const { currentUser } = useContext(AuthContext);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 px-2 sm:px-6 lg:px-12 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full mt-20">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Fintech Startups</h1>
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
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <FintechStartups currentUser={currentUser} selectedYear={selectedYear} />
        </div>
      </main>
    </div>
  );
};

export default StartupsPage; 