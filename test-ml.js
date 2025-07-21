import { MLService } from './server/ml-service.js';

async function testMLPredictions() {
  console.log('Testing ML predictions...');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const result = await MLService.predictSalary({
      jobTitle: 'Software Engineer',
      experience: 5,
      department: 'Engineering',
      location: 'San Francisco',
      educationLevel: "Bachelor's",
      companySize: 'Large (501-5000)'
    });
    
    console.log('Prediction Result:', result);
    console.log('Linear Regression:', result.linearRegressionPrediction);
    console.log('Random Forest:', result.randomForestPrediction);
    console.log('Confidence:', result.confidence);
    
    const metrics = MLService.getModelMetrics();
    console.log('Model Metrics:', metrics);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMLPredictions();