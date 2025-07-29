# SalaryPredictorPro 🎯

A sophisticated full-stack web application for employee salary prediction powered by real machine learning algorithms and comprehensive data analytics.

## ✨ Features

- **🤖 Advanced ML Models**: Real Linear Regression and Random Forest implementations
- **📊 Interactive Dashboard**: Comprehensive analytics with real-time visualizations
- **📈 Data Processing**: Handles multiple CSV datasets with intelligent feature encoding
- **🔍 Predictive Analytics**: Accurate salary predictions with confidence scores
- **📋 Feature Analysis**: Detailed insights into salary-determining factors
- **🎨 Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **⚡ Progressive Loading**: Smart loading system with step-by-step initialization
- **⌨️ Keyboard Shortcuts**: Quick navigation with Ctrl+Key combinations
- **🔄 Real-time Updates**: Auto-refreshing model metrics and performance data
- **📤 File Upload**: Drag-and-drop CSV file upload with processing status
- **🎯 Quick Actions**: Enhanced navigation panel with live model status
- **📈 Performance Monitoring**: Built-in performance tracking and optimization
- **🔧 Code Splitting**: Optimized bundle loading with lazy components

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
│   │   │   ├── ui/          # Shadcn/ui component library
│   │   │   ├── charts/      # Data visualization components
│   │   │   ├── data-upload.tsx # File upload with drag-and-drop
│   │   │   ├── enhanced-quick-actions.tsx # Navigation panel
│   │   │   ├── progressive-loader.tsx # Smart loading system
│   │   │   └── prediction.tsx # Salary prediction interface
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities and configurations
├── server/                   # Express.js backend API
│   ├── index.ts             # Main server entry point
│   ├── routes.ts            # API route definitions
│   ├── ml-service.ts        # Machine learning service
│   ├── data-processor.ts    # Data processing utilities
│   ├── performance-monitor.ts # Performance tracking system
│   ├── storage.ts           # Database abstraction layer
│   ├── vite.ts              # Vite integration for development
│   └── *.csv                # Training datasets
├── shared/                  # Shared TypeScript types
│   └── schema.ts           # Database schema and validation
├── setup.bat               # Windows setup script
├── setup.sh                # Unix/Linux setup script
├── vite.config.ts          # Vite build configuration
├── drizzle.config.ts       # Database ORM configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── components.json         # Shadcn/ui component configuration
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

## 🔌 API Endpoints

### Core ML Endpoints
- `GET /api/model-metrics` - Get current model performance metrics (R², MAE, RMSE)
- `POST /api/predict` - Make salary predictions with input validation
- `GET /api/model-status` - Check model training status and initialization

### Data Management
- `POST /api/upload-data` - Upload CSV files for model training (max 10MB)
- `GET /api/data-uploads` - List uploaded datasets with processing status
- `DELETE /api/data-uploads/:id` - Remove uploaded dataset

### Analytics & Insights
- `GET /api/analytics/salary-distribution` - Salary distribution statistics
- `GET /api/analytics/department-comparison` - Department-wise salary analysis
- `GET /api/analytics/feature-importance` - Model feature importance scores

### Performance & Monitoring
- `GET /api/performance-metrics` - System performance statistics
- `GET /api/health` - Application health check endpoint

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

## 📊 Data Format Requirements

### CSV File Structure
For optimal model training, your CSV files should contain the following columns:

```csv
salary,experience,department,location,education_level,company_size,job_title
75000,3,Engineering,San Francisco,Bachelor's,Medium,Software Engineer
95000,5,Engineering,New York,Master's,Large,Senior Developer
65000,2,Marketing,Austin,Bachelor's,Small,Marketing Specialist
```

### Required Columns
- **salary** (number): Annual salary in USD
- **experience** (number): Years of professional experience
- **department** (string): Employee department (Engineering, Sales, Marketing, HR, Finance, etc.)
- **location** (string): Work location/city
- **education_level** (string): Highest education (High School, Bachelor's, Master's, PhD)
- **company_size** (string): Organization size (Startup, Small, Medium, Large, Enterprise)

### Optional Columns
- **job_title** (string): Specific job title (for future enhancements)

### Data Quality Guidelines
- Remove rows with missing salary values
- Ensure experience values are non-negative
- Use consistent naming for departments and locations
- Salary values should be realistic (typically 20,000 - 500,000)
- File size should not exceed 10MB per upload

## 📈 Using the Application

### 1. Dashboard Overview
- **Real-time Statistics**: Live metrics from trained ML models
- **Model Performance**: R² scores, MAE, and RMSE metrics with auto-refresh
- **Data Visualizations**: Interactive charts showing salary distributions
- **Training Status**: Monitor model training progress and dataset processing
- **Progressive Loading**: Smart initialization with step-by-step progress indicators

### 2. Enhanced Navigation System
- **Quick Actions Panel**: Sticky navigation with keyboard shortcuts
- **Live Model Status**: Real-time R² scores and performance indicators
- **Keyboard Shortcuts**: Use `Ctrl+D` (Dashboard), `Ctrl+P` (Prediction), `Ctrl+A` (Analytics), `Ctrl+M` (Models), `Ctrl+U` (Upload)
- **Active Section Tracking**: Visual indicators showing current location
- **Auto-updating Metrics**: Performance data refreshes every 2 minutes

### 3. Salary Prediction Engine
- **Multi-Model Predictions**: Get estimates from both Linear Regression and Random Forest
- **Confidence Scoring**: Understand prediction reliability with uncertainty bounds
- **Feature Impact Analysis**: See how each factor influences the prediction
- **Real-time Results**: Instant predictions with detailed breakdowns
- **Interactive Forms**: User-friendly input with validation and suggestions

### 4. Data Upload & Management
- **Drag-and-Drop Interface**: Easy CSV file upload with visual feedback
- **Processing Status**: Real-time upload progress and validation
- **File Management**: View uploaded datasets with record counts and status
- **Automatic Processing**: Background model retraining with new data
- **Error Handling**: Detailed feedback for file format issues

### 5. Advanced Analytics & Visualizations
- **Comprehensive Model Comparison**: Side-by-side performance metrics
- **Interactive Charts**: Multiple visualization types (bar, line, pie, radar)
- **Department Analysis**: Salary comparisons across different departments
- **Experience Correlation**: Years of experience vs salary relationship analysis
- **Location Impact**: Geographic salary variations
- **Education Premium**: Impact of education level on compensation
- **Company Size Effects**: How organization size affects salaries
- **Feature Importance**: Visual representation of model decision factors

### 6. Performance Monitoring
- **Built-in Metrics**: Automatic performance tracking and reporting
- **Memory Usage**: Monitor application resource consumption
- **Response Times**: Track API performance and optimization opportunities
- **Model Training Times**: Benchmark ML algorithm performance
- **Cache Management**: Intelligent caching for improved response times

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
- **Drizzle ORM**: Type-safe database operations with PostgreSQL support
- **Multer**: File upload handling for CSV processing (10MB limit)
- **Express Session**: Session management with memory store
- **Performance Monitoring**: Built-in metrics collection and reporting
- **Caching System**: In-memory response caching with TTL
- **Background Processing**: Non-blocking ML model initialization

### Development Tools
- **Vite**: Lightning-fast build tool and dev server with HMR
- **ESBuild**: Ultra-fast JavaScript bundler
- **TSX**: TypeScript execution environment
- **Cross-env**: Cross-platform environment variables
- **Code Splitting**: Automatic bundle optimization with manual chunks
- **Lazy Loading**: Dynamic imports for improved initial load performance
- **Runtime Error Overlay**: Development error handling with Replit integration

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
- Check file permissions and format (CSV with headers required)
- Monitor console for training progress logs
- Verify sufficient memory for large datasets (>100MB files may require more RAM)
- Check for proper column names: `salary`, `experience`, `department`, `location`, `education_level`, `company_size`

### File Upload Problems
- Maximum file size is 10MB per upload
- Only CSV files are supported
- Ensure proper CSV format with comma separators
- Check that file contains required columns
- Monitor upload progress in the data upload section

### Performance Issues
- Clear browser cache if UI becomes unresponsive
- Check network tab for failed API requests
- Monitor memory usage in browser dev tools
- Disable browser extensions that might interfere
- Use Chrome/Firefox for best performance

### Keyboard Shortcuts Not Working
- Ensure no other applications are capturing the key combinations
- Try using `Cmd` instead of `Ctrl` on macOS
- Check that focus is on the main application window
- Refresh the page if shortcuts stop responding

## 📞 Support & Debugging

### Common Issues
1. **"Cannot find module"**: Run `npm install` to ensure all dependencies are installed
2. **"Port 5000 in use"**: Use the port killing commands above
3. **"Models not training"**: Check CSV file format and server console logs
4. **"Database errors"**: Verify PostgreSQL setup or use in-memory mode
5. **"Build failures"**: Ensure Node.js 18+ and clear npm cache
6. **"Progressive loader stuck"**: Refresh page or check network connectivity
7. **"File upload failing"**: Verify file size (<10MB) and CSV format
8. **"Keyboard shortcuts not working"**: Check browser focus and try refreshing
9. **"Charts not loading"**: Ensure JavaScript is enabled and try different browser
10. **"Performance degradation"**: Clear cache, close other tabs, check available RAM

### Debug Mode
```bash
# Enable detailed logging
DEBUG=* npm run dev

# Or check specific components
DEBUG=ml-service,data-processor npm run dev
```

## 🎯 Development Roadmap

### Recently Completed ✅
- [x] Progressive loading system with step-by-step initialization
- [x] Enhanced quick actions panel with keyboard shortcuts
- [x] Real-time model metrics with auto-refresh
- [x] Drag-and-drop file upload with processing status
- [x] Performance monitoring and caching system
- [x] Code splitting and lazy loading optimization
- [x] Comprehensive model comparison dashboard

### Immediate Enhancements
- [ ] Real-time model retraining with new data uploads
- [ ] Advanced feature selection algorithms
- [ ] Export predictions to CSV/Excel
- [ ] WebSocket integration for live updates
- [ ] Advanced error boundary with recovery options

### Future Features
- [ ] Integration with external salary APIs (Glassdoor, PayScale)
- [ ] Advanced ML models (XGBoost, Neural Networks)
- [ ] Multi-tenant support for different organizations
- [ ] Mobile-responsive design improvements
- [ ] API documentation with Swagger/OpenAPI
- [ ] User authentication and role-based access
- [ ] Data visualization customization options
- [ ] Automated model A/B testing

### Performance Optimizations
- [ ] Model caching and persistence to disk
- [ ] Database query optimization with indexing
- [ ] Service worker for offline functionality
- [ ] CDN integration for static assets
- [ ] Memory usage optimization for large datasets
- [ ] Background job processing for heavy computations

---

**🚀 Ready to revolutionize salary predictions with cutting-edge ML technology!** 🎉