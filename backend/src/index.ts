// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import startupsRoutes from './routes/startups';
import countryDataRoutes from './routes/countryData';
import newsRoutes from './routes/news';

// Add startup log to verify deployment
console.log('🚀 African Fintech Backend Starting...');
console.log('📅 Deployment Time:', new Date().toISOString());
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔧 Node Version:', process.version);
console.log('📁 Current Directory:', process.cwd());

// Validate environment variables
console.log('🔍 Checking environment variables...');
console.log('📊 NODE_ENV:', process.env.NODE_ENV);
console.log('🔌 PORT:', process.env.PORT);
console.log('🗄️ MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('🔐 JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('🔐 JWT_SECRET value:', process.env.JWT_SECRET ? `${process.env.JWT_SECRET.substring(0, 20)}...` : 'NOT_SET');
console.log('🔐 JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);

const app = express();
const PORT = process.env.PORT || 5000;

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

// Add a simple test endpoint
app.get('/test', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    deployment: 'TEST_DEPLOYMENT_2025_08_05'
  });
});

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
app.use('/api/news', newsRoutes);

console.log('🔗 Attempting to connect to MongoDB...');
console.log('🔍 MongoDB URI length:', process.env.MONGO_URI?.length || 0);
console.log('🔍 MongoDB URI starts with:', process.env.MONGO_URI?.substring(0, 20) || 'NOT_SET');

mongoose.connect(process.env.MONGO_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as any).then(() => {
  console.log('✅ MongoDB connected successfully!');
  
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
  console.error('🔧 Error details:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 