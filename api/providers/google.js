// Google Gemini provider using LangChain
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { observability, LLMMetrics, estimateCost } from '../utils/observability.js';

export class GoogleProvider {
  constructor() {
    this.name = 'google';
    this.client = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the Google client
   */
  async initialize() {
    try {
      if (!process.env.GOOGLE_AI_API_KEY) {
        throw new Error('GOOGLE_AI_API_KEY environment variable is required');
      }

      this.client = new ChatGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_AI_API_KEY,
        temperature: 0.7,
      });

      this.isInitialized = true;
      console.log('✅ Google provider initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google provider:', error);
      throw error;
    }
  }

  /**
   * Check if provider is available
   */
  async isAvailable() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.isInitialized && Boolean(process.env.GOOGLE_AI_API_KEY);
  }

  /**
   * Check if provider has capacity
   */
  async hasCapacity() {
    // Simple capacity check - could be enhanced with actual quota monitoring
    return true;
  }

  /**
   * Generate response using LangChain
   */
  async generate(request) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    let trace = null;

    try {
      // Start observability trace
      trace = await observability.startTrace('google-generate', {
        model: request.model,
        query: request.query,
        complexity: request.complexity,
      });

      // Configure model for request
      const model = request.model || 'gemini-1.5-flash';
      this.client.modelName = model;

      // Prepare messages for LangChain
      const messages = [
        ['system', request.systemPrompt || 'You are a helpful AI assistant.'],
        ['human', request.query],
      ];

      // Generate response
      const response = await this.client.invoke(messages);

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Extract content and usage info
      const content = response.content || response.text || '';
      const usage = response.usage_metadata || response.response_metadata?.usage || {};

      // Estimate tokens if not provided
      const inputTokens = usage.input_tokens || Math.ceil(request.query.length / 4);
      const outputTokens = usage.output_tokens || Math.ceil(content.length / 4);

      // Calculate cost
      const cost = estimateCost('google', model, inputTokens, outputTokens);

      // Create metrics
      const metrics = LLMMetrics.create({
        model,
        provider: 'google',
        tokens_input: inputTokens,
        tokens_output: outputTokens,
        latency_ms: latency,
        complexity: request.complexity,
        fallback_chain: request.fallback_chain || [],
        cost_estimate: cost,
        success: true,
      });

      // End trace
      await observability.endTrace(trace, { content, usage }, metrics);

      return {
        content,
        usage: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens,
        },
        model,
        provider: 'google',
        latency_ms: latency,
        cost_estimate: cost,
      };
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;

      // Create error metrics
      const metrics = LLMMetrics.create({
        model: request.model || 'gemini-1.5-flash',
        provider: 'google',
        tokens_input: 0,
        tokens_output: 0,
        latency_ms: latency,
        complexity: request.complexity,
        fallback_chain: request.fallback_chain || [],
        cost_estimate: 0,
        success: false,
        error: error.message,
      });

      // End trace with error
      if (trace) {
        await observability.endTrace(trace, {}, metrics, error);
      }

      throw error;
    }
  }
}

export const googleProvider = new GoogleProvider();
