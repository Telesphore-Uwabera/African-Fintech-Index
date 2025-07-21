# African Fintech Index Dashboard

A comprehensive full-stack web application for tracking and analyzing fintech development across African countries. Built with React, TypeScript, Node.js, and MongoDB.

## 🌟 Features

### 🗺️ Interactive Mapping
- **Interactive African Map**: Visual representation of fintech development across African countries
- **Color-coded Regions**: Countries are color-coded based on their fintech index scores
- **Hover Effects**: Detailed country information on hover
- **Shapefile Support**: Enhanced map with real geographic data

### 📊 Analytics & Data Visualization
- **Score Distribution**: Interactive charts showing fintech score distributions
- **Country Trends**: Time-series analysis of fintech development
- **Comparative Analysis**: Side-by-side country comparisons
- **Statistical Overview**: Key metrics and performance indicators

### 👥 Role-Based Access Control
- **Admin**: Full system access, user management, data upload
- **Editor**: Data management, startup addition, analytics access
- **Viewer**: Read access, startup addition, analytics viewing
- **Guest**: Limited public access

### 🏢 Startup Management
- **Startup Database**: Comprehensive fintech startup information
- **Add/Edit Startups**: Role-based startup management
- **Search & Filter**: Advanced filtering by country, sector, and keywords
- **Sector Classification**: Organized by fintech sectors (Payments, Lending, etc.)

### 📈 Data Management
- **CSV/Excel Upload**: Bulk data import functionality
- **Data Validation**: Automated data quality checks
- **Year-based Filtering**: Multi-year data analysis
- **Export Capabilities**: Data export in various formats

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **D3.js** for advanced mapping

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Role-based middleware** for access control

### Key Technologies
- **Shapefile Processing**: Geographic data handling
- **Data Visualization**: Interactive charts and maps
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Mobile-first approach

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Index
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create `.env` files in both root and backend directories:
   ```env
   # Backend .env
   MONGODB_URI=mongodb://localhost:27017/african-fintech-index
   JWT_SECRET=secret-key-here
   PORT=5000
   ```

5. **Start the development servers**
   ```bash
   # Start backend (in backend directory)
   cd backend
   npm run dev
   
   # Start frontend (in root directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 👑 Creating a Super User (Admin)

### Method 1: Direct Database Creation (Recommended)

1. **Start MongoDB and connect to your database**
   ```bash
   # Connect to MongoDB shell
   mongosh
   
   # Switch to your database
   use african-fintech-index
   ```

2. **Create the admin user directly in MongoDB**
   ```javascript
   db.users.insertOne({
     email: "admin@africanfintech.com",
     password: "$2a$10$YOUR_HASHED_PASSWORD", // Use bcrypt hash
     role: "admin",
     isVerified: true,
     name: "Super Administrator",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

3. **Generate a bcrypt hash for your password**
   ```bash
   # Install bcrypt-cli globally
   npm install -g bcrypt-cli
   
   # Generate hash for the password
   bcrypt "secure-password-here"
   ```

### Method 2: Using the Application Registration

1. **Register a new user through the application**
   - Go to http://localhost:5173
   - Click "Sign In" → "Register"
   - Use your admin email and select "admin" role
   - Complete registration

2. **Manually verify the user in MongoDB**
   ```bash
   mongosh
   use african-fintech-index
   
   # Update the user to verified status
   db.users.updateOne(
     { email: "admin-email@example.com" },
     { 
       $set: { 
         isVerified: true,
         role: "admin"
       }
     }
   )
   ```

### Method 3: Backend API Script

1. **Create a setup script** (`backend/scripts/create-admin.js`)
   ```javascript
   const bcrypt = require('bcryptjs');
   const mongoose = require('mongoose');
   require('dotenv').config();

   // Connect to MongoDB
   mongoose.connect(process.env.MONGODB_URI);

   // User schema (simplified)
   const userSchema = new mongoose.Schema({
     email: String,
     password: String,
     role: String,
     isVerified: Boolean,
     name: String,
     createdAt: Date,
     updatedAt: Date
   });

   const User = mongoose.model('User', userSchema);

   async function createAdmin() {
     try {
       const hashedPassword = await bcrypt.hash('your-admin-password', 10);
       
       const adminUser = new User({
         email: 'admin@africanfintech.com',
         password: hashedPassword,
         role: 'admin',
         isVerified: true,
         name: 'Super Administrator',
         createdAt: new Date(),
         updatedAt: new Date()
       });

       await adminUser.save();
       console.log('Admin user created successfully!');
       process.exit(0);
     } catch (error) {
       console.error('Error creating admin user:', error);
       process.exit(1);
     }
   }

   createAdmin();
   ```

2. **Run the script**
   ```bash
   cd backend
   node scripts/create-admin.js
   ```

### Admin User Credentials

After creating the admin user, sign in with:
- **Email**: admin@africanfintech.com (or chosen email)
- **Password**: secure-password-here

### Admin Capabilities

Once logged in as admin, you can:
- ✅ Manage all users (verify, edit, delete)
- ✅ Upload and manage data files
- ✅ Access all analytics and reports
- ✅ Manage fintech startups
- ✅ View system statistics
- ✅ Configure application settings

### Security Best Practices

1. **Use a strong password** (minimum 12 characters with mixed case, numbers, symbols)
2. **Change default admin email** to the organization's domain
3. **Enable two-factor authentication** if available
4. **Regular password rotation** (every 90 days)
5. **Monitor admin account activity**
6. **Limit admin access** to trusted personnel only

### Troubleshooting

**If unable to sign in:**
- Check if the user exists: `db.users.findOne({email: "admin-email"})`
- Verify the user is verified: `db.users.findOne({email: "admin-email", isVerified: true})`
- Reset password if needed: `db.users.updateOne({email: "admin-email"}, {$set: {password: "new-hash"}})`

**If the role isn't working:**
- Verify role field: `db.users.findOne({email: "admin-email"}).role`
- Update role if needed: `db.users.updateOne({email: "admin-email"}, {$set: {role: "admin"}})`

## 📁 Project Structure

```
Index/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript type definitions
│   │   ├── utils/          # Utility functions
│   │   └── data/           # Static data and shapefiles
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # MongoDB models
│   │   ├── middleware/     # Express middleware
│   │   └── utils/          # Backend utilities
│   └── package.json
├── public/                  # Public assets
└── README.md
```

## 🔐 Authentication & Roles

### User Roles
- **Admin**: Full system access including user management
- **Editor**: Data management and content creation
- **Viewer**: Read access with startup addition capabilities
- **Guest**: Limited public access

### Registration Process
1. Users register with email and role selection
2. Admin verification required for account activation
3. JWT tokens for session management
4. Role-based route protection

## 🗺️ Map Features

### Geographic Data
- **Natural Earth Data**: High-quality geographic boundaries
- **Shapefile Support**: Professional-grade mapping
- **Country Coverage**: All African countries included
- **Interactive Elements**: Hover, click, and zoom functionality

### Color Coding
- **High (80+)**: Green - Advanced fintech development
- **Medium (60-79)**: Yellow - Moderate fintech development
- **Low (40-59)**: Red - Limited fintech development
- **Very Low (<40)**: Gray - Minimal fintech development

## 📊 Data Management

### Supported Formats
- CSV files
- Excel spreadsheets (.xlsx)
- JSON data

### Data Validation
- Automatic format detection
- Required field validation
- Data type checking
- Duplicate prevention

## 🛠️ Development

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend:**
```bash
npm run dev          # Start development server with nodemon
npm run build        # Build TypeScript
npm run lint         # Run ESLint
```

### Code Quality
- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety and IntelliSense
- **Prettier**: Code formatting (if configured)

## 🌐 Deployment

### Local Deployment
See `LOCAL_DEPLOYMENT.md` for detailed local setup instructions.

### Production Deployment
1. Build the frontend: `npm run build`
2. Set up MongoDB Atlas or local MongoDB
3. Configure environment variables
4. Deploy backend to your preferred hosting service
5. Serve frontend build files

## 📈 Key Metrics

The dashboard tracks various fintech development indicators:
- **Literacy Rate**: Educational foundation
- **Digital Infrastructure**: Technology readiness
- **Investment**: Financial backing
- **Fintech Companies**: Market presence
- **Final Score**: Composite fintech index

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation in `LOCAL_DEPLOYMENT.md`
- Review the shapefile setup guide in `SHAPEFILE_SETUP.md`
- Open an issue for bugs or feature requests

## 🔄 Version History

- **v1.0.0**: Initial release with basic mapping and analytics
- **v1.1.0**: Added role-based access control
- **v1.2.0**: Enhanced startup management features
- **v1.3.0**: Improved data visualization and user experience

---

**Built with ❤️ for African Fintech Development**