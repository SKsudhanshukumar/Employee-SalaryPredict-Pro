# 🚀 Local Deployment Guide for SalaryPredictorPro

## Quick Installation (3 Steps)

### Step 1: Download the Project
You have several options to get the project files:

**Option A: Download ZIP** (Easiest)
1. Download all project files as a ZIP archive
2. Extract to your desired folder
3. Open terminal/command prompt in that folder

**Option B: Clone Repository**
```bash
git clone <repository-url>
cd salarypredictpro
```

### Step 2: Install Requirements
Make sure you have **Node.js 18+** installed:
- Download from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version`

### Step 3: Run Setup
**For Mac/Linux:**
```bash
./setup.sh
```

**For Windows:**
```batch
setup.bat
```

**For Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Manual Setup (if scripts fail):**
```bash
npm install
npm run dev
```

## 🌐 Access Your Application

Once running, open your browser to:
**http://localhost:5000**

The application will automatically:
- Train ML models using the included datasets
- Load the interactive dashboard
- Enable real-time salary predictions

## 📁 Project Structure

Make sure you have these essential files:
```
SalaryPredictorPro/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/           # Application pages
│   │   └── lib/             # Utilities
├── server/                   # Backend Express API  
│   ├── index.ts             # Main server
│   ├── ml-service.ts        # ML algorithms
│   ├── data-processor.ts    # Data processing
│   └── *.csv                # Training datasets
├── shared/                  # Shared TypeScript types
├── package.json            # Dependencies & scripts
├── README.md               # Comprehensive documentation
├── setup.sh                # Unix/Linux installer
├── setup.bat               # Windows installer
└── DEPLOYMENT.md           # This deployment guide
```

## 🔧 What Happens During Setup

1. **Node.js Verification**: Checks for Node.js 18+ installation
2. **Dependency Installation**: Downloads all required packages (~200MB)
3. **Port Availability**: Ensures port 5000 is free for the application
4. **Dataset Validation**: Checks for training CSV files
5. **Server Launch**: Starts both frontend and backend simultaneously
6. **ML Model Training**: Automatically trains models on startup
7. **Browser Access**: App becomes available at localhost:5000

## 🎯 Features Available Locally

### Core ML Capabilities
- **Advanced Salary Predictions**: Real Linear Regression and Random Forest models
- **Multi-Dataset Training**: Processes multiple CSV files for comprehensive learning
- **Feature Engineering**: Intelligent handling of categorical and numerical data
- **Model Performance Metrics**: R², MAE, RMSE validation scores
- **Confidence Scoring**: Reliability assessment for each prediction

### Interactive Dashboard
- **Real-time Analytics**: Live charts and statistics
- **Department Comparisons**: Salary analysis across different departments
- **Experience Correlation**: Years of experience vs salary trends
- **Location Analysis**: Geographic salary variations
- **Education Impact**: How education level affects compensation

### Data Management
- **CSV Processing**: Upload and process employee datasets
- **Data Validation**: Automatic quality checks and error handling
- **Feature Importance**: Understand which factors drive salary predictions
- **Export Capabilities**: Download predictions and analysis results

## 🛠 Troubleshooting

### Port 5000 Already in Use
**Windows:**
```batch
# Find the process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Alternative: find the process first
lsof -i :5000
```

### Dependencies Fail to Install
```bash
# Clear npm cache and node_modules
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# If still failing, try with different registry
npm install --registry https://registry.npmjs.org/
```

### Node.js Version Issues
```bash
# Check current version
node --version

# Should show v18.0.0 or higher
# If not, download latest from https://nodejs.org/
```

### ML Models Not Training
- Ensure CSV files exist in `/server/` directory
- Check console logs for training progress
- Verify sufficient system memory (>2GB recommended)
- Look for file permission issues

### Database Connection Issues (PostgreSQL)
```bash
# Test PostgreSQL connection
psql -d salary_predictor_pro

# Check if service is running
# Windows: services.msc -> PostgreSQL
# Mac: brew services list | grep postgresql
# Linux: systemctl status postgresql
```

## 📞 Need Help?

### Pre-Setup Checklist
- [ ] Node.js 18+ installed and accessible via terminal
- [ ] Port 5000 is available (no other services using it)
- [ ] Sufficient disk space (>500MB for dependencies)
- [ ] Stable internet connection for package downloads

### Common Solutions
1. **"Cannot find module"**: Run `npm install` in project root
2. **"Permission denied"**: Run terminal as administrator (Windows) or use `sudo` (Mac/Linux)
3. **"EACCES" errors**: Fix npm permissions or use a Node version manager
4. **Setup script won't run**: Try manual installation steps
5. **Browser won't load**: Check if server started successfully in terminal

### Getting Support
1. Check the comprehensive troubleshooting in README.md
2. Verify all prerequisites are properly installed
3. Try the manual setup process if automated scripts fail
4. Check console logs for specific error messages

## 🎉 Success Indicators

You'll know everything is working when you see:

### Terminal Output
- ✅ "Node.js v18.x.x detected"
- ✅ "Dependencies installed successfully"
- ✅ "Port 5000 is available"
- ✅ "Training datasets found"
- 🤖 "Starting ML model training..."
- 🚀 "Server running on port 5000"

### Browser Experience
- Dashboard loads at http://localhost:5000
- Charts and statistics display properly
- Prediction form accepts input and returns results
- No console errors in browser developer tools
- ML model metrics show valid R² scores

### Performance Indicators
- Page loads in under 3 seconds
- Predictions return in under 1 second
- Charts render smoothly without lag
- File uploads process successfully

---

**🚀 Ready to revolutionize salary predictions on your local machine!** 🎯