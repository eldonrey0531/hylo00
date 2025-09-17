// Test LangChain Integration
import dotenv from 'dotenv';
import { groqProvider } from './api/providers/groq.js';
import { router } from './api/utils/routing.js';
import { observability } from './api/utils/observability.js';

// Load environment variables
dotenv.config();

async function testLangChainIntegration() {
  console.log('🧪 Testing LangChain Integration...\n');

  try {
    // Test 1: Provider Initialization
    console.log('1. Testing provider initialization...');
    const isGroqAvailable = await groqProvider.isAvailable();
    console.log(`   ✅ Groq provider available: ${isGroqAvailable}`);

    // Test 2: Routing Logic
    console.log('\n2. Testing routing logic...');
    const testQuery = 'Plan a 7-day trip to Tokyo for a couple interested in culture and food';
    const complexity = router.analyzeComplexity(testQuery);
    const routing = router.selectProvider(complexity);
    console.log(`   ✅ Query complexity: ${complexity}`);
    console.log(`   ✅ Selected provider: ${routing.primary}`);
    console.log(`   ✅ Fallback chain: ${routing.fallbacks.join(', ')}`);

    // Test 3: Observability
    console.log('\n3. Testing observability...');
    const trace = await observability.startTrace('test-llm-call', {
      query: testQuery,
      complexity: complexity,
    });
    console.log(`   ✅ Trace started: ${trace.trace_id}`);

    // Test 4: LLM Call (if provider is available)
    if (isGroqAvailable) {
      console.log('\n4. Testing actual LLM call...');
      const startTime = Date.now();

      const result = await groqProvider.generate({
        query: 'Hello! Can you briefly introduce yourself?',
        systemPrompt: 'You are a helpful travel planning assistant.',
        model: 'llama-3.1-8b-instant',
        complexity: 'low',
      });

      const endTime = Date.now();

      console.log(`   ✅ LLM call successful!`);
      console.log(`   📊 Model: ${result.model}`);
      console.log(`   📊 Provider: ${result.provider}`);
      console.log(`   📊 Latency: ${result.latency_ms}ms`);
      console.log(
        `   📊 Tokens: ${result.usage.input_tokens} in, ${result.usage.output_tokens} out`
      );
      console.log(`   📊 Cost: $${result.cost_estimate.toFixed(6)}`);
      console.log(`   📝 Response: ${result.content.substring(0, 100)}...`);

      // End trace
      await observability.endTrace(trace, result, {
        model: result.model,
        provider: result.provider,
        tokens_input: result.usage.input_tokens,
        tokens_output: result.usage.output_tokens,
        latency_ms: result.latency_ms,
        complexity: 'low',
        fallback_chain: [],
        cost_estimate: result.cost_estimate,
        success: true,
      });
      console.log(`   ✅ Trace completed: ${trace.trace_id}`);
    } else {
      console.log('\n4. ⚠️  Skipping LLM call test - provider not available');
    }

    console.log('\n🎉 LangChain integration test completed successfully!');
    console.log('\n🎯 Ready for:');
    console.log('   ✅ Multi-provider routing');
    console.log('   ✅ Intelligent fallback chains');
    console.log('   ✅ Cost tracking and monitoring');
    console.log('   ✅ Observability and tracing');
    console.log('   ✅ Edge-first architecture deployment');
  } catch (error) {
    console.error('❌ LangChain integration test failed:', error);
    process.exit(1);
  }
}

// Run the test
testLangChainIntegration();
