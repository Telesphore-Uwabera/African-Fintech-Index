import React from 'react';
import { FintechStartups } from '../components/FintechStartups';

const StartupsPage: React.FC<{ 
  selectedYear: number; 
  onYearChange: (year: number) => void; 
  availableYears: number[];
  currentUser?: any;
}> = ({ selectedYear, onYearChange, availableYears, currentUser }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      <main className="flex-1 px-2 sm:px-4 py-6 sm:py-10 space-y-6 sm:space-y-10 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Fintech Startups</h1>
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          <FintechStartups currentUser={currentUser} selectedYear={selectedYear} />
        </div>
      </main>
    </div>
  );
};

export default StartupsPage; 