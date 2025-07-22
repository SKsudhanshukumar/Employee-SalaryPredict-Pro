// Test API status
const testApiStatus = async () => {
  try {
    console.log('🔍 Checking performance status...');
    
    const response = await fetch('http://localhost:5000/api/performance-status');
    
    if (response.ok) {
      const status = await response.json();
      console.log('📊 Performance Status:', JSON.stringify(status, null, 2));
    } else {
      console.error('Failed to fetch performance status:', response.status);
    }
    
    console.log('\n🔍 Checking detailed metrics...');
    
    const metricsResponse = await fetch('http://localhost:5000/api/performance-metrics');
    
    if (metricsResponse.ok) {
      const metrics = await metricsResponse.json();
      console.log('📈 Performance Metrics:');
      console.log('Summary:', JSON.stringify(metrics.summary, null, 2));
      console.log('Key Metrics:');
      
      if (metrics.metrics.prediction_total) {
        console.log(`- Total Predictions: ${metrics.metrics.prediction_total.count} requests`);
        console.log(`- Average Time: ${metrics.metrics.prediction_total.avg}ms`);
        console.log(`- Min Time: ${metrics.metrics.prediction_total.min}ms`);
        console.log(`- Max Time: ${metrics.metrics.prediction_total.max}ms`);
      }
      
      if (metrics.metrics.prediction_cache_hit) {
        console.log(`- Cache Hits: ${metrics.metrics.prediction_cache_hit.count} requests`);
        console.log(`- Cache Avg Time: ${metrics.metrics.prediction_cache_hit.avg}ms`);
      }
    } else {
      console.error('Failed to fetch performance metrics:', metricsResponse.status);
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
};

testApiStatus();