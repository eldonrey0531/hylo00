/**
 * Provider-specific configuration interfaces for LLM routing infrastructure
 *
 * This file defines configuration interfaces for each LLM provider (Cerebras, Gemini, Groq)
 * ensuring constitutional compliance for multi-LLM resilience and cost optimization.
 */

import type { ProviderName, LLMOptions, ProviderConfig, TokenUsage, ErrorInfo } from './index.js';

// =============================================================================
// Cerebras Provider Configuration
// =============================================================================

/**
 * Cerebras-specific configuration for complex query processing
 * Optimized for high-complexity travel planning and analysis
 */
export interface CerebrasConfig extends ProviderConfig {
  readonly provider: 'cerebras';
  readonly modelName: string;
  readonly endpoint: string;
  readonly features: {
    readonly supportsFunctionCalling: boolean;
    readonly supportsStreaming: boolean;
    readonly supportsSystemPrompts: boolean;
    readonly maxContextTokens: number;
    readonly maxOutputTokens: number;
  };
  readonly optimization: {
    readonly preferLargeContext: boolean;
    readonly enableParallelProcessing: boolean;
    readonly useAdvancedReasoning: boolean;
  };
}

export interface CerebrasRequest {
  readonly model: string;
  readonly messages: CerebrasMessage[];
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly topP?: number;
  readonly stream?: boolean;
  readonly stop?: string[];
  readonly presencePenalty?: number;
  readonly frequencyPenalty?: number;
  readonly functions?: CerebrasFunction[];
  readonly functionCall?: 'auto' | 'none' | { name: string };
}

export interface CerebrasMessage {
  readonly role: 'system' | 'user' | 'assistant' | 'function';
  readonly content: string;
  readonly name?: string;
  readonly functionCall?: CebrasFunctionCall;
}

export interface CerebrasFunction {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
}

export interface CebrasFunctionCall {
  readonly name: string;
  readonly arguments: string;
}

export interface CerebrasResponse {
  readonly id: string;
  readonly object: 'chat.completion';
  readonly created: number;
  readonly model: string;
  readonly choices: CerebrasChoice[];
  readonly usage: CerebrasUsage;
}

export interface CerebrasChoice {
  readonly index: number;
  readonly message: CerebrasMessage;
  readonly finishReason: 'stop' | 'length' | 'function_call' | 'content_filter';
}

export interface CerebrasUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface CerebrasStreamChunk {
  readonly id: string;
  readonly object: 'chat.completion.chunk';
  readonly created: number;
  readonly model: string;
  readonly choices: CerebrasStreamChoice[];
}

export interface CerebrasStreamChoice {
  readonly index: number;
  readonly delta: {
    readonly role?: string;
    readonly content?: string;
    readonly functionCall?: Partial<CebrasFunctionCall>;
  };
  readonly finishReason?: string;
}

// =============================================================================
// Google Gemini Provider Configuration
// =============================================================================

/**
 * Google Gemini-specific configuration for balanced workloads
 * Optimized for general travel queries with good speed/quality balance
 */
export interface GeminiConfig extends ProviderConfig {
  readonly provider: 'gemini';
  readonly modelName: string;
  readonly projectId?: string;
  readonly location?: string;
  readonly features: {
    readonly supportsMultimodal: boolean;
    readonly supportsStreaming: boolean;
    readonly supportsSafetySettings: boolean;
    readonly maxContextTokens: number;
    readonly maxOutputTokens: number;
  };
  readonly safetySettings: GeminiSafetySettings;
  readonly optimization: {
    readonly enableGrounding: boolean;
    readonly useCodeExecution: boolean;
    readonly enableFactChecking: boolean;
  };
}

export interface GeminiRequest {
  readonly contents: GeminiContent[];
  readonly generationConfig?: GeminiGenerationConfig;
  readonly safetySettings?: GeminiSafetySetting[];
  readonly tools?: GeminiTool[];
  readonly systemInstruction?: GeminiContent;
}

export interface GeminiContent {
  readonly role: 'user' | 'model';
  readonly parts: GeminiPart[];
}

export interface GeminiPart {
  readonly text?: string;
  readonly inlineData?: {
    readonly mimeType: string;
    readonly data: string;
  };
  readonly functionCall?: GeminiFunctionCall;
  readonly functionResponse?: GeminiFunctionResponse;
}

export interface GeminiGenerationConfig {
  readonly temperature?: number;
  readonly topP?: number;
  readonly topK?: number;
  readonly maxOutputTokens?: number;
  readonly stopSequences?: string[];
  readonly candidateCount?: number;
}

export interface GeminiSafetySettings {
  readonly harassmentThreshold: GeminiSafetyThreshold;
  readonly hateSpeechThreshold: GeminiSafetyThreshold;
  readonly sexuallyExplicitThreshold: GeminiSafetyThreshold;
  readonly dangerousContentThreshold: GeminiSafetyThreshold;
}

export type GeminiSafetyThreshold =
  | 'HARM_BLOCK_THRESHOLD_UNSPECIFIED'
  | 'BLOCK_LOW_AND_ABOVE'
  | 'BLOCK_MEDIUM_AND_ABOVE'
  | 'BLOCK_ONLY_HIGH'
  | 'BLOCK_NONE';

export interface GeminiSafetySetting {
  readonly category: GeminiSafetyCategory;
  readonly threshold: GeminiSafetyThreshold;
}

export type GeminiSafetyCategory =
  | 'HARM_CATEGORY_HARASSMENT'
  | 'HARM_CATEGORY_HATE_SPEECH'
  | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
  | 'HARM_CATEGORY_DANGEROUS_CONTENT';

export interface GeminiTool {
  readonly functionDeclarations: GeminiFunctionDeclaration[];
}

export interface GeminiFunctionDeclaration {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
}

export interface GeminiFunctionCall {
  readonly name: string;
  readonly args: Record<string, unknown>;
}

export interface GeminiFunctionResponse {
  readonly name: string;
  readonly response: Record<string, unknown>;
}

export interface GeminiResponse {
  readonly candidates: GeminiCandidate[];
  readonly promptFeedback?: GeminiPromptFeedback;
  readonly usageMetadata: GeminiUsageMetadata;
}

export interface GeminiCandidate {
  readonly content: GeminiContent;
  readonly finishReason: GeminiFinishReason;
  readonly index: number;
  readonly safetyRatings: GeminiSafetyRating[];
}

export type GeminiFinishReason =
  | 'FINISH_REASON_UNSPECIFIED'
  | 'STOP'
  | 'MAX_TOKENS'
  | 'SAFETY'
  | 'RECITATION'
  | 'OTHER';

export interface GeminiSafetyRating {
  readonly category: GeminiSafetyCategory;
  readonly probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface GeminiPromptFeedback {
  readonly blockReason?: 'BLOCKED_REASON_UNSPECIFIED' | 'SAFETY' | 'OTHER';
  readonly safetyRatings: GeminiSafetyRating[];
}

export interface GeminiUsageMetadata {
  readonly promptTokenCount: number;
  readonly candidatesTokenCount: number;
  readonly totalTokenCount: number;
}

// =============================================================================
// Groq Provider Configuration
// =============================================================================

/**
 * Groq-specific configuration for fast response optimization
 * Optimized for simple queries requiring quick turnaround
 */
export interface GroqConfig extends ProviderConfig {
  readonly provider: 'groq';
  readonly modelName: string;
  readonly features: {
    readonly supportsStreaming: boolean;
    readonly supportsJSONMode: boolean;
    readonly supportsToolCalls: boolean;
    readonly maxContextTokens: number;
    readonly maxOutputTokens: number;
  };
  readonly optimization: {
    readonly prioritizeSpeed: boolean;
    readonly enableCaching: boolean;
    readonly useBatchProcessing: boolean;
  };
  readonly performance: {
    readonly expectedLatencyMs: number;
    readonly maxConcurrentRequests: number;
    readonly requestQueueSize: number;
  };
}

export interface GroqRequest {
  readonly model: string;
  readonly messages: GroqMessage[];
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly topP?: number;
  readonly stream?: boolean;
  readonly stop?: string[];
  readonly presencePenalty?: number;
  readonly frequencyPenalty?: number;
  readonly responseFormat?: GroqResponseFormat;
  readonly tools?: GroqTool[];
  readonly toolChoice?: 'auto' | 'none' | GroqToolChoice;
}

export interface GroqMessage {
  readonly role: 'system' | 'user' | 'assistant' | 'tool';
  readonly content: string;
  readonly name?: string;
  readonly toolCalls?: GroqToolCall[];
  readonly toolCallId?: string;
}

export interface GroqResponseFormat {
  readonly type: 'text' | 'json_object';
}

export interface GroqTool {
  readonly type: 'function';
  readonly function: GroqFunction;
}

export interface GroqFunction {
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
}

export interface GroqToolChoice {
  readonly type: 'function';
  readonly function: {
    readonly name: string;
  };
}

export interface GroqToolCall {
  readonly id: string;
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly arguments: string;
  };
}

export interface GroqResponse {
  readonly id: string;
  readonly object: 'chat.completion';
  readonly created: number;
  readonly model: string;
  readonly choices: GroqChoice[];
  readonly usage: GroqUsage;
  readonly systemFingerprint?: string;
}

export interface GroqChoice {
  readonly index: number;
  readonly message: GroqMessage;
  readonly finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
}

export interface GroqUsage {
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
}

export interface GroqStreamChunk {
  readonly id: string;
  readonly object: 'chat.completion.chunk';
  readonly created: number;
  readonly model: string;
  readonly choices: GroqStreamChoice[];
}

export interface GroqStreamChoice {
  readonly index: number;
  readonly delta: {
    readonly role?: string;
    readonly content?: string;
    readonly toolCalls?: Partial<GroqToolCall>[];
  };
  readonly finishReason?: string;
}

// =============================================================================
// Provider Adapter Interfaces
// =============================================================================

/**
 * Common adapter interface for all providers
 * Ensures consistent API across different LLM providers
 */
export interface ProviderAdapter<TConfig extends ProviderConfig, TRequest, TResponse> {
  readonly config: TConfig;
  readonly name: ProviderName;

  // Configuration and status
  initialize(): Promise<void>;
  validateConfig(): Promise<boolean>;
  getHealth(): Promise<ProviderHealthStatus>;

  // Request transformation
  transformRequest(request: LLMOptions): TRequest;
  transformResponse(response: TResponse): string;
  transformUsage(usage: unknown): TokenUsage;

  // Error handling
  handleError(error: unknown): ErrorInfo;
  shouldRetry(error: ErrorInfo): boolean;

  // Rate limiting and capacity
  checkRateLimit(): Promise<boolean>;
  getCurrentCapacity(): Promise<number>;
  getEstimatedLatency(): Promise<number>;
}

export interface ProviderHealthStatus {
  readonly available: boolean;
  readonly latencyMs: number;
  readonly errorRate: number;
  readonly lastChecked: string;
  readonly capacityUtilization: number;
  readonly error?: ErrorInfo;
}

// =============================================================================
// Provider Factory Types
// =============================================================================

export interface ProviderFactory {
  createProvider(name: ProviderName): Promise<ProviderAdapter<any, any, any>>;
  getAllProviders(): Promise<ProviderAdapter<any, any, any>[]>;
  getAvailableProviders(): Promise<ProviderAdapter<any, any, any>[]>;
  validateProviderConfigs(): Promise<Record<ProviderName, boolean>>;
}

// =============================================================================
// Provider-Specific Constants
// =============================================================================

export const CEREBRAS_DEFAULTS = {
  modelName: 'llama3.1-70b',
  endpoint: 'https://api.cerebras.ai/v1/chat/completions',
  maxContextTokens: 128000,
  maxOutputTokens: 8192,
  timeout: 30000,
  retryAttempts: 2,
} as const;

export const GEMINI_DEFAULTS = {
  modelName: 'gemini-1.5-flash',
  maxContextTokens: 1000000,
  maxOutputTokens: 8192,
  timeout: 20000,
  retryAttempts: 2,
  safetySettings: {
    harassmentThreshold: 'BLOCK_MEDIUM_AND_ABOVE',
    hateSpeechThreshold: 'BLOCK_MEDIUM_AND_ABOVE',
    sexuallyExplicitThreshold: 'BLOCK_MEDIUM_AND_ABOVE',
    dangerousContentThreshold: 'BLOCK_MEDIUM_AND_ABOVE',
  } as GeminiSafetySettings,
} as const;

export const GROQ_DEFAULTS = {
  modelName: 'llama-3.1-70b-versatile',
  maxContextTokens: 131072,
  maxOutputTokens: 8192,
  timeout: 10000,
  retryAttempts: 3,
  expectedLatencyMs: 500,
  maxConcurrentRequests: 10,
} as const;

// =============================================================================
// Provider Detection and Validation
// =============================================================================

export function isValidProviderConfig(config: unknown): config is ProviderConfig {
  if (!config || typeof config !== 'object') return false;

  const c = config as Record<string, unknown>;
  return (
    typeof c.enabled === 'boolean' &&
    typeof c.apiKeyName === 'string' &&
    typeof c.maxTokens === 'number' &&
    typeof c.timeout === 'number' &&
    typeof c.retryAttempts === 'number'
  );
}

export function isCerebrasConfig(config: ProviderConfig): config is CerebrasConfig {
  return 'provider' in config && config.provider === 'cerebras';
}

export function isGeminiConfig(config: ProviderConfig): config is GeminiConfig {
  return 'provider' in config && config.provider === 'gemini';
}

export function isGroqConfig(config: ProviderConfig): config is GroqConfig {
  return 'provider' in config && config.provider === 'groq';
}
