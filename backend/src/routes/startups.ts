import express from 'express';
import Startup from '../models/Startup';
import { requireRole, requireAnyRole } from '../middleware/role';
import { sendEmail, sendPhoneNotification } from '../utils/notifications';
import { authMiddleware } from '../routes/auth';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ADMIN_CONTACT } from '../config/adminContact';

const router = express.Router();

// Admin contact information comes from env via config

// GET /api/startups - list all verified startups with search and filtering (public)
router.get('/', async (req, res) => {
  try {
    const { search, country, sector } = req.query;
    
    let filter: any = { verificationStatus: 'approved' }; // Only show verified startups
    
    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by country
    if (country && country !== 'All Countries') {
      filter.country = { $regex: country, $options: 'i' };
    }
    
    // Filter by sector (works with multiple sectors)
    if (sector && sector !== 'All Sectors') {
      filter.sector = { $regex: sector, $options: 'i' };
    }
    
    const startups = await Startup.find(filter).sort({ addedAt: -1 });
    
    // Log what sectors are being returned to frontend
    console.log('🔍 Backend sending verified startups to frontend:', {
      totalCount: startups.length,
      sampleSectors: startups.slice(0, 3).map(s => ({
        name: s.name,
        sector: s.sector,
        sectorsCount: s.sector ? s.sector.split(',').length : 0,
        hasMultipleSectors: s.sector && s.sector.includes(',')
      }))
    });
    
    res.json(startups);
  } catch (err) {
    console.error('Error fetching verified startups:', err);
    res.status(500).json({ error: 'Failed to fetch verified startups' });
  }
});

// GET /api/startups/all - list ALL startups (including pending) for stats calculation (admin only)
router.get('/all', authMiddleware, requireRole('admin'), async (req: any, res) => {
  try {
    const startups = await Startup.find({}).sort({ addedAt: -1 });
    res.json({ startups });
  } catch (err) {
    console.error('❌ Error fetching all startups:', err);
    res.status(500).json({ error: 'Failed to fetch all startups' });
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

// POST /api/startups - add a new startup (public, but requires admin verification)
router.post('/', async (req, res) => {
  try {
    // Check if the user is an admin (if they provide a token)
    let isAdmin = false;
    let adminEmail = 'public_user';
    
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        const user = await User.findById(decoded.userId);
        if (user && user.role === 'admin') {
          isAdmin = true;
          adminEmail = user.email;
        }
      } catch (err) {
        // Token invalid or expired, treat as public user
      }
    }

    const startup = new Startup({
      ...req.body,
      isVerified: isAdmin, // Auto-verify if admin
      verificationStatus: isAdmin ? 'approved' : 'pending',
      addedBy: adminEmail
    });
    
    await startup.save();
    
    // Send admin notification for non-admin uploads
    if (!isAdmin) {
      const notificationSubject = 'New Startup Pending Verification';
      const notificationText = `
      A new startup has been uploaded and requires verification:
      
      Name: ${startup.name}
      Country: ${startup.country}
      Sector: ${startup.sector}
      Founded Year: ${startup.foundedYear}
      Uploaded by: ${startup.addedBy}
      
      Please review and verify this startup.
      `.trim();
      
      await sendEmail(ADMIN_CONTACT.email, notificationSubject, notificationText);
      const phoneMessage = `New startup upload: ${startup.name} from ${startup.country} requires verification.`;
      await sendPhoneNotification(ADMIN_CONTACT.phone, phoneMessage);
    }
    
    res.status(201).json({
      ...startup.toObject(),
      message: isAdmin 
        ? 'Startup uploaded successfully and is now publicly visible.'
        : 'Startup uploaded successfully. Awaiting admin verification before public display.'
    });
  } catch (err) {
    console.error('❌ Error creating startup:', err);
    res.status(400).json({ error: 'Failed to create startup', details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// POST /api/startups/bulk - bulk add startups (public, but requires admin verification)
router.post('/bulk', async (req, res) => {
  try {
    // Check if the user is an admin (if they provide a token)
    let isAdmin = false;
    let adminEmail = 'public_user';
    
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        const user = await User.findById(decoded.userId);
        if (user && user.role === 'admin') {
          isAdmin = true;
          adminEmail = user.email;
        }
      } catch (err) {
        // Token invalid or expired, treat as public user
      }
    }

    const { startups } = req.body;
    
    if (!Array.isArray(startups) || startups.length === 0) {
      return res.status(400).json({ error: 'Startups array is required and must not be empty' });
    }

    const startupsToSave = startups.map(startup => ({
      ...startup,
      isVerified: isAdmin, // Auto-verify if admin
      verificationStatus: isAdmin ? 'approved' : 'pending',
      addedBy: adminEmail,
      addedAt: new Date()
    }));

    const result = await Startup.insertMany(startupsToSave);
    
    // Send admin notification for non-admin bulk uploads
    if (!isAdmin) {
      const notificationSubject = 'Bulk Startup Upload Pending Verification';
      const notificationText = `
      A bulk startup upload has been completed and requires verification:
      
      Number of Startups: ${result.length}
      Upload Date: ${new Date().toLocaleString()}
      Uploaded by: ${adminEmail}
      
      Please review and verify these startups.
      `.trim();
      
      await sendEmail(ADMIN_CONTACT.email, notificationSubject, notificationText);
      const phoneMessage = `Bulk startup upload: ${result.length} startups require verification.`;
      await sendPhoneNotification(ADMIN_CONTACT.phone, phoneMessage);
    }
    
    res.status(201).json({
      startups: result,
      message: isAdmin 
        ? `Successfully uploaded ${result.length} startups. All are now publicly visible.`
        : `Successfully uploaded ${result.length} startups. Awaiting admin verification before public display.`
    });
  } catch (err) {
    console.error('❌ Error creating bulk startups:', err);
    res.status(400).json({ error: 'Failed to create bulk startups', details: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// PUT /api/startups/:id - update an existing startup
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const startup = await Startup.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }
    
    res.json(startup);
  } catch (err) {
    console.error('Error updating startup:', err);
    res.status(400).json({ error: 'Failed to update startup' });
  }
});

// GET /api/startups/debug - debug endpoint to see current data structure
router.get('/debug', async (req, res) => {
  try {
    const startups = await Startup.find().limit(5);
    
    console.log('🔍 Debug: Current startup data in database:', {
      totalStartups: await Startup.countDocuments(),
      sampleStartups: startups.map(s => ({
        id: s._id,
        name: s.name,
        sector: s.sector,
        sectorsCount: s.sector ? s.sector.split(',').length : 0,
        hasMultipleSectors: s.sector && s.sector.includes(','),
        country: s.country,
        foundedYear: s.foundedYear
      }))
    });
    
    res.json({
      totalStartups: await Startup.countDocuments(),
      sampleStartups: startups.map(s => ({
        id: s._id,
        name: s.name,
        sector: s.sector,
        sectorsCount: s.sector ? s.sector.split(',').length : 0,
        hasMultipleSectors: s.sector && s.sector.includes(','),
        country: s.country,
        foundedYear: s.foundedYear
      }))
    });
  } catch (err) {
    console.error('Error in debug endpoint:', err);
    res.status(500).json({ error: 'Failed to get debug info' });
  }
});

// GET /api/startups/pending - Get startups pending verification (admin only)
router.get('/pending', authMiddleware, requireRole('admin'), async (req: any, res) => {
  try {
    const pendingStartups = await Startup.find({ 
      verificationStatus: 'pending' 
    }).sort({ addedAt: -1 });
    
    res.json({
      count: pendingStartups.length,
      startups: pendingStartups
    });
  } catch (err) {
    console.error('Error fetching pending startups:', err);
    res.status(500).json({ error: 'Failed to fetch pending startups' });
  }
});

// GET /api/startups/verified - Get only verified startups (public)
router.get('/verified', async (req, res) => {
  try {
    const { search, country, sector } = req.query;
    
    let filter: any = { verificationStatus: 'approved' };
    
    // Search by name or description
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by country
    if (country && country !== 'All Countries') {
      filter.country = { $regex: country, $options: 'i' };
    }
    
    // Filter by sector (works with multiple sectors)
    if (sector && sector !== 'All Sectors') {
      filter.sector = { $regex: sector, $options: 'i' };
    }
    
    const startups = await Startup.find(filter).sort({ addedAt: -1 });
    
    res.json(startups);
  } catch (err) {
    console.error('Error fetching verified startups:', err);
    res.status(500).json({ error: 'Failed to fetch verified startups' });
  }
});

// PATCH /api/startups/:id/verify - Verify a startup (admin only)
router.patch('/:id/verify', authMiddleware, requireRole('admin'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, adminNotes } = req.body;
    
    if (!['approved', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ error: 'Invalid verification status. Must be "approved" or "rejected".' });
    }
    
    const startup = await Startup.findByIdAndUpdate(
      id,
      {
        verificationStatus,
        isVerified: verificationStatus === 'approved',
        verifiedBy: req.user?.email || 'admin',
        verifiedAt: new Date(),
        adminNotes: adminNotes || ''
      },
      { new: true, runValidators: true }
    );
    
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }
    
    // Send notification about verification result
    const notificationSubject = `Startup Verification ${verificationStatus === 'approved' ? 'Approved' : 'Rejected'}`;
    const notificationText = `
Startup verification has been completed:

Startup Details:
- Name: ${startup.name}
- Country: ${startup.country}
- Sector: ${startup.sector}
- Status: ${verificationStatus.toUpperCase()}
- Verified By: ${req.user?.email || 'admin'}
- Verification Date: ${new Date().toLocaleString()}
- Admin Notes: ${adminNotes || 'None'}

${verificationStatus === 'approved' ? 'This startup is now publicly visible.' : 'This startup has been rejected and is not publicly visible.'}

African Fintech Index Admin Panel
    `.trim();
    
    // Send email notification
    await sendEmail(ADMIN_CONTACT.email, notificationSubject, notificationText);
    
    // Send phone notification
    const phoneMessage = `Startup ${startup.name} ${verificationStatus}. ${verificationStatus === 'approved' ? 'Now public.' : 'Rejected.'}`;
    await sendPhoneNotification(ADMIN_CONTACT.phone, phoneMessage);
    
    console.log(`✅ Admin notifications sent for startup verification: ${startup.name} - ${verificationStatus}`);
    
    res.json({
      message: `Startup ${verificationStatus} successfully`,
      startup
    });
  } catch (err) {
    console.error('Error verifying startup:', err);
    res.status(500).json({ error: 'Failed to verify startup' });
  }
});

// PATCH /api/startups/bulk-verify - Bulk verify multiple startups (admin only)
router.patch('/bulk-verify', authMiddleware, requireRole('admin'), async (req: any, res) => {
  try {
    const { startupIds, verificationStatus, adminNotes } = req.body;
    
    if (!Array.isArray(startupIds) || startupIds.length === 0) {
      return res.status(400).json({ error: 'Startup IDs array is required' });
    }
    
    if (!['approved', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({ error: 'Invalid verification status. Must be "approved" or "rejected".' });
    }
    
    const result = await Startup.updateMany(
      { _id: { $in: startupIds } },
      {
        verificationStatus,
        isVerified: verificationStatus === 'approved',
        verifiedBy: req.user?.email || 'admin',
        verifiedAt: new Date(),
        adminNotes: adminNotes || ''
      }
    );
    
    // Send bulk verification notification
    const notificationSubject = `Bulk Startup Verification ${verificationStatus === 'approved' ? 'Approved' : 'Rejected'}`;
    const notificationText = `
Bulk startup verification has been completed:

Verification Details:
- Startups Processed: ${result.modifiedCount}
- Status: ${verificationStatus.toUpperCase()}
- Verified By: ${req.user?.email || 'admin'}
- Verification Date: ${new Date().toLocaleString()}
- Admin Notes: ${adminNotes || 'None'}

${verificationStatus === 'approved' ? 'These startups are now publicly visible.' : 'These startups have been rejected and are not publicly visible.'}

African Fintech Index Admin Panel
    `.trim();
    
    // Send email notification
    await sendEmail(ADMIN_CONTACT.email, notificationSubject, notificationText);
    
    // Send phone notification
    const phoneMessage = `Bulk verification: ${result.modifiedCount} startups ${verificationStatus}. ${verificationStatus === 'approved' ? 'Now public.' : 'Rejected.'}`;
    await sendPhoneNotification(ADMIN_CONTACT.phone, phoneMessage);
    
    console.log(`✅ Admin notifications sent for bulk startup verification: ${result.modifiedCount} startups - ${verificationStatus}`);
    
    res.json({
      message: `Successfully ${verificationStatus} ${result.modifiedCount} startups`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Error bulk verifying startups:', err);
    res.status(500).json({ error: 'Failed to bulk verify startups' });
  }
});

// DELETE /api/startups/:id - Delete a startup (admin and editor only)
router.delete('/:id', authMiddleware, requireAnyRole(['admin', 'editor']), async (req: any, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    // Store startup details for notification before deletion
    const startupDetails = {
      name: startup.name,
      country: startup.country,
      sector: startup.sector,
      foundedYear: startup.foundedYear
    };

    // Delete the startup
    await Startup.findByIdAndDelete(req.params.id);
    
    // Send notification about deletion
    const notificationSubject = 'Startup Deleted from Database';
    const notificationText = `
Startup has been permanently deleted:

Startup Details:
- Name: ${startupDetails.name}
- Country: ${startupDetails.country}
- Sector: ${startupDetails.sector}
- Founded Year: ${startupDetails.foundedYear || 'Unknown'}
- Deleted By: ${req.user?.email || 'admin'}
- Deletion Date: ${new Date().toLocaleString()}
- User Role: ${req.user?.role || 'unknown'}

⚠️ This action cannot be undone. The startup has been permanently removed from the database.

African Fintech Index Admin Panel
    `.trim();
    
    // Send email notification
    await sendEmail(ADMIN_CONTACT.email, notificationSubject, notificationText);
    
    // Send phone notification
    const phoneMessage = `Startup ${startupDetails.name} (${startupDetails.country}) permanently deleted by ${req.user?.role}.`;
    await sendPhoneNotification(ADMIN_CONTACT.phone, phoneMessage);
    
    console.log(`✅ Startup deleted and notifications sent: ${startupDetails.name} by ${req.user?.email} (${req.user?.role})`);
    
    res.json({ 
      message: 'Startup deleted successfully', 
      deletedStartup: startupDetails,
      deletedBy: req.user?.email,
      userRole: req.user?.role
    });
  } catch (err) {
    console.error('Error deleting startup:', err);
    res.status(500).json({ error: 'Failed to delete startup' });
  }
});

export default router; 