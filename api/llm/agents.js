// Multi-agent service with LangChain integration
import { observability } from '../utils/observability.js';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const startTime = Date.now();
  let mainTrace = null;

  try {
    const body = await req.json();
    const { travelData, complexity = 'high' } = body;

    if (!travelData) {
      return new Response(JSON.stringify({ error: 'Travel data is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Start main trace for multi-agent workflow
    mainTrace = await observability.startTrace('multi-agent-workflow', {
      travel_data: travelData,
      complexity,
    });

    // Create a readable stream for server-sent events
    const stream = new ReadableStream({
      start(controller) {
        processMultiAgentWorkflow(controller, travelData, complexity, mainTrace);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('❌ Multi-agent workflow error:', error);

    // End trace with error
    if (mainTrace) {
      await observability.endTrace(
        mainTrace,
        {},
        {
          model: '',
          provider: '',
          tokens_input: 0,
          tokens_output: 0,
          latency_ms: Date.now() - startTime,
          complexity: 'unknown',
          fallback_chain: [],
          cost_estimate: 0,
          success: false,
          error: error.message,
        },
        error
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Multi-agent workflow failed',
        message: error.message,
        trace_id: mainTrace?.trace_id,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function processMultiAgentWorkflow(controller, travelData, complexity, mainTrace) {
  try {
    const sendUpdate = (data) => {
      controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Agent 1: Data Gatherer
    sendUpdate({
      agent: 'data-gatherer',
      status: 'starting',
      message: 'Analyzing travel preferences and requirements...',
      timestamp: new Date().toISOString(),
    });

    const agent1Trace = await observability.createChildSpan(mainTrace, 'agent-1-data-gatherer', {
      travel_data: travelData,
    });

    const dataAnalysis = await callLLMRoute({
      query: createDataGathererPrompt(travelData),
      complexity: 'medium',
      systemPrompt:
        'You are a travel data analysis expert. Analyze user preferences and extract key insights.',
    });

    await observability.endTrace(agent1Trace, dataAnalysis, {
      model: dataAnalysis.metadata?.model_used || '',
      provider: dataAnalysis.metadata?.provider_used || '',
      tokens_input: dataAnalysis.usage?.input_tokens || 0,
      tokens_output: dataAnalysis.usage?.output_tokens || 0,
      latency_ms: dataAnalysis.metadata?.provider_latency_ms || 0,
      complexity: 'medium',
      fallback_chain: dataAnalysis.metadata?.routing_decision?.fallbacks || [],
      cost_estimate: dataAnalysis.metadata?.cost_estimate || 0,
      success: true,
    });

    sendUpdate({
      agent: 'data-gatherer',
      status: 'completed',
      message: 'Travel preferences analyzed successfully',
      result: dataAnalysis.content,
      metadata: dataAnalysis.metadata,
      timestamp: new Date().toISOString(),
    });

    // Agent 2: Travel Analyzer
    sendUpdate({
      agent: 'travel-analyzer',
      status: 'starting',
      message: 'Analyzing destination options and constraints...',
      timestamp: new Date().toISOString(),
    });

    const agent2Trace = await observability.createChildSpan(mainTrace, 'agent-2-travel-analyzer', {
      data_analysis: dataAnalysis.content,
      travel_data: travelData,
    });

    const travelAnalysis = await callLLMRoute({
      query: createTravelAnalyzerPrompt(travelData, dataAnalysis.content),
      complexity: 'high',
      systemPrompt:
        'You are a travel analysis expert. Evaluate destinations, logistics, and constraints.',
    });

    await observability.endTrace(agent2Trace, travelAnalysis, {
      model: travelAnalysis.metadata?.model_used || '',
      provider: travelAnalysis.metadata?.provider_used || '',
      tokens_input: travelAnalysis.usage?.input_tokens || 0,
      tokens_output: travelAnalysis.usage?.output_tokens || 0,
      latency_ms: travelAnalysis.metadata?.provider_latency_ms || 0,
      complexity: 'high',
      fallback_chain: travelAnalysis.metadata?.routing_decision?.fallbacks || [],
      cost_estimate: travelAnalysis.metadata?.cost_estimate || 0,
      success: true,
    });

    sendUpdate({
      agent: 'travel-analyzer',
      status: 'completed',
      message: 'Destination analysis completed',
      result: travelAnalysis.content,
      metadata: travelAnalysis.metadata,
      timestamp: new Date().toISOString(),
    });

    // Agent 3: Itinerary Planner
    sendUpdate({
      agent: 'itinerary-planner',
      status: 'starting',
      message: 'Creating comprehensive travel itinerary...',
      timestamp: new Date().toISOString(),
    });

    const agent3Trace = await observability.createChildSpan(
      mainTrace,
      'agent-3-itinerary-planner',
      {
        data_analysis: dataAnalysis.content,
        travel_analysis: travelAnalysis.content,
        travel_data: travelData,
      }
    );

    const itinerary = await callLLMRoute({
      query: createItineraryPlannerPrompt(travelData, dataAnalysis.content, travelAnalysis.content),
      complexity: 'high',
      systemPrompt:
        'You are an expert travel itinerary planner. Create detailed, personalized travel plans.',
    });

    await observability.endTrace(agent3Trace, itinerary, {
      model: itinerary.metadata?.model_used || '',
      provider: itinerary.metadata?.provider_used || '',
      tokens_input: itinerary.usage?.input_tokens || 0,
      tokens_output: itinerary.usage?.output_tokens || 0,
      latency_ms: itinerary.metadata?.provider_latency_ms || 0,
      complexity: 'high',
      fallback_chain: itinerary.metadata?.routing_decision?.fallbacks || [],
      cost_estimate: itinerary.metadata?.cost_estimate || 0,
      success: true,
    });

    sendUpdate({
      agent: 'itinerary-planner',
      status: 'completed',
      message: 'Travel itinerary created successfully',
      result: itinerary.content,
      metadata: itinerary.metadata,
      timestamp: new Date().toISOString(),
    });

    // Final summary
    const totalCost =
      (dataAnalysis.metadata?.cost_estimate || 0) +
      (travelAnalysis.metadata?.cost_estimate || 0) +
      (itinerary.metadata?.cost_estimate || 0);

    sendUpdate({
      agent: 'workflow-complete',
      status: 'completed',
      message: 'Multi-agent travel planning completed successfully',
      summary: {
        total_cost_estimate: totalCost,
        total_agents: 3,
        trace_id: mainTrace.trace_id,
      },
      timestamp: new Date().toISOString(),
    });

    // End main trace
    await observability.endTrace(
      mainTrace,
      {
        final_itinerary: itinerary.content,
        workflow_summary: {
          agents_completed: 3,
          total_cost: totalCost,
        },
      },
      {
        model: 'multi-agent',
        provider: 'multi-provider',
        tokens_input:
          (dataAnalysis.usage?.input_tokens || 0) +
          (travelAnalysis.usage?.input_tokens || 0) +
          (itinerary.usage?.input_tokens || 0),
        tokens_output:
          (dataAnalysis.usage?.output_tokens || 0) +
          (travelAnalysis.usage?.output_tokens || 0) +
          (itinerary.usage?.output_tokens || 0),
        latency_ms: Date.now() - startTime,
        complexity: complexity,
        fallback_chain: [],
        cost_estimate: totalCost,
        success: true,
      }
    );

    controller.close();
  } catch (error) {
    controller.enqueue(
      `data: ${JSON.stringify({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString(),
      })}\n\n`
    );
    controller.close();
  }
}

// Helper function to call the LLM routing endpoint
async function callLLMRoute(request) {
  const response = await fetch('/api/llm/route', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`LLM route failed: ${response.statusText}`);
  }

  return await response.json();
}

// Prompt creation functions
function createDataGathererPrompt(travelData) {
  return `Analyze the following travel preferences and extract key insights:

Travel Details:
- Destination: ${travelData.tripDetails?.destination || 'Not specified'}
- Duration: ${travelData.tripDetails?.duration || 'Not specified'}
- Budget: ${travelData.tripDetails?.budget || 'Not specified'}
- Travel Dates: ${travelData.tripDetails?.dates || 'Not specified'}

Group Composition: ${travelData.groups?.join(', ') || 'Not specified'}
Interests: ${travelData.interests?.join(', ') || 'Not specified'}
Must Include: ${travelData.inclusions?.join(', ') || 'Not specified'}
Experience Level: ${travelData.experience?.join(', ') || 'Not specified'}
Preferred Vibe: ${travelData.vibes?.join(', ') || 'Not specified'}
Sample Days: ${travelData.sampleDays?.join(', ') || 'Not specified'}
Dining Preferences: ${travelData.dinnerChoices?.join(', ') || 'Not specified'}

Please provide a comprehensive analysis of the traveler's preferences, constraints, and priorities.`;
}

function createTravelAnalyzerPrompt(travelData, dataAnalysis) {
  return `Based on the travel preferences and the following analysis, evaluate destination options and logistics:

Data Analysis:
${dataAnalysis}

Travel Requirements:
- Destination: ${travelData.tripDetails?.destination || 'Not specified'}
- Duration: ${travelData.tripDetails?.duration || 'Not specified'}
- Budget: ${travelData.tripDetails?.budget || 'Not specified'}

Please analyze:
1. Destination feasibility and alternatives
2. Budget considerations and cost optimization
3. Logistical requirements and constraints
4. Seasonal factors and timing recommendations
5. Group-specific considerations

Provide detailed recommendations for optimizing the travel plan.`;
}

function createItineraryPlannerPrompt(travelData, dataAnalysis, travelAnalysis) {
  return `Create a comprehensive travel itinerary based on:

Traveler Analysis:
${dataAnalysis}

Travel Analysis:
${travelAnalysis}

Travel Specifications:
- Destination: ${travelData.tripDetails?.destination || 'Not specified'}
- Duration: ${travelData.tripDetails?.duration || 'Not specified'}
- Budget: ${travelData.tripDetails?.budget || 'Not specified'}
- Group: ${travelData.groups?.join(', ') || 'Not specified'}
- Interests: ${travelData.interests?.join(', ') || 'Not specified'}

Please create a detailed day-by-day itinerary including:
1. Daily activities and attractions
2. Accommodation recommendations
3. Transportation details
4. Dining suggestions
5. Budget breakdown
6. Tips and important notes
7. Alternative options for different preferences

Make the itinerary personalized, practical, and engaging.`;
}
