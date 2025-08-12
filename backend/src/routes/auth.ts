import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { sendEmail, sendPhoneNotification } from '../utils/notifications';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Admin contact information
const ADMIN_CONTACT = {
  email: 'ntakirpetero@gmail.com',
  phone: '+250 781 712 615'
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (role === 'admin') {
      return res.status(403).json({ message: 'Cannot register as admin via the app' });
    }
    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hash,
      name,
      role,
      isVerified: false,
    });
    await user.save();
    
    // Send admin notification email and phone (non-blocking)
    setImmediate(async () => {
      try {
        const notificationSubject = 'New User Registration - Requires Verification';
        const notificationText = `
New user registration requires admin verification:

User Details:
- Name: ${name}
- Email: ${email}
- Role: ${role}
- Registration Date: ${new Date().toLocaleString()}

Please log in to the admin panel to verify this user.

African Fintech Index Admin Panel
        `.trim();
        
        // Send email notification to admin
        await sendEmail(ADMIN_CONTACT.email, notificationSubject, notificationText);
        
        // Send phone notification to admin
        const phoneMessage = `New user ${name} (${email}) registered. Role: ${role}. Please verify.`;
        await sendPhoneNotification(ADMIN_CONTACT.phone, phoneMessage);
        
        console.log(`✅ Admin notifications sent for new user: ${email}`);
      } catch (error) {
        console.error('❌ Failed to send admin notification:', error);
      }
    });
    
    res.status(201).json({ message: 'User registered. Awaiting admin verification.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account not verified by admin yet' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT
export function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Get current user
router.get('/me', authMiddleware, async (req: any, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router; 