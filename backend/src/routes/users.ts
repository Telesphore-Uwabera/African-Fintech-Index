import express, { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { requireRole } from '../middleware/role';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// AuthRequest interface for req.user
interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// Auth middleware (reuse from auth.ts)
function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
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

// Real sendEmail utility using nodemailer
async function sendEmail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
  });
}

// Get all users (admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Get unverified users (admin only)
router.get('/unverified', authMiddleware, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const users = await User.find({ isVerified: false }).select('-password');
  res.json(users);
});

// Verify a user (admin only)
router.patch('/:id/verify', authMiddleware, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  // Send verification email
  await sendEmail(user.email, 'Your account has been verified', 'You can now log in to the African Fintech Index platform.');
  res.json({ message: 'User verified', user });
});

// Edit a user (admin only)
router.patch('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { name, role, isVerified } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { name, role, isVerified } },
    { new: true }
  ).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User updated', user });
});

// Delete a user (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User deleted', user });
});

// Get current user (authenticated)
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router; 