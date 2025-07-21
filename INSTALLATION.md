# 🚀 Quick Installation Guide

## One-Command Setup

### Windows
```batch
setup.bat
```

### Mac/Linux
```bash
chmod +x setup.sh && ./setup.sh
```

## Manual Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the application
npm run dev

# 3. Open browser
# Navigate to http://localhost:5000
```

## Requirements

- **Node.js 18+** ([Download](https://nodejs.org/))
- **500MB+ free disk space**
- **Port 5000 available**

## What You Get

- 🤖 **Real ML Models**: Linear Regression + Random Forest
- 📊 **Interactive Dashboard**: Live analytics and charts
- 🔍 **Salary Predictions**: Instant, accurate predictions
- 📈 **Data Processing**: Multi-CSV dataset handling
- 🎯 **Feature Analysis**: Understand prediction factors

## Troubleshooting

**Port in use?**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Dependencies fail?**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Success Check

✅ Terminal shows "Server running on port 5000"  
✅ Browser loads dashboard at localhost:5000  
✅ No console errors  
✅ Predictions work instantly  

---

**Need detailed help?** See [README.md](README.md) or [DEPLOYMENT.md](DEPLOYMENT.md)