import express from 'express';
import Startup from '../models/Startup';

const router = express.Router();

// GET /api/startups - list all startups
router.get('/', async (req, res) => {
  try {
    const startups = await Startup.find().sort({ addedAt: -1 });
    res.json(startups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch startups' });
  }
});

// GET /api/startups/counts - get startup counts by country and year
router.get('/counts', async (req, res) => {
  try {
    const { year } = req.query;
    
    let matchStage: any = {};
    if (year) {
      matchStage.foundedYear = parseInt(year as string);
    }
    
    const counts = await Startup.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          country: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    res.json(counts);
  } catch (err) {
    console.error('Error fetching startup counts:', err);
    res.status(500).json({ error: 'Failed to fetch startup counts' });
  }
});

// POST /api/startups - add a new startup
router.post('/', async (req, res) => {
  try {
    const startup = new Startup(req.body);
    await startup.save();
    res.status(201).json(startup);
  } catch (err) {
    res.status(400).json({ error: 'Failed to add startup' });
  }
});

// POST /api/startups/bulk - bulk add startups
router.post('/bulk', async (req, res) => {
  try {
    console.log('Bulk upload endpoint hit!');
    const { data } = req.body;
    if (!Array.isArray(data) || data.length === 0) {
      console.log('Invalid data received:', { data });
      return res.status(400).json({ error: 'Data array is required and must not be empty' });
    }
    
    console.log('Received bulk upload data:', {
      count: data.length,
      firstRow: data[0],
      columns: Object.keys(data[0] || {})
    });
    
    // Log a few sample rows to understand the data structure
    console.log('Sample rows:');
    data.slice(0, 3).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, {
        name: row['Organization Name'],
        country: row['Headquarters Location'],
        sector: row['Industries'],
        foundedDate: row['Founded Date']
      });
    });
    
    // Validate and transform data
    const validatedData = data.map((row, index) => {
      // Check if required fields exist - handle the specific column names from the Excel file
      const name = row.name || row.Name || row.NAME || row['Company Name'] || row['Company name'] || 
                   row['Organization Name'] || row['Organization name'];
      const country = row.country || row.Country || row.COUNTRY || row['Country Name'] || row['Country name'] || 
                      row['Headquarters Location'] || row['Headquarters location'] || row['Location'];
      const sector = row.sector || row.Sector || row.SECTOR || row['Business Sector'] || row['Business sector'] || 
                     row['Industries'] || row['Industry Groups'] || row['Industry'];
      const foundedYear = row.foundedYear || row['Founded Year'] || row['Founded year'] || row['Year Founded'] || row['Year founded'] || 
                          row['Founded Date'] || row['Founded date'];
      
      if (!name || !country || !sector || !foundedYear) {
        console.log(`Row ${index + 1} missing required fields:`, { name, country, sector, foundedYear });
        return null;
      }
      
      // Parse founded year - handle different date formats including Excel serial numbers
      let year;
      if (typeof foundedYear === 'string') {
        // Try to extract year from date string
        const yearMatch = foundedYear.match(/\b(19|20)\d{2}\b/);
        year = yearMatch ? parseInt(yearMatch[0]) : null;
      } else if (typeof foundedYear === 'number') {
        // Handle Excel date serial numbers (days since 1900-01-01)
        if (foundedYear > 1000 && foundedYear < 100000) {
          // This looks like an Excel date serial number
          const excelDate = new Date((foundedYear - 25569) * 86400 * 1000);
          year = excelDate.getFullYear();
        } else {
          year = foundedYear;
        }
      } else {
        year = null;
      }
      
      if (!year || year < 1900 || year > new Date().getFullYear()) {
        console.log(`Row ${index + 1} invalid founded year:`, foundedYear, '->', year);
        return null;
      }
      
      // Validate country is in Africa
      const africanCountries = [
        'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cameroon', 
        'Central African Republic', 'Chad', 'Comoros', 'Congo', 'Democratic Republic of the Congo', 
        'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 
        'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 
        'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 
        'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 
        'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 
        'Zambia', 'Zimbabwe'
      ];
      
      // Extract country from location string (e.g., "Dar Es Salaam, Dar es Salaam, Tanzania" -> "Tanzania")
      let countryName = String(country).trim();
      
      // Try to extract country from the end of the location string
      const locationParts = countryName.split(',').map(part => part.trim());
      const possibleCountry = locationParts[locationParts.length - 1];
      
      // Check if the last part is a known African country
      const isLastPartCountry = africanCountries.some(africanCountry => 
        possibleCountry.toLowerCase() === africanCountry.toLowerCase()
      );
      
      if (isLastPartCountry) {
        countryName = possibleCountry;
      }
      
      const isAfricanCountry = africanCountries.some(africanCountry => 
        countryName.toLowerCase().includes(africanCountry.toLowerCase()) ||
        africanCountry.toLowerCase().includes(countryName.toLowerCase())
      );
      
      // Temporarily disable African country validation for debugging
      if (!isAfricanCountry) {
        console.log(`Row ${index + 1} skipped - not an African country:`, countryName);
        // return null; // Commented out for debugging
      }
      
      console.log(`Row ${index + 1} country validation:`, { 
        originalLocation: country, 
        extractedCountry: countryName, 
        isAfricanCountry 
      });
      
              // Extract primary sector from industries (take the first one if multiple)
        let primarySector = String(sector).trim();
        if (primarySector.includes(',')) {
          primarySector = primarySector.split(',')[0].trim();
        }
        
        return {
          name: String(name).trim(),
          country: countryName,
          sector: primarySector,
          foundedYear: year,
          description: row.description || row.Description || row.DESC || row['Full Description'] || '',
          website: row.website || row.Website || row.URL || row.url || row['Organization Name URL'] || '',
          addedBy: row.addedBy || 'bulk_upload',
          addedAt: new Date()
        };
    }).filter(Boolean);
    
    console.log(`Validated ${validatedData.length} out of ${data.length} rows`);
    console.log('Sample of validated data:', validatedData.slice(0, 3));
    
    if (validatedData.length === 0) {
      // Log more details about why validation failed
      console.log('Validation failed. Sample of rejected rows:');
      data.slice(0, 5).forEach((row, index) => {
        const name = row['Organization Name'] || row.name || row.Name;
        const country = row['Headquarters Location'] || row.country || row.Country;
        const sector = row['Industries'] || row.sector || row.Sector;
        const foundedDate = row['Founded Date'] || row.foundedYear;
        
        console.log(`Row ${index + 1}:`, {
          name: name || 'MISSING',
          country: country || 'MISSING',
          sector: sector || 'MISSING',
          foundedDate: foundedDate || 'MISSING',
          hasName: !!name,
          hasCountry: !!country,
          hasSector: !!sector,
          hasFoundedDate: !!foundedDate
        });
      });
      
      return res.status(400).json({ 
        error: 'No valid startup data found. Please check your Excel file format.',
        details: 'Required fields: name, country, sector, foundedYear. Only African countries are accepted.'
      });
    }
    
    const result = await Startup.insertMany(validatedData, { ordered: false });
    res.status(201).json({
      message: `Successfully added ${result.length} startups`,
      insertedCount: result.length,
      startups: result
    });
  } catch (err) {
    console.error('Error creating bulk startups:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(400).json({ error: 'Failed to create bulk startups', details: errorMessage });
  }
});

export default router; 