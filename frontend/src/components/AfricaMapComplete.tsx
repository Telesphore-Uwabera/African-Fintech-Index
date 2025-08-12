import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { CountryData } from '../types';
import {
  processShapefileData,
  matchCountryData,
  coordinatesToPath,
  getCountryColor,
  createSimplifiedMapData,
  type ProcessedGeoData,
  type ShapefileFeature
} from '../utils/shapefileProcessor';

interface AfricaMapProps {
  data: CountryData[];
  onCountryHover: (country: CountryData | null) => void;
  hoveredCountry: CountryData | null;
  shapefilePath?: string;
  width?: number;
  height?: number;
  selectedYear?: number;
}

// ✅ Inline validation for .geojson/.json paths
function validateShapefilePath(path: string): boolean {
  return path.endsWith('.geojson') || path.endsWith('.json');
}

export const AfricaMapComplete: React.FC<AfricaMapProps> = ({
  data,
  onCountryHover,
  hoveredCountry,
  shapefilePath,
  width = 1000,
  height = 800,
  selectedYear
}) => {
  console.log('AfricaMapComplete data:', data);
  const [geoData, setGeoData] = useState<ProcessedGeoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryMap, setCountryMap] = useState<
    Map<string, { feature: ShapefileFeature; data: CountryData | null }>
  >(new Map());
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [startupCounts, setStartupCounts] = useState<Map<string, number>>(new Map());

  const loadShapefileData = useCallback(async () => {
    if (!shapefilePath) {
      const simplifiedData = createSimplifiedMapData();
      setGeoData(simplifiedData);
      const map = matchCountryData(simplifiedData.features, data);
      setCountryMap(map);
      return;
    }

    if (!validateShapefilePath(shapefilePath)) {
      setError('Invalid shapefile path');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Loading GeoJSON from:', shapefilePath);
      const processedData = await processShapefileData(shapefilePath);
      setGeoData(processedData);

      const map = matchCountryData(processedData.features, data);
      setCountryMap(map);

      setLoading(false);
    } catch (err) {
      setError('Failed to load shapefile data');
      setLoading(false);
      console.error('Error loading shapefile:', err);

      const simplifiedData = createSimplifiedMapData();
      setGeoData(simplifiedData);
      const map = matchCountryData(simplifiedData.features, data);
      setCountryMap(map);
    }
  }, [shapefilePath, data]);

  // Fetch startup counts by country and year
  const fetchStartupCounts = useCallback(async () => {
    if (!selectedYear) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      console.log('🗺️ Map: Fetching startup counts for year:', selectedYear);
      
      const response = await fetch(`${apiUrl}/startups/counts?year=${selectedYear}`);
      if (response.ok) {
        const counts = await response.json();
        console.log('🗺️ Map: Raw startup counts response:', counts);
        
        const countsMap = new Map();
        counts.forEach((item: { country: string; count: number }) => {
          countsMap.set(item.country, item.count);
          console.log(`🗺️ Map: Setting ${item.country} = ${item.count}`);
        });
        
        console.log('🗺️ Map: Final startup counts map:', Object.fromEntries(countsMap));
        console.log('🗺️ Map: Nigeria count:', countsMap.get('Nigeria'));
        setStartupCounts(countsMap);
      } else {
        console.error('❌ Map: Failed to fetch startup counts:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Map: Error fetching startup counts:', error);
    }
  }, [selectedYear]);

  useEffect(() => {
    loadShapefileData();
  }, [loadShapefileData]);

  useEffect(() => {
    fetchStartupCounts();
  }, [fetchStartupCounts]);

  const handleCountryClick = useCallback(
    (isoCode: string) => {
      const countryInfo = countryMap.get(isoCode);
      if (countryInfo?.data) {
        setSelectedCountry(countryInfo.data);
      }
    },
    [countryMap]
  );

  // Implement hover functionality
  const handleCountryHover = useCallback(
    (isoCode: string, event: React.MouseEvent) => {
      const countryInfo = countryMap.get(isoCode);
      if (countryInfo?.data) {
        setSelectedCountry(countryInfo.data);
        setMousePosition({ x: event.clientX, y: event.clientY });
      }
    },
    [countryMap]
  );

  const handleCountryLeave = useCallback(() => {
    setSelectedCountry(null);
    setMousePosition(null);
  }, []);

  const renderCountryPath = (feature: ShapefileFeature, isoCode: string) => {
    const countryInfo = countryMap.get(isoCode);
    const countryData = countryInfo?.data;
    const color = getCountryColor(countryData || null);
    
    let pathData = '';
    if (feature.geometry.type === 'Polygon') {
      pathData = coordinatesToPath(feature.geometry.coordinates as number[][][]);
    } else if (feature.geometry.type === 'MultiPolygon') {
      const multiCoords = feature.geometry.coordinates as number[][][][];
      pathData = multiCoords.map((polygon) => coordinatesToPath(polygon)).join(' ');
    }

    if (!pathData) return null;

    return (
      <path
        key={isoCode}
        d={pathData}
        fill={color}
        stroke="#ffffff"
        strokeWidth="0.5"
        className="cursor-pointer transition-all duration-200 hover:opacity-80"
        onMouseEnter={(event) => handleCountryHover(isoCode, event)}
        onMouseLeave={handleCountryLeave}
      />
    );
  };

  function getSelectedCountryCentroid() {
    if (!selectedCountry || !geoData) return null;
    
    const countryInfo = countryMap.get(selectedCountry.id);
    if (!countryInfo?.feature) return null;
    
    const coordinates = countryInfo.feature.geometry.coordinates;
    if (!coordinates || coordinates.length === 0) return null;
    
    // Calculate centroid from coordinates
    let centerX = 0, centerY = 0, totalPoints = 0;
    
    coordinates.forEach((coord: any) => {
      if (Array.isArray(coord[0])) {
        coord.forEach((point: any) => {
          centerX += point[0];
          centerY += point[1];
          totalPoints++;
        });
      } else {
        centerX += coord[0];
        centerY += coord[1];
        totalPoints++;
      }
    });
    
    return {
      centerX: centerX / totalPoints,
      centerY: centerY / totalPoints
    };
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">Error loading map</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      {geoData && (
        <div className="w-full h-full relative">
          {/* Map Title - Above the map, not overlapping */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold text-gray-900">African Fintech Index Map</h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                  {selectedYear ? `Data for ${selectedYear}` : 'Interactive visualization of fintech development across Africa'}
                </p>
              </div>
            </div>
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 1000 900"
            width="100%"
            height="100%"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            style={{ background: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#00000040" />
              </filter>
            </defs>
            {geoData.features.map((feature) => {
              const isoCode = feature.properties.ISO_A2;
              return renderCountryPath(feature, isoCode);
            })}
            {/* No SVG text labels rendered */}
          </svg>
          
          {/* Responsive Legend - Better positioning for small/medium screens */}
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 lg:right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2 sm:p-3 z-10 max-w-[calc(100%-1rem)] sm:max-w-[260px] lg:max-w-[300px]">
            <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Fintech Index Score Ranges</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-700 rounded flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600">Excellent (90+)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600">Very High (80-89)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600">High (70-79)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600">Medium (60-69)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600">Below Med (50-59)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600">Low (40-49)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-700 rounded flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600">Very Low (30-39)</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-500 rounded flex-shrink-0"></div>
                <span className="text-xs sm:text-sm text-gray-600">Extremely Low (&lt;30)</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Responsive Floating details card for selected country */}
      {(() => {
        if (selectedCountry && mousePosition) {
          // Responsive positioning and sizing
          const isMobile = window.innerWidth < 640;
          const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;
          
          let cardWidth = 'w-80';
          let cardPadding = 'p-4 sm:p-5';
          let cardPosition = { left: mousePosition.x + 16, top: mousePosition.y - 16 };
          
          if (isMobile) {
            cardWidth = 'w-[calc(100vw-2rem)] max-w-sm';
            cardPadding = 'p-3';
            // Center the card on mobile
            cardPosition = { 
              left: Math.max(8, Math.min(mousePosition.x, window.innerWidth - 320)), 
              top: Math.max(8, Math.min(mousePosition.y - 16, window.innerHeight - 200)) 
            };
          } else if (isTablet) {
            cardWidth = 'w-72';
            cardPadding = 'p-4';
          }
          
          return (
            <div
              className={`pointer-events-auto fixed z-50 ${cardWidth} bg-white rounded-xl shadow-lg border border-gray-200 ${cardPadding} flex flex-col gap-2 animate-fade-in`}
              style={cardPosition}
            >
                          <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">{selectedCountry.name}</h4>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{selectedCountry.finalScore?.toFixed(1)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-gray-600">Literacy Rate</div>
                <div className="font-semibold text-blue-700">{selectedCountry.literacyRate?.toFixed(1)}%</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-gray-600">Digital Infra</div>
                <div className="font-semibold text-green-700">{selectedCountry.digitalInfrastructure?.toFixed(1)}%</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="text-gray-600">Investment</div>
                <div className="font-semibold text-purple-700">{selectedCountry.investment?.toFixed(1)}%</div>
              </div>
              <div className="bg-orange-50 p-2 rounded">
                <div className="text-gray-600">Fintech Cos</div>
                <div className="font-semibold text-orange-700">
                  {startupCounts.get(selectedCountry.name) || 0}
                </div>
              </div>
            </div>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};
