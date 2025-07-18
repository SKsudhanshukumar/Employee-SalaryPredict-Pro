# 🚀 Local Deployment Guide for SalaryPredict Pro

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
cd salary-predict-pro
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

**Manual Setup:**
```bash
npm install
npm run dev
```

## 🌐 Access Your Application

Once running, open your browser to:
**http://localhost:5000**

## 📁 Project Files You Need

Make sure you have these essential files:
```
salary-predict-pro/
├── client/           # Frontend React app
├── server/           # Backend Express API  
├── shared/           # Shared types
├── package.json      # Dependencies
├── README.md         # Detailed instructions
├── setup.sh          # Mac/Linux installer
└── setup.bat         # Windows installer
```

## 🔧 What Happens During Setup

1. **Dependency Installation**: Downloads all required packages
2. **Port Check**: Ensures port 5000 is available
3. **Server Start**: Launches both frontend and backend
4. **Browser Access**: App available at localhost:5000

## 🎯 Features Available Locally

- **Real-time Salary Predictions**: ML-powered salary estimates
- **Interactive Dashboard**: Charts and analytics
- **Data Upload**: Process CSV files with employee data
- **Model Comparison**: Linear Regression vs Random Forest
- **Feature Analysis**: See what factors matter most

## 🛠 Troubleshooting

**Port 5000 in use:**
```bash
# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Windows - Use Task Manager to end Node.js processes
```

**Dependencies fail to install:**
```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm install
```

**Node.js not found:**
- Install Node.js 18+ from nodejs.org
- Restart terminal after installation

## 📞 Need Help?

1. Check that Node.js 18+ is installed
2. Ensure port 5000 is available
3. Try manual setup if scripts fail
4. Restart terminal/command prompt

## 🎉 Success Indicators

You'll know it's working when you see:
- "Server running on port 5000" in terminal
- Dashboard loads in browser at localhost:5000
- No error messages in console

---

**Ready to predict salaries on your local machine!** 🎯