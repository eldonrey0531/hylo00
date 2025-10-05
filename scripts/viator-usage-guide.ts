/**
 * VIATOR API USAGE GUIDE FOR YOUR ITINERARY APP
 * 
 * This demonstrates how to use all three available endpoints
 * in Basic Access tier to enhance AI-generated itineraries.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const BASE_URL = 'https://api.viator.com/partner';

const headers = {
  'exp-api-key': VIATOR_API_KEY!,
  'Accept': 'application/json;version=2.0',
  'Accept-Language': 'en-US',
  'Content-Type': 'application/json',
};

// ============================================================================
// 1. /destinations - Find destination IDs for cities
// ============================================================================
async function getDestinations() {
  console.log('\n📍 1. GET /destinations - Find cities and their IDs\n');
  console.log('Use case: Convert city names to destination IDs for searches\n');

  const response = await fetch(`${BASE_URL}/destinations`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    console.error(`Error: ${response.status}`);
    return null;
  }

  const data = await response.json();
  const destinations = data.destinations;

  // Find Paris
  const paris = destinations.find((d: any) => 
    d.name === 'Paris' && d.type === 'CITY'
  );

  // Find Tokyo
  const tokyo = destinations.find((d: any) => 
    d.name === 'Tokyo' && d.type === 'CITY'
  );

  // Find New York
  const newYork = destinations.find((d: any) => 
    d.name === 'New York City' && d.type === 'CITY'
  );

  console.log('✅ Found destinations:');
  if (paris) console.log(`   Paris: ID ${paris.destinationId}`);
  if (tokyo) console.log(`   Tokyo: ID ${tokyo.destinationId}`);
  if (newYork) console.log(`   New York: ID ${newYork.destinationId}`);
  
  console.log(`\n   Total destinations available: ${destinations.length}`);
  
  return { paris, tokyo, newYork, all: destinations };
}

// ============================================================================
// 2. /search/freetext - Search for tours and activities
// ============================================================================
async function searchFreetext(searchTerm: string, currency = 'USD') {
  console.log(`\n🔍 2. GET /search/freetext - Search for "${searchTerm}"\n`);
  console.log('Use case: Find tours/activities matching a description\n');

  const url = `${BASE_URL}/search/freetext?searchTerm=${encodeURIComponent(searchTerm)}&currency=${currency}&start=1&count=5`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.error(text.slice(0, 500));
    return null;
  }

  const data = await response.json();

  if (!data.products || data.products.length === 0) {
    console.log('   No products found');
    return null;
  }

  console.log(`✅ Found ${data.products.length} products:\n`);

  data.products.forEach((product: any, idx: number) => {
    console.log(`   ${idx + 1}. ${product.title}`);
    console.log(`      Code: ${product.productCode}`);
    
    if (product.pricing?.summary) {
      console.log(`      Price: ${product.pricing.summary.currency} ${product.pricing.summary.fromPrice}`);
    }
    
    if (product.reviews) {
      console.log(`      Rating: ⭐ ${product.reviews.combinedAverageRating}/5 (${product.reviews.totalReviews} reviews)`);
    }
    
    if (product.duration?.fixedDurationInMinutes) {
      const hours = Math.floor(product.duration.fixedDurationInMinutes / 60);
      const mins = product.duration.fixedDurationInMinutes % 60;
      console.log(`      Duration: ${hours}h ${mins}m`);
    }
    
    console.log('');
  });

  return data.products;
}

// ============================================================================
// 3. /products/{product-code} - Get detailed product information
// ============================================================================
async function getProductDetails(productCode: string) {
  console.log(`\n📦 3. GET /products/${productCode} - Get full product details\n`);
  console.log('Use case: Enrich itinerary with complete tour information\n');

  const response = await fetch(`${BASE_URL}/products/${productCode}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} ${response.statusText}`);
    return null;
  }

  const product = await response.json();

  console.log('✅ Product Details:\n');
  console.log(`   Title: ${product.title}`);
  console.log(`   Code: ${product.productCode}`);
  
  if (product.description) {
    console.log(`   Description: ${product.description.slice(0, 200)}...`);
  }
  
  if (product.pricing?.summary) {
    console.log(`   Price: ${product.pricing.summary.currency} ${product.pricing.summary.fromPrice}`);
  }
  
  if (product.reviews) {
    console.log(`   Rating: ⭐ ${product.reviews.combinedAverageRating}/5 (${product.reviews.totalReviews} reviews)`);
  }
  
  if (product.duration) {
    console.log(`   Duration: ${JSON.stringify(product.duration)}`);
  }

  if (product.images && product.images.length > 0) {
    console.log(`   Images: ${product.images.length} available`);
    const coverImage = product.images.find((img: any) => img.isCover) || product.images[0];
    if (coverImage?.variants?.[0]) {
      console.log(`   Cover Image: ${coverImage.variants[coverImage.variants.length - 1]?.url}`);
    }
  }

  if (product.itinerary) {
    console.log(`   Itinerary Type: ${product.itineraryType}`);
  }

  if (product.inclusions && product.inclusions.length > 0) {
    console.log(`   Includes: ${product.inclusions.slice(0, 3).map((i: any) => i.description).join(', ')}`);
  }

  if (product.productUrl) {
    console.log(`   Booking URL: ${product.productUrl}`);
  }

  console.log('');

  return product;
}

// ============================================================================
// DEMO: Complete workflow for building an itinerary
// ============================================================================
async function demoCompleteWorkflow() {
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 COMPLETE WORKFLOW: How to use Viator API in your itinerary app');
  console.log('═'.repeat(80));

  try {
    // Step 1: Get destinations (do this once, cache the results)
    const destinations = await getDestinations();

    console.log('\n' + '─'.repeat(80));

    // Step 2: Search for activities based on user's trip
    // Example: User wants to visit Paris and is interested in "art museums"
    const searchResults = await searchFreetext('Paris Louvre Museum tour');

    if (searchResults && searchResults.length > 0) {
      console.log('\n' + '─'.repeat(80));

      // Step 3: Get detailed info for the first result to enrich itinerary
      const topProduct = searchResults[0];
      await getProductDetails(topProduct.productCode);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ WORKFLOW COMPLETE!\n');
    console.log('💡 Integration Strategy for Your App:\n');
    console.log('1. User fills out trip form (destination, dates, interests)');
    console.log('2. AI generates initial itinerary with activity suggestions');
    console.log('3. For each AI suggestion, call /search/freetext to find matching Viator products');
    console.log('4. Get top match details with /products/{code}');
    console.log('5. Enrich itinerary with real pricing, reviews, booking links');
    console.log('6. Display enhanced itinerary to user\n');
    console.log('═'.repeat(80) + '\n');

  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================================================
// Run the demo
// ============================================================================
demoCompleteWorkflow();
