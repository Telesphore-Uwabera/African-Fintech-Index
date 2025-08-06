import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, ChevronDown, Settings, Calendar, RotateCcw } from 'lucide-react';
import type { CountryData } from '../types';

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
  const [chartType, setChartType] = useState<'trend' | 'comparison' | 'distribution'>('trend');


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
    
    // Show abbreviated country name and score
    const displayText = `${country.name.substring(0, 2).toUpperCase()} (${payload[dataKey]?.toFixed(0)})`;
    
    return (
      <g>
        <circle cx={cx} cy={cy} r={3} fill={country.color} stroke="white" strokeWidth={1} />
        <text
          x={cx + 5}
          y={cy}
          fill={country.color}
          fontSize="10"
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
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              transform: 'translateY(-50%)'
            }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: country.color }}
              />
              <h4 className="font-semibold text-gray-900 text-sm">{country.name}</h4>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Year:</span>
                <span className="font-medium">{selectedYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Score:</span>
                <span className="font-medium">{countryData.finalScore?.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Literacy:</span>
                <span className="font-medium">{countryData.literacyRate?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Digital Infra:</span>
                <span className="font-medium">{countryData.digitalInfrastructure?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Investment:</span>
                <span className="font-medium">{countryData.investment?.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fintech Companies:</span>
                <span className="font-medium">{startupCounts.get(country.name) || 0}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Footer Info - Responsive */}
      {chartType === 'trend' && (
        <div className="mt-2 sm:mt-3 md:mt-4 text-xs text-gray-500 text-center px-2">
          <div className="break-words leading-relaxed">
            <p className="mb-1">Showing fintech index trends from {startYear} to {endYear}</p>
            <p className="mb-1">Country names and latest scores displayed at line endpoints</p>
            <p className="mb-1">💡 <strong>Hover over any country line to see detailed information</strong></p>
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