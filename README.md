# African Fintech Index Dashboard

A comprehensive full-stack web application for tracking and analyzing fintech development across African countries. Built with React, TypeScript, Node.js, and MongoDB, featuring responsive design and real-time data visualization.

## 🌟 Features

### 🗺️ Interactive Mapping
- **Interactive African Map**: Visual representation of fintech development across African countries
- **Color-coded Regions**: Countries are color-coded based on their fintech index scores
- **Hover Effects**: Detailed country information on hover with custom tooltips
- **Shapefile Support**: Enhanced map with real geographic data using D3-geo
- **Responsive Design**: Optimized for all screen sizes from mobile to desktop

### 📊 Analytics & Data Visualization
- **Interactive Charts**: Multiple chart types (line, bar, pie) with Recharts
- **Score Distribution**: Donut chart showing fintech score distributions
- **Country Trends**: Time-series analysis with year-over-year comparisons
- **Comparative Analysis**: Side-by-side country comparisons with real-time data
- **Statistical Overview**: Key metrics and performance indicators
- **Country List Integration**: Filterable country selection within analytics

### 👥 Role-Based Access Control
- **Admin**: Full system access, user management, data upload, notifications
- **Editor**: Data management, startup addition, analytics access
- **Viewer**: Read access, startup addition, analytics viewing
- **Guest**: Limited public access with view-only capabilities

### 🏢 Startup Management
- **Startup Database**: Comprehensive fintech startup information
- **Add/Edit Startups**: Role-based startup management with bulk upload
- **Search & Filter**: Advanced filtering by country, sector, and keywords
- **Sector Classification**: Organized by fintech sectors (Payments, Lending, etc.)
- **Incremental Loading**: "View More" functionality showing 6 startups at a time
- **Responsive Grid**: Optimized layout for mobile, tablet, and desktop

### 📈 Data Management
- **CSV/Excel Upload**: Bulk data import functionality with validation
- **Data Validation**: Automated data quality checks and error handling
- **Year-based Filtering**: Multi-year data analysis with global year selection
- **Export Capabilities**: Data export in CSV format
- **Real-time Updates**: Live data synchronization across components

### 📰 News Integration
- **Finance News**: Latest fintech developments from NewsAPI.org
- **Auto-refresh**: Hourly updates with manual refresh option
- **Responsive Cards**: Mobile-optimized news display
- **Error Handling**: Graceful fallbacks for network issues

### 🔔 Admin Notifications
- **User Registration Alerts**: Real-time notifications for new user registrations
- **Email Notifications**: Automated email alerts to admin users
- **Unverified Users**: Easy management of pending user verifications
- **Polling System**: Automatic updates every 60 seconds

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized building
- **Tailwind CSS** for responsive styling and utility classes
- **React Router DOM** for client-side navigation
- **Recharts** for interactive data visualization
- **D3-geo** for advanced geographic mapping
- **Lucide React** for modern iconography
- **Responsive Design**: Mobile-first approach with breakpoint optimization

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for type safety and better development experience
- **MongoDB** with Mongoose ODM for data modeling
- **JWT** for secure authentication and session management
- **Role-based middleware** for granular access control
- **Nodemailer** for email notifications
- **CORS** configuration for cross-origin requests

### Key Technologies
- **Shapefile Processing**: Geographic data handling with shpjs
- **Data Visualization**: Interactive charts and maps with real-time updates
- **Real-time Updates**: Live data synchronization across components
- **Responsive Design**: Mobile-first approach with comprehensive breakpoints
- **Email Integration**: Automated notification system
- **File Upload**: Support for CSV, Excel, and JSON formats

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Telesphore-Uwabera/African-Fintech-Index.git
   cd African-Fintech-Index
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
   JWT_SECRET=your-secret-key-here
   PORT=5000
   NODE_ENV=development
   
   # Frontend .env
   VITE_API_URL=http://localhost:5000/api
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

## 🌐 Live Deployment

### Production URLs
- **Frontend**: https://africanfintechindex.netlify.app
- **Backend**: https://african-fintech-backend.azurewebsites.net

### CI/CD Pipeline
- **GitHub Actions**: Automated deployment workflows
- **Netlify**: Frontend hosting with automatic builds
- **Azure App Service**: Backend hosting with Node.js support
- **MongoDB Atlas**: Cloud database hosting

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

### Admin User Credentials

After creating the admin user, sign in with:
- **Email**: admin@africanfintech.com (or chosen email)
- **Password**: secure-password-here

### Admin Capabilities

Once logged in as admin, you can:
- ✅ Manage all users (verify, edit, delete, view profiles)
- ✅ Upload and manage data files (CSV, Excel, JSON)
- ✅ Access all analytics and reports
- ✅ Manage fintech startups with bulk upload
- ✅ View system statistics and user activity
- ✅ Receive real-time notifications for new registrations
- ✅ Configure application settings

## 📁 Project Structure

```
African-Fintech-Index/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── InteractiveChart.tsx    # Main analytics component
│   │   │   ├── CountryTable.tsx        # Responsive data table
│   │   │   ├── FintechStartups.tsx     # Startup management
│   │   │   ├── FinanceNews.tsx         # News integration
│   │   │   ├── AdminNotifications.tsx  # Admin notification system
│   │   │   ├── Footer.tsx              # Responsive footer
│   │   │   └── ...                    # Other components
│   │   ├── pages/          # Page components
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
├── .github/workflows/      # CI/CD pipelines
├── public/                  # Public assets
└── README.md
```

## 🔐 Authentication & Roles

### User Roles
- **Admin**: Full system access including user management and notifications
- **Editor**: Data management and content creation
- **Viewer**: Read access with startup addition capabilities
- **Guest**: Limited public access

### Registration Process
1. Users register with email and role selection
2. Admin verification required for account activation
3. Email notifications sent to admin users for new registrations
4. JWT tokens for session management
5. Role-based route protection

## 🗺️ Map Features

### Geographic Data
- **Natural Earth Data**: High-quality geographic boundaries
- **Shapefile Support**: Professional-grade mapping with D3-geo
- **Country Coverage**: All African countries included
- **Interactive Elements**: Hover, click, and zoom functionality
- **Custom Tooltips**: Detailed country information on hover

### Color Coding
- **High (80+)**: Green - Advanced fintech development
- **Medium (60-79)**: Yellow - Moderate fintech development
- **Low (40-59)**: Red - Limited fintech development
- **Very Low (<40)**: Gray - Minimal fintech development

## 📊 Data Management

### Supported Formats
- CSV files with automatic parsing
- Excel spreadsheets (.xlsx) with xlsx library
- JSON data with validation

### Data Validation
- Automatic format detection
- Required field validation
- Data type checking
- Duplicate prevention
- Error handling and user feedback

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
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Error Handling**: Comprehensive error management

## 🌐 Deployment

### Local Deployment
See `LOCAL_DEPLOYMENT.md` for detailed local setup instructions.

### Production Deployment
1. **Frontend**: Automated deployment via Netlify
   - Build the frontend: `npm run build`
   - Connected to GitHub repository
   - Automatic builds on push to main branch

2. **Backend**: Automated deployment via Azure App Service
   - Connected to GitHub repository
   - Automatic builds and deployments
   - Environment variables configured in Azure

3. **Database**: MongoDB Atlas
   - Cloud-hosted MongoDB
   - Automated backups and monitoring

## 📈 Key Metrics

The dashboard tracks various fintech development indicators:
- **Literacy Rate**: Educational foundation and financial literacy
- **Digital Infrastructure**: Technology readiness and connectivity
- **Investment**: Financial backing and funding availability
- **Fintech Companies**: Market presence and startup ecosystem
- **Final Score**: Composite fintech index calculation
- **Year-over-Year Change**: Growth tracking and trends

## 🎨 Responsive Design

### Mobile Optimization
- **Mobile-first approach**: Designed for mobile devices first
- **Touch-friendly**: Optimized touch targets and interactions
- **Responsive tables**: Horizontal scrolling for data tables
- **Adaptive layouts**: Grid systems that work on all screen sizes

### Breakpoint System
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (sm to lg)
- **Desktop**: > 1024px (lg+)

### Component Responsiveness
- **Stats Cards**: Stacked on mobile, grid on larger screens
- **Charts**: Responsive sizing with proper aspect ratios
- **Navigation**: Collapsible sidebar on mobile
- **Forms**: Responsive grid layouts
- **Footer**: Optimized for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with responsive design in mind
4. Add tests if applicable
5. Ensure mobile compatibility
6. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the documentation in `LOCAL_DEPLOYMENT.md`
- Review the shapefile setup guide in `SHAPEFILE_SETUP.md`
- Open an issue for bugs or feature requests
- Check deployment status in GitHub Actions

## 🔄 Version History

- **v1.0.0**: Initial release with basic mapping and analytics
- **v1.1.0**: Added role-based access control
- **v1.2.0**: Enhanced startup management features
- **v1.3.0**: Improved data visualization and user experience
- **v1.4.0**: Added responsive design and mobile optimization
- **v1.5.0**: Enhanced admin notifications and email integration
- **v1.6.0**: Improved analytics with country list integration
- **v1.7.0**: Comprehensive responsive design overhaul

## 🚀 Recent Updates

### Responsive Design Improvements
- ✅ Mobile-optimized dashboard layout
- ✅ Responsive table design with horizontal scrolling
- ✅ Adaptive chart sizing for all screen sizes
- ✅ Touch-friendly navigation and interactions
- ✅ Optimized footer layout for mobile devices

### New Features
- ✅ Admin notification system for new user registrations
- ✅ Email integration with Nodemailer
- ✅ Enhanced analytics with country list integration
- ✅ Improved startup management with incremental loading
- ✅ Real-time news integration with error handling

### Performance Enhancements
- ✅ Optimized build process with Vite
- ✅ Improved loading states and error handling
- ✅ Better data fetching with proper error boundaries
- ✅ Enhanced user experience with smooth transitions

---

**Built with ❤️ for African Fintech Development**

*Partnership between Carnegie Mellon University, Carnegie Mellon Africa, and University of the Witwatersrand*