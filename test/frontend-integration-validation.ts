/**
 * Comprehensive Validation Script for T031 Frontend Integration
 *
 * This script validates that the multiAgentService continues to work
 * correctly with the new LLM routing infrastructure.
 */

// Sample test data that matches the expected TravelFormData structure
const sampleTravelData = {
  tripDetails: {
    destinations: ['Paris, France'],
    duration: '7 days',
    startDate: '2024-06-15',
    budget: 3000,
    currency: 'USD',
    travelers: {
      adults: 2,
      children: 1,
      childrenAges: [12],
    },
  },
  groups: ['Couple', 'Family with kids'],
  interests: ['Culture & History', 'Food & Drink', 'Art & Museums'],
  inclusions: ['Flights', 'Hotels', 'Activities'],
  experience: ['First time in destination', 'Moderate experience with travel'],
  vibes: ['Cultural immersion', 'Relaxed pace', 'Family-friendly'],
  sampleDays: [
    'Day 1: Arrival and settling in',
    'Day 2: Major attractions and landmarks',
    'Day 3: Cultural experiences and local food',
  ],
  dinnerChoices: ['Local restaurants', 'Hotel dining', 'Street food'],
  nickname: 'Paris Family Adventure',
  contact: {
    name: 'Test User',
    email: 'test@example.com',
  },
};

/**
 * Validation Results Interface
 */
interface ValidationResult {
  phase: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: {
    provider?: string;
    complexity?: string;
    fallbacksUsed?: number;
    agentLogs?: number;
  };
}

/**
 * Comprehensive validation function
 */
export async function validateFrontendIntegration(): Promise<{
  success: boolean;
  results: ValidationResult[];
  summary: {
    totalDuration: number;
    successfulPhases: number;
    failedPhases: number;
    providersUsed: string[];
    totalAgentInteractions: number;
  };
}> {
  const results: ValidationResult[] = [];
  const startTime = Date.now();
  let providersUsed: string[] = [];
  let totalAgentInteractions = 0;

  console.log('🚀 Starting Comprehensive Frontend Integration Validation');
  console.log('📋 Test Data:', {
    destinations: sampleTravelData.tripDetails.destinations,
    duration: sampleTravelData.tripDetails.duration,
    travelers: sampleTravelData.tripDetails.travelers,
    interests: sampleTravelData.interests.length,
    nickname: sampleTravelData.nickname,
  });
  console.log('');

  // Phase 1: Import and initialization
  try {
    console.log('📦 Phase 1: Testing imports and initialization...');
    const phaseStart = Date.now();

    // Dynamic import to avoid compile-time issues
    const { generateMultiAgentItinerary } = await import('../src/services/multiAgentService');

    const duration = Date.now() - phaseStart;
    results.push({
      phase: 'Import & Initialization',
      success: true,
      duration,
    });
    console.log(`✅ Phase 1 completed in ${duration}ms`);
    console.log('');

    // Phase 2: Agent execution with monitoring
    console.log('🤖 Phase 2: Testing multi-agent execution...');
    const agentStart = Date.now();

    const agentLogs: any[] = [];
    let itineraryResult: any = null;

    try {
      // Mock the streaming callback to capture agent logs
      const mockCallback = (log: any) => {
        agentLogs.push(log);
        totalAgentInteractions++;

        console.log(`   Agent ${log.agentId} (${log.agentName}):`, {
          model: log.model,
          timestamp: log.timestamp,
          hasOutput: !!log.output,
          outputLength: log.output ? JSON.stringify(log.output).length : 0,
        });

        // Track provider information if available
        if (log.output && typeof log.output === 'object' && log.output.routing_metadata) {
          const provider = log.output.routing_metadata.provider;
          if (provider && !providersUsed.includes(provider)) {
            providersUsed.push(provider);
          }
        }
      };

      // Execute the multi-agent itinerary generation
      itineraryResult = await generateMultiAgentItinerary(sampleTravelData, mockCallback);

      const agentDuration = Date.now() - agentStart;

      // Validate the result structure
      const hasValidStructure =
        itineraryResult &&
        typeof itineraryResult === 'object' &&
        itineraryResult.itinerary &&
        Array.isArray(itineraryResult.itinerary);

      if (!hasValidStructure) {
        throw new Error('Invalid itinerary structure returned');
      }

      results.push({
        phase: 'Multi-Agent Execution',
        success: true,
        duration: agentDuration,
        details: {
          agentLogs: agentLogs.length,
        },
      });

      console.log(`✅ Phase 2 completed in ${agentDuration}ms`);
      console.log(`   Generated itinerary with ${itineraryResult.itinerary.length} days`);
      console.log(`   Captured ${agentLogs.length} agent interactions`);
      console.log('');

      // Phase 3: Result validation
      console.log('🔍 Phase 3: Validating result quality...');
      const validationStart = Date.now();

      const validationChecks = {
        hasItinerary: !!itineraryResult.itinerary,
        hasMultipleDays: itineraryResult.itinerary.length > 0,
        hasDayStructure: itineraryResult.itinerary.every(
          (day: any) => day.day && day.activities && Array.isArray(day.activities)
        ),
        hasMetadata: !!itineraryResult.metadata,
        hasAgentLogs: agentLogs.length >= 4, // Should have at least 4 agents
      };

      const allChecksPass = Object.values(validationChecks).every(Boolean);
      const validationDuration = Date.now() - validationStart;

      results.push({
        phase: 'Result Validation',
        success: allChecksPass,
        duration: validationDuration,
        details: {
          ...(validationChecks as any),
        },
      });

      console.log(`${allChecksPass ? '✅' : '❌'} Phase 3 completed in ${validationDuration}ms`);
      console.log('   Validation checks:', validationChecks);
      console.log('');
    } catch (agentError) {
      const agentDuration = Date.now() - agentStart;
      results.push({
        phase: 'Multi-Agent Execution',
        success: false,
        duration: agentDuration,
        error: agentError instanceof Error ? agentError.message : 'Unknown error',
      });
      console.log(`❌ Phase 2 failed in ${agentDuration}ms:`, agentError);
    }
  } catch (importError) {
    const duration = Date.now() - startTime;
    results.push({
      phase: 'Import & Initialization',
      success: false,
      duration,
      error: importError instanceof Error ? importError.message : 'Unknown error',
    });
    console.log(`❌ Phase 1 failed:`, importError);
  }

  const totalDuration = Date.now() - startTime;
  const successfulPhases = results.filter((r) => r.success).length;
  const failedPhases = results.filter((r) => !r.success).length;

  const summary = {
    totalDuration,
    successfulPhases,
    failedPhases,
    providersUsed,
    totalAgentInteractions,
  };

  console.log('📊 Validation Summary:');
  console.log(`   Total Duration: ${totalDuration}ms`);
  console.log(`   Successful Phases: ${successfulPhases}/${results.length}`);
  console.log(`   Failed Phases: ${failedPhases}/${results.length}`);
  console.log(`   Providers Used: ${providersUsed.join(', ') || 'None detected'}`);
  console.log(`   Agent Interactions: ${totalAgentInteractions}`);
  console.log('');

  const success = failedPhases === 0;
  console.log(`${success ? '🎉' : '💥'} Overall Result: ${success ? 'SUCCESS' : 'FAILURE'}`);

  return {
    success,
    results,
    summary,
  };
}

// Export for use in other validation scripts
export { sampleTravelData };
