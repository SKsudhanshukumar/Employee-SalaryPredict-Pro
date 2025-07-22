// Simple performance test script
const testPredictionPerformance = async () => {
  const testData = {
    jobTitle: 'Software Engineer',
    experience: 5,
    department: 'IT',
    location: 'Bangalore',
    educationLevel: 'Bachelor',
    companySize: 'Medium (100-999)'
  };

  console.log('🧪 Testing prediction performance...');
  
  const results = [];
  const numTests = 10;

  for (let i = 0; i < numTests; i++) {
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      if (response.ok) {
        const result = await response.json();
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results.push(responseTime);
        console.log(`Test ${i + 1}: ${responseTime}ms - Prediction: ₹${result.prediction.linearRegressionPrediction.toLocaleString()}`);
      } else {
        console.error(`Test ${i + 1}: Failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`Test ${i + 1}: Error - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (results.length > 0) {
    const avgTime = results.reduce((sum, time) => sum + time, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);
    
    console.log('\n📊 Performance Summary:');
    console.log(`Average Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`Fastest Response: ${minTime}ms`);
    console.log(`Slowest Response: ${maxTime}ms`);
    console.log(`Total Tests: ${results.length}/${numTests}`);
    
    if (avgTime < 100) {
      console.log('🚀 EXCELLENT performance!');
    } else if (avgTime < 200) {
      console.log('⚡ GOOD performance!');
    } else if (avgTime < 500) {
      console.log('⚠️ MODERATE performance');
    } else {
      console.log('🐌 SLOW performance - needs optimization');
    }
  }
};

// Run the test
testPredictionPerformance().catch(console.error);