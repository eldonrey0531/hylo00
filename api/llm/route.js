// Main LLM routing endpoint with LangChain integration - Vercel Edge Function
import { groqProvider } from '../providers/groq.js';
import { googleProvider } from '../providers/google.js';
import { cerebrasProvider } from '../providers/cerebras.js';
import { router, fallbackHandler } from '../utils/routing.js';
import { observability } from '../utils/observability.js';

export const config = {
  runtime: 'edge',
};

const providers = {
  groq: groqProvider,
  google: googleProvider,
  cerebras: cerebrasProvider,
};

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
    const { query, context = {}, systemPrompt, complexity: requestedComplexity } = body;

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Start main trace for the entire request
    mainTrace = await observability.startTrace('llm-route-request', {
      query,
      context,
      requested_complexity: requestedComplexity,
    });

    // Analyze complexity if not provided
    const complexity = requestedComplexity || router.analyzeComplexity(query, context);

    // Select provider and fallback chain
    const routing = router.selectProvider(complexity);
    router.logRoutingDecision(routing, query, context);

    // Get appropriate model for primary provider
    const model = router.getModelForProvider(routing.primary, complexity);

    // Prepare request for provider
    const providerRequest = {
      query,
      systemPrompt,
      model,
      complexity,
      fallback_chain: [routing.primary, ...routing.fallbacks],
      context,
    };

    // Execute with fallback handling
    const operation = async (providerName) => {
      const provider = providers[providerName];
      if (!provider) {
        throw new Error(`Provider ${providerName} not found`);
      }

      // Ensure provider is available
      if (!(await provider.isAvailable())) {
        throw new Error(`Provider ${providerName} is not available`);
      }

      if (!(await provider.hasCapacity())) {
        throw new Error(`Provider ${providerName} has no capacity`);
      }

      // Use model appropriate for this provider
      const providerModel = router.getModelForProvider(providerName, complexity);
      const requestWithModel = { ...providerRequest, model: providerModel };

      return await provider.generate(requestWithModel);
    };

    const result = await fallbackHandler.executeWithFallback(operation, routing, [
      routing.primary,
      ...routing.fallbacks,
    ]);

    const endTime = Date.now();
    const totalLatency = endTime - startTime;

    // Prepare response
    const response = {
      content: result.result.content,
      usage: result.result.usage,
      metadata: {
        provider_used: result.provider_used,
        model_used: result.result.model,
        complexity,
        routing_decision: routing,
        attempt_count: result.attempt_count,
        total_latency_ms: totalLatency,
        provider_latency_ms: result.result.latency_ms,
        cost_estimate: result.result.cost_estimate,
        trace_id: mainTrace.trace_id,
      },
    };

    // End main trace
    await observability.endTrace(mainTrace, response, {
      model: result.result.model,
      provider: result.provider_used,
      tokens_input: result.result.usage.input_tokens,
      tokens_output: result.result.usage.output_tokens,
      latency_ms: totalLatency,
      complexity,
      fallback_chain: result.fallback_chain,
      cost_estimate: result.result.cost_estimate,
      success: true,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const endTime = Date.now();
    const totalLatency = endTime - startTime;

    console.error('❌ LLM routing error:', error);

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
          latency_ms: totalLatency,
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
        error: 'LLM request failed',
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
