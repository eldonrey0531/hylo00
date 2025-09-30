import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/console-logger';
import { searchSimilarItineraries } from '@/lib/redis/redis-vector';

/**
 * POST /api/itinerary/search
 * Search for similar itineraries using vector similarity
 */
export async function POST(request: NextRequest) {
  try {
    logger.log(1, 'Search request received', 'search/route.ts', 'POST');

    const body = await request.json();
    const { destination, duration, budget, activities, preferences, topK = 5 } = body;

    // Validate required fields
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination is required' },
        { status: 400 }
      );
    }

    logger.log(2, 'Search parameters parsed', 'search/route.ts', 'POST', {
      destination,
      duration,
      budget,
      activitiesCount: activities?.length || 0,
      preferencesCount: preferences?.length || 0,
      topK,
    });

    // Search for similar itineraries using Redis
    const similarItineraries = await searchSimilarItineraries(
      {
        destination,
        duration: duration ? parseInt(duration) : undefined,
        budget,
        activities,
        preferences,
      },
      topK
    );

    logger.log(4, 'Similar itineraries found', 'search/route.ts', 'POST', {
      count: similarItineraries.length,
      topScore: similarItineraries.length > 0 ? similarItineraries[0].score : null,
    });

    // Format results for response
    const results = similarItineraries.map(result => ({
      workflowId: result.id,
      score: result.score,
      destination: result.metadata?.destination,
      duration: result.metadata?.duration,
      budget: result.metadata?.budget,
      activities: result.metadata?.activities || [],
      preferences: result.metadata?.preferences || [],
      createdAt: result.metadata?.timestamp,
      // Include a summary of the itinerary if available
      summary: result.metadata?.itinerary ? {
        title: result.metadata.itinerary.title || `Trip to ${result.metadata?.destination}`,
        description: result.metadata.itinerary.description || `${result.metadata?.duration} day trip`,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      query: {
        destination,
        duration,
        budget,
        activities,
        preferences,
      },
      results,
      count: results.length,
    });

  } catch (error) {
    logger.error(10, 'Search request failed', 'search/route.ts', 'POST', error instanceof Error ? error : String(error));

    return NextResponse.json(
      { 
        error: 'Failed to search itineraries',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}