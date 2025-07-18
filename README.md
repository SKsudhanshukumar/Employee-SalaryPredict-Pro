# SalaryPredict Pro - Local Installation Guide

A full-stack web application for employee salary prediction with machine learning-powered analytics.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **PostgreSQL** (Optional - app works with in-memory storage by default)

### Installation Steps

1. **Clone or Download the Project**
   ```bash
   git clone <your-repo-url>
   cd salary-predict-pro
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
   - The app will automatically open the dashboard

## 🛠 Project Structure

```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript types
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## 📊 Features

- **Salary Prediction**: ML-powered predictions using multiple algorithms
- **Interactive Dashboard**: Real-time analytics and visualizations
- **Data Upload**: CSV file processing for employee data
- **Model Comparison**: Linear Regression vs Random Forest results
- **Feature Analysis**: Understanding which factors impact salary most

## 🔧 Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm start` - Start production server

## 🗄️ Database Setup (Optional)

By default, the app uses in-memory storage. For persistent data:

1. **Install PostgreSQL**
2. **Create Database**
   ```sql
   CREATE DATABASE salary_predict;
   ```
3. **Set Environment Variable**
   ```bash
   export DATABASE_URL="postgresql://username:password@localhost:5432/salary_predict"
   ```
4. **Restart Application**
   ```bash
   npm run dev
   ```

## 📈 Using the Application

### 1. Dashboard Overview
- View key statistics and metrics
- Monitor model performance
- See data visualizations

### 2. Salary Prediction
- Fill out the prediction form with job details
- Get predictions from multiple ML models
- View confidence scores and feature importance

### 3. Data Upload
- Upload CSV files with employee data
- Automatic data validation and processing
- Real-time upload status tracking

### 4. Analytics
- Department salary comparisons
- Experience vs salary trends
- Location-based analysis

## 🤖 Machine Learning Models

The application uses simulated ML algorithms with realistic weightings:

- **Linear Regression**: Base prediction model
- **Random Forest**: Enhanced accuracy with ensemble methods
- **Features**: Experience, Location, Department, Education, Company Size

## 🔍 Technical Details

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Charts**: Recharts for data visualization
- **UI Components**: Shadcn/ui for modern interface

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
npm run dev
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists and is accessible

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure ports 5000 is available

## 🎯 Next Steps

1. **Custom Data**: Upload your own salary datasets
2. **Model Training**: Integrate with real ML frameworks
3. **Advanced Analytics**: Add more visualization types
4. **API Integration**: Connect to external salary data sources

---

**Ready to predict salaries like a pro!** 🎉