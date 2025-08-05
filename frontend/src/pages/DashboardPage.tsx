import React from 'react';
import Dashboard from '../components/Dashboard';

const DashboardPage: React.FC<{ selectedYear: number; onYearChange: (year: number) => void; availableYears: number[] }> = ({ selectedYear, onYearChange, availableYears }) => <Dashboard selectedYear={selectedYear} onYearChange={onYearChange} availableYears={availableYears} />;

export default DashboardPage; 