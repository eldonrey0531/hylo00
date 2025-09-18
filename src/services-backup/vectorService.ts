/**
 * Vector Database Service for Qdrant Integration
 * Handles embeddings, vector storage, search, and TTL management
 * Constitutional compliance: Edge-compatible, observable, type-safe
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import { HfInference } from '@huggingface/inference';
import { VectorMetadata, VectorMetadataSchema, TravelFormData } from '../types/rag.js';

/**
 * Simple observability function for RAG operations
 * Will integrate with full LangSmith client in T060
 */
async function observeOperation(operationName: string, data: Record<string, any>): Promise<void> {
  try {
    // For now, just log to console - will integrate with LangSmith in T060
    console.log(`[RAG Operation] ${operationName}:`, JSON.stringify(data, null, 2));
  } catch (error) {
    // Don't fail operations due to observability issues
    console.warn('Observability logging failed:', error);
  }
}

// =============================================================================
// VECTOR SERVICE CONFIGURATION
// =============================================================================

interface VectorConfig {
  qdrantUrl: string;
  qdrantApiKey: string;
  collectionName: string;
  embeddingModel: string;
  huggingfaceApiKey: string;
  embeddingDimension: number;
  similarityThreshold: number;
  maxResults: number;
}

interface EmbeddingResult {
  vector: number[];
  dimension: number;
  model: string;
  tokenCount: number;
}

interface SearchResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
  summary: string;
}

interface VectorOperationResult {
  success: boolean;
  operation: 'upsert' | 'search' | 'delete' | 'cleanup';
  vectorId?: string;
  resultsCount?: number;
  error?: string;
  durationMs: number;
}

// =============================================================================
// VECTOR SERVICE CLASS
// =============================================================================

export class VectorService {
  private qdrantClient: QdrantClient;
  private hfInference: HfInference;
  private config: VectorConfig;

  constructor(config: VectorConfig) {
    this.config = config;
    this.qdrantClient = new QdrantClient({
      url: config.qdrantUrl,
      apiKey: config.qdrantApiKey,
    });
    this.hfInference = new HfInference(config.huggingfaceApiKey);
  }

  /**
   * Initialize the vector collection if it doesn't exist
   * Must be called before any vector operations
   */
  async initializeCollection(): Promise<boolean> {
    const startTime = Date.now();

    try {
      // Check if collection exists
      const collections = await this.qdrantClient.getCollections();
      const collectionExists = collections.collections?.some(
        (col) => col.name === this.config.collectionName
      );

      if (!collectionExists) {
        // Create collection with appropriate vector configuration
        await this.qdrantClient.createCollection(this.config.collectionName, {
          vectors: {
            size: this.config.embeddingDimension,
            distance: 'Cosine', // Best for semantic similarity
          },
          optimizers_config: {
            default_segment_number: 2,
            memmap_threshold: 20000,
          },
          replication_factor: 1,
        });

        // Note: Field indexes will be created automatically by Qdrant for filter operations
      }

      await observeOperation('vector_collection_init', {
        success: true,
        duration_ms: Date.now() - startTime,
        collection_name: this.config.collectionName,
        collection_existed: collectionExists,
      });

      return true;
    } catch (error) {
      await observeOperation('vector_collection_init', {
        success: false,
        duration_ms: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(`Failed to initialize collection: ${error}`);
    }
  }

  /**
   * Generate embeddings for text using Hugging Face API
   * T025: embedText() method using Hugging Face API
   */
  async embedText(text: string): Promise<EmbeddingResult> {
    const startTime = Date.now();

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty for embedding');
    }

    // Truncate text if too long (model-specific limits)
    const maxLength = 512; // Safe limit for most sentence transformers
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

    try {
      const response = await this.hfInference.featureExtraction({
        model: this.config.embeddingModel,
        inputs: truncatedText,
      });

      // Hugging Face returns nested arrays, flatten to single vector
      const vector = Array.isArray(response[0]) ? response[0] : response;

      if (!Array.isArray(vector) || vector.length !== this.config.embeddingDimension) {
        throw new Error(
          `Invalid embedding dimension: expected ${this.config.embeddingDimension}, got ${vector.length}`
        );
      }

      const result: EmbeddingResult = {
        vector: vector as number[],
        dimension: vector.length,
        model: this.config.embeddingModel,
        tokenCount: Math.ceil(truncatedText.length / 4), // Rough token estimate
      };

      await observeOperation('text_embedding', {
        success: true,
        duration_ms: Date.now() - startTime,
        text_length: text.length,
        token_count: result.tokenCount,
        model: this.config.embeddingModel,
      });

      return result;
    } catch (error) {
      await observeOperation('text_embedding', {
        success: false,
        duration_ms: Date.now() - startTime,
        text_length: text.length,
        model: this.config.embeddingModel,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(`Embedding generation failed: ${error}`);
    }
  }

  /**
   * T026: searchVectors() method with filtering and similarity threshold
   * Search for similar vectors with metadata filtering
   */
  async searchVectors(
    queryText: string,
    sessionId: string,
    options: {
      limit?: number;
      similarityThreshold?: number;
      contentType?: VectorMetadata['content_type'];
      destination?: string;
    } = {}
  ): Promise<SearchResult[]> {
    const startTime = Date.now();

    try {
      // Generate query embedding
      const queryEmbedding = await this.embedText(queryText);

      // Build filter conditions
      const filter: any = {
        must: [
          { key: 'session_id', match: { value: sessionId } },
          // Only search vectors that haven't expired
          { key: 'ttl_hours', range: { gt: 0 } },
        ],
      };

      if (options.contentType) {
        filter.must.push({
          key: 'content_type',
          match: { value: options.contentType },
        });
      }

      if (options.destination) {
        filter.must.push({
          key: 'destination',
          match: { value: options.destination },
        });
      }

      const searchResults = await this.qdrantClient.search(this.config.collectionName, {
        vector: queryEmbedding.vector,
        limit: options.limit || this.config.maxResults,
        score_threshold: options.similarityThreshold || this.config.similarityThreshold,
        filter,
        with_payload: true,
      });

      const results: SearchResult[] = searchResults.map((result) => ({
        id: result.id.toString(),
        score: result.score || 0,
        metadata: result.payload as VectorMetadata,
        summary: (result.payload as VectorMetadata)?.summary_text || '',
      }));

      await observeOperation('vector_search', {
        success: true,
        duration_ms: Date.now() - startTime,
        query_length: queryText.length,
        results_count: results.length,
        session_id: sessionId,
        similarity_threshold: options.similarityThreshold || this.config.similarityThreshold,
      });

      return results;
    } catch (error) {
      await observeOperation('vector_search', {
        success: false,
        duration_ms: Date.now() - startTime,
        query_length: queryText.length,
        session_id: sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(`Vector search failed: ${error}`);
    }
  }

  /**
   * T027: upsertSessionVector() method for form data vectorization
   * Store or update a vector with session metadata
   */
  async upsertSessionVector(
    sessionId: string,
    formId: string,
    formData: TravelFormData,
    options: {
      ttlHours?: number;
      contentType?: VectorMetadata['content_type'];
    } = {}
  ): Promise<VectorOperationResult> {
    const startTime = Date.now();

    try {
      // Sanitize form data before processing
      const sanitizedData = this.sanitizeFormData(formData);

      // Generate session summary text for vectorization
      const summaryText = this.generateSessionSummary(sanitizedData, formId);

      // Generate embedding
      const embedding = await this.embedText(summaryText);

      // Create base metadata
      const metadata: VectorMetadata = {
        session_id: sessionId,
        form_id: formId,
        summary_text: summaryText,
        created_at: new Date().toISOString(),
        ttl_hours: options.ttlHours || 24,
        content_type: options.contentType || this.inferContentType(formId),
      };

      // Add optional fields only if they exist
      if (sanitizedData.destination) {
        metadata.destination = sanitizedData.destination;
      }
      if (sanitizedData.groupSize) {
        metadata.group_size = sanitizedData.groupSize;
      }

      const tripType = this.inferTripType(sanitizedData);
      if (tripType) {
        metadata.trip_type = tripType;
      }

      const budgetRange = this.inferBudgetRange(sanitizedData);
      if (budgetRange) {
        metadata.budget_range = budgetRange;
      }

      // Validate metadata
      const validationResult = VectorMetadataSchema.safeParse(metadata);
      if (!validationResult.success) {
        throw new Error(`Invalid metadata: ${validationResult.error.message}`);
      }

      // Generate unique vector ID
      const vectorId = `${sessionId}_${formId}_${Date.now()}`;

      // Upsert vector to Qdrant
      await this.qdrantClient.upsert(this.config.collectionName, {
        wait: true,
        points: [
          {
            id: vectorId,
            vector: embedding.vector,
            payload: metadata,
          },
        ],
      });

      const result: VectorOperationResult = {
        success: true,
        operation: 'upsert',
        vectorId,
        durationMs: Date.now() - startTime,
      };

      await observeOperation('vector_upsert', {
        success: true,
        duration_ms: result.durationMs,
        session_id: sessionId,
        form_id: formId,
        vector_id: vectorId,
        summary_length: summaryText.length,
        content_type: metadata.content_type,
      });

      return result;
    } catch (error) {
      const result: VectorOperationResult = {
        success: false,
        operation: 'upsert',
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };

      await observeOperation('vector_upsert', {
        success: false,
        duration_ms: result.durationMs,
        session_id: sessionId,
        form_id: formId,
        error: result.error,
      });

      return result;
    }
  }

  /**
   * T028: sanitizeFormData() method for PII removal
   * Remove personally identifiable information before vectorization
   */
  private sanitizeFormData(formData: TravelFormData): TravelFormData {
    const sanitized: TravelFormData = {
      ...formData,
      // Keep travel preferences but sanitize any free text
    };

    // Remove contact information
    delete sanitized.contactInfo;

    // Sanitize special requests if they exist
    if (formData.specialRequests) {
      sanitized.specialRequests = this.sanitizeText(formData.specialRequests);
    }

    return sanitized;
  }

  /**
   * Sanitize free text by removing potential PII patterns
   */
  private sanitizeText(text: string): string {
    return text
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Email
      .replace(/\b\d{3}-?\d{3}-?\d{4}\b/g, '[PHONE]') // Phone numbers
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]') // Credit card patterns
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]'); // Likely names
  }

  /**
   * Generate human-readable summary from form data
   */
  private generateSessionSummary(formData: TravelFormData, formId: string): string {
    const parts: string[] = [];

    if (formData.destination) {
      parts.push(`Travel destination: ${formData.destination}`);
    }

    if (formData.travelVibe) {
      parts.push(`Travel style: ${formData.travelVibe}`);
    }

    if (formData.groupSize) {
      parts.push(`Group size: ${formData.groupSize} people`);
    }

    if (formData.tripLengthDays) {
      parts.push(`Trip duration: ${formData.tripLengthDays} days`);
    }

    if (formData.interests && formData.interests.length > 0) {
      const interestList = formData.interests
        .map((i) => `${i.category} (${i.intensity})`)
        .join(', ');
      parts.push(`Interests: ${interestList}`);
    }

    if (formData.budgetRange) {
      parts.push(
        `Budget: ${formData.budgetRange.flexibility} ${formData.budgetRange.currency} budget`
      );
    }

    if (formData.accommodationType) {
      parts.push(`Accommodation preference: ${formData.accommodationType}`);
    }

    if (formData.dietaryRestrictions && formData.dietaryRestrictions.length > 0) {
      parts.push(`Dietary requirements: ${formData.dietaryRestrictions.join(', ')}`);
    }

    if (formData.specialRequests) {
      parts.push(`Special requests: ${formData.specialRequests}`);
    }

    parts.push(`Form: ${formId}`);

    return parts.join('. ') || `Travel preferences from ${formId}`;
  }

  /**
   * Infer trip type from form data
   */
  private inferTripType(formData: TravelFormData): VectorMetadata['trip_type'] {
    if (formData.travelVibe === 'adventure') return 'adventure';
    if (formData.travelVibe === 'relaxed' || formData.travelVibe === 'luxury') return 'relaxation';
    return 'leisure';
  }

  /**
   * Infer budget range from form data
   */
  private inferBudgetRange(formData: TravelFormData): VectorMetadata['budget_range'] {
    if (formData.travelVibe === 'budget') return 'budget';
    if (formData.travelVibe === 'luxury') return 'luxury';
    return 'mid-range';
  }

  /**
   * Infer content type from form ID
   */
  private inferContentType(formId: string): VectorMetadata['content_type'] {
    if (formId.includes('Interest')) return 'interests';
    if (formId.includes('Accommodation') || formId.includes('hotel')) return 'accommodation';
    if (formId.includes('Transport')) return 'transport';
    if (formId.includes('Experience') || formId.includes('Activity')) return 'experience';
    if (formId.includes('Destination') || formId.includes('Trip')) return 'destination';
    return 'destination';
  }

  /**
   * T029: cleanupExpiredVectors() method for TTL enforcement
   * Remove vectors that have exceeded their TTL
   */
  async cleanupExpiredVectors(): Promise<VectorOperationResult> {
    const startTime = Date.now();

    try {
      const currentTime = new Date();
      const cutoffTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

      // Find expired vectors
      const searchResult = await this.qdrantClient.scroll(this.config.collectionName, {
        filter: {
          must: [
            {
              key: 'created_at',
              range: { lt: cutoffTime.toISOString() },
            },
          ],
        },
        limit: 1000, // Process in batches
        with_payload: true,
      });

      if (searchResult.points && searchResult.points.length > 0) {
        const idsToDelete = searchResult.points.map((point) => point.id);

        await this.qdrantClient.delete(this.config.collectionName, {
          wait: true,
          points: idsToDelete,
        });
      }

      const result: VectorOperationResult = {
        success: true,
        operation: 'cleanup',
        resultsCount: searchResult.points?.length || 0,
        durationMs: Date.now() - startTime,
      };

      await observeOperation('vector_cleanup', {
        success: true,
        duration_ms: result.durationMs,
        deleted_count: result.resultsCount,
        cutoff_time: cutoffTime.toISOString(),
      });

      return result;
    } catch (error) {
      const result: VectorOperationResult = {
        success: false,
        operation: 'cleanup',
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };

      await observeOperation('vector_cleanup', {
        success: false,
        duration_ms: result.durationMs,
        error: result.error,
      });

      return result;
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionInfo() {
    try {
      const info = await this.qdrantClient.getCollection(this.config.collectionName);
      return {
        vectorsCount: info.vectors_count || 0,
        indexedVectorsCount: info.indexed_vectors_count || 0,
        pointsCount: info.points_count || 0,
        status: info.status,
      };
    } catch (error) {
      throw new Error(`Failed to get collection info: ${error}`);
    }
  }

  /**
   * Delete all vectors for a specific session
   */
  async deleteSessionVectors(sessionId: string): Promise<VectorOperationResult> {
    const startTime = Date.now();

    try {
      await this.qdrantClient.delete(this.config.collectionName, {
        wait: true,
        filter: {
          must: [{ key: 'session_id', match: { value: sessionId } }],
        },
      });

      const result: VectorOperationResult = {
        success: true,
        operation: 'delete',
        durationMs: Date.now() - startTime,
      };

      await observeOperation('session_vectors_delete', {
        success: true,
        duration_ms: result.durationMs,
        session_id: sessionId,
      });

      return result;
    } catch (error) {
      const result: VectorOperationResult = {
        success: false,
        operation: 'delete',
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
      };

      await observeOperation('session_vectors_delete', {
        success: false,
        duration_ms: result.durationMs,
        session_id: sessionId,
        error: result.error,
      });

      return result;
    }
  }

  /**
   * Health check for vector service dependencies
   */
  async healthCheck(): Promise<{ qdrant: boolean; huggingface: boolean; overall: boolean }> {
    try {
      // Test Qdrant connection
      let qdrantHealthy = false;
      try {
        await this.qdrantClient.getCollections();
        qdrantHealthy = true;
      } catch (qdrantError) {
        console.warn('Qdrant health check failed:', qdrantError);
        qdrantHealthy = false;
      }

      // Test Hugging Face API
      let huggingfaceHealthy = false;
      try {
        // Try to embed a short test string
        await this.embedText('test');
        huggingfaceHealthy = true;
      } catch (hfError) {
        console.warn('Hugging Face health check failed:', hfError);
        huggingfaceHealthy = false;
      }

      return {
        qdrant: qdrantHealthy,
        huggingface: huggingfaceHealthy,
        overall: qdrantHealthy && huggingfaceHealthy,
      };
    } catch (error) {
      console.warn('Vector service health check failed:', error);
      return {
        qdrant: false,
        huggingface: false,
        overall: false,
      };
    }
  }
}

// =============================================================================
// FACTORY FUNCTION FOR EDGE-COMPATIBLE INITIALIZATION
// =============================================================================

/**
 * Create VectorService instance with environment configuration
 * Edge-compatible factory function
 */
export function createVectorService(): VectorService {
  const config: VectorConfig = {
    qdrantUrl: process.env['QDRANT_URL'] || '',
    qdrantApiKey: process.env['QDRANT_API_KEY'] || '',
    collectionName: process.env['QDRANT_COLLECTION_NAME'] || 'travel-sessions',
    embeddingModel: process.env['EMBEDDING_MODEL'] || 'sentence-transformers/all-MiniLM-L6-v2',
    huggingfaceApiKey: process.env['HUGGINGFACE_API_KEY'] || '',
    embeddingDimension: parseInt(process.env['RAG_EMBEDDING_DIMENSION'] || '384'),
    similarityThreshold: parseFloat(process.env['RAG_SIMILARITY_THRESHOLD'] || '0.7'),
    maxResults: parseInt(process.env['RAG_MAX_VECTOR_RESULTS'] || '10'),
  };

  // Validate required configuration
  if (!config.qdrantUrl || !config.qdrantApiKey || !config.huggingfaceApiKey) {
    throw new Error('Missing required vector service configuration');
  }

  return new VectorService(config);
}
