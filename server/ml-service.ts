// ML Service for salary prediction
// This simulates ML model predictions - in production, this would integrate with Python ML models

export interface PredictionResult {
  linearRegressionPrediction: number;
  randomForestPrediction: number;
  confidence: number;
  featureImportance: Record<string, number>;
}

export interface ModelMetrics {
  r2Score: number;
  meanAbsoluteError: number;
  rootMeanSquareError: number;
}

export class MLService {
  // Simulate model predictions based on input features
  static predictSalary(input: {
    jobTitle: string;
    experience: number;
    department: string;
    location: string;
    educationLevel: string;
    companySize: string;
  }): PredictionResult {
    // Base salary calculation using simplified feature weights
    let baseSalary = 50000;
    
    // Experience factor (most important)
    baseSalary += input.experience * 4000;
    
    // Department factor
    const deptMultipliers: Record<string, number> = {
      'Engineering': 1.4,
      'Sales': 1.1,
      'Marketing': 1.05,
      'Finance': 1.15,
      'HR': 0.95
    };
    baseSalary *= (deptMultipliers[input.department] || 1.0);
    
    // Location factor
    const locationMultipliers: Record<string, number> = {
      'San Francisco': 1.3,
      'New York': 1.25,
      'Los Angeles': 1.15,
      'Chicago': 1.05,
      'Remote': 1.1
    };
    baseSalary *= (locationMultipliers[input.location] || 1.0);
    
    // Education factor
    const educationMultipliers: Record<string, number> = {
      'PhD': 1.2,
      "Master's": 1.15,
      "Bachelor's": 1.0,
      'Associate': 0.9,
      'High School': 0.8
    };
    baseSalary *= (educationMultipliers[input.educationLevel] || 1.0);
    
    // Company size factor
    const companySizeMultipliers: Record<string, number> = {
      'Startup (1-50)': 0.9,
      'Medium (51-500)': 1.0,
      'Large (501-5000)': 1.1,
      'Enterprise (5000+)': 1.15
    };
    baseSalary *= (companySizeMultipliers[input.companySize] || 1.0);
    
    // Add some variation between models
    const linearRegression = Math.round(baseSalary * (0.95 + Math.random() * 0.1));
    const randomForest = Math.round(baseSalary * (0.98 + Math.random() * 0.04));
    
    // Calculate confidence based on experience and other factors
    const confidence = Math.min(95, 75 + input.experience * 2);
    
    // Feature importance (simplified)
    const featureImportance = {
      experience: 0.35,
      location: 0.25,
      department: 0.20,
      education: 0.12,
      companySize: 0.08
    };
    
    return {
      linearRegressionPrediction: linearRegression,
      randomForestPrediction: randomForest,
      confidence: confidence,
      featureImportance
    };
  }
  
  static getModelMetrics(): { linearRegression: ModelMetrics; randomForest: ModelMetrics } {
    return {
      linearRegression: {
        r2Score: 0.947,
        meanAbsoluteError: 3420,
        rootMeanSquareError: 4850
      },
      randomForest: {
        r2Score: 0.968,
        meanAbsoluteError: 2780,
        rootMeanSquareError: 3920
      }
    };
  }
  
  // Simulate training data processing
  static async processTrainingData(data: any[]): Promise<{ success: boolean; recordsProcessed: number; message: string }> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Validate data format
    const validRecords = data.filter(record => 
      record.jobTitle && 
      typeof record.experience === 'number' && 
      record.department && 
      record.location && 
      record.educationLevel && 
      record.companySize &&
      typeof record.actualSalary === 'number'
    );
    
    if (validRecords.length === 0) {
      return {
        success: false,
        recordsProcessed: 0,
        message: 'No valid records found in uploaded data'
      };
    }
    
    return {
      success: true,
      recordsProcessed: validRecords.length,
      message: `Successfully processed ${validRecords.length} records`
    };
  }
}
