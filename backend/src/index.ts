import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import startupsRoutes from './routes/startups';
import countryDataRoutes from './routes/countryData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Add startup log to verify deployment
console.log('🚀 African Fintech Backend Starting...');
console.log('📅 Deployment Time:', new Date().toISOString());
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

app.use(cors({
  origin: [
    'https://africanfintechindex.netlify.app',
    'http://localhost:5173',
    'https://africanfintechindex.netlify.app/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Health check endpoint for Azure
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    deployment: 'NEW_DEPLOYMENT_2025_08_05'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'African Fintech Index API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    deployment: 'NEW_DEPLOYMENT_2025_08_05'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/startups', startupsRoutes);
app.use('/api/country-data', countryDataRoutes);

mongoose.connect(process.env.MONGO_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any).then(() => {
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️ MongoDB connected: ${mongoose.connection.host}`);
    console.log(`🚀 NEW DEPLOYMENT SUCCESSFUL!`);
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    process.exit(1);
  });

  // Handle process termination
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      mongoose.connection.close();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      mongoose.connection.close();
      process.exit(0);
    });
  });

}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  console.error('🔧 Please check your MONGO_URI environment variable');
  process.exit(1);
}); 