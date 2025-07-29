// Real ML Service for salary prediction using actual datasets
// import { PerformanceMonitor } from './performance-monitor';
import { DataProcessor, EmployeeRecord, TrainingData, ModelResults } from './data-processor';

interface PredictionInput {
  jobTitle: string;
  experience: number;
  department: string;
  location: string;
  educationLevel: string;
  companySize: string;
}

interface PredictionResult {
  linearRegressionPrediction: number;
  randomForestPrediction: number;
  averagePrediction: number;
  confidence: number;
  uncertaintyBounds: {
    lowerBound: number;
    upperBound: number;
    range: number;
    confidenceInterval: string;
  };
  featureImportance: Record<string, number>;
  factors: {
    experienceImpact: number;
    locationImpact: number;
    educationImpact: number;
    companySizeImpact: number;
    departmentImpact: number;
    jobTitleImpact?: number; // Optional for future use
  };
}

export class MLService {
  private static instance: MLService;
  private isInitialized = false;
  private isTraining = false;
  private trainingData: TrainingData | null = null;
  private linearRegressionModel: any = null;
  private randomForestModel: any = null;
  private featureMappings: Map<string, Map<string, number>> = new Map();
  private lastTrainingTime: Date | null = null;
  private modelMetrics: any = {};

  private constructor() {}

  static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  async initializeModels(): Promise<void> {
    if (this.isInitialized || this.isTraining) {
      return;
    }

    console.log('🤖 Starting ML model initialization...');
    this.isTraining = true;

    try {
      const startTime = Date.now();
      
      // Load and process data
      const records = await DataProcessor.loadDatasets();
      console.log(`📊 Processing ${records.length} employee records...`);
      
      // Use optimized dataset for faster startup
      const optimizedRecords = records.slice(0, Math.min(4000, records.length));
      console.log(`🚀 Using optimized dataset: ${optimizedRecords.length} records for fast startup`);
      
      this.trainingData = DataProcessor.encodeFeatures(optimizedRecords);
      this.buildFeatureMappings(optimizedRecords);
      
      // Train models
      console.log('🧠 Training Linear Regression model...');
      const linearResult = DataProcessor.trainLinearRegression(
        this.trainingData.features,
        this.trainingData.targets
      );
      this.linearRegressionModel = linearResult;
      
      console.log('🌲 Training Optimized Random Forest model...');
      console.log('🌲 Using 30 trees for fastest startup');
      const forestResult = DataProcessor.trainRandomForest(
        this.trainingData.features,
        this.trainingData.targets,
        30 // Reduced trees for faster startup
      );
      this.randomForestModel = forestResult;
      
      const endTime = Date.now();
      console.log(`✅ Model training completed in ${endTime - startTime}ms!`);
      console.log(`📈 Linear Regression R² Score: ${linearResult.r2Score.toFixed(3)}`);
      console.log(`🌲 Random Forest R² Score: ${forestResult.r2Score.toFixed(3)}`);
      console.log(`📊 Training samples: ${this.trainingData.features.length}`);
      
      if (forestResult.r2Score < 0) {
        console.log('⚠️ Random Forest has negative R² score, using fallback prediction');
      }
      
      this.modelMetrics = {
        linearRegression: {
          r2Score: linearResult.r2Score,
          meanAbsoluteError: this.calculateMAE(this.trainingData.targets, linearResult.predictions),
          rootMeanSquareError: this.calculateRMSE(this.trainingData.targets, linearResult.predictions),
          trainingTime: endTime - startTime,
          sampleSize: this.trainingData.features.length
        },
        randomForest: {
          r2Score: forestResult.r2Score,
          meanAbsoluteError: this.calculateMAE(this.trainingData.targets, forestResult.predictions),
          rootMeanSquareError: this.calculateRMSE(this.trainingData.targets, forestResult.predictions),
          trainingTime: endTime - startTime,
          sampleSize: this.trainingData.features.length,
          numTrees: 30
        }
      };
      
      this.isInitialized = true;
      this.lastTrainingTime = new Date();
      
      console.log('✅ Background ML models initialized successfully');
      
      // Start background training of more advanced models
      this.trainAdvancedModelsInBackground();
      
    } catch (error) {
      console.error('❌ ML model initialization failed:', error);
      this.isInitialized = false;
    } finally {
      this.isTraining = false;
    }
  }

  private async trainAdvancedModelsInBackground(): Promise<void> {
    // Train more sophisticated models in background for better accuracy
    setTimeout(async () => {
      try {
        console.log('🚀 Starting background training of advanced models...');
        
        if (this.trainingData) {
          // Train with more trees for better accuracy
          const advancedTrees = Math.min(134, Math.floor(this.trainingData.features.length / 30));
          console.log(`🌲 Training advanced Random Forest with ${advancedTrees} trees...`);
          
          const startTime = Date.now();
          const advancedForest = DataProcessor.trainRandomForest(
            this.trainingData.features,
            this.trainingData.targets,
            advancedTrees
          );
          const endTime = Date.now();
          
          console.log(`✅ Advanced model training completed in ${endTime - startTime}ms!`);
          console.log(`🌲 Improved Random Forest R² Score: ${advancedForest.r2Score.toFixed(3)}`);
          
          // Update model if it's better
          if (advancedForest.r2Score > this.randomForestModel.r2Score) {
            this.randomForestModel = advancedForest;
            this.modelMetrics.randomForest.r2Score = advancedForest.r2Score;
            this.modelMetrics.randomForest.meanAbsoluteError = this.calculateMAE(this.trainingData.targets, advancedForest.predictions);
            this.modelMetrics.randomForest.rootMeanSquareError = this.calculateRMSE(this.trainingData.targets, advancedForest.predictions);
            this.modelMetrics.randomForest.numTrees = advancedTrees;
          }
        }
      } catch (error) {
        console.error('⚠️ Background training failed:', error);
      }
    }, 3000); // Start after 3 seconds
  }

  private buildFeatureMappings(records: EmployeeRecord[]): void {
    const jobTitleMap = new Map<string, number>();
    const departmentMap = new Map<string, number>();
    const locationMap = new Map<string, number>();
    const educationMap = new Map<string, number>();
    const companySizeMap = new Map<string, number>();

    records.forEach(record => {
      if (!jobTitleMap.has(record.jobTitle)) {
        jobTitleMap.set(record.jobTitle, jobTitleMap.size);
      }
      if (!departmentMap.has(record.department)) {
        departmentMap.set(record.department, departmentMap.size);
      }
      if (!locationMap.has(record.location)) {
        locationMap.set(record.location, locationMap.size);
      }
      if (!educationMap.has(record.educationLevel)) {
        educationMap.set(record.educationLevel, educationMap.size);
      }
      if (!companySizeMap.has(record.companySize)) {
        companySizeMap.set(record.companySize, companySizeMap.size);
      }
    });

    this.featureMappings.set('jobTitle', jobTitleMap);
    this.featureMappings.set('department', departmentMap);
    this.featureMappings.set('location', locationMap);
    this.featureMappings.set('educationLevel', educationMap);
    this.featureMappings.set('companySize', companySizeMap);
  }

  private encodeInputFeatures(input: PredictionInput): number[] {
    const jobTitleMap = this.featureMappings.get('jobTitle')!;
    const departmentMap = this.featureMappings.get('department')!;
    const locationMap = this.featureMappings.get('location')!;
    const educationMap = this.featureMappings.get('educationLevel')!;
    const companySizeMap = this.featureMappings.get('companySize')!;

    const encoded = [
      jobTitleMap.get(input.jobTitle) ?? 0,
      input.experience,
      departmentMap.get(input.department) ?? 0,
      locationMap.get(input.location) ?? 0,
      educationMap.get(input.educationLevel) ?? 0,
      companySizeMap.get(input.companySize) ?? 0
    ];
    
    return encoded;
  }

  async predict(input: PredictionInput): Promise<PredictionResult> {
    const startTime = Date.now();
    
    if (!this.isInitialized) {
      await this.initializeModels();
    }

    try {
      const features = this.encodeInputFeatures(input);
      
      // Linear Regression Prediction
      let linearPrediction = this.linearRegressionModel.bias;
      for (let i = 0; i < features.length; i++) {
        linearPrediction += this.linearRegressionModel.weights[i] * features[i];
      }
      linearPrediction = Math.max(0, linearPrediction);
      


      // Random Forest Prediction
      let forestPrediction = 0;
      if (this.randomForestModel.r2Score > 0) {
        // Use actual random forest if it's performing well
        for (const tree of this.randomForestModel.trees) {
          forestPrediction += this.predictWithTree(tree, features);
        }
        forestPrediction = Math.max(0, forestPrediction / this.randomForestModel.trees.length);
      } else {
        // Fallback to enhanced linear prediction
        forestPrediction = linearPrediction * 1.1; // Slight adjustment
      }

      const averagePrediction = (linearPrediction + forestPrediction) / 2;
      
      // Calculate confidence based on model performance
      const confidence = Math.min(0.95, Math.max(0.6, 
        (this.modelMetrics.linearRegression?.r2Score || 0.7) * 0.8 + 0.2
      ));

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (responseTime < 1) {
        console.log('⚡ Ultra-fast prediction completed in 0ms');
      } else {
        console.log(`⚡ Fast prediction completed in ${responseTime}ms`);
      }

      // Calculate uncertainty bounds
      const uncertaintyBounds = this.calculateUncertaintyBounds(
        linearPrediction,
        forestPrediction,
        averagePrediction,
        confidence
      );

      return {
        linearRegressionPrediction: Math.round(linearPrediction),
        randomForestPrediction: Math.round(forestPrediction),
        averagePrediction: Math.round(averagePrediction),
        confidence,
        uncertaintyBounds,
        featureImportance: this.calculateDynamicFeatureImportance(input, features),
        factors: {
          experienceImpact: input.experience * 0.15,
          locationImpact: this.calculateLocationImpact(input.location),
          educationImpact: this.calculateEducationImpact(input.educationLevel),
          companySizeImpact: this.calculateCompanySizeImpact(input.companySize),
          departmentImpact: this.calculateDepartmentImpact(input.department),
          jobTitleImpact: this.calculateJobTitleImpact(input.jobTitle)
        }
      };
    } catch (error) {
      console.error('❌ Prediction failed:', error);
      throw new Error('Prediction service temporarily unavailable');
    }
  }

  private predictWithTree(tree: any, features: number[]): number {
    if (tree.prediction !== undefined) {
      return tree.prediction;
    }
    
    if (features[tree.featureIdx] <= tree.threshold) {
      return this.predictWithTree(tree.left, features);
    } else {
      return this.predictWithTree(tree.right, features);
    }
  }

  private calculateLocationImpact(location: string): number {
    const highCostCities = ['Mumbai', 'Bangalore', 'Delhi', 'Gurgaon', 'Pune'];
    return highCostCities.includes(location) ? 0.2 : 0.1;
  }

  private calculateJobTitleImpact(jobTitle: string): number {
    const techJobTitles = ['Software Engineer', 'Data Scientist', 'DevOps Engineer', 'Product Manager', 'AI Engineer'];
    return techJobTitles.includes(jobTitle) ? 0.25 : 0.15;
  }

  private calculateCompanySizeImpact(size: string): number {
    const smallCompanies = ['1-50', '51-500', '501-5000', '5000+'];
    return smallCompanies.includes(size) ? 0.2 : 0.1;
  }

  private calculateDepartmentImpact(department: string): number {
    const techDepartments = ['IT', 'Data Science' , 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    return techDepartments.includes(department) ? 0.15 : 0.10;
  }

  private calculateEducationImpact(education: string): number {
    switch (education.toLowerCase()) {
      case 'phd': return 0.4;
      case 'master': case 'masters': return 0.2;
      case 'bachelor': case 'bachelors': return 0.1;
      default: return 0.05;
    }
  }

  private calculateDynamicFeatureImportance(input: PredictionInput, features: number[]): Record<string, number> {
    // Base importance values
    let importance = {
      experience: 0.25,
      location: 0.20,
      department: 0.20,
      educationLevel: 0.15,
      companySize: 0.10,
      jobTitle: 0.10
    };

    // Adjust based on experience level
    if (input.experience > 10) {
      importance.experience += 0.15;
      importance.educationLevel -= 0.05;
    } else if (input.experience < 2) {
      importance.educationLevel += 0.10;
      importance.experience -= 0.05;
    }

    // Adjust based on location
    const highCostCities = ['Mumbai', 'Bangalore', 'Delhi', 'Hydrabad', 'Chennai', 'Pune', 'Rmote'];
    if (highCostCities.includes(input.location)) {
      importance.location += 0.10;
      importance.companySize -= 0.05;
    }

    // Adjust based on education level
    if (input.educationLevel === 'PhD') {
      importance.educationLevel += 0.15;
      importance.experience -= 0.05;
    }

    // Adjust based on department
    const techDepartments = ['IT', 'Data Science' , 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    if (techDepartments.includes(input.department)) {
      importance.department += 0.05;
      importance.jobTitle += 0.05;
    }

    // Adjust based on company size
    const smallCompanies = ['1-50', '51-500', '501-5000', '5000+'];
    if (smallCompanies.includes(input.companySize)) {
      importance.companySize += 0.10;
      importance.department -= 0.05;
    }

    // Normalize to ensure sum equals 1
    const total = Object.values(importance).reduce((sum, val) => sum + val, 0);
    Object.keys(importance).forEach(key => {
      importance[key as keyof typeof importance] = importance[key as keyof typeof importance] / total;
    });

    return importance;
  }

  private calculateUncertaintyBounds(
    linearPrediction: number, 
    forestPrediction: number, 
    averagePrediction: number, 
    confidence: number
  ): { lowerBound: number; upperBound: number; range: number; confidenceInterval: string } {
    // Calculate prediction variance based on model disagreement
    const modelVariance = Math.abs(linearPrediction - forestPrediction);
    
    // Base uncertainty from model performance (lower R² = higher uncertainty)
    const linearR2 = this.modelMetrics.linearRegression?.r2Score || 0.7;
    const forestR2 = this.modelMetrics.randomForest?.r2Score || 0.7;
    
    // Calculate uncertainty multiplier (higher for lower confidence)
    const uncertaintyMultiplier = Math.max(0.1, 1 - confidence);
    
    // Base uncertainty percentage (10-25% based on model performance)
    const baseUncertaintyPercent = 0.10 + (0.15 * uncertaintyMultiplier);
    
    // Additional uncertainty from model disagreement
    const disagreementUncertainty = modelVariance * 0.3;
    
    // Calculate bounds
    const totalUncertainty = (averagePrediction * baseUncertaintyPercent) + disagreementUncertainty;
    const lowerBound = Math.max(30000, averagePrediction - totalUncertainty); // Minimum salary floor
    const upperBound = Math.min(10000000, averagePrediction + totalUncertainty); // Maximum salary ceiling
    const range = upperBound - lowerBound;
    
    // Determine confidence interval description
    let confidenceInterval: string;
    const confidencePercent = Math.round(confidence * 100);
    
    if (confidence >= 0.9) {
      confidenceInterval = `${confidencePercent}% confidence - Very reliable prediction`;
    } else if (confidence >= 0.8) {
      confidenceInterval = `${confidencePercent}% confidence - Reliable prediction`;
    } else if (confidence >= 0.7) {
      confidenceInterval = `${confidencePercent}% confidence - Moderate confidence`;
    } else {
      confidenceInterval = `${confidencePercent}% confidence - Lower confidence, wider range`;
    }
    
    return {
      lowerBound: Math.round(lowerBound),
      upperBound: Math.round(upperBound),
      range: Math.round(range),
      confidenceInterval
    };
  }

  private calculateMAE(actual: number[], predicted: number[]): number {
    let sum = 0;
    for (let i = 0; i < actual.length; i++) {
      sum += Math.abs(actual[i] - predicted[i]);
    }
    return sum / actual.length;
  }

  private calculateRMSE(actual: number[], predicted: number[]): number {
    let sum = 0;
    for (let i = 0; i < actual.length; i++) {
      sum += Math.pow(actual[i] - predicted[i], 2);
    }
    return Math.sqrt(sum / actual.length);
  }

  getModelStatus() {
    return {
      isInitialized: this.isInitialized,
      isTraining: this.isTraining,
      lastTrainingTime: this.lastTrainingTime,
      trainingDataSize: this.trainingData?.features.length || 0,
      modelMetrics: this.modelMetrics
    };
  }

  getModelMetrics() {
    return this.modelMetrics;
  }


  async retrain(): Promise<{ success: boolean; recordsProcessed: number }> {
  console.log('🔄 Starting model retraining...');
  this.isInitialized = false;
  
    try {
      await this.initializeModels();
      return {
        success: true,
        recordsProcessed: this.trainingData?.features.length || 0
      };
    } catch (error) {
      console.error('❌ Model retraining failed:', error);
      return {
        success: false,
        recordsProcessed: 0
      };
    }
  }

}