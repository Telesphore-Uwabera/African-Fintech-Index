# Shapefile Integration Setup Guide

This guide explains how to integrate the `ne_110m_admin_0_countries.shp` shapefile into the Africa Fintech Index project.

## Prerequisites

1. **Node.js and npm** must be installed on your system
2. The shapefile should be placed in the project directory

## Installation Steps

### 1. Install Required Dependencies

Run the following command in your project directory:

```bash
npm install shapefile d3-geo d3-projection @types/d3-geo
```

### 2. Place the Shapefile

Copy your `ne_110m_admin_0_countries.shp` file and its associated files (`.dbf`, `.shx`, `.prj`) into the project directory. We recommend creating a `public/data/` folder:

```
public/
  data/
    ne_110m_admin_0_countries.shp
    ne_110m_admin_0_countries.dbf
    ne_110m_admin_0_countries.shx
    ne_110m_admin_0_countries.prj
```

### 3. Update the Component

The `AfricaMapWithShapefile.tsx` component is already set up to handle shapefile data. To use it:

```tsx
import { AfricaMapWithShapefile } from './components/AfricaMapWithShapefile';

// In your component:
<AfricaMapWithShapefile
  data={countryData}
  onCountryHover={handleCountryHover}
  hoveredCountry={hoveredCountry}
  shapefilePath="/data/ne_110m_admin_0_countries.shp"
/>
```

## Implementation Details

### Shapefile Processing

The component will:

1. **Load the shapefile** using the `shapefile` library
2. **Filter for African countries** based on continent codes
3. **Convert to GeoJSON** format for rendering
4. **Project coordinates** using D3's projection functions
5. **Render SVG paths** for each country

### Country Code Mapping

The shapefile uses ISO country codes. Make sure your `CountryData` objects have matching `id` fields:

- Nigeria: `NG`
- South Africa: `ZA`
- Kenya: `KE`
- Egypt: `EG`
- Ghana: `GH`
- Morocco: `MA`
- Ethiopia: `ET`
- Tanzania: `TZ`

### Performance Considerations

- Shapefiles can be large, so consider converting to GeoJSON format for better performance
- Use web workers for processing large shapefiles
- Implement caching for processed data

## Alternative: Pre-processed GeoJSON

If you prefer not to process shapefiles in the browser, you can:

1. Convert the shapefile to GeoJSON using tools like:
   - QGIS
   - GDAL (`ogr2ogr`)
   - Online converters

2. Place the GeoJSON file in `public/data/`

3. Update the component to load GeoJSON directly

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure the shapefile is in the `public/` directory
2. **Missing dependencies**: Ensure all required packages are installed
3. **File not found**: Check the file path and ensure all shapefile components are present

### Development vs Production

- In development, Vite will serve files from `public/` directly
- In production, ensure the shapefile is included in your build output

## Next Steps

Once the basic setup is working:

1. Add more African countries to your data
2. Implement zoom and pan functionality
3. Add tooltips and interactive features
4. Optimize performance for large datasets
5. Add animations and transitions

## Example Usage

```tsx
// App.tsx or your main component
import React, { useState } from 'react';
import { AfricaMapWithShapefile } from './components/AfricaMapWithShapefile';
import { CountryData } from './types';

function App() {
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  
  const countryData: CountryData[] = [
    {
      id: 'NG',
      name: 'Nigeria',
      literacyRate: 62.0,
      digitalInfrastructure: 45.0,
      investment: 35.0,
      finalScore: 47.3,
      year: 2024
    },
    // ... more countries
  ];

  return (
    <div className="h-screen p-4">
      <AfricaMapWithShapefile
        data={countryData}
        onCountryHover={setHoveredCountry}
        hoveredCountry={hoveredCountry}
        shapefilePath="/data/ne_110m_admin_0_countries.shp"
      />
    </div>
  );
}

export default App;
``` 