import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, ChevronDown, Settings, Calendar, RotateCcw } from 'lucide-react';
import type { CountryData } from '../types';

interface InteractiveChartProps {
  data: CountryData[];
  allYearsData: CountryData[];
  selectedYear: number;
}

const COUNTRY_COLORS = [
  '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5a2b', '#ec4899', '#06b6d4',
  '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#f43f5e', '#a855f7', '#059669', '#d97706'
];

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ data, allYearsData, selectedYear }) => {
  const [chartType, setChartType] = useState<'trend' | 'comparison' | 'distribution'>('trend');
  const [visibleCountries, setVisibleCountries] = useState<Set<string>>(new Set());
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [yearRange, setYearRange] = useState<'custom' | number>('custom');
  const [customStartYear, setCustomStartYear] = useState<number>(2020);
  const [customEndYear, setCustomEndYear] = useState<number>(selectedYear);

  // Get all available years from the data
  const availableYears = React.useMemo(() => {
    const years = [...new Set(allYearsData.map(country => country.year))].sort((a, b) => a - b);
    return years;
  }, [allYearsData]);

  // Get min and max years
  const minYear = Math.min(...availableYears);
  const maxYear = Math.max(...availableYears);

  // Initialize custom year range
  useEffect(() => {
    setCustomStartYear(minYear);
    setCustomEndYear(selectedYear);
  }, [minYear, selectedYear]);

  // Get all unique countries from all years data, filtering out those with zero scores
  const allCountries = React.useMemo(() => {
    const countryMap = new Map();
    allYearsData.forEach(country => {
      // Only include countries with non-zero scores
      if (country.finalScore > 0 && !countryMap.has(country.id)) {
        countryMap.set(country.id, {
          id: country.id,
          name: country.name,
          color: COUNTRY_COLORS[countryMap.size % COUNTRY_COLORS.length]
        });
      }
    });
    return Array.from(countryMap.values());
  }, [allYearsData]);

  // Initialize with all countries visible
  useEffect(() => {
    setVisibleCountries(new Set(allCountries.map(c => c.id)));
  }, [allCountries]);

  // Calculate the year range to display based on selection
  const getYearRange = () => {
    if (yearRange === 'custom') {
      return { startYear: customStartYear, endYear: customEndYear };
    } else {
      const endYear = selectedYear;
      const startYear = Math.max(endYear - yearRange + 1, minYear);
      return { startYear, endYear };
    }
  };

  // Prepare trend data with filtered years based on selection
  const trendData = React.useMemo(() => {
    const { startYear, endYear } = getYearRange();
    
    const yearlyData = allYearsData
      .filter(country => country.year >= startYear && country.year <= endYear)
      .reduce((acc, country) => {
        // Only include data points with non-zero scores
        if (country.finalScore > 0) {
          if (!acc[country.year]) {
            acc[country.year] = {
              year: country.year,
              countries: {}
            };
          }
          acc[country.year].countries[country.id] = country.finalScore;
        }
        return acc;
      }, {} as any);

    return Object.values(yearlyData).map((yearData: any) => ({
      year: yearData.year,
      ...yearData.countries
    })).sort((a, b) => a.year - b.year);
  }, [allYearsData, selectedYear, yearRange, customStartYear, customEndYear]);

  // Prepare comparison data for selected year, filtering out zero scores
  const comparisonData = data
    .filter(country => country.finalScore > 0)
    .map(country => ({
      name: country.name.length > 8 ? country.name.substring(0, 8) + '...' : country.name,
      fullName: country.name,
      finalScore: country.finalScore,
      literacyRate: country.literacyRate,
      digitalInfra: country.digitalInfrastructure,
      investment: country.investment,
      fintechCompanies: country.fintechCompanies || 0
    })).sort((a, b) => b.finalScore - a.finalScore).slice(0, 10);

  // Prepare distribution data for selected year, filtering out zero scores
  const filteredData = data.filter(c => c.finalScore > 0);
  const distributionData = [
    { name: 'High (80+)', value: filteredData.filter(c => c.finalScore >= 80).length, color: '#10B981' },
    { name: 'Medium (60-79)', value: filteredData.filter(c => c.finalScore >= 60 && c.finalScore < 80).length, color: '#F59E0B' },
    { name: 'Low (40-59)', value: filteredData.filter(c => c.finalScore >= 40 && c.finalScore < 60).length, color: '#EF4444' },
    { name: 'Very Low (Below 40)', value: filteredData.filter(c => c.finalScore < 40).length, color: '#6B7280' }
  ].filter(item => item.value > 0); // Remove categories with zero countries

  const chartTypes = [
    { id: 'trend', label: 'Country Trends', icon: TrendingUp },
    { id: 'comparison', label: 'Country Comparison', icon: BarChart3 },
    { id: 'distribution', label: 'Score Distribution', icon: PieChartIcon }
  ];

  const yearRangeOptions = [
    { value: 2, label: '2 years' },
    { value: 3, label: '3 years' },
    { value: 4, label: '4 years' },
    { value: 5, label: '5 years' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const toggleCountryVisibility = (countryId: string) => {
    const newVisible = new Set(visibleCountries);
    if (newVisible.has(countryId)) {
      newVisible.delete(countryId);
    } else {
      newVisible.add(countryId);
    }
    setVisibleCountries(newVisible);
  };

  const toggleAllCountries = () => {
    if (visibleCountries.size === allCountries.length) {
      setVisibleCountries(new Set());
    } else {
      setVisibleCountries(new Set(allCountries.map(c => c.id)));
    }
  };

  const resetToAllYears = () => {
    setYearRange('custom');
    setCustomStartYear(minYear);
    setCustomEndYear(maxYear);
  };

  // Custom dot component to add country labels at line ends
  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props;
    const country = allCountries.find(c => c.id === dataKey);
    
    if (!country || !visibleCountries.has(country.id) || !payload) return null;
    
    // Check if this is the last data point for this country
    const isLastPoint = trendData.findIndex(d => d.year === payload.year) === trendData.length - 1;
    
    if (!isLastPoint) return null;
    
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill={country.color} stroke="white" strokeWidth={2} />
        <text
          x={cx + 10}
          y={cy}
          fill={country.color}
          fontSize="12"
          fontWeight="600"
          textAnchor="start"
          dominantBaseline="middle"
        >
          {country.name} ({payload[dataKey]?.toFixed(1)})
        </text>
      </g>
    );
  };

  const { startYear, endYear } = getYearRange();
  const totalYearsShown = endYear - startYear + 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-6 w-full max-w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 w-full max-w-full min-w-0 overflow-x-hidden gap-3 md:gap-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 break-words whitespace-normal">Interactive Analytics</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words whitespace-normal">
              {chartType === 'trend' 
                ? `Showing data from ${startYear} to ${endYear} (${totalYearsShown} year${totalYearsShown > 1 ? 's' : ''})`
                : `Data for ${selectedYear}`
              }
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-start md:items-center gap-2 md:gap-2 min-w-0 w-full md:w-auto text-xs sm:text-sm md:text-base">
          {chartType === 'trend' && (
            <>
              {/* Year Range Selector */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg min-w-0">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-black whitespace-nowrap">Range:</span>
                <select
                  value={yearRange}
                  onChange={(e) => setYearRange(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
                  className="text-sm border-0 bg-transparent focus:ring-0 focus:outline-none text-black"
                >
                  {yearRangeOptions.map(option => (
                    <option key={option.value} value={option.value} className="text-black">{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Custom Year Range Controls */}
              {yearRange === 'custom' && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <select
                    value={customStartYear}
                    onChange={(e) => setCustomStartYear(Number(e.target.value))}
                    className="text-sm border-0 bg-transparent focus:ring-0 focus:outline-none text-black"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year} className="text-black">{year}</option>
                    ))}
                  </select>
                  <span className="text-sm text-black">to</span>
                  <select
                    value={customEndYear}
                    onChange={(e) => setCustomEndYear(Number(e.target.value))}
                    className="text-sm border-0 bg-transparent focus:ring-0 focus:outline-none text-black"
                  >
                    {availableYears.filter(year => year >= customStartYear).map(year => (
                      <option key={year} value={year} className="text-black">{year}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Show All Years Button */}
              <button
                onClick={resetToAllYears}
                className="flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium border border-green-200"
                title="Show all available years"
              >
                <RotateCcw className="w-4 h-4" />
                <span>All Years</span>
                <span className="text-xs">({minYear}-{maxYear})</span>
              </button>

              <button
                onClick={() => setShowCountrySelector(!showCountrySelector)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100"
              >
                <Settings className="w-4 h-4" />
                <span>Countries</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showCountrySelector ? 'rotate-180' : ''}`} />
              </button>
            </>
          )}
          
          <div className="flex space-x-2">
            {chartTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartType === type.id
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <type.icon className="w-4 h-4" />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Available Years Info */}
      {chartType === 'trend' && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Available Data: {availableYears.join(', ')} 
                <span className="text-blue-700 ml-1">({availableYears.length} years total)</span>
              </span>
            </div>
            <div className="text-xs text-blue-700">
              Currently showing: {startYear} - {endYear} ({totalYearsShown} year{totalYearsShown > 1 ? 's' : ''})
            </div>
          </div>
        </div>
      )}

      {/* Country Selection for Trend Chart */}
      {chartType === 'trend' && showCountrySelector && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">Select Countries to Display</h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                Showing {startYear}-{endYear}
              </span>
              <button
                onClick={toggleAllCountries}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                {visibleCountries.size === allCountries.length ? 'Hide All' : 'Show All'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {allCountries.map((country) => (
              <label
                key={country.id}
                className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visibleCountries.has(country.id)}
                  onChange={() => toggleCountryVisibility(country.id)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    visibleCountries.has(country.id) ? 'border-transparent' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: visibleCountries.has(country.id) ? country.color : 'transparent'
                  }}
                >
                  {visibleCountries.has(country.id) && (
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700">{country.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Showing {visibleCountries.size} of {allCountries.length} countries • 
            Trend shows {totalYearsShown} year{totalYearsShown > 1 ? 's' : ''} from {startYear} to {endYear} • 
            Country names and scores displayed at line endpoints
          </p>
        </div>
      )}

      <div className="h-48 md:h-64 lg:h-80 w-full max-w-full min-w-0 overflow-x-hidden">
        {chartType === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 20, right: 150, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                domain={[startYear, endYear]}
                type="number"
                scale="linear"
                tickCount={Math.min(totalYearsShown, 8)}
              />
              <YAxis 
                stroke="#6b7280" 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                label={{ value: 'Fintech Index Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
                labelFormatter={(label) => `Year: ${label}`}
                formatter={(value: any, name: string) => {
                  const country = allCountries.find(c => c.id === name);
                  return [
                    `${value?.toFixed(1) || 'N/A'}`,
                    country?.name || name
                  ];
                }}
              />
              {allCountries.map((country) => (
                visibleCountries.has(country.id) && (
                  <Line
                    key={country.id}
                    type="monotone"
                    dataKey={country.id}
                    stroke={country.color}
                    strokeWidth={2.5}
                    name={country.name}
                    dot={<CustomDot />}
                    activeDot={{ r: 6, stroke: country.color, strokeWidth: 2, fill: 'white' }}
                    connectNulls={false}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === 'comparison' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
                label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelFormatter={(label, payload) => {
                  const data = payload?.[0]?.payload;
                  return data?.fullName || label;
                }}
                formatter={(value: any, name: string) => [
                  typeof value === 'number' ? value.toFixed(1) : value,
                  name === 'finalScore' ? 'Final Score' : 
                  name === 'fintechCompanies' ? 'Fintech Companies' : name
                ]}
              />
              <Bar dataKey="finalScore" fill="#8b5cf6" name="Final Score" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fintechCompanies" fill="#10b981" name="Fintech Companies" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartType === 'distribution' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => [`${value} countries`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {chartType === 'trend' && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Showing fintech index trends from {startYear} to {endYear} • 
          Country names and latest scores displayed at line endpoints • 
          Use controls above to adjust time period or view all {availableYears.length} available years ({minYear}-{maxYear})
        </div>
      )}
      
      {chartType === 'comparison' && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Top 10 countries by fintech index score for {selectedYear} • 
          Only countries with scores above zero are included
        </div>
      )}
      
      {chartType === 'distribution' && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Distribution of countries by fintech index score ranges for {selectedYear} • 
          Zero-score countries excluded
        </div>
      )}
    </div>
  );
};