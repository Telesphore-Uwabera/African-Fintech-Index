import React from 'react';
import Dashboard from '../components/Dashboard';

const DashboardPage: React.FC<{ selectedYear: number; onYearChange: (year: number) => void }> = ({ selectedYear, onYearChange }) => <Dashboard selectedYear={selectedYear} onYearChange={onYearChange} />;

export default DashboardPage; 