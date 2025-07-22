// Test script to verify prediction performance fixes

const API_BASE = 'http://localhost:5000';

async function testPrediction() {
  console.log('🧪 Testing prediction performance fixes...\n');
  
  const testData = {
    jobTitle: 'Software Engineer',
    experience: 5,
    department: 'IT',
    location: 'Bangalore',
    educationLevel: 'Bachelor',
    companySize: 'Medium (100-999)'
  };

  const results = [];
  
  for (let i = 1; i <= 5; i++) {
    console.log(`📊 Test ${i}/5: Making prediction request...`);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        results.push({
          test: i,
          success: true,
          responseTime,
          prediction: data.prediction?.linearRegressionPrediction,
          fallback: data.fallback || false
        });
        
        console.log(`✅ Success in ${responseTime}ms - Prediction: ₹${data.prediction?.linearRegressionPrediction?.toLocaleString('en-IN')}`);
        if (data.fallback) {
          console.log('   ⚠️ Used fallback prediction');
        }
      } else {
        results.push({
          test: i,
          success: false,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        });
        console.log(`❌ Failed in ${responseTime}ms - ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      results.push({
        test: i,
        success: false,
        responseTime,
        error: error.message
      });
      console.log(`❌ Error in ${responseTime}ms - ${error.message}`);
    }
    
    // Wait 1 second between requests
    if (i < 5) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Summary
  console.log('\n📈 Test Results Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful requests: ${successful.length}/5`);
  console.log(`❌ Failed requests: ${failed.length}/5`);
  
  if (successful.length > 0) {
    const avgTime = successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length;
    const minTime = Math.min(...successful.map(r => r.responseTime));
    const maxTime = Math.max(...successful.map(r => r.responseTime));
    
    console.log(`⚡ Average response time: ${Math.round(avgTime)}ms`);
    console.log(`🚀 Fastest response: ${minTime}ms`);
    console.log(`🐌 Slowest response: ${maxTime}ms`);
    
    const fallbackCount = successful.filter(r => r.fallback).length;
    if (fallbackCount > 0) {
      console.log(`⚠️ Fallback predictions used: ${fallbackCount}/${successful.length}`);
    }
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed requests details:');
    failed.forEach(f => {
      console.log(`   Test ${f.test}: ${f.error} (${f.responseTime}ms)`);
    });
  }
  
  // Performance assessment
  console.log('\n🎯 Performance Assessment:');
  if (successful.length === 5) {
    const avgTime = successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length;
    if (avgTime < 1000) {
      console.log('🚀 EXCELLENT: All requests successful with fast response times!');
    } else if (avgTime < 5000) {
      console.log('✅ GOOD: All requests successful with acceptable response times.');
    } else {
      console.log('⚠️ SLOW: All requests successful but response times are high.');
    }
  } else if (successful.length >= 3) {
    console.log('⚠️ PARTIAL: Some requests failed but most are working.');
  } else {
    console.log('❌ POOR: Most requests are failing. Check server status.');
  }
}

// Run the test
testPrediction().catch(console.error);