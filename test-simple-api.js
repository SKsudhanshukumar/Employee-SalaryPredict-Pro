// Simple API test
const testApi = async () => {
  try {
    console.log('🔍 Testing prediction API directly...');
    
    const testData = {
      jobTitle: 'Software Engineer',
      experience: 5,
      department: 'IT',
      location: 'Bangalore',
      educationLevel: 'Bachelor',
      companySize: 'Medium (100-999)'
    };
    
    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response body (first 200 chars):', text.substring(0, 200));
    
    if (response.headers.get('content-type')?.includes('application/json')) {
      const result = JSON.parse(text);
      console.log('✅ API is working! Response time:', result.responseTime + 'ms');
      console.log('Prediction:', result.prediction.linearRegressionPrediction);
    } else {
      console.log('❌ API returned HTML instead of JSON');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testApi();