/**
 * LLM Routing Service for Frontend Integration
 *
 * Replaces direct Groq SDK calls with our new multi-provider routing infrastructure
 * while maintaining existing interface compatibility for the travel planning UI.
 *
 * Constitutional compliance:
 * - Edge-first architecture: Routes through /api endpoints
 * - Multi-LLM resilience: Automatic provider fallback
 * - Observable operations: Comprehensive request tracing
 * - Cost-conscious design: Intelligent provider selection
 */

export interface LLMRequest {
  query: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
  };
  metadata?: {
    agentId?: number;
    agentName?: string;
    requestId?: string;
    complexity?: 'low' | 'medium' | 'high';
    tags?: string[];
  };
}

export interface LLMResponse {
  response: string;
  metadata: {
    provider: string;
    latency: number;
    complexity: string;
    requestId: string;
    fallbacksUsed: number;
  };
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface StreamingUpdate {
  type:
    | 'started'
    | 'step'
    | 'complexity'
    | 'routing'
    | 'provider_attempt'
    | 'completed'
    | 'error'
    | 'metrics';
  data: any;
  requestId: string;
  timestamp: number;
}

/**
 * LLM Routing Client
 * Provides the same interface as Groq SDK but routes through our infrastructure
 */
export class LLMRoutingClient {
  private baseUrl: string;
  private enableLogging: boolean;

  constructor(config: { baseUrl?: string; enableLogging?: boolean } = {}) {
    // Auto-detect environment and set appropriate base URL
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    } else if (typeof window !== 'undefined') {
      // Browser environment - determine if we're in dev or production
      const isDev =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (isDev) {
        // Development: Use dev server if running, otherwise fallback to local API
        this.baseUrl = 'http://localhost:3002/api/llm'; // LangChain dev server
      } else {
        // Production: Use relative paths for Vercel deployment
        this.baseUrl = '/api/llm';
      }
    } else {
      // Node.js environment (SSR) - use relative paths
      this.baseUrl = '/api/llm';
    }

    this.enableLogging = config.enableLogging !== false;

    if (this.enableLogging) {
      console.log('🔗 LLM Routing Client initialized:', {
        baseUrl: this.baseUrl,
        environment: typeof window !== 'undefined' ? 'browser' : 'node',
      });
    }
  }

  /**
   * Create a chat completion using our routing infrastructure
   * Maintains compatibility with existing Groq SDK interface
   */
  async createChatCompletion(params: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    model?: string;
    temperature?: number;
    max_tokens?: number;
    response_format?: { type: 'json_object' | 'text' };
    stream?: boolean;
  }): Promise<{
    choices: Array<{
      message: {
        content: string;
        role: 'assistant';
      };
      finish_reason: string;
    }>;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    model: string;
    provider: string;
    routing_metadata: any;
  }> {
    // Convert messages to a single query string
    const query = this.convertMessagesToQuery(params.messages);

    // Determine complexity based on query characteristics
    const complexity = this.analyzeComplexity(query, params);

    const request: LLMRequest = {
      query,
      options: {
        maxTokens: params.max_tokens || 2000,
        temperature: params.temperature || 0.7,
        stream: params.stream || false,
      },
      metadata: {
        requestId: this.generateRequestId(),
        complexity,
        tags: ['travel_planning', 'multi_agent', params.response_format?.type || 'text'],
      },
    };

    if (this.enableLogging) {
      console.log('🚀 Routing LLM request:', {
        complexity,
        tokens: request.options?.maxTokens,
        temperature: request.options?.temperature,
      });
    }

    try {
      const response = await this.routeRequest(request);

      // Convert our response format back to Groq SDK format
      return this.convertToGroqFormat(response, params);
    } catch (error) {
      console.error('LLM routing error:', error);
      throw new Error(
        `LLM request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create streaming chat completion
   */
  async createStreamingCompletion(
    params: Parameters<LLMRoutingClient['createChatCompletion']>[0],
    onUpdate?: (update: StreamingUpdate) => void
  ): Promise<ReadableStream<any>> {
    const query = this.convertMessagesToQuery(params.messages);
    const complexity = this.analyzeComplexity(query, params);

    const request: LLMRequest = {
      query,
      options: {
        maxTokens: params.max_tokens || 2000,
        temperature: params.temperature || 0.7,
        stream: true,
      },
      metadata: {
        requestId: this.generateRequestId(),
        complexity,
        tags: ['travel_planning', 'multi_agent', 'streaming'],
      },
    };

    return this.routeStreamingRequest(request, onUpdate);
  }

  /**
   * Route request through our LLM infrastructure
   */
  private async routeRequest(request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch(`${this.baseUrl}/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(
        `HTTP ${response.status}: ${error.message || error.error || 'Request failed'}`
      );
    }

    // Handle streaming response
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      return this.handleStreamingResponse(response);
    }

    // Handle JSON response
    return response.json();
  }

  /**
   * Route streaming request
   */
  private async routeStreamingRequest(
    request: LLMRequest,
    onUpdate?: (update: StreamingUpdate) => void
  ): Promise<ReadableStream<any>> {
    const response = await fetch(`${this.baseUrl}/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Request failed`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    return new ReadableStream({
      start(controller) {
        const decoder = new TextDecoder();

        function pump(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (onUpdate) {
                    onUpdate(data);
                  }
                  controller.enqueue(data);
                } catch (error) {
                  console.warn('Failed to parse SSE data:', line);
                }
              }
            }

            return pump();
          });
        }

        return pump();
      },
    });
  }

  /**
   * Handle streaming response from server-sent events
   */
  private async handleStreamingResponse(response: Response): Promise<LLMResponse> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    const decoder = new TextDecoder();
    let finalResponse: LLMResponse | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'completed') {
                finalResponse = {
                  response: data.data.response,
                  metadata: data.data.metadata,
                  usage: data.data.usage,
                };
              }
            } catch (error) {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!finalResponse) {
      throw new Error('No final response received from stream');
    }

    return finalResponse;
  }

  /**
   * Convert messages array to single query string
   */
  private convertMessagesToQuery(messages: Array<{ role: string; content: string }>): string {
    // Combine system and user messages into a coherent query
    const systemMessages = messages.filter((m) => m.role === 'system').map((m) => m.content);
    const userMessages = messages.filter((m) => m.role === 'user').map((m) => m.content);

    let query = '';

    if (systemMessages.length > 0) {
      query += `System Instructions: ${systemMessages.join(' ')}\n\n`;
    }

    if (userMessages.length > 0) {
      query += `User Request: ${userMessages.join(' ')}`;
    }

    return query.trim();
  }

  /**
   * Analyze query complexity for routing decisions
   */
  private analyzeComplexity(query: string, params: any): 'low' | 'medium' | 'high' {
    // Length-based analysis
    if (query.length > 3000) return 'high';
    if (query.length > 1000) return 'medium';

    // JSON response format suggests structured output
    if (params.response_format?.type === 'json_object') return 'medium';

    // High token count suggests complex generation
    if (params.max_tokens > 3000) return 'high';
    if (params.max_tokens > 1000) return 'medium';

    // Complex keywords
    const complexKeywords = [
      'analyze',
      'comprehensive',
      'detailed',
      'structure',
      'itinerary',
      'planning',
      'recommendations',
      'research',
    ];
    const complexMatches = complexKeywords.filter((keyword) =>
      query.toLowerCase().includes(keyword)
    ).length;

    if (complexMatches >= 3) return 'high';
    if (complexMatches >= 1) return 'medium';

    return 'low';
  }

  /**
   * Convert our response format to Groq SDK compatible format
   */
  private convertToGroqFormat(response: LLMResponse, originalParams: any): any {
    return {
      choices: [
        {
          message: {
            content: response.response,
            role: 'assistant' as const,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: response.usage?.inputTokens || 0,
        completion_tokens: response.usage?.outputTokens || 0,
        total_tokens: response.usage?.totalTokens || 0,
      },
      model: originalParams.model || 'multi-provider',
      provider: response.metadata.provider,
      routing_metadata: {
        complexity: response.metadata.complexity,
        latency: response.metadata.latency,
        fallbacksUsed: response.metadata.fallbacksUsed,
        requestId: response.metadata.requestId,
      },
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create Groq SDK compatible client using our routing infrastructure
 */
export function createRoutingGroqClient(
  config: { enableLogging?: boolean; baseUrl?: string } = {}
) {
  const client = new LLMRoutingClient(config);

  return {
    chat: {
      completions: {
        create: async (params: Parameters<LLMRoutingClient['createChatCompletion']>[0]) => {
          return client.createChatCompletion(params);
        },
      },
    },
    // Add any other Groq SDK methods that are used
  };
}

/**
 * Default export for easy replacement of Groq import
 */
export default {
  createRoutingGroqClient,
  LLMRoutingClient,
};
