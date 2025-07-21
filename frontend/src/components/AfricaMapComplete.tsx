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
  height = 800
}) => {
  const [geoData, setGeoData] = useState<ProcessedGeoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryMap, setCountryMap] = useState<
    Map<string, { feature: ShapefileFeature; data: CountryData | null }>
  >(new Map());
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);

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

  useEffect(() => {
    loadShapefileData();
  }, [loadShapefileData]);

  const handleCountryClick = useCallback(
    (isoCode: string) => {
      const countryInfo = countryMap.get(isoCode);
      if (countryInfo?.data) {
        setSelectedCountry(countryInfo.data);
      }
    },
    [countryMap]
  );

  // Remove hover logic, only use click
  const handleCountryHover = () => {};

  const renderCountryPath = (feature: ShapefileFeature, isoCode: string) => {
    const countryInfo = countryMap.get(isoCode);
    const color = getCountryColor(countryInfo?.data || null);
    const isSelected = selectedCountry && countryInfo?.data && selectedCountry.id === countryInfo.data.id;

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
        stroke={isSelected ? '#2563eb' : '#222'}
        strokeWidth={isSelected ? 3 : 1.5}
        filter={isSelected ? 'url(#shadow)' : undefined}
        className="cursor-pointer hover:opacity-80 transition-all duration-200"
        onClick={() => handleCountryClick(isoCode)}
      />
    );
  };

  // Helper to get centroid of selected country
  function getSelectedCountryCentroid() {
    if (!geoData || !selectedCountry) return null;
    let feature = geoData.features.find(f => f.properties.ADMIN === selectedCountry.name);
    if (!feature && selectedCountry.name === 'Tanzania') {
      feature = geoData.features.find(f => f.properties.ADMIN === 'United Republic of Tanzania');
    }
    if (!feature) return null;
    const coords = feature.geometry.coordinates;
    let centerX = 0, centerY = 0;
    if (feature.geometry.type === 'Polygon' && coords[0]) {
      const points = coords[0] as number[][];
      centerX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
      centerY = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    } else if (feature.geometry.type === 'MultiPolygon' && coords[0]?.[0]) {
      const points = coords[0][0] as number[][];
      centerX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
      centerY = points.reduce((sum, p) => sum + p[1], 0) / points.length;
    }
    if (isNaN(centerX) || isNaN(centerY)) return null;
    return { centerX, centerY };
  }

    return (
    <div className="w-full h-full flex items-center justify-center relative" style={{ minHeight: 400 }}>
      {/* Overlay to clear selection when clicking outside the map */}
      {selectedCountry && (
        <div
          className="fixed inset-0 z-30"
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedCountry(null)}
        />
      )}
      {loading ? (
        <div className="flex items-center justify-center h-full w-full">
          <span className="text-gray-500">Loading map...</span>
        </div>
      ) : (
        <div className="relative w-full h-full">
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
            {geoData && geoData.features.map((feature) => {
              const isoCode = feature.properties.ISO_A2;
              return renderCountryPath(feature, isoCode);
            })}
            {/* No SVG text labels rendered */}
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 z-10">
            <div className="text-xs font-semibold text-gray-700 mb-2">Fintech Index Score Ranges</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600">High (80+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-xs text-gray-600">Medium (60-79)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600">Low (40-59)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded"></div>
                <span className="text-xs text-gray-600">Very Low (&lt;40)</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating details card for selected country, positioned at the country centroid */}
      {(() => {
        const centroid = getSelectedCountryCentroid();
        if (selectedCountry && centroid) {
          // Project SVG coordinates to screen coordinates
          const svg = svgRef.current;
          let left = 0, top = 0;
          if (svg) {
            const pt = svg.createSVGPoint();
            pt.x = centroid.centerX;
            pt.y = centroid.centerY;
            const screenCTM = svg.getScreenCTM();
            if (screenCTM) {
              const transformed = pt.matrixTransform(screenCTM);
              left = transformed.x;
              top = transformed.y;
            }
          }
          return (
            <div
              className="pointer-events-auto fixed z-50 w-80 max-w-full bg-white rounded-xl shadow-lg border border-gray-200 p-5 flex flex-col gap-2 animate-fade-in"
              style={{ left: left + 24, top: top + 24 }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-gray-900">{selectedCountry.name}</h4>
                <span className="text-2xl font-bold text-blue-600">{selectedCountry.finalScore?.toFixed(1)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
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
                  <div className="font-semibold text-orange-700">{selectedCountry.fintechCompanies ?? 'N/A'}</div>
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
