# SalaryPredictorPro 🎯

A sophisticated full-stack web application for employee salary prediction powered by real machine learning algorithms and comprehensive data analytics.

## ✨ Features

- **🤖 Advanced ML Models**: Real Linear Regression and Random Forest implementations
- **📊 Interactive Dashboard**: Comprehensive analytics with real-time visualizations
- **📈 Data Processing**: Handles multiple CSV datasets with intelligent feature encoding
- **🔍 Predictive Analytics**: Accurate salary predictions with confidence scores
- **📋 Feature Analysis**: Detailed insights into salary-determining factors
- **🎨 Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **PostgreSQL** (Optional - app works with in-memory storage by default)

### Automated Setup

**Windows Users:**
```batch
setup.bat
```

**Mac/Linux Users:**
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Installation

1. **Clone or Download the Project**
   ```bash
   git clone <your-repo-url>
   cd SalaryPredictorPro
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Application**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:5000`
   - The dashboard will load automatically with pre-trained models

## 🛠 Project Structure

```
SalaryPredictorPro/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities and configurations
├── server/                   # Express.js backend API
│   ├── index.ts             # Main server entry point
│   ├── routes.ts            # API route definitions
│   ├── ml-service.ts        # Machine learning service
│   ├── data-processor.ts    # Data processing utilities
│   └── *.csv                # Training datasets
├── shared/                  # Shared TypeScript types
├── setup.bat               # Windows setup script
├── setup.sh                # Unix/Linux setup script
├── package.json            # Dependencies and scripts
└── README.md               # This documentation
```

## 🎯 Core Capabilities

### Machine Learning Engine
- **Real Algorithm Implementation**: Actual Linear Regression and Random Forest models
- **Multi-Dataset Training**: Processes multiple CSV files for comprehensive training
- **Feature Engineering**: Intelligent encoding of categorical variables
- **Model Validation**: Cross-validation with performance metrics (R², MAE, RMSE)
- **Confidence Scoring**: Prediction reliability assessment

### Data Analytics
- **Interactive Visualizations**: Charts powered by Recharts library
- **Statistical Analysis**: Comprehensive salary distribution analysis
- **Feature Importance**: Understanding which factors drive salary predictions
- **Department Comparisons**: Cross-departmental salary insights
- **Experience Correlation**: Years of experience vs salary trends

## 🔧 Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production deployment
- `npm start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes (if using PostgreSQL)

## 🗄️ Database Configuration

### Default: In-Memory Storage
The application works out-of-the-box with in-memory storage - no database setup required!

### Optional: PostgreSQL Integration
For persistent data storage and enhanced performance:

1. **Install PostgreSQL**
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Ensure PostgreSQL service is running

2. **Create Database**
   ```sql
   CREATE DATABASE salary_predictor_pro;
   ```

3. **Configure Environment**
   ```bash
   # Create .env file in project root
   DATABASE_URL="postgresql://username:password@localhost:5432/salary_predictor_pro"
   ```

4. **Initialize Schema**
   ```bash
   npm run db:push
   ```

5. **Restart Application**
   ```bash
   npm run dev
   ```

## 📈 Using the Application

### 1. Dashboard Overview
- **Real-time Statistics**: Live metrics from trained ML models
- **Model Performance**: R² scores, MAE, and RMSE metrics
- **Data Visualizations**: Interactive charts showing salary distributions
- **Training Status**: Monitor model training progress and dataset processing

### 2. Salary Prediction Engine
- **Multi-Model Predictions**: Get estimates from both Linear Regression and Random Forest
- **Confidence Scoring**: Understand prediction reliability
- **Feature Impact Analysis**: See how each factor influences the prediction
- **Real-time Results**: Instant predictions with detailed breakdowns

### 3. Data Processing Pipeline
- **Multi-Dataset Support**: Automatically processes multiple CSV files
- **Intelligent Feature Encoding**: Handles categorical variables (departments, locations, education)
- **Data Validation**: Ensures data quality and consistency
- **Training Data Management**: Efficient handling of large employee datasets

### 4. Advanced Analytics
- **Department Analysis**: Salary comparisons across different departments
- **Experience Correlation**: Years of experience vs salary relationship analysis
- **Location Impact**: Geographic salary variations
- **Education Premium**: Impact of education level on compensation
- **Company Size Effects**: How organization size affects salaries

## 🤖 Machine Learning Implementation

### Real Algorithm Implementation
- **Linear Regression**: Implemented with gradient descent optimization
- **Random Forest**: Ensemble method with multiple decision trees
- **Feature Engineering**: Categorical encoding, normalization, and scaling
- **Cross-Validation**: 80/20 train-test split with performance validation

### Supported Features
- **Years of Experience**: Continuous numerical feature
- **Department**: Categorical (Engineering, Sales, Marketing, HR, Finance, etc.)
- **Location**: Categorical (various cities and regions)
- **Education Level**: Ordinal (High School, Bachelor's, Master's, PhD)
- **Company Size**: Categorical (Startup, Small, Medium, Large, Enterprise)

## 🔍 Technical Stack

### Frontend Architecture
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Shadcn/ui**: High-quality, accessible UI component library
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Powerful data fetching and caching
- **Recharts**: Responsive chart library for data visualization
- **Framer Motion**: Smooth animations and transitions

### Backend Architecture
- **Express.js**: Fast, minimalist web framework
- **TypeScript**: Type-safe server-side development
- **Drizzle ORM**: Type-safe database operations
- **Multer**: File upload handling for CSV processing
- **Express Session**: Session management
- **WebSocket**: Real-time communication capabilities

### Development Tools
- **Vite**: Lightning-fast build tool and dev server
- **ESBuild**: Ultra-fast JavaScript bundler
- **TSX**: TypeScript execution environment
- **Cross-env**: Cross-platform environment variables

## 🚨 Troubleshooting

### Port Already in Use
**Windows:**
```batch
# Find and kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

**Mac/Linux:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
npm run dev
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Node.js Version Issues
```bash
# Check current version
node --version

# Should be 18.0.0 or higher
# Update from https://nodejs.org/
```

### Database Connection (PostgreSQL)
- Ensure PostgreSQL service is running
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
- Check database exists and user has proper permissions
- Test connection: `psql -d salary_predictor_pro`

### Model Training Issues
- Ensure CSV files are present in `/server/` directory
- Check file permissions and format
- Monitor console for training progress logs
- Verify sufficient memory for large datasets

## 📞 Support & Debugging

### Common Issues
1. **"Cannot find module"**: Run `npm install` to ensure all dependencies are installed
2. **"Port 5000 in use"**: Use the port killing commands above
3. **"Models not training"**: Check CSV file format and server console logs
4. **"Database errors"**: Verify PostgreSQL setup or use in-memory mode
5. **"Build failures"**: Ensure Node.js 18+ and clear npm cache

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* npm run dev

# Or check specific components
DEBUG=ml-service,data-processor npm run dev
```

## 🎯 Development Roadmap

### Immediate Enhancements
- [ ] Real-time model retraining with new data uploads
- [ ] Advanced feature selection algorithms
- [ ] Model performance comparison dashboard
- [ ] Export predictions to CSV/Excel

### Future Features
- [ ] Integration with external salary APIs (Glassdoor, PayScale)
- [ ] Advanced ML models (XGBoost, Neural Networks)
- [ ] Multi-tenant support for different organizations
- [ ] Mobile-responsive design improvements
- [ ] API documentation with Swagger/OpenAPI

### Performance Optimizations
- [ ] Model caching and persistence
- [ ] Database query optimization
- [ ] Frontend code splitting
- [ ] CDN integration for static assets

---

**🚀 Ready to revolutionize salary predictions with cutting-edge ML technology!** 🎉