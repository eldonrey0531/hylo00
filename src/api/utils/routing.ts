/**
 * Routing Engine for LLM Provider Selection
 *
 * Implements complexity analysis and intelligent provider routing with
 * constitutional compliance for observable operations and multi-LLM resilience.
 */

import type {
  LLMRequest,
  LLMProvider,
  ProviderName,
  ComplexityLevel,
  ComplexityAnalysis,
  ComplexityFactor,
  RoutingDecision,
  ProviderCandidate,
} from '../types/index.js';
import type { ProviderFactory } from '../providers/factory.js';

/**
 * Routing configuration for complexity analysis
 */
interface RoutingConfig {
  readonly complexityThresholds: {
    readonly low: number; // 0.0 - 0.3
    readonly medium: number; // 0.3 - 0.7
    readonly high: number; // 0.7 - 1.0
  };
  readonly factorWeights: {
    readonly queryLength: number;
    readonly technicalTerms: number;
    readonly multiStep: number;
    readonly contextDepth: number;
    readonly outputFormat: number;
  };
  readonly providerPreferences: {
    readonly speedPriority: ProviderName[];
    readonly qualityPriority: ProviderName[];
    readonly costPriority: ProviderName[];
  };
  readonly fallbackRules: {
    readonly maxRetries: number;
    readonly timeoutMs: number;
    readonly errorThreshold: number;
  };
}

/**
 * Routing engine for intelligent LLM provider selection
 * Constitutional requirement: Observable AI operations with multi-LLM resilience
 */
export class RoutingEngine {
  private readonly config: RoutingConfig;
  private readonly providerFactory: ProviderFactory;

  constructor(providerFactory: ProviderFactory, config?: Partial<RoutingConfig>) {
    this.providerFactory = providerFactory;
    this.config = this.mergeConfig(config);
  }

  // =============================================================================
  // Main Routing Methods
  // =============================================================================

  /**
   * Analyze query complexity and route to best provider
   * Constitutional requirement: Intelligent routing with transparency
   */
  async routeRequest(request: LLMRequest): Promise<RoutingDecision> {
    try {
      // Step 1: Analyze complexity
      const complexityAnalysis = await this.analyzeComplexity(request);

      // Step 2: Get available providers
      const healthyProviders = await this.providerFactory.getHealthyProviders();

      if (Object.keys(healthyProviders).length === 0) {
        throw new Error('No healthy providers available');
      }

      // Step 3: Evaluate provider candidates
      const candidates = await this.evaluateProviders(
        Object.values(healthyProviders),
        complexityAnalysis,
        request
      );

      // Step 4: Select best provider
      const selectedProvider = this.selectBestProvider(candidates, complexityAnalysis);

      // Step 5: Build fallback chain
      const fallbackChain = await this.buildFallbackChain(
        selectedProvider.name,
        complexityAnalysis.level
      );

      const routingDecision: RoutingDecision = {
        selectedProvider: selectedProvider.name,
        reasoning: this.generateReasoning(selectedProvider, complexityAnalysis),
        candidateProviders: candidates,
        complexityScore: complexityAnalysis.score,
        fallbackChain,
      };

      return routingDecision;
    } catch (error) {
      throw new Error(`Routing failed: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze query complexity using multiple factors
   * Constitutional requirement: Transparent complexity analysis
   */
  async analyzeComplexity(request: LLMRequest): Promise<ComplexityAnalysis> {
    const factors: ComplexityFactor[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Factor 1: Query Length
    const lengthFactor = this.analyzeQueryLength(request.query);
    factors.push(lengthFactor);
    totalScore += lengthFactor.value * lengthFactor.weight;
    totalWeight += lengthFactor.weight;

    // Factor 2: Technical Terms
    const technicalFactor = this.analyzeTechnicalTerms(request.query);
    factors.push(technicalFactor);
    totalScore += technicalFactor.value * technicalFactor.weight;
    totalWeight += technicalFactor.weight;

    // Factor 3: Multi-Step Reasoning
    const multiStepFactor = this.analyzeMultiStepReasoning(request.query);
    factors.push(multiStepFactor);
    totalScore += multiStepFactor.value * multiStepFactor.weight;
    totalWeight += multiStepFactor.weight;

    // Factor 4: Context Depth
    const contextFactor = this.analyzeContextDepth(request);
    factors.push(contextFactor);
    totalScore += contextFactor.value * contextFactor.weight;
    totalWeight += contextFactor.weight;

    // Factor 5: Output Format Complexity
    const outputFactor = this.analyzeOutputFormat(request);
    factors.push(outputFactor);
    totalScore += outputFactor.value * outputFactor.weight;
    totalWeight += outputFactor.weight;

    // Calculate normalized score
    const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    // Determine complexity level
    const level = this.determineComplexityLevel(normalizedScore);

    // Detect patterns
    const patterns = this.detectPatterns(request.query, factors);

    // Generate reasoning
    const reasoning = this.generateComplexityReasoning(factors, level, normalizedScore);

    // Estimate tokens
    const tokenEstimate = this.estimateTokens(request.query);

    return {
      level,
      score: normalizedScore,
      detectedPatterns: patterns,
      reasoning,
      tokenEstimate,
      factors,
    };
  }

  // =============================================================================
  // Complexity Analysis Methods
  // =============================================================================

  private analyzeQueryLength(query: string): ComplexityFactor {
    const length = query.length;
    const words = query.split(/\s+/).length;

    // Score based on character count and word count
    let value = 0;
    if (length < 100 || words < 20) {
      value = 0.1; // Very short
    } else if (length < 300 || words < 60) {
      value = 0.3; // Short
    } else if (length < 800 || words < 150) {
      value = 0.6; // Medium
    } else {
      value = 0.9; // Long
    }

    return {
      type: 'query_length',
      weight: this.config.factorWeights.queryLength,
      value,
      description: `Query has ${words} words (${length} characters)`,
    };
  }

  private analyzeTechnicalTerms(query: string): ComplexityFactor {
    const technicalPatterns = [
      // Travel industry terms
      /\b(itinerary|accommodation|transportation|logistics|booking|reservation)\b/gi,
      // Complex planning terms
      /\b(optimization|algorithm|analysis|evaluation|comparison|recommendation)\b/gi,
      // Geographic and cultural terms
      /\b(geographical|cultural|historical|architectural|culinary)\b/gi,
      // Time and scheduling
      /\b(schedule|timeline|duration|availability|constraint|requirement)\b/gi,
      // Budget and cost terms
      /\b(budget|cost|pricing|expense|financial|economic)\b/gi,
    ];

    let technicalCount = 0;
    technicalPatterns.forEach((pattern) => {
      const matches = query.match(pattern);
      if (matches) {
        technicalCount += matches.length;
      }
    });

    const words = query.split(/\s+/).length;
    const technicalRatio = words > 0 ? technicalCount / words : 0;

    let value = Math.min(technicalRatio * 3, 1); // Scale to 0-1

    return {
      type: 'technical_terms',
      weight: this.config.factorWeights.technicalTerms,
      value,
      description: `Found ${technicalCount} technical terms in ${words} words (${(
        technicalRatio * 100
      ).toFixed(1)}% ratio)`,
    };
  }

  private analyzeMultiStepReasoning(query: string): ComplexityFactor {
    const multiStepPatterns = [
      // Sequential indicators
      /\b(first|second|third|then|next|after|before|finally|lastly)\b/gi,
      // Planning indicators
      /\b(plan|organize|arrange|coordinate|consider|evaluate|compare)\b/gi,
      // Conditional reasoning
      /\b(if|unless|provided|depending|based on|according to)\b/gi,
      // Multiple requirements
      /\b(both|all|various|multiple|several|different|alternative)\b/gi,
    ];

    let stepCount = 0;
    multiStepPatterns.forEach((pattern) => {
      const matches = query.match(pattern);
      if (matches) {
        stepCount += matches.length;
      }
    });

    // Look for enumeration patterns
    const listPatterns = /\b\d+\./g;
    const bulletPatterns = /[-*•]/g;
    const enumerationMatches =
      (query.match(listPatterns) || []).length + (query.match(bulletPatterns) || []).length;

    const totalIndicators = stepCount + enumerationMatches;
    let value = Math.min(totalIndicators * 0.15, 1); // Scale to 0-1

    return {
      type: 'multi_step',
      weight: this.config.factorWeights.multiStep,
      value,
      description: `Found ${totalIndicators} multi-step reasoning indicators`,
    };
  }

  private analyzeContextDepth(request: LLMRequest): ComplexityFactor {
    // Analyze context from request metadata and options
    let contextFactors = 0;

    // Check for session continuation
    if (request.metadata?.sessionId) {
      contextFactors += 1;
    }

    // Check for user preferences
    if (request.metadata?.userPreference) {
      contextFactors += 1;
    }

    // Check for complex options
    if (request.options?.maxTokens && request.options.maxTokens > 2000) {
      contextFactors += 1;
    }

    if (request.options?.temperature && request.options.temperature !== 0.7) {
      contextFactors += 0.5; // Custom temperature suggests specific needs
    }

    if (request.options?.stopSequences && request.options.stopSequences.length > 0) {
      contextFactors += 0.5;
    }

    const value = Math.min(contextFactors * 0.2, 1);

    return {
      type: 'context_depth',
      weight: this.config.factorWeights.contextDepth,
      value,
      description: `Context complexity from ${contextFactors} factors`,
    };
  }

  private analyzeOutputFormat(request: LLMRequest): ComplexityFactor {
    const query = request.query.toLowerCase();
    let formatComplexity = 0;

    // JSON/structured output
    if (query.includes('json') || query.includes('format') || query.includes('structure')) {
      formatComplexity += 0.3;
    }

    // Tables or lists
    if (query.includes('table') || query.includes('list') || query.includes('bullet')) {
      formatComplexity += 0.2;
    }

    // Detailed formatting requirements
    if (
      query.includes('detailed') ||
      query.includes('comprehensive') ||
      query.includes('complete')
    ) {
      formatComplexity += 0.3;
    }

    // Multiple output sections
    if (query.includes('section') || query.includes('part') || query.includes('chapter')) {
      formatComplexity += 0.2;
    }

    const value = Math.min(formatComplexity, 1);

    return {
      type: 'output_format',
      weight: this.config.factorWeights.outputFormat,
      value,
      description: `Output format complexity score: ${formatComplexity.toFixed(2)}`,
    };
  }

  private determineComplexityLevel(score: number): ComplexityLevel {
    if (score <= this.config.complexityThresholds.low) {
      return 'low';
    } else if (score <= this.config.complexityThresholds.medium) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  private detectPatterns(query: string, factors: ComplexityFactor[]): string[] {
    const patterns: string[] = [];

    // Travel planning patterns
    if (query.toLowerCase().includes('travel') || query.toLowerCase().includes('trip')) {
      patterns.push('travel_planning');
    }

    if (query.toLowerCase().includes('itinerary')) {
      patterns.push('itinerary_generation');
    }

    // Complexity patterns from factors
    const highFactors = factors.filter((f) => f.value > 0.7);
    if (highFactors.length > 2) {
      patterns.push('high_complexity_multi_factor');
    }

    if (factors.find((f) => f.type === 'multi_step' && f.value > 0.5)) {
      patterns.push('multi_step_reasoning');
    }

    if (factors.find((f) => f.type === 'technical_terms' && f.value > 0.6)) {
      patterns.push('technical_content');
    }

    return patterns;
  }

  private generateComplexityReasoning(
    factors: ComplexityFactor[],
    level: ComplexityLevel,
    score: number
  ): string {
    const topFactors = factors.sort((a, b) => b.value * b.weight - a.value * a.weight).slice(0, 3);

    const factorDescriptions = topFactors.map((f) => f.description).join(', ');

    return `Complexity level: ${level} (score: ${score.toFixed(
      3
    )}). Key factors: ${factorDescriptions}`;
  }

  private estimateTokens(query: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(query.length / 4);
  }

  // =============================================================================
  // Provider Selection Methods
  // =============================================================================

  private async evaluateProviders(
    providers: LLMProvider[],
    complexity: ComplexityAnalysis,
    request: LLMRequest
  ): Promise<ProviderCandidate[]> {
    const candidates: ProviderCandidate[] = [];

    for (const provider of providers) {
      const candidate = await this.evaluateProvider(provider, complexity, request);
      candidates.push(candidate);
    }

    return candidates.sort((a, b) => b.score - a.score);
  }

  private async evaluateProvider(
    provider: LLMProvider,
    complexity: ComplexityAnalysis,
    request: LLMRequest
  ): Promise<ProviderCandidate> {
    const available = await provider.isAvailable();
    const hasCapacity = await provider.hasCapacity();
    const metrics = await provider.getMetrics();

    // Calculate base score from complexity match
    let score = 0;
    if (provider.preferredComplexity === complexity.level) {
      score += 0.4; // Perfect match
    } else if (
      (provider.preferredComplexity === 'medium' && complexity.level !== 'medium') ||
      (complexity.level === 'medium' && provider.preferredComplexity !== 'medium')
    ) {
      score += 0.2; // Partial match
    }

    // Adjust for availability and capacity
    if (!available) {
      score = 0;
    } else if (!hasCapacity) {
      score *= 0.3;
    }

    // Adjust for historical performance
    if (metrics.successfulRequests > 0) {
      const successRate = metrics.successfulRequests / metrics.requestCount;
      score *= successRate;
    }

    // Adjust for speed preference if low complexity
    if (complexity.level === 'low') {
      score += (1 / provider.timeoutMs) * 1000; // Favor faster providers
    }

    // Estimate latency and cost
    const estimatedLatency = available
      ? metrics.averageLatencyMs || provider.timeoutMs / 2
      : provider.timeoutMs;
    const estimatedCost = this.estimateCost(provider, complexity.tokenEstimate);

    return {
      name: provider.name,
      score,
      available,
      hasCapacity,
      estimatedLatency,
      estimatedCost,
    };
  }

  private selectBestProvider(
    candidates: ProviderCandidate[],
    complexity: ComplexityAnalysis
  ): ProviderCandidate {
    const availableCandidates = candidates.filter((c) => c.available && c.hasCapacity);

    if (availableCandidates.length === 0) {
      // Fallback to any available provider
      const anyAvailable = candidates.filter((c) => c.available);
      if (anyAvailable.length === 0) {
        throw new Error('No available providers for routing');
      }
      return anyAvailable[0];
    }

    return availableCandidates[0]; // Already sorted by score
  }

  private async buildFallbackChain(
    primaryProvider: ProviderName,
    complexity: ComplexityLevel
  ): Promise<ProviderName[]> {
    const allProviders = await this.providerFactory.getHealthyProviders();
    const providerNames = Object.keys(allProviders) as ProviderName[];

    // Remove primary provider from chain
    const fallbackCandidates = providerNames.filter((name) => name !== primaryProvider);

    // Sort by preference for the complexity level
    return fallbackCandidates.sort((a, b) => {
      const providerA = allProviders[a];
      const providerB = allProviders[b];

      // Prefer providers that match complexity
      const aMatch = providerA.preferredComplexity === complexity ? 1 : 0;
      const bMatch = providerB.preferredComplexity === complexity ? 1 : 0;

      if (aMatch !== bMatch) {
        return bMatch - aMatch;
      }

      // Secondary sort by timeout (faster first)
      return providerA.timeoutMs - providerB.timeoutMs;
    });
  }

  private generateReasoning(candidate: ProviderCandidate, complexity: ComplexityAnalysis): string {
    const reasons: string[] = [];

    // Complexity match reason
    if (candidate.name === 'cerebras' && complexity.level === 'high') {
      reasons.push(
        'Cerebras selected for high-complexity travel planning requiring advanced reasoning'
      );
    } else if (candidate.name === 'gemini' && complexity.level === 'medium') {
      reasons.push('Gemini selected for balanced performance on medium-complexity travel queries');
    } else if (candidate.name === 'groq' && complexity.level === 'low') {
      reasons.push('Groq selected for fast response on straightforward travel questions');
    } else {
      reasons.push(`${candidate.name} selected as best available provider`);
    }

    // Performance reasons
    if (candidate.score > 0.8) {
      reasons.push('High confidence score based on availability and performance history');
    } else if (candidate.score > 0.5) {
      reasons.push('Moderate confidence score with acceptable performance metrics');
    } else {
      reasons.push('Lower confidence due to capacity constraints or performance issues');
    }

    return reasons.join('. ');
  }

  private estimateCost(provider: LLMProvider, tokenEstimate: number): number {
    // Mock cost calculation - in real implementation, use actual provider pricing
    const baseCosts: Record<ProviderName, number> = {
      groq: 0.0000003, // Lowest cost
      gemini: 0.0000005, // Medium cost
      cerebras: 0.000001, // Highest cost (more capable)
    };

    return (baseCosts[provider.name] || 0.000001) * tokenEstimate;
  }

  // =============================================================================
  // Configuration Management
  // =============================================================================

  private mergeConfig(userConfig?: Partial<RoutingConfig>): RoutingConfig {
    const defaultConfig: RoutingConfig = {
      complexityThresholds: {
        low: 0.3,
        medium: 0.7,
        high: 1.0,
      },
      factorWeights: {
        queryLength: 0.2,
        technicalTerms: 0.25,
        multiStep: 0.25,
        contextDepth: 0.15,
        outputFormat: 0.15,
      },
      providerPreferences: {
        speedPriority: ['groq', 'gemini', 'cerebras'],
        qualityPriority: ['cerebras', 'gemini', 'groq'],
        costPriority: ['groq', 'gemini', 'cerebras'],
      },
      fallbackRules: {
        maxRetries: 3,
        timeoutMs: 30000,
        errorThreshold: 0.1,
      },
    };

    return {
      ...defaultConfig,
      ...userConfig,
      complexityThresholds: {
        ...defaultConfig.complexityThresholds,
        ...userConfig?.complexityThresholds,
      },
      factorWeights: {
        ...defaultConfig.factorWeights,
        ...userConfig?.factorWeights,
      },
      providerPreferences: {
        ...defaultConfig.providerPreferences,
        ...userConfig?.providerPreferences,
      },
      fallbackRules: {
        ...defaultConfig.fallbackRules,
        ...userConfig?.fallbackRules,
      },
    };
  }

  /**
   * Get current routing configuration
   */
  getConfig(): RoutingConfig {
    return { ...this.config };
  }

  /**
   * Update routing configuration
   */
  updateConfig(newConfig: Partial<RoutingConfig>): void {
    Object.assign(this.config, this.mergeConfig(newConfig));
  }
}

/**
 * Create a routing engine instance
 * Constitutional requirement: Centralized routing logic
 */
export function createRoutingEngine(
  providerFactory: ProviderFactory,
  config?: Partial<RoutingConfig>
): RoutingEngine {
  return new RoutingEngine(providerFactory, config);
}
