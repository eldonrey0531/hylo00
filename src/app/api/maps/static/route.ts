import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/console-logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    logger.log(1, 'Static map request received', 'maps/static/route.ts', 'GET');

    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const zoom = searchParams.get('zoom') || '12';
    const size = searchParams.get('size') || '400x300';
    const maptype = searchParams.get('maptype') || 'roadmap';

    logger.log(2, 'Request parameters parsed', 'maps/static/route.ts', 'GET', {
      location,
      zoom,
      size,
      maptype
    });

    // Validate required parameters
    if (!location) {
      logger.error(3, 'Missing location parameter', 'maps/static/route.ts', 'GET', 'ValidationError: location is required');
      return NextResponse.json(
        { error: 'location parameter is required', success: false },
        { status: 400 }
      );
    }

    // Validate zoom level
    const zoomNum = parseInt(zoom);
    if (isNaN(zoomNum) || zoomNum < 1 || zoomNum > 20) {
      logger.error(4, 'Invalid zoom parameter', 'maps/static/route.ts', 'GET', 'ValidationError: zoom must be 1-20');
      return NextResponse.json(
        { error: 'zoom must be between 1 and 20', success: false },
        { status: 400 }
      );
    }

    // Validate size format
    const sizeRegex = /^\d+x\d+$/;
    if (!sizeRegex.test(size)) {
      logger.error(5, 'Invalid size parameter format', 'maps/static/route.ts', 'GET', 'ValidationError: size must be in format WxH');
      return NextResponse.json(
        { error: 'size must be in format WIDTHxHEIGHT (e.g., 400x300)', success: false },
        { status: 400 }
      );
    }

    // Validate maptype
    const validMapTypes = ['roadmap', 'satellite', 'terrain', 'hybrid'];
    if (!validMapTypes.includes(maptype)) {
      logger.error(6, 'Invalid maptype parameter', 'maps/static/route.ts', 'GET', `ValidationError: maptype must be one of ${validMapTypes.join(', ')}`);
      return NextResponse.json(
        { error: `maptype must be one of: ${validMapTypes.join(', ')}`, success: false },
        { status: 400 }
      );
    }

    // TODO: Step 7-8: Check Redis cache for existing map (T027)
    const cacheKey = `map_${location}_${zoom}_${size}_${maptype}`;
    logger.log(7, 'Checking cache for existing map', 'maps/static/route.ts', 'GET', { cacheKey });

    // Mock cache check - simulate 30% cache hit rate
    const cached = Math.random() < 0.3;
    logger.log(8, 'Cache check completed', 'maps/static/route.ts', 'GET', { cached });

    let imageUrl: string;

    if (cached) {
      // Return cached URL
      imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(location)}&zoom=${zoom}&size=${size}&maptype=${maptype}&key=CACHED_MOCK_KEY`;
      logger.log(9, 'Using cached map image', 'maps/static/route.ts', 'GET', { imageUrl });
    } else {
      // TODO: Step 10-12: Generate new map via SERP API (T026)
      logger.log(10, 'Generating new map image', 'maps/static/route.ts', 'GET');

      // Mock SERP API call - in real implementation, this would call the SERP service
      imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(location)}&zoom=${zoom}&size=${size}&maptype=${maptype}&key=MOCK_API_KEY`;

      // TODO: Step 13: Store in Redis cache (T027)
      logger.log(13, 'Storing map in cache', 'maps/static/route.ts', 'GET', { cacheKey });
    }

    logger.log(14, 'Map image URL generated', 'maps/static/route.ts', 'GET', {
      imageUrl: imageUrl.substring(0, 100) + '...', // Truncate for logging
      cached
    });

    const processingTime = Date.now() - startTime;
    logger.log(15, 'Static map request completed successfully', 'maps/static/route.ts', 'GET', {
      location,
      cached,
      processingTimeMs: processingTime
    });

    // Return map data per contract
    return NextResponse.json({
      success: true,
      imageUrl,
      cached
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    logger.error(16, 'Unexpected error in static map generation', 'maps/static/route.ts', 'GET', error instanceof Error ? error : String(error), {
      processingTimeMs: processingTime
    });

    return NextResponse.json(
      {
        error: 'Internal server error',
        success: false,
        message: 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    );
  }
}