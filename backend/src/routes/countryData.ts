import express, { Request, Response } from 'express';
import CountryData, { ICountryData } from '../models/CountryData';
import { requireRole, requireAnyRole } from '../middleware/role';
import { authMiddleware } from './auth';
import { sendEmail, sendPhoneNotification } from '../utils/notifications';

// AuthRequest interface for req.user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

import { ADMIN_CONTACT } from '../config/adminContact';

// GET /api/country-data - Get all country data with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { year, country, limit, sort } = req.query;
    
    let query: any = {};
    
    // Filter by year if provided
    if (year) {
      const yearNum = parseInt(year as string);
      if (isNaN(yearNum)) {
        return res.status(400).json({ error: 'Invalid year parameter' });
      }
      query.year = yearNum;
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
    
    // Projection to reduce payload size
    const projection = {
      _id: 1,
      id: 1,
      name: 1,
      year: 1,
      finalScore: 1,
      literacyRate: 1,
      digitalInfrastructure: 1,
      investment: 1,
      population: 1,
      gdp: 1,
    };
    
    // Increased timeout for slower networks/backends
    const TIMEOUT_MS = 25000;
    const data = await Promise.race([
      CountryData.find(query)
        .select('id name year finalScore literacyRate digitalInfrastructure investment population gdp')
        .sort(sortOption)
        .limit(limitNum)
        .lean(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), TIMEOUT_MS)
      )
    ]);
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching country data:', err);
    if (err instanceof Error && err.message === 'Query timeout') {
      res.status(408).json({ error: 'Request timeout - please try again' });
    } else {
      res.status(500).json({ error: 'Failed to fetch country data' });
    }
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
router.post('/', authMiddleware, requireAnyRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
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

// DELETE /api/country-data/:id/:year - Delete specific country data (admin and editor)
router.delete('/:id/:year', authMiddleware, requireAnyRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
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

// DELETE /api/country-data/delete-by-year/:year - Delete all data for a specific year (admin and editor)
router.delete('/delete-by-year/:year', authMiddleware, requireAnyRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
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

// DELETE /api/country-data/delete-by-country/:country - Delete all data for a specific country (admin and editor)
router.delete('/delete-by-country/:country', authMiddleware, requireAnyRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
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

// DELETE /api/country-data/delete-selective - Delete multiple records by IDs (admin and editor)
router.delete('/delete-selective', authMiddleware, requireAnyRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
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

// DELETE /api/country-data/delete-all - Delete all country data (admin and editor)
router.delete('/delete-all', authMiddleware, requireAnyRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    const result = await CountryData.deleteMany({});
    
    // Send admin notification about data deletion
    const notificationSubject = 'All Country Data Deleted';
    const notificationText = `
All country data has been deleted from the database:

Deletion Details:
- User: ${req.user?.email || 'Unknown'}
- User Role: ${req.user?.role || 'Unknown'}
- Records Deleted: ${result.deletedCount}
- Deletion Date: ${new Date().toLocaleString()}
- Operation: Delete All Data

⚠️ This action cannot be undone. All data has been permanently removed.

African Fintech Index Admin Panel
    `.trim();
    
    // Send email notification
    await sendEmail(ADMIN_CONTACT.email, notificationSubject, notificationText);
    
    // Send phone notification
    const phoneMessage = `All country data deleted: ${result.deletedCount} records by ${req.user?.email} (${req.user?.role}).`;
    await sendPhoneNotification(ADMIN_CONTACT.phone, phoneMessage);
    
    console.log(`✅ Admin notifications sent for data deletion: ${result.deletedCount} records by ${req.user?.email} (${req.user?.role})`);
    
    res.json({ 
      message: `Deleted all ${result.deletedCount} records`,
      deletedCount: result.deletedCount,
      deletedBy: req.user?.email,
      userRole: req.user?.role
    });
  } catch (err) {
    console.error('Error deleting all data:', err);
    res.status(500).json({ error: 'Failed to delete all data' });
  }
});

// DELETE /api/country-data - Delete all country data (admin and editor) - Alternative endpoint
router.delete('/', authMiddleware, requireAnyRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 DELETE /api/country-data called by:', req.user?.email, 'Role:', req.user?.role);
    
    // Count records before deletion
    const beforeCount = await CountryData.countDocuments({});
    console.log('🔍 Records before deletion:', beforeCount);
    
    const result = await CountryData.deleteMany({});
    console.log('🔍 Delete result:', result);
    
    // Count records after deletion
    const afterCount = await CountryData.countDocuments({});
    console.log('🔍 Records after deletion:', afterCount);
    
    console.log('✅ Delete operation completed successfully');
    
    res.json({ 
      message: `Deleted all ${result.deletedCount} records`,
      deletedCount: result.deletedCount,
      beforeCount,
      afterCount
    });
  } catch (err) {
    console.error('❌ Error deleting all data:', err);
    res.status(500).json({ error: 'Failed to delete all data' });
  }
});

// POST /api/country-data/bulk - Add multiple country data records (admin or editor)
router.post('/bulk', authMiddleware, requireAnyRole(['admin', 'editor']), async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔍 Bulk upload request received:', {
      user: req.user?.email,
      bodyKeys: Object.keys(req.body),
      dataLength: req.body.data?.length || 0
    });

    const { data } = req.body;
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log('❌ Validation failed: data is not an array or is empty');
      return res.status(400).json({ error: 'Data array is required and must not be empty' });
    }

    console.log('🔍 Sample data item:', data[0]);
    console.log('🔍 Total records to insert:', data.length);

    // Check for existing data that might cause conflicts
    const existingData = await CountryData.find({
      $or: data.map(item => ({ id: item.id, year: item.year }))
    }).lean();

    if (existingData.length > 0) {
      console.log('⚠️ Found existing data that would conflict:', existingData.map(item => ({ id: item.id, year: item.year })));
      return res.status(400).json({ 
        error: 'Duplicate data detected', 
        details: `Found ${existingData.length} existing records that would conflict with the upload. Each country can only have one record per year.`,
        conflicts: existingData.map(item => ({ id: item.id, year: item.year }))
      });
    }
    
    const countryDataArray = data.map(item => ({
      ...item,
      createdBy: req.user?.email || 'admin',
      updatedBy: req.user?.email || 'admin'
    }));

    console.log('🔍 Attempting to insert data...');
    const result = await CountryData.insertMany(countryDataArray, { 
      ordered: false
    });

    console.log('✅ Successfully inserted:', result.length, 'records');
    
    // Send admin notification about data upload
    const notificationSubject = 'Country Data Upload Completed';
    const notificationText = `
Country data upload has been completed:

Upload Details:
- User: ${req.user?.email || 'Unknown'}
- Records Added: ${result.length}
- Upload Date: ${new Date().toLocaleString()}
- Years Covered: ${[...new Set(data.map(item => item.year))].join(', ')}

Please review and verify this uploaded data.

African Fintech Index Admin Panel
    `.trim();
    
    // Send email notification
    await sendEmail(ADMIN_CONTACT.email, notificationSubject, notificationText);
    
    // Send phone notification
    const phoneMessage = `Country data upload: ${result.length} records added by ${req.user?.email || 'Unknown'}. Please verify.`;
    await sendPhoneNotification(ADMIN_CONTACT.phone, phoneMessage);
    
    console.log(`✅ Admin notifications sent for country data upload: ${result.length} records`);
    
    res.status(201).json({
      message: `Successfully added ${result.length} records`,
      insertedCount: result.length
    });
  } catch (err) {
    console.error('❌ Error creating bulk country data:', err);
    
    // Check if it's a duplicate key error
    if (err && typeof err === 'object' && 'code' in err && err.code === 11000) {
      return res.status(400).json({ 
        error: 'Duplicate data detected',
        details: 'Some countries already have data for the specified year(s). Each country can only have one record per year.'
      });
    }
    
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    res.status(400).json({ error: 'Failed to create bulk country data', details: errorMessage });
  }
});

export default router; 