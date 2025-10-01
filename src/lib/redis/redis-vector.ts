/**
 * Redis-based Vector Storage and Search
 * Uses Redis for both regular storage and semantic search
 */

import { Redis } from '@upstash/redis';
import { logger } from '@/utils/console-logger';

// Global Redis client instance (reuse the existing one)
let redisClient: Redis | null = null;

/**
 * Get Redis client (reuse existing connection)
 */
function getRedisClient(): Redis {
  if (!redisClient) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      logger.error(0, 'REDIS_CONFIG_MISSING', 'redis-vector.ts', 'getRedisClient', 'Missing Redis credentials');
      throw new Error('Missing KV_REST_API_URL or KV_REST_API_TOKEN');
    }

    redisClient = new Redis({
      url,
      token,
    });

    logger.log(0, 'REDIS_VECTOR_CLIENT_INITIALIZED', 'redis-vector.ts', 'getRedisClient');
  }

  return redisClient;
}

/**
 * Store itinerary with search metadata in Redis
 */
export async function storeItineraryForSearch(
  workflowId: string,
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
    const redis = getRedisClient();
    
    // Create searchable text for simple text-based search
    const searchText = [
      metadata.destination.toLowerCase(),
      `${metadata.duration} days`,
      metadata.budget.toLowerCase(),
      ...metadata.activities.map(a => a.toLowerCase()),
      ...metadata.preferences.map(p => p.toLowerCase())
    ].join(' ');

    // Store in Redis with search metadata
    const searchKey = `search:${workflowId}`;
    await redis.hset(searchKey, {
      workflowId,
      destination: metadata.destination,
      duration: metadata.duration,
      budget: metadata.budget,
      activities: JSON.stringify(metadata.activities),
      preferences: JSON.stringify(metadata.preferences),
      searchText, // For text-based search
      timestamp: metadata.timestamp,
      itinerary: JSON.stringify(metadata.itinerary),
    });

    // Add to searchable index (using Redis Sets for each category)
    const pipe = redis.pipeline();
    
    // Index by destination
    pipe.sadd(`idx:destination:${metadata.destination.toLowerCase()}`, workflowId);
    
    // Index by budget
    pipe.sadd(`idx:budget:${metadata.budget.toLowerCase()}`, workflowId);
    
    // Index by duration range
    const durationRange = getDurationRange(metadata.duration);
    pipe.sadd(`idx:duration:${durationRange}`, workflowId);
    
    // Index by activities
    metadata.activities.forEach(activity => {
      pipe.sadd(`idx:activity:${activity.toLowerCase()}`, workflowId);
    });

    // Add to global index
    pipe.sadd('idx:all', workflowId);
    
    await pipe.exec();

    logger.log(201, 'ITINERARY_SEARCH_DATA_STORED', 'redis-vector.ts', 'storeItineraryForSearch', {
      workflowId,
      destination: metadata.destination,
    });

    return true;
  } catch (error) {
    logger.error(202, 'ITINERARY_SEARCH_STORE_FAILED', 'redis-vector.ts', 'storeItineraryForSearch', error instanceof Error ? error : String(error), {
      workflowId,
    });
    return false;
  }
}

/**
 * Search for similar itineraries using Redis
 */
export async function searchSimilarItineraries(
  query: {
    destination?: string;
    duration?: number;
    budget?: string;
    activities?: string[];
    preferences?: string[];
  },
  topK: number = 5
) {
  try {
    const redis = getRedisClient();
    
    const searchSets: string[] = [];
    
    // Build search criteria
    if (query.destination) {
      searchSets.push(`idx:destination:${query.destination.toLowerCase()}`);
    }
    
    if (query.budget) {
      searchSets.push(`idx:budget:${query.budget.toLowerCase()}`);
    }
    
    if (query.duration) {
      const durationRange = getDurationRange(query.duration);
      searchSets.push(`idx:duration:${durationRange}`);
    }
    
    if (query.activities && query.activities.length > 0) {
      query.activities.forEach(activity => {
        searchSets.push(`idx:activity:${activity.toLowerCase()}`);
      });
    }

    let workflowIds: string[];
    
    if (searchSets.length === 0) {
      // Get all if no specific criteria
      workflowIds = await redis.smembers('idx:all');
    } else if (searchSets.length === 1) {
      // Single criteria
      workflowIds = await redis.smembers(searchSets[0]);
    } else {
      // Multiple criteria - get all sets and find intersection manually
      const allSets = await Promise.all(
        searchSets.map(setKey => redis.smembers(setKey))
      );
      
      // Find intersection manually
      if (allSets.length > 0) {
        workflowIds = allSets[0].filter(id => 
          allSets.every(set => set.includes(id))
        );
      } else {
        workflowIds = [];
      }
    }

    // Get detailed results
    const results = [];
    for (const workflowId of workflowIds.slice(0, topK)) {
      const data = await redis.hgetall(`search:${workflowId}`);
      if (data && Object.keys(data).length > 0) {
        results.push({
          id: workflowId,
          score: calculateSimilarityScore(query, data), // Simple scoring
          metadata: {
            destination: data.destination,
            duration: parseInt(data.duration as string),
            budget: data.budget,
            activities: JSON.parse(data.activities as string),
            preferences: JSON.parse(data.preferences as string),
            timestamp: data.timestamp,
            itinerary: JSON.parse(data.itinerary as string),
          },
        });
      }
    }

    // Sort by score
    results.sort((a, b) => b.score - a.score);

    logger.log(203, 'SIMILAR_ITINERARIES_FOUND', 'redis-vector.ts', 'searchSimilarItineraries', {
      resultsCount: results.length,
      topK,
    });

    return results.slice(0, topK);
  } catch (error) {
    logger.error(204, 'SIMILAR_ITINERARIES_SEARCH_FAILED', 'redis-vector.ts', 'searchSimilarItineraries', error instanceof Error ? error : String(error));
    return [];
  }
}

/**
 * Get itinerary search data by workflow ID
 */
export async function getItinerarySearchData(workflowId: string) {
  try {
    const redis = getRedisClient();
    
    const data = await redis.hgetall(`search:${workflowId}`);
    
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return {
      id: workflowId,
      metadata: {
        destination: data.destination,
        duration: parseInt(data.duration as string),
        budget: data.budget,
        activities: JSON.parse(data.activities as string),
        preferences: JSON.parse(data.preferences as string),
        timestamp: data.timestamp,
        itinerary: JSON.parse(data.itinerary as string),
      },
    };
  } catch (error) {
    logger.error(207, 'ITINERARY_SEARCH_RETRIEVE_FAILED', 'redis-vector.ts', 'getItinerarySearchData', error instanceof Error ? error : String(error), {
      workflowId,
    });
    return null;
  }
}

/**
 * Calculate simple similarity score based on matching criteria
 */
function calculateSimilarityScore(query: any, data: any): number {
  let score = 0;
  let maxScore = 0;

  // Destination match (highest weight)
  maxScore += 0.4;
  if (query.destination && data.destination) {
    if (data.destination.toLowerCase().includes(query.destination.toLowerCase())) {
      score += 0.4;
    }
  }

  // Budget match
  maxScore += 0.3;
  if (query.budget && data.budget) {
    if (data.budget.toLowerCase() === query.budget.toLowerCase()) {
      score += 0.3;
    }
  }

  // Duration similarity
  maxScore += 0.2;
  if (query.duration && data.duration) {
    const durationDiff = Math.abs(query.duration - parseInt(data.duration));
    if (durationDiff === 0) score += 0.2;
    else if (durationDiff <= 2) score += 0.1;
  }

  // Activity matches
  maxScore += 0.1;
  if (query.activities && data.activities) {
    const queryActivities = query.activities.map((a: string) => a.toLowerCase());
    const dataActivities = JSON.parse(data.activities).map((a: string) => a.toLowerCase());
    const matches = queryActivities.filter((a: string) => dataActivities.includes(a)).length;
    if (matches > 0) {
      score += (matches / Math.max(queryActivities.length, dataActivities.length)) * 0.1;
    }
  }

  return maxScore > 0 ? score / maxScore : 0;
}

/**
 * Get duration range for indexing
 */
function getDurationRange(duration: number): string {
  if (duration <= 3) return 'short'; // 1-3 days
  if (duration <= 7) return 'week'; // 4-7 days
  if (duration <= 14) return 'long'; // 8-14 days
  return 'extended'; // 15+ days
}