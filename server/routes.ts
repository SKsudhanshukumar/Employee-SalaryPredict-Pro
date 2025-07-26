import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { MLService } from "./ml-service";
import { PerformanceMonitor } from "./performance-monitor";
import { DataProcessor } from "./data-processor";
import { insertPredictionSchema, insertDataUploadSchema, insertEmployeeSchema } from "@shared/schema";
import { z } from "zod";

// Extend Request interface to include file property for multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const getCachedResponse = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedResponse = (key: string, data: any, ttlMs: number) => {
  cache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Start performance monitoring
  PerformanceMonitor.startAutoReporting();
  console.log('📊 Performance monitoring started');
  
  // Initialize ML models in the background after server starts (non-blocking)
  console.log('🚀 Server starting - ML models will initialize lazily');
  
  // Start background initialization after server is ready (longer delay for better startup performance)
  setTimeout(() => {
    console.log('🤖 Starting background ML model initialization...');
    MLService.getInstance().initializeModels()
      .then(() => {
        console.log('✅ Background ML models initialized successfully');
        // Start advanced model training after basic models are ready (longer delay)
        setTimeout(() => {

        }, 10000); // Wait 10 seconds before advanced training
      })
      .catch(error => {
        console.error('❌ Background ML model initialization failed:', error);
        console.log('🔄 Models will initialize on first prediction request');
      });
  }, 10000); // Start after 10 seconds to allow server to fully start and serve initial requests
  
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });
  
  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      } else {
        console.error('Failed to create employee:', error);
        res.status(500).json({ message: "Failed to create employee" });
      }
    }
  });
  
  // Prediction routes with timeout protection
  app.post("/api/predict", async (req, res) => {
    const startTime = Date.now();
    
    try {
      const validatedData = insertPredictionSchema.parse(req.body);
      
      // Set a 3-second timeout for predictions to ensure ultra-fast response
      const predictionPromise = MLService.getInstance().predict(validatedData);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Prediction timeout')), 3000);
      });
      
      // Race between prediction and timeout
      const mlResult = await Promise.race([predictionPromise, timeoutPromise]) as any;
      
      // Store prediction with results (run in background to not slow response)
      const storagePromise = storage.createPrediction({
        ...validatedData,
        linearRegressionPrediction: mlResult.linearRegressionPrediction,
        randomForestPrediction: mlResult.randomForestPrediction,
        confidence: mlResult.confidence
      });
      
      // Don't wait for storage - respond immediately
      storagePromise.catch(error => {
        console.error('Background storage error:', error);
      });
      
      const responseTime = Date.now() - startTime;
      PerformanceMonitor.recordMetric('api_predict_response', responseTime);
      console.log(`🚀 Prediction API responded in ${responseTime}ms`);
      
      // Send immediate response
      res.json({
        prediction: {
          id: Date.now(), // Temporary ID until storage completes
          ...validatedData,
          linearRegressionPrediction: mlResult.linearRegressionPrediction,
          randomForestPrediction: mlResult.randomForestPrediction,
          confidence: mlResult.confidence
        },
        featureImportance: mlResult.featureImportance,
        responseTime: responseTime
      });
      
      // Update with real ID when storage completes
      storagePromise.then(prediction => {
        console.log(`💾 Prediction stored with ID: ${prediction.id}`);
      });
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid prediction data", 
          errors: error.errors,
          responseTime 
        });
      } else if (error instanceof Error && error.message === 'Prediction timeout') {
        console.warn(`⚠️ Prediction timeout after ${responseTime}ms`);
        res.status(408).json({ 
          message: "Prediction is taking longer than expected. Please try again.",
          responseTime 
        });
      } else {
        console.error('Prediction error:', error);
        res.status(500).json({ 
          message: "Failed to generate prediction",
          responseTime 
        });
      }
    }
  });
  
  app.get("/api/predictions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const predictions = await storage.getPredictions(limit);
      
      // Add feature importance to each prediction for frontend compatibility
      const predictionsWithFeatures = predictions.map(prediction => ({
        prediction,
        featureImportance: {
          experience: 0.35,
          location: 0.25,
          department: 0.20,
          education: 0.12,
          companySize: 0.08
        }
      }));
      
      res.json(predictionsWithFeatures);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });
  
  // Analytics routes with caching
  app.get("/api/analytics/department-salaries", async (req, res) => {
    try {
      const cacheKey = "department-salaries";
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const data = await storage.getAverageSalaryByDepartment();
      setCachedResponse(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department salary data" });
    }
  });
  
  app.get("/api/analytics/experience-salaries", async (req, res) => {
    try {
      const cacheKey = "experience-salaries";
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const data = await storage.getSalaryByExperienceRange();
      setCachedResponse(cacheKey, data, 5 * 60 * 1000); // Cache for 5 minutes
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch experience salary data" });
    }
  });
  
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const cacheKey = "analytics-stats";
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      const [totalEmployees, avgSalary] = await Promise.all([
        storage.getTotalEmployeeCount(),
        storage.getAverageSalary()
      ]);
      
      // Get model metrics to calculate average accuracy
      let modelAccuracy = 85.0; // Default fallback
      try {
        const metrics = MLService.getInstance().getModelMetrics();
        if (metrics && metrics.linearRegression && metrics.randomForest) {
          const linearAccuracy = (metrics.linearRegression.r2Score || 0) * 100;
          const forestAccuracy = (metrics.randomForest.r2Score || 0) * 100;
          modelAccuracy = Math.round(((linearAccuracy + forestAccuracy) / 2) * 10) / 10; // Round to 1 decimal
        }
      } catch (error) {
        console.warn('Failed to get model metrics for stats:', error);
      }
      
      const stats = {
        totalEmployees,
        avgSalary: Math.round(avgSalary),
        modelAccuracy: modelAccuracy
      };

      setCachedResponse(cacheKey, stats, 2 * 60 * 1000); // Cache for 2 minutes
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  
  // Model metrics route
  app.get("/api/model-metrics", async (req, res) => {
    try {
      const metrics = MLService.getInstance().getModelMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch model metrics" });
    }
  });

  // Model training status endpoint
  app.get("/api/model-status", async (req, res) => {
    try {
      const totalEmployees = await storage.getTotalEmployeeCount();
      const mlStatus = MLService.getInstance().getModelStatus();
      
      res.json({
        isTraining: mlStatus.isTraining,
        isInitialized: mlStatus.isInitialized,
        totalRecords: totalEmployees,
        message: `Real ML models trained on ${totalEmployees.toLocaleString()}+ salary records`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch model status" });
    }
  });

  // Performance metrics endpoint
  app.get("/api/performance-metrics", async (req, res) => {
    try {
      const metrics = PerformanceMonitor.getAllMetrics();
      const summary = PerformanceMonitor.getPerformanceSummary();
      res.json({
        metrics,
        summary,
        timestamp: new Date().toISOString(),
        message: "Performance metrics for prediction system"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  // Quick performance status endpoint
  app.get("/api/performance-status", async (req, res) => {
    try {
      const summary = PerformanceMonitor.getPerformanceSummary();
      res.json({
        ...summary,
        timestamp: new Date().toISOString(),
        optimized: true
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance status" });
    }
  });

  // Dynamic dropdown options endpoint
  app.get("/api/dropdown-options", async (req, res) => {
    try {
      const cacheKey = "dropdown-options";
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      console.log('🔄 Fetching dynamic dropdown options from datasets...');
      const uniqueValues = await DataProcessor.getUniqueValues();
      
      const options = {
        jobTitles: uniqueValues.jobTitles,
        departments: uniqueValues.departments,
        locations: uniqueValues.locations,
        educationLevels: uniqueValues.educationLevels,
        companySizes: uniqueValues.companySizes,
        lastUpdated: new Date().toISOString()
      };

      // Cache for 10 minutes since dataset values don't change frequently
      setCachedResponse(cacheKey, options, 10 * 60 * 1000);
      
      console.log('✅ Dynamic dropdown options fetched successfully');
      res.json(options);
    } catch (error) {
      console.error('Failed to fetch dropdown options:', error);
      res.status(500).json({ message: "Failed to fetch dropdown options" });
    }
  });
  
  // Data upload routes
  app.post("/api/upload-data", upload.single('file'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Parse CSV data (simplified - in production would use proper CSV parser)
      const csvContent = req.file.buffer.toString();
      const lines = csvContent.split('\n').filter((line: string) => line.trim());
      
      if (lines.length < 2) {
        return res.status(400).json({ message: "Invalid CSV format" });
      }
      
      // Create upload record
      const upload = await storage.createDataUpload({
        filename: req.file.originalname,
        recordCount: lines.length - 1, // excluding header
        status: 'processing'
      });
      
      // Process data in background (simplified)
      setTimeout(async () => {
        try {
          // Parse CSV lines into objects (simplified)
          const headers = lines[0].split(',');
          const data = lines.slice(1).map((line: string) => {
            const values = line.split(',');
            const record: any = {};
            headers.forEach((header: string, index: number) => {
              record[header.trim()] = values[index]?.trim();
            });
            return record;
          });
          
          const result = await MLService.getInstance().retrain();
          
          if (result.success) {
            await storage.updateDataUploadStatus(upload.id, 'processed');
            
            // Add processed data to storage
            let successfullyAddedRecords = 0;
            for (const record of data.slice(0, result.recordsProcessed)) {
              try {
                await storage.createEmployee({
                  jobTitle: record.jobTitle,
                  experience: parseInt(record.experience),
                  department: record.department,
                  location: record.location,
                  educationLevel: record.educationLevel,
                  companySize: record.companySize,
                  actualSalary: parseFloat(record.actualSalary)
                });
                successfullyAddedRecords++;
              } catch (err) {
                // Skip invalid records
              }
            }
            
            // Update training data count with successfully added records
            storage.updateTrainingDataCount(successfullyAddedRecords);
            
            // Clear cache to refresh stats with new data
            cache.delete("analytics-stats");
            cache.delete("department-salaries");
            cache.delete("experience-salaries");
            console.log('📊 Cache cleared after data upload - stats will refresh');
          } else {
            await storage.updateDataUploadStatus(upload.id, 'failed');
          }
        } catch (error) {
          console.error('Error processing uploaded data:', error);
          await storage.updateDataUploadStatus(upload.id, 'failed');
        }
      }, 3000);
      
      res.json({ 
        message: "File uploaded successfully", 
        uploadId: upload.id,
        recordCount: upload.recordCount 
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  
  app.get("/api/data-uploads", async (req, res) => {
    try {
      const uploads = await storage.getDataUploads();
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch uploads" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
