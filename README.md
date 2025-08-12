# African Fintech Index

A comprehensive research platform tracking financial technology development across Africa, providing insights into digital innovation, investment flows, and regulatory landscapes.

## 🎯 Project Overview

The African Fintech Index is a collaborative research initiative between:
- **Carnegie Mellon University** (Pittsburgh, Pennsylvania, USA)
- **Carnegie Mellon Africa** (Kigali, Rwanda)
- **University of the Witwatersrand** (Johannesburg, South Africa)

Proudly funded by the **AFRETEC NETWORK**.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (for backend)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd African-Fintech-Index-main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Frontend (.env)
   VITE_API_URL=http://localhost:5000/api
   
   # Backend (.env)
   MONGODB_URI=mongodb://localhost:27017/african-fintech-index
   JWT_SECRET=ntakirpetero-secret-key
EMAIL_USER=ntakirpetero@gmail.com
EMAIL_PASS=ntakirpetero-app-password
   ```

4. **Start the development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open the browser:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 🗺️ Map Features

### Interactive African Countries Map
- **Color-coded by fintech index scores**
- **Hover effects with country information**
- **Click interactions**
- **Responsive design**
- **Shapefile data integration**

### Country Coverage
- Nigeria (NG)
- South Africa (ZA)
- Kenya (KE)
- Egypt (EG)
- Ghana (GH)
- Morocco (MA)
- Ethiopia (ET)
- Tanzania (TZ)

### Score Categories
- 🟢 **Green: High (80+)** - Excellent fintech development
- 🟡 **Yellow: Medium (60-79)** - Good fintech development
- 🔴 **Red: Low (40-59)** - Moderate fintech development
- ⚫ **Gray: Very Low (<40)** - Limited fintech development

## 📊 Sample Data

The application includes sample data for 8 African countries:

| Country | Fintech Score | Population | GDP | Fintech Companies |
|---------|---------------|------------|-----|-------------------|
| South Africa | 75.7 | 59.3M | $301.9B | 490 |
| Kenya | 61.0 | 53.8M | $98.5B | 180 |
| Morocco | 62.7 | 36.9M | $119.7B | 85 |
| Egypt | 55.3 | 102.3M | $363.1B | 120 |
| Ghana | 53.7 | 31.1M | $72.4B | 90 |
| Nigeria | 47.3 | 206.1M | $448.1B | 250 |
| Tanzania | 46.0 | 59.7M | $63.2B | 60 |
| Ethiopia | 35.7 | 115.0M | $107.5B | 45 |

## 🔧 Shapefile Integration

### Current Status
- **Files Present:** ✅ All shapefile components are in `frontend/public/data/`
- **Processing:** 🔄 Using simplified geometry as fallback
- **Next Step:** 📦 Install shapefile parsing library

### To Enable Full Shapefile Parsing

1. **Install required dependencies:**
   ```bash
   cd frontend
   npm install shapefile d3-geo d3-projection @types/d3-geo
   ```

2. **The components will automatically:**
   - Load the actual shapefile data
   - Parse country geometries
   - Filter for African countries
   - Render accurate country boundaries

### Shapefile Setup

1. **Place shapefile in the correct directory:**
   ```
   frontend/public/data/
   ├── ne_110m_admin_0_countries.shp    ✅ Shapefile geometry
   ├── ne_110m_admin_0_countries.dbf    ✅ Shapefile attributes
   ├── ne_110m_admin_0_countries.shx    ✅ Shapefile index
   └── ne_110m_admin_0_countries.prj    ✅ Shapefile projection
   ```

2. **Update the component path:**
   ```tsx
   <AfricaMapComplete
     data={countryData}
     onCountryHover={handleCountryHover}
     hoveredCountry={hoveredCountry}
     shapefilePath="/data/ne_110m_admin_0_countries.shp"
   />
   ```

### Country Code Mapping

The shapefile uses ISO country codes. Make sure the `CountryData` objects have matching `id` fields:

- Nigeria: `NG`
- South Africa: `ZA`
- Kenya: `KE`
- Egypt: `EG`
- Ghana: `GH`
- Morocco: `MA`
- Ethiopia: `ET`
- Tanzania: `TZ`

## 🏗️ Project Structure

```
African-Fintech-Index-main/
├── frontend/                          # React frontend application
│   ├── public/
│   │   ├── logos/                     # University and partner logos
│   │   │   ├── cmu-africa-logo.png
│   │   │   ├── seal-4c-600x600-min.jpg
│   │   │   ├── FintechHubLogo.png
│   │   │   └── 06-18-afretec.png
│   │   └── data/                      # Shapefile data
│   ├── src/
│   │   ├── components/                # React components
│   │   │   ├── AfricaMapComplete.tsx  # Enhanced map component
│   │   │   ├── InteractiveChart.tsx   # Analytics charts
│   │   │   ├── CountryTable.tsx       # Country rankings
│   │   │   ├── FintechStartups.tsx    # Startup directory
│   │   │   └── Footer.tsx             # Footer with real logos
│   │   ├── pages/                     # Page components
│   │   ├── types/                     # TypeScript interfaces
│   │   └── utils/                     # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── backend/                           # Node.js backend API
│   ├── src/
│   │   ├── routes/                    # API endpoints
│   │   ├── models/                    # MongoDB models
│   │   └── middleware/                # Authentication & validation
│   ├── package.json
│   └── server.js
├── netlify.toml                       # Netlify deployment config
├── package.json                       # Root package.json
└── README.md                          # This file
```

## 🎨 Features

### Interactive Analytics
- **Country Trends:** Line charts showing fintech development over time
- **Country Comparison:** Horizontal stacked bar charts with score breakdowns
- **Score Distribution:** Pie charts showing score ranges

### Fintech Startups Directory
- **Search & Filter:** By country, sector, and keywords
- **Multiple Sectors:** Support for startups with multiple business sectors
- **Bulk Upload:** Excel/CSV import functionality
- **Real-time Data:** Live updates from backend

### User Management
- **Role-based Access:** Admin, Editor, Viewer roles
- **User Verification:** Email-based verification system
- **Admin Notifications:** Real-time alerts for new registrations

### Responsive Design
- **Mobile First:** Optimized for all screen sizes
- **Modern UI:** Clean, professional interface
- **Accessibility:** Proper contrast and interactive elements

## 🚀 Deployment

### Netlify (Frontend)
1. Connect the GitHub repository
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/dist`
4. Deploy automatically on push to main branch

### Railway/Heroku (Backend)
1. Connect the GitHub repository
2. Set environment variables
3. Deploy automatically on push to main branch

## 🔧 Development

### Available Scripts

```bash
# Root directory
npm run dev          # Start both frontend and backend
npm run build        # Build both applications
npm run start        # Start production servers

# Frontend only
cd frontend
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend only
cd backend
npm run dev          # Start with nodemon
npm run start        # Start production server
npm run test         # Run tests
```

### Code Quality
- **TypeScript:** Full type safety
- **ESLint:** Code linting and formatting
- **Prettier:** Consistent code style
- **Husky:** Pre-commit hooks

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify/:token` - Email verification

### Data
- `GET /api/country-data` - Country fintech data
- `GET /api/country-data/years` - Available years
- `GET /api/startups` - Fintech startups
- `POST /api/startups/bulk` - Bulk upload startups

### Users
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/:id` - Update user (admin only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make the changes
4. Commit: `git commit -m 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **AFRETEC NETWORK** for funding and support
- **Carnegie Mellon University** for research collaboration
- **University of the Witwatersrand** for African expertise
- **Open Source Community** for tools and libraries

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Ready to explore the Africa Fintech Index! 🗺️✨**