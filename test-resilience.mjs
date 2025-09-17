/**
 * Resilience Features Test Script
 *
 * Tests all resilience components to ensure they work correctly
 */

import { CircuitBreaker, CircuitState } from '../src/utils/circuitBreaker.js';
import { withRetry, shouldRetryLLMOperation } from '../src/utils/retry.js';
import { resilientLLMService } from '../src/services/resilientLLMService.js';

async function testCircuitBreaker() {
  console.log('\n🔄 Testing Circuit Breaker...');

  const breaker = new CircuitBreaker('test-provider', {
    failureThreshold: 2,
    recoveryTimeout: 1000,
    successThreshold: 1,
    monitoringWindow: 5000,
  });

  // Test successful operation
  try {
    const result = await breaker.execute(async () => 'Success!');
    console.log('✅ Circuit Breaker Success:', result);
  } catch (error) {
    console.error('❌ Circuit Breaker Error:', error.message);
  }

  // Test failure and circuit opening
  for (let i = 0; i < 3; i++) {
    try {
      await breaker.execute(async () => {
        throw new Error('Simulated failure');
      });
    } catch (error) {
      console.log(`🔄 Failure ${i + 1}:`, error.message);
    }
  }

  const metrics = breaker.getMetrics();
  console.log('📊 Circuit Breaker Metrics:', {
    state: metrics.state,
    failureCount: metrics.failureCount,
    successRate: metrics.successRate,
  });

  return metrics.state === CircuitState.OPEN;
}

async function testRetryMechanism() {
  console.log('\n🔄 Testing Retry Mechanism...');

  let attempts = 0;

  try {
    const result = await withRetry(
      async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'Success after retries!';
      },
      {
        maxAttempts: 5,
        baseDelay: 100,
        exponentialBase: 2,
        jitter: false,
      },
      (metrics) => {
        console.log(`🔄 Retry attempt ${metrics.attempt}: ${metrics.error}`);
      }
    );

    console.log('✅ Retry Success:', result);
    console.log(`📊 Total attempts: ${attempts}`);
    return true;
  } catch (error) {
    console.error('❌ Retry Failed:', error.message);
    return false;
  }
}

async function testLLMRetryConditions() {
  console.log('\n🔄 Testing LLM Retry Conditions...');

  const testCases = [
    { error: new Error('Invalid API key'), shouldRetry: false },
    { error: new Error('Rate limit exceeded'), shouldRetry: true },
    { error: new Error('Network timeout'), shouldRetry: true },
    { error: { status: 429, message: 'Too many requests' }, shouldRetry: true },
    { error: { status: 400, message: 'Bad request' }, shouldRetry: false },
    { error: { status: 500, message: 'Internal server error' }, shouldRetry: true },
  ];

  let passedTests = 0;

  for (const testCase of testCases) {
    const result = shouldRetryLLMOperation(testCase.error);
    const passed = result === testCase.shouldRetry;

    console.log(
      `${passed ? '✅' : '❌'} ${testCase.error.message || testCase.error}: ${
        result ? 'RETRY' : 'NO_RETRY'
      }`
    );

    if (passed) passedTests++;
  }

  console.log(`📊 Passed ${passedTests}/${testCases.length} retry condition tests`);
  return passedTests === testCases.length;
}

async function testResilientService() {
  console.log('\n🔄 Testing Resilient LLM Service...');

  try {
    // Test system health
    const health = await resilientLLMService.getSystemHealth();
    console.log('✅ System Health:', {
      status: health.status,
      availableProviders: health.availableProviders.length,
      totalProviders: health.totalProviders,
    });

    // Test circuit breaker metrics
    const circuitMetrics = resilientLLMService.getCircuitBreakerMetrics();
    console.log('✅ Circuit Breaker Metrics:', Object.keys(circuitMetrics));

    return true;
  } catch (error) {
    console.error('❌ Resilient Service Error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Resilience Features Test Suite\n');

  const results = {};

  try {
    results.circuitBreaker = await testCircuitBreaker();
    results.retryMechanism = await testRetryMechanism();
    results.llmRetryConditions = await testLLMRetryConditions();
    results.resilientService = await testResilientService();

    console.log('\n📊 Test Results Summary:');
    console.log('========================');

    let passedTests = 0;
    const totalTests = Object.keys(results).length;

    for (const [test, passed] of Object.entries(results)) {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
      if (passed) passedTests++;
    }

    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('🎉 All resilience features are working correctly!');
    } else {
      console.log('⚠️  Some resilience features need attention.');
    }
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export { runAllTests };
