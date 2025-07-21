import express, { Request, Response } from 'express';
import CountryData, { ICountryData } from '../models/CountryData';
import { requireRole } from '../middleware/role';

// AuthRequest interface for req.user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// GET /api/country-data - Get all country data with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { year, country, limit, sort } = req.query;
    
    let query: any = {};
    
    // Filter by year if provided
    if (year) {
      query.year = parseInt(year as string);
    }
    
    // Filter by country if provided
    if (country) {
      query.$or = [
        { name: { $regex: country as string, $options: 'i' } },
        { id: { $regex: country as string, $options: 'i' } }
      ];
    }
    
    let sortOption: any = { year: -1, name: 1 };
    if (sort === 'score') {
      sortOption = { finalScore: -1, year: -1 };
    } else if (sort === 'name') {
      sortOption = { name: 1, year: -1 };
    }
    
    const limitNum = limit ? parseInt(limit as string) : 1000;
    
    const data = await CountryData.find(query)
      .sort(sortOption)
      .limit(limitNum);
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching country data:', err);
    res.status(500).json({ error: 'Failed to fetch country data' });
  }
});

// GET /api/country-data/stats - Get statistics about the data
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await CountryData.aggregate([
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          uniqueCountries: { $addToSet: '$id' },
          years: { $addToSet: '$year' },
          averageScore: { $avg: '$finalScore' },
          minScore: { $min: '$finalScore' },
          maxScore: { $max: '$finalScore' }
        }
      },
      {
        $project: {
          _id: 0,
          totalRecords: 1,
          uniqueCountries: { $size: '$uniqueCountries' },
          years: { $sortArray: { input: '$years', sortBy: -1 } },
          averageScore: { $round: ['$averageScore', 2] },
          minScore: 1,
          maxScore: 1
        }
      }
    ]);
    
    res.json(stats[0] || {});
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// GET /api/country-data/years - Get all available years
router.get('/years', async (req: Request, res: Response) => {
  try {
    const years = await CountryData.distinct('year');
    res.json(years.sort((a, b) => b - a)); // Sort descending
  } catch (err) {
    console.error('Error fetching years:', err);
    res.status(500).json({ error: 'Failed to fetch years' });
  }
});

// GET /api/country-data/countries - Get all available countries
router.get('/countries', async (req: Request, res: Response) => {
  try {
    const countries = await CountryData.distinct('name', { name: { $exists: true, $ne: '' } });
    res.json(countries.sort());
  } catch (err) {
    console.error('Error fetching countries:', err);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// POST /api/country-data - Add new country data (admin/editor only)
router.post('/', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const countryData = new CountryData({
      ...req.body,
      createdBy: req.user?.email || 'admin',
      updatedBy: req.user?.email || 'admin'
    });
    
    await countryData.save();
    res.status(201).json(countryData);
  } catch (err: any) {
    console.error('Error creating country data:', err);
    if (err.code === 11000) {
      res.status(409).json({ error: 'Data for this country and year already exists' });
    } else {
      res.status(400).json({ error: 'Failed to create country data' });
    }
  }
});

// PUT /api/country-data/:id/:year - Update specific country data (admin/editor only)
router.put('/:id/:year', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id, year } = req.params;
    const yearNum = parseInt(year);
    
    const countryData = await CountryData.findOneAndUpdate(
      { id, year: yearNum },
      { 
        ...req.body,
        updatedBy: req.user?.email || 'admin'
      },
      { new: true, runValidators: true }
    );
    
    if (!countryData) {
      return res.status(404).json({ error: 'Country data not found' });
    }
    
    res.json(countryData);
  } catch (err) {
    console.error('Error updating country data:', err);
    res.status(400).json({ error: 'Failed to update country data' });
  }
});

// DELETE /api/country-data/:id/:year - Delete specific country data (admin only)
router.delete('/:id/:year', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id, year } = req.params;
    const yearNum = parseInt(year);
    
    const countryData = await CountryData.findOneAndDelete({ id, year: yearNum });
    
    if (!countryData) {
      return res.status(404).json({ error: 'Country data not found' });
    }
    
    res.json({ message: 'Country data deleted successfully', deletedData: countryData });
  } catch (err) {
    console.error('Error deleting country data:', err);
    res.status(500).json({ error: 'Failed to delete country data' });
  }
});

// DELETE /api/country-data/delete-by-year/:year - Delete all data for a specific year (admin only)
router.delete('/delete-by-year/:year', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { year } = req.params;
    const yearNum = parseInt(year);
    
    const result = await CountryData.deleteMany({ year: yearNum });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No data found for the specified year' });
    }
    
    res.json({ 
      message: `Deleted ${result.deletedCount} records for year ${yearNum}`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error deleting data by year:', err);
    res.status(500).json({ error: 'Failed to delete data by year' });
  }
});

// DELETE /api/country-data/delete-by-country/:country - Delete all data for a specific country (admin only)
router.delete('/delete-by-country/:country', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { country } = req.params;
    
    const result = await CountryData.deleteMany({
      $or: [
        { name: { $regex: country, $options: 'i' } },
        { id: { $regex: country, $options: 'i' } }
      ]
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No data found for the specified country' });
    }
    
    res.json({ 
      message: `Deleted ${result.deletedCount} records for country ${country}`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error deleting data by country:', err);
    res.status(500).json({ error: 'Failed to delete data by country' });
  }
});

// DELETE /api/country-data/delete-selective - Delete multiple records by IDs (admin only)
router.delete('/delete-selective', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'IDs array is required and must not be empty' });
    }
    
    const result = await CountryData.deleteMany({ _id: { $in: ids } });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No records found with the provided IDs' });
    }
    
    res.json({ 
      message: `Deleted ${result.deletedCount} records`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error deleting selective data:', err);
    res.status(500).json({ error: 'Failed to delete selective data' });
  }
});

// DELETE /api/country-data/delete-all - Delete all country data (admin only)
router.delete('/delete-all', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const result = await CountryData.deleteMany({});
    
    res.json({ 
      message: `Deleted all ${result.deletedCount} records`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error deleting all data:', err);
    res.status(500).json({ error: 'Failed to delete all data' });
  }
});

// POST /api/country-data/bulk - Add multiple country data records (admin only)
router.post('/bulk', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: 'Data array is required and must not be empty' });
    }
    
    const countryDataArray = data.map(item => ({
      ...item,
      createdBy: req.user?.email || 'admin',
      updatedBy: req.user?.email || 'admin'
    }));
    
    const result = await CountryData.insertMany(countryDataArray, { 
      ordered: false
    });
    
    res.status(201).json({
      message: `Successfully added ${result.length} records`,
      insertedCount: result.length
    });
  } catch (err) {
    console.error('Error creating bulk country data:', err);
    res.status(400).json({ error: 'Failed to create bulk country data' });
  }
});

export default router; 