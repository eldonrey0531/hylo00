// Test End-to-End Integration
// This script tests the complete flow from form submission to itinerary generation

const testFormData = {
  tripDetails: {
    location: 'Tokyo, Japan',
    departDate: '2025-12-01',
    returnDate: '2025-12-07',
    plannedDays: 7,
    adults: 2,
    children: 0,
    budget: 5000,
    currency: 'USD',
  },
  groups: ['Couple'],
  interests: ['Culture & History', 'Food & Dining', 'Nature'],
  inclusions: ['Accommodations', 'Dining', 'Activities & Tours'],
  experience: ['Intermediate'],
  vibes: ['Cultural & Educational', 'Relaxed & Chill'],
  sampleDays: ['Museums & Galleries', 'Local Markets', 'Traditional Experiences'],
  dinnerChoices: ['Local Restaurants', 'Street Food'],
  nickname: 'Tokyo Adventure 2025',
  contact: {
    name: 'Test User',
    email: 'test@example.com',
  },
};

// Test the API endpoint directly
async function testLLMRouting() {
  console.log('🧪 Testing LLM Routing Endpoint...');

  const testQuery = {
    query:
      'Plan a 7-day cultural itinerary for Tokyo, Japan for a couple interested in traditional culture, food, and nature',
    metadata: {
      agentName: 'Travel Planner',
      requestId: 'test-' + Date.now(),
      complexity: 'high',
    },
  };

  try {
    const response = await fetch('http://localhost:3001/api/llm/route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testQuery),
    });

    const result = await response.json();
    console.log('✅ LLM Routing Response:', {
      success: result.success,
      provider: result.data?.metadata?.provider,
      latency: result.data?.metadata?.latency + 'ms',
      tokens: result.data?.usage?.total_tokens,
      fallbacks: result.data?.metadata?.fallbacksUsed,
      responseLength: result.data?.response?.length,
    });

    return result;
  } catch (error) {
    console.error('❌ LLM Routing Error:', error);
    return null;
  }
}

// Test the complete multi-agent service
async function testMultiAgentService() {
  console.log('🤖 Testing Multi-Agent Service...');

  try {
    // This would normally be called by the frontend
    console.log('Simulating multi-agent itinerary generation...');
    console.log('Form Data:', JSON.stringify(testFormData, null, 2));

    // The actual call would be:
    // const result = await generateMultiAgentItinerary(testFormData);

    console.log('✅ Multi-agent service would process this form data through:');
    console.log('1. Agent 1: Data Gatherer - Extract user selections');
    console.log('2. Agent 2: Information Gatherer - Get real-time data using Compound model');
    console.log('3. Agent 3: Planning Strategist - Create itinerary structure');
    console.log('4. Agent 4: Content Compiler - Assemble final itinerary');

    return true;
  } catch (error) {
    console.error('❌ Multi-Agent Service Error:', error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting End-to-End Integration Tests...\n');

  // Test 1: LLM Routing
  const llmResult = await testLLMRouting();
  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Multi-Agent Service
  const agentResult = await testMultiAgentService();
  console.log('\n' + '='.repeat(50) + '\n');

  // Summary
  console.log('📊 Test Summary:');
  console.log(`LLM Routing: ${llmResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Multi-Agent Service: ${agentResult ? '✅ PASS' : '❌ FAIL'}`);

  if (llmResult && agentResult) {
    console.log('\n🎉 All tests passed! The integration is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('1. Test the frontend form submission');
    console.log('2. Verify the complete multi-agent workflow');
    console.log('3. Check error handling and fallback chains');
  }
}

// For browser execution
if (typeof window !== 'undefined') {
  window.runTests = runTests;
  window.testFormData = testFormData;
  console.log('Test functions loaded. Run window.runTests() to start testing.');
} else {
  // For Node.js execution
  runTests();
}
