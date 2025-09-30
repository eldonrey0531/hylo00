/**
 * Upstash Vector Database Client
 * Handles itinerary embeddings and semantic search
 */

import { Index } from '@upstash/vector';
import { logger } from '@/utils/console-logger';

// Global vector client instance
let vectorClient: Index | null = null;

/**
 * Initialize and get the Upstash Vector client
 */
export function getVectorClient(): Index {
  if (!vectorClient) {
    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;

    if (!url || !token) {
      logger.error(0, 'VECTOR_CONFIG_MISSING', 'vector.ts', 'getVectorClient', 'Missing Upstash Vector credentials');
      throw new Error('Missing UPSTASH_VECTOR_REST_URL or UPSTASH_VECTOR_REST_TOKEN');
    }

    vectorClient = new Index({
      url,
      token,
    });

    logger.log(0, 'VECTOR_CLIENT_INITIALIZED', 'vector.ts', 'getVectorClient', {
      hasUrl: !!url,
      hasToken: !!token,
    });
  }

  return vectorClient;
}

/**
 * Store itinerary as vector embedding
 */
export async function storeItineraryVector(
  workflowId: string,
  embedding: number[],
  metadata: {
    destination: string;
    duration: number;
    budget: string;
    activities: string[];
    preferences: string[];
    itinerary: any;
    timestamp: string;
  }
): Promise<boolean> {
  try {
    const client = getVectorClient();
    
    await client.upsert({
      id: workflowId,
      vector: embedding,
      metadata: {
        ...metadata,
        // Store itinerary as JSON string to avoid nested object issues
        itinerary: JSON.stringify(metadata.itinerary),
        activities: JSON.stringify(metadata.activities),
        preferences: JSON.stringify(metadata.preferences),
      },
    });

    logger.log(201, 'ITINERARY_VECTOR_STORED', 'vector.ts', 'storeItineraryVector', {
      workflowId,
      destination: metadata.destination,
      vectorDimensions: embedding.length,
    });

    return true;
  } catch (error) {
    logger.error(202, 'ITINERARY_VECTOR_STORE_FAILED', 'vector.ts', 'storeItineraryVector', error instanceof Error ? error : String(error), {
      workflowId,
    });
    return false;
  }
}

/**
 * Search for similar itineraries using vector similarity
 */
export async function searchSimilarItineraries(
  queryEmbedding: number[],
  topK: number = 5,
  includeMetadata: boolean = true
) {
  try {
    const client = getVectorClient();
    
    const results = await client.query({
      vector: queryEmbedding,
      topK,
      includeMetadata,
    });

    logger.log(203, 'SIMILAR_ITINERARIES_FOUND', 'vector.ts', 'searchSimilarItineraries', {
      resultsCount: results.length,
      topK,
    });

    // Parse JSON strings back to objects
    return results.map(result => ({
      ...result,
      metadata: result.metadata ? {
        destination: result.metadata.destination as string,
        duration: result.metadata.duration as number,
        budget: result.metadata.budget as string,
        timestamp: result.metadata.timestamp as string,
        itinerary: result.metadata.itinerary ? JSON.parse(result.metadata.itinerary as string) : null,
        activities: result.metadata.activities ? JSON.parse(result.metadata.activities as string) : [],
        preferences: result.metadata.preferences ? JSON.parse(result.metadata.preferences as string) : [],
      } : null,
    }));
  } catch (error) {
    logger.error(204, 'SIMILAR_ITINERARIES_SEARCH_FAILED', 'vector.ts', 'searchSimilarItineraries', error instanceof Error ? error : String(error));
    return [];
  }
}

/**
 * Get itinerary by workflow ID from vector store
 */
export async function getItineraryVector(workflowId: string) {
  try {
    const client = getVectorClient();
    
    const result = await client.fetch([workflowId]);
    
    if (result && result.length > 0 && result[0]) {
      const itinerary = result[0];
      
      logger.log(205, 'ITINERARY_VECTOR_RETRIEVED', 'vector.ts', 'getItineraryVector', {
        workflowId,
        hasMetadata: !!itinerary.metadata,
      });

      // Parse JSON strings back to objects
      return {
        ...itinerary,
        metadata: itinerary.metadata ? {
          destination: itinerary.metadata.destination as string,
          duration: itinerary.metadata.duration as number,
          budget: itinerary.metadata.budget as string,
          timestamp: itinerary.metadata.timestamp as string,
          itinerary: itinerary.metadata.itinerary ? JSON.parse(itinerary.metadata.itinerary as string) : null,
          activities: itinerary.metadata.activities ? JSON.parse(itinerary.metadata.activities as string) : [],
          preferences: itinerary.metadata.preferences ? JSON.parse(itinerary.metadata.preferences as string) : [],
        } : null,
      };
    }

    logger.log(206, 'ITINERARY_VECTOR_NOT_FOUND', 'vector.ts', 'getItineraryVector', {
      workflowId,
    });

    return null;
  } catch (error) {
    logger.error(207, 'ITINERARY_VECTOR_RETRIEVE_FAILED', 'vector.ts', 'getItineraryVector', error instanceof Error ? error : String(error), {
      workflowId,
    });
    return null;
  }
}

/**
 * Generate embedding for text using a simple approach
 * Note: In production, you'd use OpenAI's embedding API
 */
export function generateSimpleEmbedding(text: string): number[] {
  // Simple hash-based embedding for demonstration
  // In production, use: await openai.embeddings.create()
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0); // 384-dimensional vector
  
  words.forEach((word, index) => {
    const hash = simpleHash(word);
    const position = Math.abs(hash) % embedding.length;
    embedding[position] += 1 / (index + 1); // Weight by position
  });
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }
  
  return embedding;
}

/**
 * Simple hash function for demonstration
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}