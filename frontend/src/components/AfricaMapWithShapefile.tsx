import React, { useEffect, useState, useRef } from 'react';
import { CountryData } from '../types';

interface AfricaMapProps {
  data: CountryData[];
  onCountryHover: (country: CountryData | null) => void;
  hoveredCountry: CountryData | null;
  shapefilePath?: string;
}

interface GeoFeature {
  type: string;
  properties: {
    ADMIN: string;
    ISO_A2: string;
    ISO_A3: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

interface GeoData {
  type: string;
  features: GeoFeature[];
}

export const AfricaMapWithShapefile: React.FC<AfricaMapProps> = ({ 
  data, 
  onCountryHover, 
  hoveredCountry,
  shapefilePath 
}) => {
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Load shapefile data
  useEffect(() => {
    if (!shapefilePath) {
      // Fallback to simplified map if no shapefile provided
      return;
    }

    const loadShapefile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // This would require the shapefile library to be installed
        // For now, we'll use a placeholder approach
        console.log('Loading shapefile from:', shapefilePath);
        
        // Placeholder: In a real implementation, you would:
        // 1. Use the shapefile library to parse the .shp file
        // 2. Convert to GeoJSON format
        // 3. Filter for African countries
        // 4. Set the geoData state
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load shapefile data');
        setLoading(false);
        console.error('Error loading shapefile:', err);
      }
    };

    loadShapefile();
  }, [shapefilePath]);

  const getCountryColor = (countryId: string): string => {
    const country = data.find((c: CountryData) => c.id === countryId);
    if (!country) return '#E5E7EB';
    
    const score = country.finalScore;
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    if (score >= 40) return '#EF4444';
    return '#6B7280';
  };

  const handleCountryClick = (countryId: string): void => {
    const country = data.find((c: CountryData) => c.id === countryId);
    if (country) {
      onCountryHover(country);
    }
  };

  const renderSimplifiedMap = () => (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 800"
      className="w-full h-full border border-gray-100 rounded-lg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Africa continent outline */}
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#00000020"/>
        </filter>
      </defs>

      {/* Nigeria */}
      <g>
        <path
          d="M420 380 L480 380 L490 420 L470 450 L420 450 Z"
          fill={getCountryColor('NG')}
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-all duration-200"
          filter="url(#shadow)"
          onClick={() => handleCountryClick('NG')}
          onMouseEnter={() => onCountryHover(data.find((c: CountryData) => c.id === 'NG') || null)}
          onMouseLeave={() => onCountryHover(null)}
        />
        <text x="450" y="415" textAnchor="middle" className="text-xs font-medium fill-white">
          Nigeria
        </text>
      </g>

      {/* South Africa */}
      <g>
        <path
          d="M480 650 L580 650 L600 690 L560 720 L480 720 Z"
          fill={getCountryColor('ZA')}
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-all duration-200"
          filter="url(#shadow)"
          onClick={() => handleCountryClick('ZA')}
          onMouseEnter={() => onCountryHover(data.find((c: CountryData) => c.id === 'ZA') || null)}
          onMouseLeave={() => onCountryHover(null)}
        />
        <text x="530" y="685" textAnchor="middle" className="text-xs font-medium fill-white">
          South Africa
        </text>
      </g>

      {/* Kenya */}
      <g>
        <path
          d="M620 450 L670 450 L680 490 L660 520 L620 520 Z"
          fill={getCountryColor('KE')}
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-all duration-200"
          filter="url(#shadow)"
          onClick={() => handleCountryClick('KE')}
          onMouseEnter={() => onCountryHover(data.find((c: CountryData) => c.id === 'KE') || null)}
          onMouseLeave={() => onCountryHover(null)}
        />
        <text x="645" y="485" textAnchor="middle" className="text-xs font-medium fill-white">
          Kenya
        </text>
      </g>

      {/* Egypt */}
      <g>
        <path
          d="M520 200 L600 200 L620 240 L580 280 L520 280 Z"
          fill={getCountryColor('EG')}
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-all duration-200"
          filter="url(#shadow)"
          onClick={() => handleCountryClick('EG')}
          onMouseEnter={() => onCountryHover(data.find((c: CountryData) => c.id === 'EG') || null)}
          onMouseLeave={() => onCountryHover(null)}
        />
        <text x="560" y="240" textAnchor="middle" className="text-xs font-medium fill-white">
          Egypt
        </text>
      </g>

      {/* Ghana */}
      <g>
        <path
          d="M360 420 L400 420 L410 460 L390 490 L360 490 Z"
          fill={getCountryColor('GH')}
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-all duration-200"
          filter="url(#shadow)"
          onClick={() => handleCountryClick('GH')}
          onMouseEnter={() => onCountryHover(data.find((c: CountryData) => c.id === 'GH') || null)}
          onMouseLeave={() => onCountryHover(null)}
        />
        <text x="380" y="455" textAnchor="middle" className="text-xs font-medium fill-white">
          Ghana
        </text>
      </g>

      {/* Morocco */}
      <g>
        <path
          d="M380 250 L450 250 L470 290 L430 330 L380 330 Z"
          fill={getCountryColor('MA')}
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-all duration-200"
          filter="url(#shadow)"
          onClick={() => handleCountryClick('MA')}
          onMouseEnter={() => onCountryHover(data.find((c: CountryData) => c.id === 'MA') || null)}
          onMouseLeave={() => onCountryHover(null)}
        />
        <text x="415" y="290" textAnchor="middle" className="text-xs font-medium fill-white">
          Morocco
        </text>
      </g>

      {/* Ethiopia */}
      <g>
        <path
          d="M680 380 L740 380 L750 420 L720 450 L680 450 Z"
          fill={getCountryColor('ET')}
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-all duration-200"
          filter="url(#shadow)"
          onClick={() => handleCountryClick('ET')}
          onMouseEnter={() => onCountryHover(data.find((c: CountryData) => c.id === 'ET') || null)}
          onMouseLeave={() => onCountryHover(null)}
        />
        <text x="710" y="415" textAnchor="middle" className="text-xs font-medium fill-white">
          Ethiopia
        </text>
      </g>

      {/* Tanzania */}
      <g>
        <path
          d="M620 540 L680 540 L690 580 L660 610 L620 610 Z"
          fill={getCountryColor('TZ')}
          stroke="#fff"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-all duration-200"
          filter="url(#shadow)"
          onClick={() => handleCountryClick('TZ')}
          onMouseEnter={() => onCountryHover(data.find((c: CountryData) => c.id === 'TZ') || null)}
          onMouseLeave={() => onCountryHover(null)}
        />
        <text x="650" y="575" textAnchor="middle" className="text-xs font-medium fill-white">
          Tanzania
        </text>
      </g>
    </svg>
  );

  const renderShapefileMap = () => {
    if (!geoData) return null;

    return (
      <svg
        ref={svgRef}
        viewBox="0 0 1000 800"
        className="w-full h-full border border-gray-100 rounded-lg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#00000020"/>
          </filter>
        </defs>
        
        {/* This would render the actual shapefile data */}
        {/* For now, showing a placeholder */}
        <text x="500" y="400" textAnchor="middle" className="text-lg font-medium fill-gray-500">
          Shapefile data would be rendered here
        </text>
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4 flex-shrink-0">
        <h3 className="text-xl font-bold text-gray-900">Africa Fintech Index Map</h3>
        {shapefilePath && (
          <p className="text-sm text-gray-600 mt-1">Using shapefile: {shapefilePath}</p>
        )}
      </div>
      
      {/* Map Container */}
      <div className="flex-1 px-6 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 mb-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading map data...</div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-500">Error: {error}</div>
            </div>
          )}
          
          {!loading && !error && (
            geoData ? renderShapefileMap() : renderSimplifiedMap()
          )}
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 flex-shrink-0">
          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs font-medium text-green-800">High (80+)</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-lg">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-xs font-medium text-yellow-800">Medium (60-79)</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs font-medium text-red-800">Low (40-59)</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span className="text-xs font-medium text-gray-800">Very Low (&lt;40)</span>
          </div>
        </div>
      </div>
      
      {/* Country Info */}
      {hoveredCountry && (
        <div className="p-6 pt-0 flex-shrink-0">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-gray-900">{hoveredCountry.name}</h4>
              <div className="text-2xl font-bold text-blue-600">{hoveredCountry.finalScore.toFixed(1)}</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Literacy Rate</div>
                <div className="font-semibold text-blue-600">{hoveredCountry.literacyRate.toFixed(1)}%</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Digital Infra</div>
                <div className="font-semibold text-green-600">{hoveredCountry.digitalInfrastructure.toFixed(1)}%</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Investment</div>
                <div className="font-semibold text-purple-600">{hoveredCountry.investment.toFixed(1)}%</div>
              </div>
              <div className="bg-white p-2 rounded">
                <div className="text-gray-600">Fintech Cos</div>
                <div className="font-semibold text-orange-600">{hoveredCountry.fintechCompanies || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 