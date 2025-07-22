// Test performance with varied inputs
const testVariedPerformance = async () => {
  const testCases = [
    {
      jobTitle: 'Software Engineer',
      experience: 5,
      department: 'IT',
      location: 'Bangalore',
      educationLevel: 'Bachelor',
      companySize: 'Medium (100-999)'
    },
    {
      jobTitle: 'Data Scientist',
      experience: 8,
      department: 'Data Science',
      location: 'Mumbai',
      educationLevel: 'Master',
      companySize: 'Large (1000+)'
    },
    {
      jobTitle: 'Marketing Manager',
      experience: 10,
      department: 'Marketing',
      location: 'Delhi',
      educationLevel: 'Master',
      companySize: 'Medium (100-999)'
    },
    {
      jobTitle: 'Sales Executive',
      experience: 3,
      department: 'Sales',
      location: 'Chennai',
      educationLevel: 'Bachelor',
      companySize: 'Small (10-99)'
    },
    {
      jobTitle: 'HR Manager',
      experience: 7,
      department: 'HR',
      location: 'Pune',
      educationLevel: 'Master',
      companySize: 'Large (1000+)'
    }
  ];

  console.log('🧪 Testing prediction performance with varied inputs...');
  
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const testData = testCases[i];
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
        console.log(`${testData.jobTitle} (${testData.experience}y, ${testData.department}): ${responseTime}ms - ₹${result.prediction.linearRegressionPrediction.toLocaleString()}`);
      } else {
        console.error(`Test ${i + 1}: Failed with status ${response.status}`);
      }
    } catch (error) {
      console.error(`Test ${i + 1}: Error - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Test cache hits by repeating the first request
  console.log('\n🔄 Testing cache performance...');
  const cacheTestData = testCases[0];
  
  for (let i = 0; i < 3; i++) {
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cacheTestData)
      });
      
      if (response.ok) {
        const result = await response.json();
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results.push(responseTime);
        console.log(`Cache test ${i + 1}: ${responseTime}ms - ₹${result.prediction.linearRegressionPrediction.toLocaleString()}`);
      }
    } catch (error) {
      console.error(`Cache test ${i + 1}: Error - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  if (results.length > 0) {
    const avgTime = results.reduce((sum, time) => sum + time, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);
    
    console.log('\n📊 Overall Performance Summary:');
    console.log(`Average Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`Fastest Response: ${minTime}ms`);
    console.log(`Slowest Response: ${maxTime}ms`);
    console.log(`Total Tests: ${results.length}`);
    
    if (avgTime < 50) {
      console.log('🚀 EXCELLENT performance!');
    } else if (avgTime < 100) {
      console.log('⚡ GOOD performance!');
    } else if (avgTime < 200) {
      console.log('⚠️ MODERATE performance');
    } else {
      console.log('🐌 SLOW performance - needs optimization');
    }
  }
};

// Run the test
testVariedPerformance().catch(console.error);