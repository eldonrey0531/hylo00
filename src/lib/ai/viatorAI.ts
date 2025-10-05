/**
 * Viator Integration Module
 * 
 * Searches Viator API for tours, activities, and experiences
 * Returns products with affiliate links to enrich AI-generated itineraries
 */

import type { TripFormData, TripLocationDetails } from '@/types/itinerary/trip-form-data';
import { logger } from '@/utils/console-logger';
import { LogStatus } from '@/types/itinerary/enums';
import { getItineraryConfig } from '@/lib/config/itinerary-config';

const VIATOR_API_BASE = 'https://api.viator.com/partner';

export interface ViatorProduct {
  productCode: string;
  productName: string;
  productUrl: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    formattedPrice: string;
  };
  duration: string;
  location: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
  rating: {
    average: number;
    count: number;
  };
  images: string[];
  categories: string[];
  highlights: string[];
  cancellationPolicy?: string;
}

export interface ViatorSearchParams {
  destinationName: string;
  destinationId?: string | null;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
  currency?: string;
  categories?: string[]; // e.g., ['activities', 'dining', 'transportation']
  interests?: string[]; // e.g., ['food', 'history', 'culture']
  adults?: number;
  children?: number;
}

export interface ViatorSearchResult {
  products: ViatorProduct[];
  totalResults: number;
  searchId: string;
}

/**
 * Search Viator for products based on destination and preferences
 */
export async function searchViatorProducts(
  params: ViatorSearchParams
): Promise<ViatorSearchResult> {
  const startTime = Date.now();
  
  try {
    const {
      viator: { apiKey: viatorApiKey },
    } = getItineraryConfig();
    
    if (!viatorApiKey) {
      logger.log(
        150,
        'Viator API key not configured, returning empty results',
        'viatorAI.ts',
        'searchViatorProducts',
        { destination: params.destinationName },
        undefined,
        LogStatus.SUCCESS
      );
      
      return {
        products: [],
        totalResults: 0,
        searchId: 'no-api-key'
      };
    }

    if (!params.destinationId) {
      logger.log(
        151,
        'Missing Viator destination ID; skipping product search',
        'viatorAI.ts',
        'searchViatorProducts',
        {
          destinationName: params.destinationName,
          latitude: params.latitude,
          longitude: params.longitude,
        },
        undefined,
        LogStatus.SUCCESS
      );

      return {
        products: [],
        totalResults: 0,
        searchId: 'missing-destination-id',
      };
    }

    // Build Viator API request
    const searchPayload = {
      destId: params.destinationId,
      startDate: params.startDate,
      endDate: params.endDate,
      currency: params.currency || 'USD',
      topX: '20', // Get top 20 products
      sortOrder: 'RATING', // Sort by highest rated
      catId: mapCategoriesToViatorIds(params.categories),
    };

    logger.log(
      152,
      'Searching Viator API',
      'viatorAI.ts',
      'searchViatorProducts',
      {
        destinationId: params.destinationId,
        destinationName: params.destinationName,
        categories: params.categories,
        interests: params.interests,
      },
      undefined,
      LogStatus.SUCCESS
    );

    const response = await fetch(`${VIATOR_API_BASE}/search/products`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'exp-api-key': viatorApiKey,
      },
      body: JSON.stringify(searchPayload),
    });

    if (!response.ok) {
      throw new Error(`Viator API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Viator response to our format
    const products: ViatorProduct[] = (data.data || []).map((item: any) => ({
      productCode: item.productCode,
      productName: item.title,
      productUrl: buildViatorAffiliateUrl(item.productCode),
      description: item.description || item.shortDescription || '',
      price: {
        amount: item.price?.amount || 0,
        currency: item.price?.currency || params.currency || 'USD',
        formattedPrice: item.price?.formattedPrice || 'Contact for price',
      },
      duration: item.duration || 'Varies',
      location: {
        name: item.location?.name || params.destinationName,
        latitude: item.location?.latitude,
        longitude: item.location?.longitude,
      },
      rating: {
        average: item.rating || 0,
        count: item.reviewCount || 0,
      },
      images: item.images || [],
      categories: item.categories || [],
      highlights: item.highlights || [],
      cancellationPolicy: item.cancellationPolicy,
    }));

    const duration = Date.now() - startTime;
    
    logger.log(
      153,
      'Viator search completed',
      'viatorAI.ts',
      'searchViatorProducts',
      {
        productsFound: products.length,
        destinationId: params.destinationId,
        destinationName: params.destinationName,
        durationMs: duration,
      },
      duration,
      LogStatus.SUCCESS
    );

    return {
      products,
      totalResults: data.totalCount || products.length,
      searchId: data.searchId || `search-${Date.now()}`,
    };

  } catch (error) {
    logger.error(
      154,
      'Viator search failed',
      'viatorAI.ts',
      'searchViatorProducts',
      error instanceof Error ? error : new Error(String(error)),
      { destinationId: params.destinationId, destinationName: params.destinationName }
    );

    // Return empty results on error
    return {
      products: [],
      totalResults: 0,
      searchId: 'error',
    };
  }
}

/**
 * Build Viator affiliate URL with partner tracking
 */
function buildViatorAffiliateUrl(productCode: string): string {
  const {
    viator: { partnerId },
  } = getItineraryConfig();
  return `https://www.viator.com/tours/${productCode}?pid=${partnerId || 'HYLO'}&mcid=42383`;
}

/**
 * Map user's selected categories to Viator category IDs
 */
function mapCategoriesToViatorIds(categories?: string[]): string[] {
  if (!categories || categories.length === 0) {
    return [];
  }

  const categoryMapping: Record<string, string> = {
    'activities': '4',      // Tours & Activities
    'dining': '17',         // Food & Dining
    'entertainment': '13',  // Shows & Entertainment
    'nature': '8',          // Nature & Adventure
    'culture': '2',         // Cultural & Historical
    'water-sports': '9',    // Water Sports
    'wellness': '18',       // Wellness & Spa
  };

  return categories
    .map(cat => categoryMapping[cat])
    .filter((id): id is string => id !== undefined);
}

/**
 * Search Viator and format results as AI context
 * This context will be injected into the AI architect prompt
 */
export async function getViatorContextForItinerary(
  formData: TripFormData
): Promise<string> {
  // Extract search parameters from form data
  const locationDetails = formData.locationDetails ?? null;
  const primaryLocationLabel = locationDetails?.label?.trim() || formData.location;

  const destinationId = await getViatorDestinationId(locationDetails ?? primaryLocationLabel);

  if (!destinationId) {
    logger.log(
      155,
      'Viator destination ID not found for location',
      'viatorAI.ts',
      'getViatorContextForItinerary',
      {
        primaryLocationLabel,
        locationDetails,
      },
      undefined,
      LogStatus.SUCCESS
    );

    return `No Viator destination match found for ${primaryLocationLabel}.`;
  }

  const searchParams: ViatorSearchParams = {
    destinationName: primaryLocationLabel,
    destinationId,
    latitude: locationDetails?.latitude,
    longitude: locationDetails?.longitude,
    startDate: formData.departDate || undefined,
    endDate: formData.returnDate || undefined,
    currency: formData.currency,
    categories: extractCategoriesFromInclusions(formData.selectedInclusions),
    interests: formData.selectedInterests,
    adults: formData.adults,
    children: formData.children,
  };

  // Search Viator
  const results = await searchViatorProducts(searchParams);

  if (results.products.length === 0) {
    return 'No Viator products found for this destination.';
  }

  // Format as context for AI
  const contextLines: string[] = [
    '=== AVAILABLE VIATOR PRODUCTS ===',
    `Found ${results.products.length} highly-rated tours and activities:`,
    ''
  ];

  results.products.forEach((product, index) => {
    contextLines.push(`${index + 1}. ${product.productName}`);
    contextLines.push(`   Product Code: ${product.productCode}`);
    contextLines.push(`   Price: ${product.price.formattedPrice}`);
    contextLines.push(`   Duration: ${product.duration}`);
    contextLines.push(`   Rating: ${product.rating.average}/5 (${product.rating.count} reviews)`);
    contextLines.push(`   Booking URL: ${product.productUrl}`);
    if (product.highlights.length > 0) {
      contextLines.push(`   Highlights: ${product.highlights.slice(0, 3).join(', ')}`);
    }
    contextLines.push('');
  });

  contextLines.push('=== INSTRUCTIONS ===');
  contextLines.push('Include these Viator products in your recommendations.');
  contextLines.push('Use the Product Code and Booking URL exactly as provided.');
  contextLines.push('Match products to relevant days/activities in the itinerary.');
  contextLines.push('');

  return contextLines.join('\n');
}

/**
 * Extract activity categories from user's selected inclusions
 */
function extractCategoriesFromInclusions(inclusions: string[]): string[] {
  if (!inclusions || inclusions.length === 0) {
    return ['activities']; // Default to activities
  }

  const categoryMap: Record<string, string> = {
    'activities': 'activities',
    'dining': 'dining',
    'entertainment': 'entertainment',
    'nature': 'nature',
  };

  return inclusions
    .map(inc => categoryMap[inc])
    .filter((cat): cat is string => cat !== undefined);
}

/**
 * Get destination ID for Viator API
 * This would typically call Viator's destination search endpoint
 */
export async function getViatorDestinationId(location: TripLocationDetails | string): Promise<string | null> {
  try {
    const {
      viator: { apiKey: viatorApiKey },
    } = getItineraryConfig();

    if (!viatorApiKey) {
      return null;
    }

    const searchTerms = buildDestinationSearchTerms(location);
    if (searchTerms.length === 0) {
      return null;
    }

    const targetCoords =
      typeof location === 'object'
        ? { latitude: location.latitude, longitude: location.longitude }
        : { latitude: null, longitude: null };

    const candidates: DestinationCandidate[] = [];

    for (const term of searchTerms) {
      try {
        const response = await fetch(
          `${VIATOR_API_BASE}/search/destinations?searchTerm=${encodeURIComponent(term)}`,
          {
            headers: {
              Accept: 'application/json',
              'exp-api-key': viatorApiKey,
            },
          }
        );

        if (!response.ok) {
          continue;
        }

        const payload = await response.json();
        const matches = Array.isArray(payload?.data) ? payload.data : [];

        for (const item of matches) {
          const destinationId =
            item?.destinationId ?? item?.id ?? item?.destId ?? item?.destination_id;

          if (!destinationId) {
            continue;
          }

          const latitude = toNumeric(item?.latitude ?? item?.lat ?? item?.geo?.latitude);
          const longitude = toNumeric(item?.longitude ?? item?.lng ?? item?.geo?.longitude);

          candidates.push({
            destinationId: String(destinationId),
            name:
              item?.name ??
              item?.destinationName ??
              item?.destination ??
              item?.label ??
              term,
            latitude,
            longitude,
            country: item?.country ?? item?.countryName,
          });
        }
      } catch (error) {
        logger.error(
          161,
          'Viator destination search failed',
          'viatorAI.ts',
          'getViatorDestinationId',
          error instanceof Error ? error : new Error(String(error)),
          { term }
        );
      }

      // If we already have viable candidates, no need to keep querying with additional terms
      if (candidates.length > 0) {
        break;
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    if (targetCoords.latitude !== null && targetCoords.longitude !== null) {
      candidates.sort((a, b) => {
        const aDistance = haversineDistanceKm(
          targetCoords.latitude!,
          targetCoords.longitude!,
          a.latitude,
          a.longitude
        );
        const bDistance = haversineDistanceKm(
          targetCoords.latitude!,
          targetCoords.longitude!,
          b.latitude,
          b.longitude
        );
        return aDistance - bDistance;
      });
    }

    return candidates[0]?.destinationId ?? null;
  } catch (error) {
    logger.error(
      160,
      'Failed to get Viator destination ID',
      'viatorAI.ts',
      'getViatorDestinationId',
      error instanceof Error ? error : new Error(String(error)),
      { location }
    );
    return null;
  }
}

function buildDestinationSearchTerms(location: TripLocationDetails | string): string[] {
  if (typeof location === 'string') {
    const trimmed = location.trim();
    if (!trimmed) {
      return [];
    }

    const terms = new Set<string>();
    terms.add(trimmed);

    const pieces = trimmed.split(',').map((part) => part.trim()).filter(Boolean);
    pieces.forEach((part) => terms.add(part));

    if (pieces.length >= 2) {
      const city = pieces[0];
      const country = pieces[pieces.length - 1];
      if (city && country) {
        terms.add(`${city}, ${country}`);
      }

      const region = pieces.length >= 3 ? pieces[pieces.length - 2] : '';
      if (city && region) {
        terms.add(`${city}, ${region}`);
      }
    }

    return Array.from(terms);
  }

  const terms = new Set<string>();

  const label = location.label?.trim();
  if (label) {
    terms.add(label);
  }

  const city = location.city?.trim();
  const region = location.region?.trim();
  const country = location.country?.trim();

  if (city && country) {
    terms.add(`${city}, ${country}`);
  }

  if (region && country) {
    terms.add(`${region}, ${country}`);
  }

  if (city) {
    terms.add(city);
  }

  if (country) {
    terms.add(country);
  }

  return Array.from(terms);
}

function toNumeric(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = typeof value === 'string' ? Number(value) : value;
  return typeof numeric === 'number' && Number.isFinite(numeric) ? numeric : null;
}

function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number | null,
  lon2: number | null
): number {
  if (lat2 === null || lon2 === null) {
    return Number.MAX_VALUE;
  }

  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

interface DestinationCandidate {
  destinationId: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  country?: string;
}
