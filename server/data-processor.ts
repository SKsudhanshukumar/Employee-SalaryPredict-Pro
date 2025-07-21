import * as fs from 'fs';
import * as path from 'path';

export interface EmployeeRecord {
  employeeId: number;
  name: string;
  age: number;
  gender: string;
  educationLevel: string;
  yearsOfExperience: number;
  department: string;
  jobRole: string;
  location: string;
  employmentType: string;
  performanceRating: number;
  certifications: number;
  salary: number;
}

export interface TrainingData {
  features: number[][];
  targets: number[];
  featureNames: string[];
}

export interface ModelResults {
  predictions: number[];
  accuracy: number;
  featureImportance: Record<string, number>;
  metrics: {
    r2Score: number;
    meanAbsoluteError: number;
    rootMeanSquareError: number;
    oobScore?: number;
    predictionVariance?: number;
    featureStability?: number;
    confidenceInterval95?: number;
  };
  weights?: number[];
  bias?: number;
  featureMeans?: number[];
  featureStds?: number[];
}

export class DataProcessor {
  static encodeFeatures(records: EmployeeRecord[]): TrainingData {
    const featureNames = [
      'age',
      'yearsOfExperience', 
      'performanceRating',
      'certifications',
      'education_bachelor',
      'education_master',
      'education_phd',
      'education_highschool',
      'gender_male',
      'gender_female', 
      'gender_other',
      'dept_engineering',
      'dept_sales',
      'dept_marketing',
      'dept_finance',
      'dept_hr',
      'dept_operations',
      'dept_datascience',
      'location_bangalore',
      'location_delhi',
      'location_mumbai',
      'location_chennai',
      'location_pune',
      'location_hyderabad',
      'location_remote',
      'employment_fulltime',
      'employment_parttime',
      'employment_contract'
    ];

    const features = records.map(record => {
      const feature: number[] = [
        record.age,
        record.yearsOfExperience,
        record.performanceRating,
        record.certifications,
        // Education encoding
        record.educationLevel === 'Bachelor' ? 1 : 0,
        record.educationLevel === 'Master' ? 1 : 0,
        record.educationLevel === 'PhD' ? 1 : 0,
        record.educationLevel === 'High School' ? 1 : 0,
        // Gender encoding
        record.gender === 'Male' ? 1 : 0,
        record.gender === 'Female' ? 1 : 0,
        record.gender === 'Other' ? 1 : 0,
        // Department encoding
        record.department === 'Engineering' || record.department === 'IT' ? 1 : 0,
        record.department === 'Sales' ? 1 : 0,
        record.department === 'Marketing' ? 1 : 0,
        record.department === 'Finance' ? 1 : 0,
        record.department === 'HR' ? 1 : 0,
        record.department === 'Operations' ? 1 : 0,
        record.department === 'Data Science' ? 1 : 0,
        // Location encoding
        record.location === 'Bangalore' ? 1 : 0,
        record.location === 'Delhi' ? 1 : 0,
        record.location === 'Mumbai' ? 1 : 0,
        record.location === 'Chennai' ? 1 : 0,
        record.location === 'Pune' ? 1 : 0,
        record.location === 'Hyderabad' ? 1 : 0,
        record.location === 'Remote' ? 1 : 0,
        // Employment type encoding
        record.employmentType === 'Full-Time' ? 1 : 0,
        record.employmentType === 'Part-Time' ? 1 : 0,
        record.employmentType === 'Contract' ? 1 : 0
      ];
      return feature;
    });

    const targets = records.map(record => record.salary);

    return { features, targets, featureNames };
  }

  static parseCSV(csvContent: string): EmployeeRecord[] {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',');
      
      try {
        return {
          employeeId: parseInt(values[0]),
          name: values[1],
          age: parseInt(values[2]),
          gender: values[3],
          educationLevel: values[4],
          yearsOfExperience: parseFloat(values[5]),
          department: values[6],
          jobRole: values[7],
          location: values[8],
          employmentType: values[9],
          performanceRating: parseFloat(values[10]),
          certifications: parseInt(values[11]),
          salary: parseFloat(values[12])
        };
      } catch (error) {
        console.warn(`Skipping invalid record at line ${index + 2}:`, error);
        return null;
      }
    }).filter(record => record !== null) as EmployeeRecord[];
  }

  static async loadDatasets(): Promise<EmployeeRecord[]> {
    const datasetPaths = [
      'server/employee_salary_dataset_1_1752865359721.csv',
      'server/employee_salary_dataset_2_1752865359722.csv',
      'server/employee_salary_dataset_3_1752865359722.csv',
      'server/employee_salary_dataset_4_1752865359722.csv'
    ];

    const allRecords: EmployeeRecord[] = [];

    for (const datasetPath of datasetPaths) {
      try {
        if (!fs.existsSync(datasetPath)) {
          console.warn(`Dataset file not found: ${datasetPath}`);
          continue;
        }
        
        const csvContent = fs.readFileSync(datasetPath, 'utf-8');
        if (!csvContent.trim()) {
          console.warn(`Dataset file is empty: ${datasetPath}`);
          continue;
        }
        
        const records = this.parseCSV(csvContent);
        allRecords.push(...records);
        console.log(`Loaded ${records.length} records from ${datasetPath}`);
      } catch (error) {
        console.warn(`Failed to load ${datasetPath}:`, error);
      }
    }

    console.log(`Total loaded records: ${allRecords.length}`);
    return allRecords;
  }

  static trainLinearRegression(data: TrainingData): ModelResults {
    const { features, targets } = data;
    const n = features.length;
    const m = features[0]?.length || 0;

    if (n === 0 || m === 0) {
      return {
        predictions: [],
        accuracy: 0,
        featureImportance: {},
        metrics: { r2Score: 0, meanAbsoluteError: 0, rootMeanSquareError: 0 }
      };
    }

    // Normalize features for better training stability
    const { normalizedFeatures, featureMeans, featureStds } = this.normalizeFeatures(features);
    
    // Add bias term (intercept)
    const X = normalizedFeatures.map(row => [1, ...row]); // Add 1 for bias
    const y = targets;
    
    // Calculate weights using normal equation: w = (X^T * X)^(-1) * X^T * y
    const XTranspose = this.transpose(X);
    const XTX = this.matrixMultiply(XTranspose, X);
    const XTXInverse = this.matrixInverse(XTX);
    const XTy = this.vectorMatrixMultiply(XTranspose, y);
    const weights = this.vectorMatrixMultiply(XTXInverse, XTy);
    
    const predictions = X.map(row => {
      const prediction = row.reduce((sum, val, idx) => sum + val * weights[idx], 0);
      return Math.max(50000, Math.min(5000000, prediction)); // Reasonable salary bounds
    });

    const metrics = this.calculateMetrics(targets, predictions);
    
    // Calculate feature importance from weights (excluding bias)
    const featureImportance: Record<string, number> = {};
    const totalImportance = weights.slice(1).reduce((sum, w) => sum + Math.abs(w), 0);
    
    data.featureNames.forEach((name, idx) => {
      if (totalImportance > 0) {
        featureImportance[name] = Math.abs(weights[idx + 1]) / totalImportance;
      } else {
        featureImportance[name] = 1 / data.featureNames.length;
      }
    });

    return {
      predictions,
      accuracy: metrics.r2Score,
      featureImportance,
      metrics,
      weights: weights.slice(1), // Exclude bias (first element)
      bias: weights[0],
      featureMeans,
      featureStds
    };
  }

  static trainRandomForest(data: TrainingData, numTrees: number = 80): ModelResults {
    const { features, targets } = data;
    
    if (features.length === 0) {
      return {
        predictions: [],
        accuracy: 0,
        featureImportance: {},
        metrics: { r2Score: 0, meanAbsoluteError: 0, rootMeanSquareError: 0 }
      };
    }

    // Enhanced hyperparameter optimization with cross-validation insights
    const datasetSize = features.length;
    const numFeatures = features[0].length;
    
    // Optimized tree count for faster training while maintaining accuracy
    const optimalNumTrees = Math.min(numTrees, Math.max(50, Math.floor(Math.sqrt(datasetSize) * 1.2)));
    
    // Balanced feature subsampling for speed and accuracy
    const baseRatio = Math.sqrt(numFeatures) / numFeatures;
    const adaptiveRatio = Math.max(0.4, Math.min(0.7, baseRatio * 1.1));
    const numFeaturesToSelect = Math.max(4, Math.floor(numFeatures * adaptiveRatio));
    
    // Optimized tree parameters for faster training
    const maxDepth = Math.min(20, Math.max(10, Math.floor(Math.log2(datasetSize)) + 3));
    const minSamplesLeaf = Math.max(3, Math.floor(datasetSize * 0.001));
    const minSamplesSplit = Math.max(8, Math.floor(datasetSize * 0.002));

    console.log(`🌲 Enhanced RF Hyperparameters: trees=${optimalNumTrees}, depth=${maxDepth}, features=${numFeaturesToSelect}/${numFeatures}, minLeaf=${minSamplesLeaf}`);

    const trees: EnhancedDecisionTree[] = [];
    const allFeatureImportance: Record<string, number>[] = [];
    const oobPredictions: number[][] = Array(features.length).fill(null).map(() => []);
    
    // Balanced stratification for speed and distribution quality
    const targetQuantiles = this.calculateTargetQuantiles(targets, 6);
    
    // Feature correlation analysis for better selection
    const featureCorrelations = this.calculateFeatureCorrelations(features, targets);
    
    // Feature importance tracking for adaptive selection
    const cumulativeFeatureImportance: Record<string, number> = {};
    data.featureNames.forEach(name => cumulativeFeatureImportance[name] = 0);

    // Train multiple decision trees with advanced techniques
    for (let i = 0; i < optimalNumTrees; i++) {
      // Use improved stratified bootstrap sampling
      const { bootstrapFeatures, bootstrapTargets, oobIndices } = 
        this.enhancedStratifiedBootstrapSample(features, targets, targetQuantiles);
      
      // Adaptive feature selection based on previous tree performance
      const selectedFeatureIndices = this.adaptiveFeatureSelection(
        features[0].length, 
        numFeaturesToSelect, 
        i, 
        optimalNumTrees,
        featureCorrelations,
        cumulativeFeatureImportance,
        data.featureNames
      );
      
      // Create tree with enhanced parameters and regularization
      const tree = new EnhancedDecisionTree(
        maxDepth, 
        minSamplesLeaf, 
        minSamplesSplit,
        0.1 // L2 regularization factor
      );
      tree.train(bootstrapFeatures, bootstrapTargets, selectedFeatureIndices, data.featureNames);
      trees.push(tree);
      
      // Update cumulative feature importance
      const treeImportance = tree.getFeatureImportance();
      Object.entries(treeImportance).forEach(([name, importance]) => {
        cumulativeFeatureImportance[name] += importance;
      });
      
      // Calculate out-of-bag predictions with validation
      for (const oobIndex of oobIndices) {
        const prediction = tree.predict(features[oobIndex]);
        if (!isNaN(prediction) && isFinite(prediction) && prediction > 0) {
          oobPredictions[oobIndex].push(prediction);
        }
      }
      
      allFeatureImportance.push(treeImportance);
    }

    // Make predictions using advanced ensemble method with confidence weighting
    const targetMean = targets.reduce((sum, val) => sum + val, 0) / targets.length;
    const targetStd = Math.sqrt(
      targets.reduce((sum, val) => sum + Math.pow(val - targetMean, 2), 0) / targets.length
    );
    
    const predictions = features.map((featureVector, index) => {
      const treePredictions = trees.map((tree, treeIndex) => {
        const prediction = tree.predict(featureVector);
        const confidence = tree.getPredictionConfidence(featureVector);
        return { prediction, confidence, treeIndex };
      });
      
      let validPredictions = treePredictions
        .filter(({ prediction, confidence }) => 
          !isNaN(prediction) && isFinite(prediction) && prediction > 0 && confidence > 0.1)
        .map(({ prediction, confidence }) => ({ prediction, confidence }));
      
      if (validPredictions.length === 0) {
        return targetMean; // fallback to mean
      }
      
      // Advanced outlier removal using modified Z-score
      if (validPredictions.length > 8) {
        const predValues = validPredictions.map(p => p.prediction);
        const median = this.calculateMedian(predValues);
        const mad = this.calculateMAD(predValues, median);
        
        if (mad > 0) {
          const threshold = 3.0; // Slightly stricter threshold
          validPredictions = validPredictions.filter(({ prediction }) => {
            const modifiedZScore = 0.6745 * (prediction - median) / mad;
            return Math.abs(modifiedZScore) < threshold;
          });
        }
        
        if (validPredictions.length === 0) {
          validPredictions = [{ prediction: median, confidence: 1.0 }];
        }
      }
      
      // Confidence-weighted ensemble prediction
      const totalConfidence = validPredictions.reduce((sum, { confidence }) => sum + confidence, 0);
      const weightedPrediction = validPredictions.reduce((sum, { prediction, confidence }) => 
        sum + prediction * (confidence / totalConfidence), 0);
      
      // Apply adaptive bounds based on data distribution
      const lowerBound = Math.max(25000, targetMean - 3.5 * targetStd);
      const upperBound = Math.min(1000000, targetMean + 3.5 * targetStd);
      
      return Math.max(lowerBound, Math.min(upperBound, weightedPrediction));
    });

    // Calculate weighted feature importance across all trees
    const featureImportance: Record<string, number> = {};
    const totalTrees = allFeatureImportance.length;
    
    data.featureNames.forEach(name => {
      const weightedImportance = allFeatureImportance.reduce((sum, treeImportance, treeIndex) => {
        const importance = treeImportance[name] || 0;
        // Weight later trees slightly more as they benefit from adaptive selection
        const weight = 1 + (treeIndex / totalTrees) * 0.2;
        return sum + importance * weight;
      }, 0);
      
      featureImportance[name] = weightedImportance / totalTrees;
    });

    // Normalize feature importance
    const totalImportance = Object.values(featureImportance).reduce((sum, val) => sum + val, 0);
    if (totalImportance > 0) {
      Object.keys(featureImportance).forEach(name => {
        featureImportance[name] /= totalImportance;
      });
    }

    // Calculate out-of-bag score for better model evaluation
    const oobScore = this.calculateOOBScore(oobPredictions, targets);
    const metrics = this.calculateMetrics(targets, predictions);
    
    // Enhanced metrics with confidence intervals
    const enhancedMetrics = this.calculateEnhancedMetrics(targets, predictions, oobPredictions);
    
    // Use OOB score as a more reliable accuracy measure if available
    const finalAccuracy = oobScore !== null ? oobScore : metrics.r2Score;

    return {
      predictions,
      accuracy: finalAccuracy,
      featureImportance,
      metrics: {
        ...metrics,
        ...enhancedMetrics,
        oobScore: oobScore || 0
      }
    };
  }

  private static normalizeFeatures(features: number[][]) {
    const n = features.length;
    const m = features[0]?.length || 0;
    
    if (n === 0 || m === 0) {
      return { normalizedFeatures: [], featureMeans: [], featureStds: [] };
    }
    
    const featureMeans = new Array(m).fill(0);
    const featureStds = new Array(m).fill(1);
    
    // Calculate means
    for (let j = 0; j < m; j++) {
      featureMeans[j] = features.reduce((sum, row) => sum + row[j], 0) / n;
    }
    
    // Calculate standard deviations
    for (let j = 0; j < m; j++) {
      const variance = features.reduce((sum, row) => sum + Math.pow(row[j] - featureMeans[j], 2), 0) / n;
      featureStds[j] = Math.sqrt(variance) || 1; // Avoid division by zero
    }
    
    // Normalize features
    const normalizedFeatures = features.map(row => 
      row.map((val, j) => (val - featureMeans[j]) / featureStds[j])
    );
    
    return { normalizedFeatures, featureMeans, featureStds };
  }

  private static randomFeatureSelection(totalFeatures: number, numToSelect: number): number[] {
    const indices = Array.from({ length: totalFeatures }, (_, i) => i);
    const selected: number[] = [];
    
    for (let i = 0; i < numToSelect && indices.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * indices.length);
      selected.push(indices.splice(randomIndex, 1)[0]);
    }
    
    return selected;
  }

  private static bootstrapSample(features: number[][], targets: number[]) {
    const n = features.length;
    const indices = Array.from({ length: n }, () => Math.floor(Math.random() * n));
    
    return {
      bootstrapFeatures: indices.map(i => features[i]),
      bootstrapTargets: indices.map(i => targets[i])
    };
  }

  private static improvedBootstrapSample(features: number[][], targets: number[]) {
    const n = features.length;
    const bootstrapIndices: number[] = [];
    const oobIndices: number[] = [];
    const selectedIndices = new Set<number>();
    
    // Generate bootstrap sample with replacement
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      bootstrapIndices.push(randomIndex);
      selectedIndices.add(randomIndex);
    }
    
    // Identify out-of-bag samples
    for (let i = 0; i < n; i++) {
      if (!selectedIndices.has(i)) {
        oobIndices.push(i);
      }
    }
    
    return {
      bootstrapFeatures: bootstrapIndices.map(i => features[i]),
      bootstrapTargets: bootstrapIndices.map(i => targets[i]),
      oobIndices
    };
  }

  private static calculateTargetQuantiles(targets: number[], numQuantiles: number): number[] {
    const sortedTargets = [...targets].sort((a, b) => a - b);
    const quantiles: number[] = [];
    
    for (let i = 1; i < numQuantiles; i++) {
      const index = Math.floor((i / numQuantiles) * sortedTargets.length);
      quantiles.push(sortedTargets[index]);
    }
    
    return quantiles;
  }

  private static stratifiedBootstrapSample(features: number[][], targets: number[], quantiles: number[]) {
    const n = features.length;
    const bootstrapIndices: number[] = [];
    const oobIndices: number[] = [];
    const selectedIndices = new Set<number>();
    
    // Assign each sample to a stratum based on target value
    const strata: number[][] = Array(quantiles.length + 1).fill(null).map(() => []);
    
    for (let i = 0; i < n; i++) {
      let stratum = 0;
      for (let j = 0; j < quantiles.length; j++) {
        if (targets[i] <= quantiles[j]) {
          stratum = j;
          break;
        }
        stratum = quantiles.length;
      }
      strata[stratum].push(i);
    }
    
    // Sample proportionally from each stratum
    for (let i = 0; i < n; i++) {
      // Choose stratum proportionally to its size
      const stratumWeights = strata.map(s => s.length);
      const totalWeight = stratumWeights.reduce((sum, w) => sum + w, 0);
      
      let randomWeight = Math.random() * totalWeight;
      let selectedStratum = 0;
      
      for (let j = 0; j < stratumWeights.length; j++) {
        randomWeight -= stratumWeights[j];
        if (randomWeight <= 0) {
          selectedStratum = j;
          break;
        }
      }
      
      // Sample from selected stratum
      if (strata[selectedStratum].length > 0) {
        const randomIndex = strata[selectedStratum][Math.floor(Math.random() * strata[selectedStratum].length)];
        bootstrapIndices.push(randomIndex);
        selectedIndices.add(randomIndex);
      }
    }
    
    // Identify out-of-bag samples
    for (let i = 0; i < n; i++) {
      if (!selectedIndices.has(i)) {
        oobIndices.push(i);
      }
    }
    
    return {
      bootstrapFeatures: bootstrapIndices.map(i => features[i]),
      bootstrapTargets: bootstrapIndices.map(i => targets[i]),
      oobIndices
    };
  }

  private static advancedFeatureSelection(totalFeatures: number, numToSelect: number, treeIndex: number, totalTrees: number): number[] {
    const indices = Array.from({ length: totalFeatures }, (_, i) => i);
    const selected: number[] = [];
    
    // Use different selection strategies for diversity
    const strategy = treeIndex % 3;
    
    if (strategy === 0) {
      // Random selection (original approach)
      for (let i = 0; i < numToSelect && indices.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * indices.length);
        selected.push(indices.splice(randomIndex, 1)[0]);
      }
    } else if (strategy === 1) {
      // Systematic selection with random start
      const step = Math.floor(totalFeatures / numToSelect);
      const start = Math.floor(Math.random() * step);
      
      for (let i = 0; i < numToSelect; i++) {
        const index = (start + i * step) % totalFeatures;
        if (!selected.includes(index)) {
          selected.push(index);
        }
      }
      
      // Fill remaining with random selection
      while (selected.length < numToSelect && selected.length < totalFeatures) {
        const randomIndex = Math.floor(Math.random() * totalFeatures);
        if (!selected.includes(randomIndex)) {
          selected.push(randomIndex);
        }
      }
    } else {
      // Clustered selection for feature interaction
      const clusterSize = Math.max(2, Math.floor(numToSelect / 3));
      const numClusters = Math.ceil(numToSelect / clusterSize);
      
      for (let cluster = 0; cluster < numClusters && selected.length < numToSelect; cluster++) {
        const clusterStart = Math.floor(Math.random() * (totalFeatures - clusterSize));
        
        for (let i = 0; i < clusterSize && selected.length < numToSelect; i++) {
          const index = (clusterStart + i) % totalFeatures;
          if (!selected.includes(index)) {
            selected.push(index);
          }
        }
      }
    }
    
    return selected.slice(0, numToSelect);
  }

  private static enhancedStratifiedBootstrapSample(features: number[][], targets: number[], quantiles: number[]) {
    const n = features.length;
    const bootstrapIndices: number[] = [];
    const oobIndices: number[] = [];
    const selectedIndices = new Set<number>();
    
    // Assign each sample to a stratum based on target value
    const strata: number[][] = Array(quantiles.length + 1).fill(null).map(() => []);
    
    for (let i = 0; i < n; i++) {
      let stratum = quantiles.length; // Default to last stratum
      for (let j = 0; j < quantiles.length; j++) {
        if (targets[i] <= quantiles[j]) {
          stratum = j;
          break;
        }
      }
      strata[stratum].push(i);
    }
    
    // Enhanced stratified sampling with variance balancing
    const targetSamplesPerStratum = strata.map(s => Math.max(1, Math.floor(n * s.length / n)));
    
    for (let stratumIdx = 0; stratumIdx < strata.length; stratumIdx++) {
      const stratum = strata[stratumIdx];
      const targetSamples = targetSamplesPerStratum[stratumIdx];
      
      // Sample with replacement from this stratum
      for (let i = 0; i < targetSamples && stratum.length > 0; i++) {
        const randomIndex = stratum[Math.floor(Math.random() * stratum.length)];
        bootstrapIndices.push(randomIndex);
        selectedIndices.add(randomIndex);
      }
    }
    
    // Fill remaining samples randomly to reach target size
    while (bootstrapIndices.length < n) {
      const randomIndex = Math.floor(Math.random() * n);
      bootstrapIndices.push(randomIndex);
      selectedIndices.add(randomIndex);
    }
    
    // Identify out-of-bag samples
    for (let i = 0; i < n; i++) {
      if (!selectedIndices.has(i)) {
        oobIndices.push(i);
      }
    }
    
    return {
      bootstrapFeatures: bootstrapIndices.map(i => features[i]),
      bootstrapTargets: bootstrapIndices.map(i => targets[i]),
      oobIndices
    };
  }

  private static calculateFeatureCorrelations(features: number[][], targets: number[]): number[] {
    const correlations: number[] = [];
    const n = features.length;
    
    if (n === 0) return correlations;
    
    const targetMean = targets.reduce((sum, val) => sum + val, 0) / n;
    const targetStd = Math.sqrt(
      targets.reduce((sum, val) => sum + Math.pow(val - targetMean, 2), 0) / n
    );
    
    for (let featureIdx = 0; featureIdx < features[0].length; featureIdx++) {
      const featureValues = features.map(row => row[featureIdx]);
      const featureMean = featureValues.reduce((sum, val) => sum + val, 0) / n;
      const featureStd = Math.sqrt(
        featureValues.reduce((sum, val) => sum + Math.pow(val - featureMean, 2), 0) / n
      );
      
      if (featureStd === 0 || targetStd === 0) {
        correlations.push(0);
        continue;
      }
      
      let correlation = 0;
      for (let i = 0; i < n; i++) {
        correlation += (featureValues[i] - featureMean) * (targets[i] - targetMean);
      }
      correlation = correlation / (n * featureStd * targetStd);
      
      correlations.push(Math.abs(correlation)); // Use absolute correlation
    }
    
    return correlations;
  }

  private static adaptiveFeatureSelection(
    totalFeatures: number, 
    numToSelect: number, 
    treeIndex: number, 
    totalTrees: number,
    featureCorrelations: number[],
    cumulativeImportance: Record<string, number>,
    featureNames: string[]
  ): number[] {
    const selected: number[] = [];
    
    // Early trees use more random selection, later trees use importance-guided selection
    const importanceWeight = Math.min(0.7, treeIndex / totalTrees);
    const randomWeight = 1 - importanceWeight;
    
    // Create feature scores combining correlation and cumulative importance
    const featureScores = Array.from({ length: totalFeatures }, (_, idx) => {
      const correlation = featureCorrelations[idx] || 0;
      const importance = cumulativeImportance[featureNames[idx]] || 0;
      const randomFactor = Math.random();
      
      return {
        index: idx,
        score: correlation * 0.4 + importance * importanceWeight + randomFactor * randomWeight
      };
    });
    
    // Sort by score and select top features with some randomness
    featureScores.sort((a, b) => b.score - a.score);
    
    // Select features with weighted probability
    const candidates = featureScores.slice(0, Math.min(totalFeatures, numToSelect * 2));
    
    while (selected.length < numToSelect && candidates.length > 0) {
      // Weighted random selection from candidates
      const weights = candidates.map((_, idx) => Math.exp(-idx * 0.3)); // Exponential decay
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      
      let randomValue = Math.random() * totalWeight;
      let selectedIdx = 0;
      
      for (let i = 0; i < weights.length; i++) {
        randomValue -= weights[i];
        if (randomValue <= 0) {
          selectedIdx = i;
          break;
        }
      }
      
      selected.push(candidates[selectedIdx].index);
      candidates.splice(selectedIdx, 1);
    }
    
    return selected;
  }

  private static calculateEnhancedMetrics(actual: number[], predicted: number[], oobPredictions: number[][]) {
    const baseMetrics = this.calculateMetrics(actual, predicted);
    
    // Calculate prediction confidence intervals
    const predictionVariances: number[] = [];
    
    for (let i = 0; i < oobPredictions.length; i++) {
      if (oobPredictions[i].length > 1) {
        const mean = oobPredictions[i].reduce((sum, val) => sum + val, 0) / oobPredictions[i].length;
        const variance = oobPredictions[i].reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / oobPredictions[i].length;
        predictionVariances.push(variance);
      }
    }
    
    const avgPredictionVariance = predictionVariances.length > 0 
      ? predictionVariances.reduce((sum, val) => sum + val, 0) / predictionVariances.length 
      : 0;
    
    // Calculate feature stability (how consistent feature importance is)
    const featureStability = this.calculateFeatureStability(oobPredictions);
    
    return {
      ...baseMetrics,
      predictionVariance: avgPredictionVariance,
      featureStability,
      confidenceInterval95: Math.sqrt(avgPredictionVariance) * 1.96
    };
  }

  private static calculateFeatureStability(oobPredictions: number[][]): number {
    // Simple stability measure based on OOB prediction consistency
    let totalStability = 0;
    let validSamples = 0;
    
    for (const predictions of oobPredictions) {
      if (predictions.length > 2) {
        const mean = predictions.reduce((sum, val) => sum + val, 0) / predictions.length;
        const variance = predictions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / predictions.length;
        const stability = mean > 0 ? 1 / (1 + variance / (mean * mean)) : 0;
        totalStability += stability;
        validSamples++;
      }
    }
    
    return validSamples > 0 ? totalStability / validSamples : 0;
  }

  private static calculateOOBScore(oobPredictions: number[][], targets: number[]): number | null {
    const oobActual: number[] = [];
    const oobPredicted: number[] = [];
    
    for (let i = 0; i < oobPredictions.length; i++) {
      if (oobPredictions[i].length > 0) {
        // Use median instead of mean for more robust OOB predictions
        const sortedPredictions = [...oobPredictions[i]].sort((a, b) => a - b);
        const medianPrediction = this.calculateMedian(sortedPredictions);
        oobActual.push(targets[i]);
        oobPredicted.push(medianPrediction);
      }
    }
    
    if (oobActual.length === 0) return null;
    
    // Calculate R² score for OOB predictions
    const actualMean = oobActual.reduce((sum, val) => sum + val, 0) / oobActual.length;
    let totalSumSquares = 0;
    let residualSumSquares = 0;
    
    for (let i = 0; i < oobActual.length; i++) {
      const error = oobActual[i] - oobPredicted[i];
      totalSumSquares += Math.pow(oobActual[i] - actualMean, 2);
      residualSumSquares += Math.pow(error, 2);
    }
    
    return totalSumSquares === 0 ? 0 : 1 - (residualSumSquares / totalSumSquares);
  }

  private static calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private static calculateMAD(values: number[], median: number): number {
    const deviations = values.map(val => Math.abs(val - median));
    return this.calculateMedian(deviations);
  }

  private static calculateMetrics(actual: number[], predicted: number[]) {
    const n = actual.length;
    if (n === 0) {
      return { r2Score: 0, meanAbsoluteError: 0, rootMeanSquareError: 0 };
    }
    
    // Remove invalid predictions
    const validPairs = actual.map((a, i) => ({ actual: a, predicted: predicted[i] }))
      .filter(pair => !isNaN(pair.actual) && !isNaN(pair.predicted) && 
                     isFinite(pair.actual) && isFinite(pair.predicted));
    
    if (validPairs.length === 0) {
      return { r2Score: 0, meanAbsoluteError: 0, rootMeanSquareError: 0 };
    }
    
    const validActual = validPairs.map(p => p.actual);
    const validPredicted = validPairs.map(p => p.predicted);
    
    const actualMean = validActual.reduce((sum, val) => sum + val, 0) / validActual.length;
    
    let totalSumSquares = 0;
    let residualSumSquares = 0;
    let absoluteErrors = 0;

    for (let i = 0; i < validActual.length; i++) {
      const error = validActual[i] - validPredicted[i];
      totalSumSquares += Math.pow(validActual[i] - actualMean, 2);
      residualSumSquares += Math.pow(error, 2);
      absoluteErrors += Math.abs(error);
    }

    const r2Score = totalSumSquares === 0 ? 0 : 1 - (residualSumSquares / totalSumSquares);
    const meanAbsoluteError = absoluteErrors / validActual.length;
    const rootMeanSquareError = Math.sqrt(residualSumSquares / validActual.length);

    // Ensure reasonable bounds
    return { 
      r2Score: Math.max(-1, Math.min(1, r2Score)), 
      meanAbsoluteError: Math.max(0, meanAbsoluteError), 
      rootMeanSquareError: Math.max(0, rootMeanSquareError) 
    };
  }

  // Matrix operations
  private static transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  private static matrixMultiply(a: number[][], b: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  private static vectorMatrixMultiply(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => 
      row.reduce((sum, val, idx) => sum + val * vector[idx], 0)
    );
  }

  private static matrixInverse(matrix: number[][]): number[][] {
    const n = matrix.length;
    if (n === 0) return [];
    
    const identity = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
    );

    // Augment matrix with identity
    const augmented = matrix.map((row, i) => [...row, ...identity[i]]);

    // Gaussian elimination
    for (let i = 0; i < n; i++) {
      // Make diagonal element 1
      const diagonal = augmented[i][i];
      if (diagonal === 0) {
        // Handle singular matrix by returning identity
        console.warn('Singular matrix encountered, returning identity matrix');
        return identity;
      }
      
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= diagonal;
      }

      // Make other elements in column 0
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }

    // Extract inverse matrix
    return augmented.map(row => row.slice(n));
  }
}

// Decision Tree Node interface
interface TreeNode {
  isLeaf: boolean;
  prediction?: number;
  featureIndex?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  samples?: number;
}

// Enhanced Decision Tree implementation for regression with regularization
class EnhancedDecisionTree {
  private root: TreeNode | null = null;
  private maxDepth: number;
  private minSamplesLeaf: number;
  private minSamplesSplit: number;
  private regularizationFactor: number;
  private featureImportance: Record<string, number> = {};
  private featureNames: string[] = [];
  private nodeCount: number = 0;

  constructor(
    maxDepth: number = 8, 
    minSamplesLeaf: number = 20, 
    minSamplesSplit: number = 40,
    regularizationFactor: number = 0.1
  ) {
    this.maxDepth = maxDepth;
    this.minSamplesLeaf = minSamplesLeaf;
    this.minSamplesSplit = minSamplesSplit;
    this.regularizationFactor = regularizationFactor;
  }

  getPredictionConfidence(featureVector: number[]): number {
    if (!this.root) return 0;
    return this.getNodeConfidence(this.root, featureVector);
  }

  private getNodeConfidence(node: TreeNode, featureVector: number[]): number {
    if (node.isLeaf) {
      // Confidence based on number of samples in leaf
      const samples = node.samples || 1;
      return Math.min(1.0, Math.log(samples + 1) / Math.log(this.minSamplesLeaf + 1));
    }
    
    if (node.featureIndex !== undefined && node.threshold !== undefined) {
      const childConfidence = featureVector[node.featureIndex] <= node.threshold
        ? (node.left ? this.getNodeConfidence(node.left, featureVector) : 0)
        : (node.right ? this.getNodeConfidence(node.right, featureVector) : 0);
      
      // Reduce confidence as we go deeper
      const depthPenalty = 0.95;
      return childConfidence * depthPenalty;
    }
    
    return 0;
  }

  train(features: number[][], targets: number[], selectedFeatureIndices: number[], featureNames: string[]) {
    this.featureNames = featureNames;
    this.featureImportance = {};
    this.nodeCount = 0;
    featureNames.forEach(name => this.featureImportance[name] = 0);
    
    this.root = this.buildTree(features, targets, selectedFeatureIndices, 0);
  }

  private buildTree(features: number[][], targets: number[], featureIndices: number[], depth: number): TreeNode {
    const n = features.length;
    this.nodeCount++;
    
    // Enhanced stopping criteria with regularization
    const complexityPenalty = this.regularizationFactor * this.nodeCount;
    const currentVariance = this.calculateVariance(targets);
    
    if (depth >= this.maxDepth || 
        n <= this.minSamplesLeaf || 
        n < this.minSamplesSplit || 
        this.shouldStop(targets) ||
        currentVariance < complexityPenalty) {
      
      // Use median for more robust leaf predictions
      const sortedTargets = [...targets].sort((a, b) => a - b);
      const medianPrediction = this.calculateMedian(sortedTargets);
      
      // Apply regularization to leaf prediction
      const targetMean = targets.reduce((sum, val) => sum + val, 0) / n;
      const regularizedPrediction = medianPrediction * (1 - this.regularizationFactor) + 
                                   targetMean * this.regularizationFactor;
      
      // Bound leaf predictions to reasonable salary ranges
      const boundedPrediction = Math.max(25000, Math.min(1000000, regularizedPrediction));
      
      return {
        isLeaf: true,
        prediction: boundedPrediction,
        samples: n
      };
    }

    // Find best split with regularization
    const bestSplit = this.findBestSplitRegularized(features, targets, featureIndices, depth);
    
    if (!bestSplit) {
      const sortedTargets = [...targets].sort((a, b) => a - b);
      const medianPrediction = this.calculateMedian(sortedTargets);
      const boundedPrediction = Math.max(25000, Math.min(1000000, medianPrediction));
      return {
        isLeaf: true,
        prediction: boundedPrediction,
        samples: n
      };
    }

    // Update feature importance with depth weighting
    if (this.featureNames[bestSplit.featureIndex]) {
      const depthWeight = 1.0 / (1.0 + depth * 0.1); // Reduce importance for deeper splits
      this.featureImportance[this.featureNames[bestSplit.featureIndex]] += bestSplit.improvement * depthWeight;
    }

    // Split data
    const { leftFeatures, leftTargets, rightFeatures, rightTargets } = 
      this.splitData(features, targets, bestSplit.featureIndex, bestSplit.threshold);

    // Recursively build subtrees
    const leftChild = this.buildTree(leftFeatures, leftTargets, featureIndices, depth + 1);
    const rightChild = this.buildTree(rightFeatures, rightTargets, featureIndices, depth + 1);

    return {
      isLeaf: false,
      featureIndex: bestSplit.featureIndex,
      threshold: bestSplit.threshold,
      left: leftChild,
      right: rightChild,
      samples: n
    };
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private shouldStop(targets: number[]): boolean {
    if (targets.length <= 1) return true;
    
    // Stop if all targets are the same (pure node)
    const first = targets[0];
    return targets.every(target => Math.abs(target - first) < 0.01);
  }

  private findBestSplitRegularized(features: number[][], targets: number[], featureIndices: number[], depth: number) {
    let bestSplit: { featureIndex: number; threshold: number; improvement: number } | null = null;
    let bestImprovement = 0.0001; // Lower minimum improvement threshold for better splits
    
    const currentVariance = this.calculateVariance(targets);
    if (currentVariance === 0) return null; // Pure node
    
    // Apply depth-based regularization to minimum improvement
    const depthPenalty = 1.0 + depth * this.regularizationFactor;
    const minImprovement = bestImprovement * depthPenalty;
    
    for (const featureIndex of featureIndices) {
      const featureValues = features.map(row => row[featureIndex]);
      const uniqueValues = Array.from(new Set(featureValues)).sort((a, b) => a - b);
      
      // Skip if not enough unique values
      if (uniqueValues.length < 2) continue;
      
      // Improved threshold selection - use more thresholds for better splits
      const maxThresholds = Math.min(25, uniqueValues.length - 1);
      const step = Math.max(1, Math.floor(uniqueValues.length / maxThresholds));
      
      for (let i = 0; i < uniqueValues.length - 1; i += step) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        
        const { leftTargets, rightTargets } = this.splitTargets(features, targets, featureIndex, threshold);
        
        // More flexible minimum samples requirement with regularization
        const minSamples = Math.max(this.minSamplesLeaf, Math.floor(targets.length * 0.015));
        if (leftTargets.length < minSamples || rightTargets.length < minSamples) continue;
        
        const leftVariance = this.calculateVariance(leftTargets);
        const rightVariance = this.calculateVariance(rightTargets);
        
        const weightedVariance = 
          (leftTargets.length * leftVariance + rightTargets.length * rightVariance) / targets.length;
        
        // Use variance reduction ratio for better split evaluation
        let improvement = (currentVariance - weightedVariance) / currentVariance;
        
        // Apply regularization penalty for complex splits
        const balancePenalty = Math.abs(leftTargets.length - rightTargets.length) / targets.length;
        improvement *= (1 - this.regularizationFactor * balancePenalty);
        
        if (improvement > Math.max(bestImprovement, minImprovement)) {
          bestImprovement = improvement;
          bestSplit = { featureIndex, threshold, improvement };
        }
      }
    }
    
    return bestSplit;
  }

  private findBestSplit(features: number[][], targets: number[], featureIndices: number[]) {
    // Fallback to non-regularized version for compatibility
    return this.findBestSplitRegularized(features, targets, featureIndices, 0);
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return variance;
  }

  private splitTargets(features: number[][], targets: number[], featureIndex: number, threshold: number) {
    const leftTargets: number[] = [];
    const rightTargets: number[] = [];
    
    for (let i = 0; i < features.length; i++) {
      if (features[i][featureIndex] <= threshold) {
        leftTargets.push(targets[i]);
      } else {
        rightTargets.push(targets[i]);
      }
    }
    
    return { leftTargets, rightTargets };
  }

  private splitData(features: number[][], targets: number[], featureIndex: number, threshold: number) {
    const leftFeatures: number[][] = [];
    const leftTargets: number[] = [];
    const rightFeatures: number[][] = [];
    const rightTargets: number[] = [];
    
    for (let i = 0; i < features.length; i++) {
      if (features[i][featureIndex] <= threshold) {
        leftFeatures.push(features[i]);
        leftTargets.push(targets[i]);
      } else {
        rightFeatures.push(features[i]);
        rightTargets.push(targets[i]);
      }
    }
    
    return { leftFeatures, leftTargets, rightFeatures, rightTargets };
  }

  predict(featureVector: number[]): number {
    if (!this.root) return 0;
    
    return this.predictNode(this.root, featureVector);
  }

  private predictNode(node: TreeNode, featureVector: number[]): number {
    if (node.isLeaf) {
      return node.prediction || 0;
    }
    
    if (node.featureIndex !== undefined && node.threshold !== undefined) {
      if (featureVector[node.featureIndex] <= node.threshold) {
        return node.left ? this.predictNode(node.left, featureVector) : 0;
      } else {
        return node.right ? this.predictNode(node.right, featureVector) : 0;
      }
    }
    
    return 0;
  }

  getFeatureImportance(): Record<string, number> {
    // Normalize feature importance
    const total = Object.values(this.featureImportance).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return this.featureImportance;
    
    const normalized: Record<string, number> = {};
    Object.entries(this.featureImportance).forEach(([name, importance]) => {
      normalized[name] = importance / total;
    });
    
    return normalized;
  }
}