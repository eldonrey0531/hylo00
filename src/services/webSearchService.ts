/**
 * Web Search Service for Real-time Travel Information
 * T050-T054: Web search integration for enhanced RAG context
 * Constitutional compliance: Edge-compatible, observable, cost-conscious
 */

import { z } from 'zod';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface WebSearchConfig {
  readonly serpApiKey: string;
  readonly searchEngine: 'google' | 'bing' | 'duckduckgo';
  readonly maxResults: number;
  readonly timeout: number;
  readonly rateLimitDelay: number;
  readonly enableCaching: boolean;
  readonly cacheExpiryHours: number;
}

export interface SearchQuery {
  query: string;
  location?: string | undefined;
  dateRange?:
    | {
        start: string;
        end: string;
      }
    | undefined;
  category?:
    | 'general'
    | 'hotels'
    | 'restaurants'
    | 'activities'
    | 'weather'
    | 'flights'
    | undefined;
  options?:
    | {
        maxResults?: number | undefined;
        freshness?: 'recent' | 'week' | 'month' | 'year' | undefined;
        language?: string | undefined;
      }
    | undefined;
}

export interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  displayLink: string;
  position: number;
  searchInformation?: {
    totalResults: number;
    searchTime: number;
  };
  metadata?: {
    publishedDate?: string;
    category?: string;
    trustScore?: number;
  };
}

export interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  totalResults: number;
  searchTime: number;
  timestamp: string;
  searchEngine: string;
  cached: boolean;
  rateLimited: boolean;
}

export interface WebSearchOperationResult {
  success: boolean;
  data?: WebSearchResponse;
  error?: string;
  duration: number;
  cached: boolean;
  costUsd: number;
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const SearchQuerySchema = z.object({
  query: z.string().min(3).max(500),
  location: z.string().optional(),
  dateRange: z
    .object({
      start: z.string().datetime(),
      end: z.string().datetime(),
    })
    .optional(),
  category: z
    .enum(['general', 'hotels', 'restaurants', 'activities', 'weather', 'flights'])
    .optional(),
  options: z
    .object({
      maxResults: z.number().int().min(1).max(20).optional(),
      freshness: z.enum(['recent', 'week', 'month', 'year']).optional(),
      language: z.string().min(2).max(5).optional(),
    })
    .optional(),
});

// =============================================================================
// WEB SEARCH SERVICE CLASS
// =============================================================================

export class WebSearchService {
  private readonly config: WebSearchConfig;
  private searchCache: Map<string, { data: WebSearchResponse; expires: number }> = new Map();
  private lastSearchTime: number = 0;
  private requestCount: number = 0;
  private readonly maxRequestsPerHour: number = 100; // Rate limiting

  constructor(config: WebSearchConfig) {
    this.config = config;
  }

  /**
   * T050: Primary search method with intelligent query enhancement
   */
  async search(query: SearchQuery): Promise<WebSearchOperationResult> {
    const startTime = Date.now();

    try {
      // Validate input
      const validatedQuery = SearchQuerySchema.parse(query);

      // Generate cache key
      const cacheKey = this.generateCacheKey(validatedQuery);

      // Check cache first
      if (this.config.enableCaching) {
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            duration: Date.now() - startTime,
            cached: true,
            costUsd: 0,
          };
        }
      }

      // Rate limiting check
      const rateLimitResult = this.checkRateLimit();
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          duration: Date.now() - startTime,
          cached: false,
          costUsd: 0,
        };
      }

      // Enhance query for travel-specific searches
      const enhancedQuery = this.enhanceSearchQuery(validatedQuery);

      // Perform search
      const searchResponse = await this.performSearch(enhancedQuery);

      // Cache result
      if (this.config.enableCaching && searchResponse.success) {
        this.cacheResult(cacheKey, searchResponse.data!);
      }

      // Update request tracking
      this.requestCount++;
      this.lastSearchTime = Date.now();

      await this.observeSearchOperation('web_search_completed', {
        query: validatedQuery.query,
        category: validatedQuery.category,
        results_count: searchResponse.data?.results.length || 0,
        cached: false,
        cost_usd: searchResponse.costUsd,
        duration_ms: Date.now() - startTime,
      });

      return searchResponse;
    } catch (error) {
      const result: WebSearchOperationResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown search error',
        duration: Date.now() - startTime,
        cached: false,
        costUsd: 0,
      };

      await this.observeSearchOperation('web_search_error', {
        query: query.query,
        error: result.error,
        duration_ms: result.duration,
      });

      return result;
    }
  }

  /**
   * T051: Enhanced search for travel-specific queries
   */
  async searchTravelContent(
    destination: string,
    category: 'hotels' | 'restaurants' | 'activities' | 'weather',
    options: {
      dates?: { start: string; end: string };
      maxResults?: number;
      priceRange?: 'budget' | 'mid' | 'luxury';
    } = {}
  ): Promise<WebSearchOperationResult> {
    const enhancedQuery = this.buildTravelQuery(destination, category, options);

    return this.search({
      query: enhancedQuery,
      location: destination,
      dateRange: options.dates,
      category,
      options: {
        maxResults: options.maxResults || 10,
        freshness: 'month',
      },
    });
  }

  /**
   * T052: Multi-query search for comprehensive information
   */
  async searchMultiple(queries: SearchQuery[]): Promise<WebSearchOperationResult[]> {
    const results: WebSearchOperationResult[] = [];

    for (const query of queries) {
      // Respect rate limiting between requests
      if (this.lastSearchTime > 0) {
        const timeSinceLastSearch = Date.now() - this.lastSearchTime;
        if (timeSinceLastSearch < this.config.rateLimitDelay) {
          await this.delay(this.config.rateLimitDelay - timeSinceLastSearch);
        }
      }

      const result = await this.search(query);
      results.push(result);

      // Stop if we hit rate limits or errors
      if (!result.success && result.error?.includes('Rate limit')) {
        break;
      }
    }

    return results;
  }

  /**
   * T053: Real-time information validation and freshness scoring
   */
  async validateSearchResults(results: SearchResult[]): Promise<SearchResult[]> {
    return results
      .map((result) => {
        const trustScore = this.calculateTrustScore(result);
        const freshness = this.calculateFreshness(result);

        return {
          ...result,
          metadata: {
            ...result.metadata,
            trustScore,
            freshness,
          },
        };
      })
      .sort((a, b) => {
        // Sort by trust score and freshness
        const scoreA = (a.metadata?.trustScore || 0) + (a.metadata?.freshness || 0);
        const scoreB = (b.metadata?.trustScore || 0) + (b.metadata?.freshness || 0);
        return scoreB - scoreA;
      });
  }

  /**
   * T054: Smart result aggregation and deduplication
   */
  async aggregateResults(searchResponses: WebSearchResponse[]): Promise<{
    combinedResults: SearchResult[];
    totalSources: number;
    averageRelevance: number;
    topCategories: string[];
  }> {
    const allResults: SearchResult[] = [];
    const seenUrls = new Set<string>();

    // Deduplicate and combine results
    for (const response of searchResponses) {
      for (const result of response.results) {
        if (!seenUrls.has(result.link)) {
          seenUrls.add(result.link);
          allResults.push(result);
        }
      }
    }

    // Validate and score results
    const validatedResults = await this.validateSearchResults(allResults);

    // Calculate metrics
    const averageRelevance =
      validatedResults.reduce((sum, r) => sum + (r.metadata?.trustScore || 0), 0) /
      validatedResults.length;

    const categories = validatedResults
      .map((r) => r.metadata?.category)
      .filter(Boolean) as string[];

    const topCategories = [...new Set(categories)]
      .sort((a, b) => {
        const countA = categories.filter((c) => c === a).length;
        const countB = categories.filter((c) => c === b).length;
        return countB - countA;
      })
      .slice(0, 5);

    return {
      combinedResults: validatedResults.slice(0, 20), // Limit to top 20
      totalSources: validatedResults.length,
      averageRelevance,
      topCategories,
    };
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Perform actual search using configured search engine
   */
  private async performSearch(query: SearchQuery): Promise<WebSearchOperationResult> {
    const startTime = Date.now();

    try {
      // For now, implement a mock search that simulates real API behavior
      // In production, this would call actual search APIs (SerpAPI, Google Custom Search, etc.)
      const mockResults = this.generateMockResults(query);

      const response: WebSearchResponse = {
        query: query.query,
        results: mockResults,
        totalResults: mockResults.length,
        searchTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        searchEngine: this.config.searchEngine,
        cached: false,
        rateLimited: false,
      };

      return {
        success: true,
        data: response,
        duration: Date.now() - startTime,
        cached: false,
        costUsd: this.calculateSearchCost(mockResults.length),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        duration: Date.now() - startTime,
        cached: false,
        costUsd: 0,
      };
    }
  }

  /**
   * Enhance search query for better travel results
   */
  private enhanceSearchQuery(query: SearchQuery): SearchQuery {
    let enhancedQuery = query.query;

    // Add travel-specific terms
    if (query.category && query.category !== 'general') {
      const categoryTerms = {
        hotels: 'accommodation booking reviews',
        restaurants: 'dining food reviews menu',
        activities: 'things to do attractions tours',
        weather: 'weather forecast temperature climate',
        flights: 'flights airfare booking deals',
      };

      const categoryTerm = categoryTerms[query.category as keyof typeof categoryTerms];
      if (categoryTerm) {
        enhancedQuery += ` ${categoryTerm}`;
      }
    } // Add location context
    if (query.location) {
      enhancedQuery += ` in ${query.location}`;
    }

    // Add temporal context
    if (query.dateRange) {
      const startDate = new Date(query.dateRange.start);
      const year = startDate.getFullYear();
      enhancedQuery += ` ${year}`;
    }

    return {
      ...query,
      query: enhancedQuery.trim(),
    };
  }

  /**
   * Build travel-specific search query
   */
  private buildTravelQuery(destination: string, category: string, options: any): string {
    const baseQueries = {
      hotels: `best hotels ${destination} accommodation booking`,
      restaurants: `best restaurants ${destination} dining food local cuisine`,
      activities: `things to do ${destination} attractions tours activities`,
      weather: `${destination} weather forecast climate when to visit`,
    };

    let query =
      baseQueries[category as keyof typeof baseQueries] || `${destination} travel information`;

    if (options.priceRange) {
      const priceTerms = {
        budget: 'budget cheap affordable',
        mid: 'mid-range moderate',
        luxury: 'luxury high-end premium',
      };
      const priceTerm = priceTerms[options.priceRange as keyof typeof priceTerms];
      if (priceTerm) {
        query += ` ${priceTerm}`;
      }
    }

    return query;
  }

  /**
   * Generate cache key for search result caching
   */
  private generateCacheKey(query: SearchQuery): string {
    const key = {
      q: query.query,
      loc: query.location,
      cat: query.category,
      opts: query.options,
    };
    return Buffer.from(JSON.stringify(key)).toString('base64');
  }

  /**
   * Check and get cached results
   */
  private getCachedResult(cacheKey: string): WebSearchResponse | null {
    const cached = this.searchCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    if (cached) {
      this.searchCache.delete(cacheKey);
    }
    return null;
  }

  /**
   * Cache search results
   */
  private cacheResult(cacheKey: string, data: WebSearchResponse): void {
    const expires = Date.now() + this.config.cacheExpiryHours * 60 * 60 * 1000;
    this.searchCache.set(cacheKey, { data, expires });
  }

  /**
   * Check rate limiting constraints
   */
  private checkRateLimit(): { allowed: boolean; waitTime?: number } {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000;

    // Reset counter if an hour has passed
    if (this.lastSearchTime < hourAgo) {
      this.requestCount = 0;
    }

    if (this.requestCount >= this.maxRequestsPerHour) {
      const waitTime = hourAgo + 60 * 60 * 1000 - now;
      return { allowed: false, waitTime };
    }

    return { allowed: true };
  }

  /**
   * Calculate trust score for search results
   */
  private calculateTrustScore(result: SearchResult): number {
    let score = 0.5; // Base score

    // Domain reputation (simplified)
    const trustedDomains = [
      'tripadvisor.com',
      'booking.com',
      'expedia.com',
      'lonelyplanet.com',
      'travel.com',
      'hotels.com',
      'airbnb.com',
      'viator.com',
      'getyourguide.com',
    ];

    const domain = result.displayLink.toLowerCase();
    if (trustedDomains.some((trusted) => domain.includes(trusted))) {
      score += 0.3;
    }

    // Title and snippet quality
    if (result.title.length > 30 && result.snippet.length > 100) {
      score += 0.1;
    }

    // Position boost (higher positions are generally more relevant)
    score += Math.max(0, (10 - result.position) / 20);

    return Math.min(score, 1.0);
  }

  /**
   * Calculate content freshness score
   */
  private calculateFreshness(result: SearchResult): number {
    if (!result.metadata?.publishedDate) {
      return 0.5; // Unknown freshness
    }

    const published = new Date(result.metadata.publishedDate);
    const now = new Date();
    const ageInDays = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);

    // Fresher content gets higher scores
    if (ageInDays < 30) return 1.0;
    if (ageInDays < 90) return 0.8;
    if (ageInDays < 180) return 0.6;
    if (ageInDays < 365) return 0.4;
    return 0.2;
  }

  /**
   * Generate mock search results for development/testing
   */
  private generateMockResults(query: SearchQuery): SearchResult[] {
    const results: SearchResult[] = [];
    const maxResults = query.options?.maxResults || this.config.maxResults;

    for (let i = 0; i < Math.min(maxResults, 10); i++) {
      results.push({
        title: `Travel Information: ${query.query} - Result ${i + 1}`,
        snippet: `Comprehensive travel information about ${query.query}. Includes details about ${
          query.category || 'general travel topics'
        } with recent updates and user reviews.`,
        link: `https://example-travel-site.com/result-${i + 1}`,
        displayLink: 'example-travel-site.com',
        position: i + 1,
        searchInformation: {
          totalResults: 150000,
          searchTime: 0.12,
        },
        metadata: {
          publishedDate: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          category: query.category || 'general',
          trustScore: 0.7 + Math.random() * 0.3,
        },
      });
    }

    return results;
  }

  /**
   * Calculate search API cost
   */
  private calculateSearchCost(resultCount: number): number {
    // Mock cost calculation - $0.001 per result
    return resultCount * 0.001;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Observability for search operations
   */
  private async observeSearchOperation(
    operationName: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      console.log(`[Web Search] ${operationName}:`, JSON.stringify(data, null, 2));
    } catch (error) {
      console.warn('Web search observability logging failed:', error);
    }
  }

  /**
   * Health check for web search service
   */
  async healthCheck(): Promise<{
    apiKey: boolean;
    rateLimit: boolean;
    cache: boolean;
    overall: boolean;
  }> {
    const apiKeyValid = !!this.config.serpApiKey;
    const rateLimitOk = this.checkRateLimit().allowed;
    const cacheWorking = this.searchCache instanceof Map;

    return {
      apiKey: apiKeyValid,
      rateLimit: rateLimitOk,
      cache: cacheWorking,
      overall: apiKeyValid && rateLimitOk && cacheWorking,
    };
  }
}

// =============================================================================
// FACTORY FUNCTION FOR EDGE-COMPATIBLE INITIALIZATION
// =============================================================================

/**
 * Create WebSearchService instance with environment configuration
 */
export function createWebSearchService(): WebSearchService {
  const config: WebSearchConfig = {
    serpApiKey: process.env['SERP_API_KEY'] || '',
    searchEngine: (process.env['WEB_SEARCH_ENGINE'] as any) || 'google',
    maxResults: parseInt(process.env['WEB_SEARCH_MAX_RESULTS'] || '10'),
    timeout: parseInt(process.env['WEB_SEARCH_TIMEOUT'] || '10000'),
    rateLimitDelay: parseInt(process.env['WEB_SEARCH_RATE_LIMIT_DELAY'] || '1000'),
    enableCaching: process.env['WEB_SEARCH_ENABLE_CACHING'] !== 'false',
    cacheExpiryHours: parseInt(process.env['WEB_SEARCH_CACHE_EXPIRY_HOURS'] || '24'),
  };

  return new WebSearchService(config);
}
