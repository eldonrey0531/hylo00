// Frontend Form Submission Test
// This simulates what happens when user clicks "Generate Itinerary"

import { generateMultiAgentItinerary } from './src/services/multiAgentService.js';

const testFormData = {
  tripDetails: {
    location: 'Kyoto, Japan',
    departDate: '2025-11-15',
    returnDate: '2025-11-22',
    plannedDays: 7,
    adults: 2,
    children: 0,
    budget: 4000,
    currency: 'USD',
  },
  groups: ['Couple'],
  interests: ['Culture & History', 'Food & Dining', 'Photography'],
  inclusions: ['Accommodations', 'Dining', 'Activities & Tours', 'Transportation'],
  experience: ['Intermediate'],
  vibes: ['Cultural & Educational', 'Romantic'],
  sampleDays: ['Museums & Galleries', 'Traditional Experiences', 'Nature Walks'],
  dinnerChoices: ['Local Restaurants', 'Fine Dining'],
  nickname: 'Kyoto Cultural Journey',
  contact: {
    name: 'Travel Enthusiast',
    email: 'traveler@example.com',
  },
};

async function testCompleteFlow() {
  console.log('🎯 Testing Complete Frontend-Backend Integration...');
  console.log('📋 Form Data:', JSON.stringify(testFormData, null, 2));
  console.log('\n🤖 Starting Multi-Agent Itinerary Generation...\n');

  const logs = [];

  try {
    const result = await generateMultiAgentItinerary(testFormData, (agentLogs) => {
      console.log(`📊 Agent Update - ${agentLogs.length} agents completed`);
      logs.push(...agentLogs);
    });

    console.log('\n✅ Multi-Agent Generation Complete!');
    console.log('\n📈 Agent Execution Summary:');

    logs.forEach((log, index) => {
      console.log(`\n${index + 1}. ${log.agentName} (${log.model})`);
      console.log(`   ⏱️  Timestamp: ${log.timestamp}`);
      console.log(`   🎯 Decisions: ${log.decisions?.length || 0} key decisions`);
      if (log.searchQueries) {
        console.log(`   🔍 Searches: ${log.searchQueries.length} queries performed`);
      }
      console.log(`   💭 Reasoning: ${log.reasoning?.substring(0, 100)}...`);
    });

    console.log('\n📄 Generated Itinerary Preview:');
    console.log('=' * 50);
    console.log(result.itinerary.substring(0, 500) + '...');
    console.log('=' * 50);

    console.log('\n🎉 SUCCESS: Complete end-to-end integration working!');
    console.log(`📊 Stats:`);
    console.log(`   - ${logs.length} agents executed`);
    console.log(`   - ${result.itinerary.length} characters generated`);
    console.log(`   - Real LLM providers used throughout the chain`);

    return true;
  } catch (error) {
    console.error('\n❌ ERROR in complete flow:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

testCompleteFlow();
