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
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

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

  // Handle country line click
  const handleCountryClick = (countryId: string) => {
    if (selectedCountry === countryId) {
      // If clicking the same country, show all countries
      setSelectedCountry(null);
      setVisibleCountries(new Set(allCountries.map(c => c.id)));
    } else {
      // Show only the clicked country
      setSelectedCountry(countryId);
      setVisibleCountries(new Set([countryId]));
    }
  };

  // Custom dot component to add country labels at line ends
  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props;
    const country = allCountries.find(c => c.id === dataKey);
    
    if (!country || !visibleCountries.has(country.id) || !payload) return null;
    
    // Check if this is the last data point for this country
    const isLastPoint = trendData.findIndex(d => d.year === payload.year) === trendData.length - 1;
    
    if (!isLastPoint) return null;
    
    // Show full country name if only one country is selected, otherwise show abbreviated name
    const displayText = selectedCountry === country.id 
      ? `${country.name} (${payload[dataKey]?.toFixed(0)})`
      : `${country.name.substring(0, 2).toUpperCase()} (${payload[dataKey]?.toFixed(0)})`;
    
    return (
      <g>
        <circle cx={cx} cy={cy} r={3} fill={country.color} stroke="white" strokeWidth={1} />
        <text
          x={cx + 5}
          y={cy}
          fill={country.color}
          fontSize={selectedCountry === country.id ? "12" : "10"}
          fontWeight="600"
          textAnchor="start"
          dominantBaseline="middle"
        >
          {displayText}
        </text>
      </g>
    );
  };

  const { startYear, endYear } = getYearRange();
  const totalYearsShown = endYear - startYear + 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-4 w-full min-w-0 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col space-y-2 sm:space-y-3 mb-2 sm:mb-3 lg:mb-4 w-full min-w-0 overflow-hidden">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Activity className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900 break-words whitespace-normal">Interactive Analytics</h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 break-words whitespace-normal">
              {chartType === 'trend' 
                ? `Showing data from ${startYear} to ${endYear} (${totalYearsShown} year${totalYearsShown > 1 ? 's' : ''})`
                : `Data for ${selectedYear}`
              }
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col space-y-1 sm:space-y-2 min-w-0 w-full text-xs sm:text-sm overflow-hidden">
          {chartType === 'trend' && (
            <>
              {/* Year Range Selector */}
              <div className="flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 bg-gray-50 rounded-lg min-w-0">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-black whitespace-nowrap">Range:</span>
                <select
                  value={yearRange}
                  onChange={(e) => setYearRange(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
                  className="text-xs sm:text-sm border-0 bg-transparent focus:ring-0 focus:outline-none text-black min-w-0"
                >
                  {yearRangeOptions.map(option => (
                    <option key={option.value} value={option.value} className="text-black">{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Custom Year Range Controls */}
              {yearRange === 'custom' && (
                <div className="flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <select
                    value={customStartYear}
                    onChange={(e) => setCustomStartYear(Number(e.target.value))}
                    className="text-xs sm:text-sm border-0 bg-transparent focus:ring-0 focus:outline-none text-black min-w-0"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year} className="text-black">{year}</option>
                    ))}
                  </select>
                  <span className="text-xs sm:text-sm text-black">to</span>
                  <select
                    value={customEndYear}
                    onChange={(e) => setCustomEndYear(Number(e.target.value))}
                    className="text-xs sm:text-sm border-0 bg-transparent focus:ring-0 focus:outline-none text-black min-w-0"
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
                className="flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium border border-green-200"
                title="Show all available years"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">All Years</span>
                <span className="sm:hidden">All</span>
                <span className="text-xs">({minYear}-{maxYear})</span>
              </button>

              <button
                onClick={() => setShowCountrySelector(!showCountrySelector)}
                className="flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Countries</span>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showCountrySelector ? 'rotate-180' : ''}`} />
              </button>

              {/* Selected Country Indicator */}
              {selectedCountry && (
                <div className="flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ backgroundColor: allCountries.find(c => c.id === selectedCountry)?.color }}></div>
                  <span className="text-xs sm:text-sm font-medium">
                    {allCountries.find(c => c.id === selectedCountry)?.name}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedCountry(null);
                      setVisibleCountries(new Set(allCountries.map(c => c.id)));
                    }}
                    className="ml-1 sm:ml-2 text-purple-500 hover:text-purple-700"
                    title="Show all countries"
                  >
                    ×
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* Chart Type Buttons */}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {chartTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id as any)}
                className={`flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  chartType === type.id
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <type.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{type.label}</span>
                <span className="sm:hidden">
                  {type.id === 'trend' ? 'Trend' : type.id === 'comparison' ? 'Compare' : 'Dist'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Available Years Info - Responsive */}
      {chartType === 'trend' && (
        <div className="mb-2 sm:mb-3 md:mb-4 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start space-x-1 sm:space-x-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-medium text-blue-900 break-words">
                  Available Data: {availableYears.join(', ')}
                </span>
                <div className="text-xs text-blue-700 mt-1">
                  ({availableYears.length} years total)
                </div>
              </div>
            </div>
            <div className="text-xs text-blue-700 sm:text-right">
              Currently showing: {startYear} - {endYear} ({totalYearsShown} year{totalYearsShown > 1 ? 's' : ''})
            </div>
          </div>
        </div>
      )}

      {/* Country Selection for Trend Chart */}
      {chartType === 'trend' && showCountrySelector && (
        <div className="mb-3 sm:mb-4 md:mb-6 p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
            <h4 className="text-xs sm:text-sm font-medium text-gray-900">
              {selectedCountry ? `Selected: ${allCountries.find(c => c.id === selectedCountry)?.name}` : 'Select Countries to Display'}
            </h4>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-xs text-gray-500">
                Showing {startYear}-{endYear}
              </span>
              {selectedCountry ? (
                <button
                  onClick={() => {
                    setSelectedCountry(null);
                    setVisibleCountries(new Set(allCountries.map(c => c.id)));
                  }}
                  className="px-1.5 sm:px-2 md:px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Show All Countries
                </button>
              ) : (
                <button
                  onClick={toggleAllCountries}
                  className="px-1.5 sm:px-2 md:px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  {visibleCountries.size === allCountries.length ? 'Hide All' : 'Show All'}
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2">
            {(selectedCountry ? allCountries.filter(c => c.id === selectedCountry) : allCountries).map((country) => (
              <label
                key={country.id}
                className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-1.5 md:p-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
              >
                <input
                  type="checkbox"
                  checked={visibleCountries.has(country.id)}
                  onChange={() => toggleCountryVisibility(country.id)}
                  className="sr-only"
                />
                <div
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center ${
                    visibleCountries.has(country.id) ? 'border-transparent' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: visibleCountries.has(country.id) ? country.color : 'transparent'
                  }}
                >
                  {visibleCountries.has(country.id) && (
                    <svg className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-700">{country.name}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 sm:mt-3">
            {selectedCountry ? (
              <>
                <span className="font-medium text-green-700">Focusing on {allCountries.find(c => c.id === selectedCountry)?.name}</span> • 
              </>
            ) : (
              <>
                Showing {visibleCountries.size} of {allCountries.length} countries • 
              </>
            )}
            Trend shows {totalYearsShown} year{totalYearsShown > 1 ? 's' : ''} from {startYear} to {endYear} • 
            Country names and scores displayed at line endpoints
          </p>
        </div>
      )}

      {/* Chart Container */}
      <div className="h-80 sm:h-96 md:h-[500px] lg:h-[600px] xl:h-[700px] 2xl:h-[800px] w-full min-w-0 overflow-hidden">
        {chartType === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                stroke="#6b7280"
                tick={{ fontSize: 8 }}
                domain={[startYear, endYear]}
                type="number"
                scale="linear"
                tickCount={Math.min(totalYearsShown, 4)}
              />
              <YAxis 
                stroke="#6b7280" 
                domain={[0, 100]}
                tick={{ fontSize: 8 }}
                label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 8 }}
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
                    type="linear"
                    dataKey={country.id}
                    stroke={country.color}
                    strokeWidth={selectedCountry === country.id ? 3 : 1.5}
                    name={country.name}
                    dot={<CustomDot />}
                    activeDot={{ r: 3, stroke: country.color, strokeWidth: 1, fill: 'white' }}
                    connectNulls={false}
                    onClick={() => handleCountryClick(country.id)}
                    style={{ cursor: 'pointer' }}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === 'comparison' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280"
                tick={{ fontSize: 8 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fontSize: 8 }}
                label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 8 }}
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
              <Bar dataKey="finalScore" fill="#8b5cf6" name="Final Score" radius={[1, 1, 0, 0]} />
              <Bar dataKey="fintechCompanies" fill="#10b981" name="Fintech Companies" radius={[1, 1, 0, 0]} />
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
                outerRadius={50}
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

      {/* Footer Info - Responsive */}
      {chartType === 'trend' && (
        <div className="mt-2 sm:mt-3 md:mt-4 text-xs text-gray-500 text-center px-2">
          <div className="break-words leading-relaxed">
            <p className="mb-1">Showing fintech index trends from {startYear} to {endYear}</p>
            <p className="mb-1">Country names and latest scores displayed at line endpoints</p>
            <p className="mb-1">💡 <strong>Click any country line to focus on that country only</strong></p>
            <p>Use controls above to adjust time period or view all {availableYears.length} available years ({minYear}-{maxYear})</p>
          </div>
        </div>
      )}
      
      {chartType === 'comparison' && (
        <div className="mt-2 sm:mt-3 md:mt-4 text-xs text-gray-500 text-center px-2">
          <div className="break-words">
            Top 10 countries by fintech index score for {selectedYear} • 
            Only countries with scores above zero are included
          </div>
        </div>
      )}
      
      {chartType === 'distribution' && (
        <div className="mt-2 sm:mt-3 md:mt-4 text-xs text-gray-500 text-center px-2">
          <div className="break-words">
            Distribution of countries by fintech index score ranges for {selectedYear} • 
            Zero-score countries excluded
          </div>
        </div>
      )}
    </div>
  );
};