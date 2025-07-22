// Test health endpoint
async function testHealth() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await fetch('http://localhost:5000/api/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health check passed:');
      console.log(`   Status: ${data.status}`);
      console.log(`   Prediction System: ${data.prediction_system}`);
      console.log(`   Response Time: ${data.response_time}ms`);
      console.log(`   Test Prediction: ₹${data.test_prediction?.toLocaleString('en-IN')}`);
      console.log(`   Message: ${data.message}`);
    } else {
      console.log(`❌ Health check failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
  }
}

testHealth();