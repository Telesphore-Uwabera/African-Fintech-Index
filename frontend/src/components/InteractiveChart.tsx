import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, Activity, ChevronDown, Settings, Calendar, RotateCcw } from 'lucide-react';
import type { CountryData } from '../types';
import { CountryList } from './CountryList';

interface InteractiveChartProps {
  data: CountryData[];
  allYearsData: CountryData[];
  selectedYear: number;
  onCountrySelect?: (countryId: string | null) => void;
  selectedCountry?: string | null;
}

const COUNTRY_COLORS = [
  '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5a2b', '#ec4899', '#06b6d4',
  '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#f43f5e', '#a855f7', '#059669', '#d97706'
];

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ data, allYearsData, selectedYear, onCountrySelect, selectedCountry: externalSelectedCountry }) => {
  const [chartType, setChartType] = useState<'trend' | 'distribution'>('trend');


  const [yearRange, setYearRange] = useState<'custom' | number>('custom');
  const [customStartYear, setCustomStartYear] = useState<number>(2020);
  const [customEndYear, setCustomEndYear] = useState<number>(selectedYear);
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [startupCounts, setStartupCounts] = useState<Map<string, number>>(new Map());

  // Global mouse position tracker
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (hoveredCountryId) {
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [hoveredCountryId]);

  // Fetch startup counts by country and year
  const fetchStartupCounts = useCallback(async () => {
    if (!selectedYear) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/startups/counts?year=${selectedYear}`);
      if (response.ok) {
        const counts = await response.json();
        const countsMap = new Map();
        counts.forEach((item: { country: string; count: number }) => {
          countsMap.set(item.country, item.count);
        });
        setStartupCounts(countsMap);
        console.log('Startup counts fetched:', countsMap);
      }
    } catch (error) {
      console.error('Error fetching startup counts:', error);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchStartupCounts();
  }, [fetchStartupCounts]);


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
    
    // Create a map of all years in the range
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    
    // For each year, create an object with year and all country scores
    return years.map(year => {
      const yearData: any = { year };
      
      // Add data for each country for this year
      allCountries.forEach(country => {
        const countryData = allYearsData.find(c => c.id === country.id && c.year === year);
        if (countryData && countryData.finalScore > 0) {
          yearData[country.id] = countryData.finalScore;
        }
      });
      
      return yearData;
    });
  }, [allYearsData, selectedYear, yearRange, customStartYear, customEndYear, allCountries]);

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
    { id: 'distribution', label: 'Score Distribution', icon: PieChartIcon }
  ];

  const resetToAllYears = () => {
    setYearRange('custom');
    setCustomStartYear(minYear);
    setCustomEndYear(maxYear);
  };

  const yearRangeOptions = [
    { value: 2, label: '2 years' },
    { value: 3, label: '3 years' },
    { value: 4, label: '4 years' },
    { value: 5, label: '5 years' },
    { value: 'custom', label: 'Custom Range' }
  ];







  // Custom dot component to add country labels at line ends
  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey } = props;
    const country = allCountries.find(c => c.id === dataKey);
    
    if (!country || !payload) return null;
    
    // Check if this is the last data point for this country
    const isLastPoint = trendData.findIndex(d => d.year === payload.year) === trendData.length - 1;
    
    if (!isLastPoint) return null;
    
    // Show full country name and score
    const displayText = `${country.name} (${payload[dataKey]?.toFixed(0)})`;
    
    return (
      <g>
        <circle cx={cx} cy={cy} r={3} fill={country.color} stroke="white" strokeWidth={1} />
        <text
          x={cx + 8}
          y={cy}
          fill={country.color}
          fontSize="9"
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
  
  // Debug logging
  console.log('InteractiveChart render - allCountries:', allCountries.map(c => ({ id: c.id, name: c.name })));
  console.log('InteractiveChart render - trendData sample:', trendData.slice(0, 2));
  console.log('InteractiveChart render - allCountries length:', allCountries.length);
  console.log('InteractiveChart render - trendData length:', trendData.length);

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
          </div>
        </div>

        {/* Controls Section - Combined into one row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0 w-full text-xs sm:text-sm overflow-hidden">
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

          {/* Currently Showing Info */}
          <div className="text-xs sm:text-sm font-bold text-gray-800 ml-auto">
            Currently showing: {startYear} - {endYear} ({totalYearsShown} year{totalYearsShown > 1 ? 's' : ''})
          </div>
        </div>
      </div>





      {/* Chart and Country List Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full min-w-0 overflow-hidden">
        {/* Chart Container */}
        <div className={`${chartType === 'trend' ? 'lg:col-span-4' : 'lg:col-span-3'} h-80 sm:h-96 md:h-[500px] lg:h-[600px] xl:h-[700px] 2xl:h-[800px] w-full min-w-0 overflow-hidden`}>
        {chartType === 'trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 80, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                stroke="#6b7280"
                tick={{ fontSize: 12, fontWeight: 'bold' }}
                domain={[startYear, endYear]}
                type="number"
                scale="linear"
                tickCount={Math.min(totalYearsShown, 4)}
              />
              <YAxis 
                stroke="#6b7280" 
                domain={[0, 100]}
                tick={{ fontSize: 12, fontWeight: 'bold' }}
                label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 14, fontWeight: 'bold' }}
              />

              {allCountries.map((country) => (
                <Line
                  key={country.id}
                  type="linear"
                  dataKey={country.id}
                  stroke={country.color}
                  strokeWidth={hoveredCountryId === country.id ? 3 : 1.5}
                  name={country.name}
                  dot={<CustomDot />}
                  activeDot={{ r: 3, stroke: country.color, strokeWidth: 1, fill: 'white' }}
                  connectNulls={false}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => {
                    console.log('Mouse enter on country:', country.name, country.id);
                    setHoveredCountryId(country.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredCountryId(null);
                    setMousePosition(null);
                  }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartType === 'distribution' && (
          <div className="w-full h-full flex flex-col">
            {/* Chart Title - Matching Country Comparison styling */}
            <div className="mb-4 text-center">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                Score Distribution Analysis
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Breakdown of countries by score ranges for {selectedYear}
              </p>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={140}
                  innerRadius={70}
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
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                  formatter={(value: any) => [`${value} countries`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      
      {/* Country List - Takes up 1/4 of the space (hidden for trend view) */}
      {chartType !== 'trend' && (
        <div className="lg:col-span-1">
          <CountryList
            data={data}
            selectedYear={selectedYear}
            selectedCountry={externalSelectedCountry}
            onCountrySelect={onCountrySelect}
          />
        </div>
      )}
    </div>

    {/* Custom Floating Tooltip */}
      {hoveredCountryId && mousePosition && (() => {
        console.log('Rendering tooltip for country:', hoveredCountryId, 'mouse position:', mousePosition);
        const country = allCountries.find(c => c.id === hoveredCountryId);
        if (!country) {
          console.log('Country not found for ID:', hoveredCountryId);
          return null;
        }
        
        // Get the latest data for this country
        const countryData = allYearsData.find(c => c.id === hoveredCountryId && c.year === selectedYear);
        if (!countryData) {
          console.log('Country data not found for:', hoveredCountryId, 'year:', selectedYear);
          return null;
        }
        
        return (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 sm:p-5 max-w-sm pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: country.color }}
              />
              <h4 className="font-bold text-gray-900 text-base sm:text-lg lg:text-xl">{country.name}</h4>
            </div>
            
            <div className="space-y-2 text-sm sm:text-base">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Year:</span>
                <span className="font-bold text-lg sm:text-xl">{selectedYear}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Score:</span>
                <span className="font-bold text-lg sm:text-xl text-blue-600">{countryData.finalScore?.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Literacy:</span>
                <span className="font-bold text-lg sm:text-xl text-blue-700">{countryData.literacyRate?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Digital Infra:</span>
                <span className="font-bold text-lg sm:text-xl text-green-700">{countryData.digitalInfrastructure?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Investment:</span>
                <span className="font-bold text-lg sm:text-xl text-purple-700">{countryData.investment?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Fintech Companies:</span>
                <span className="font-bold text-lg sm:text-xl text-orange-700">{startupCounts.get(country.name) || 0}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer Info - Responsive */}
      {chartType === 'trend' && (
        <div className="mt-4 sm:mt-6 md:mt-8 text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 text-center">
          <div className="leading-relaxed">
            <p className="mb-2">Showing fintech index trends from {startYear} to {endYear}</p>
            <p className="mb-2">Country names and latest scores displayed at line endpoints</p>
            <p className="mb-2">💡 Hover over any country line to see detailed information</p>
            <p>Use controls above to adjust time period or view all {availableYears.length} available years ({minYear}-{maxYear})</p>
          </div>
        </div>
      )}
      
      {chartType === 'distribution' && (
        <div className="mt-4 sm:mt-6 md:mt-8 text-center px-4">
          <div className="break-words">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              Distribution of countries by fintech index score ranges for {selectedYear}
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              Zero-score countries excluded
            </p>
          </div>
        </div>
      )}
    </div>
  );
};