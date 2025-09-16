/**
 * Test script for LLM Routing Integration
 *
 * This script validates that the new routing infrastructure works
 * with the existing multiAgentService interface.
 */

import { createRoutingGroqClient } from '../src/services/llmRoutingService';

async function testRoutingIntegration() {
  console.log('🧪 Testing LLM Routing Integration...\n');

  const groq = createRoutingGroqClient({
    enableLogging: true,
  });

  try {
    // Test 1: Simple completion
    console.log('Test 1: Simple completion');
    const simple = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: 'Say hello in a travel context.',
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log('✅ Simple completion response:');
    console.log('   Response:', simple.choices[0]?.message?.content?.substring(0, 100) + '...');
    console.log('   Provider:', simple.provider);
    console.log('   Tokens:', simple.usage.total_tokens);
    console.log('   Complexity:', simple.routing_metadata.complexity);
    console.log('');

    // Test 2: JSON format response (like agents use)
    console.log('Test 2: JSON format response');
    const jsonResponse = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Extract travel preferences from user input.',
        },
        {
          role: 'user',
          content: 'I want to visit Paris for 5 days with my family.',
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    console.log('✅ JSON format response:');
    console.log('   Provider:', jsonResponse.provider);
    console.log('   Complexity:', jsonResponse.routing_metadata.complexity);
    console.log('   Fallbacks used:', jsonResponse.routing_metadata.fallbacksUsed);
    console.log('');

    // Test 3: High complexity request
    console.log('Test 3: High complexity request');
    const complex = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are a comprehensive travel planning agent. Analyze the provided information and create a detailed itinerary with research, recommendations, and comprehensive planning details.',
        },
        {
          role: 'user',
          content:
            'Create a detailed 7-day itinerary for a family of 4 visiting Japan in spring, including cultural experiences, food recommendations, transportation options, accommodation suggestions, and daily schedules.',
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 4000,
    });

    console.log('✅ High complexity response:');
    console.log('   Provider:', complex.provider);
    console.log('   Complexity:', complex.routing_metadata.complexity);
    console.log('   Latency:', `${complex.routing_metadata.latency}ms`);
    console.log('   Response length:', complex.choices[0]?.message?.content?.length || 0, 'chars');
    console.log('');

    console.log('🎉 All tests passed! Routing integration working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run if called directly
// testRoutingIntegration().catch(console.error);

export { testRoutingIntegration };
