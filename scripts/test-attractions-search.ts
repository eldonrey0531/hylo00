/**
 * Test Viator Attractions Search API
 * 
 * This script demonstrates how to search for attractions in a destination,
 * which can be used for location/place autocomplete functionality.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

interface AttractionDetails {
  attractionId: number;
  name: string;
  destinations: Array<{
    id: number;
    primary: boolean;
  }>;
  attractionUrl?: string;
  productCount: number;
  productCodes: string[];
  images: Array<{
    variants: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  }>;
  reviews?: {
    totalReviews: number;
    averageRating: number;
  };
  freeAttraction?: boolean;
  openingHours?: string;
  center?: {
    latitude: number;
    longitude: number;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
}

interface AttractionsSearchResponse {
  attractions: AttractionDetails[];
  totalCount: number;
}

async function searchAttractions(destinationId: number, maxResults: number = 10) {
  const apiKey = process.env.VIATOR_API_KEY;
  
  if (!apiKey) {
    throw new Error('VIATOR_API_KEY not found in environment variables');
  }

  const url = 'https://api.viator.com/partner/attractions/search';
  
  const requestBody = {
    destinationId: destinationId,
    sorting: {
      sort: "REVIEW_AVG_RATING" // or "DEFAULT" or "ALPHABETICAL"
    },
    pagination: {
      start: 1,
      count: maxResults
    }
  };

  console.log(`\n🔍 Searching attractions for destination ID: ${destinationId}`);
  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'exp-api-key': apiKey,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
        'Content-Type': 'application/json;version=2.0'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`\nResponse Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: AttractionsSearchResponse = await response.json();
    
    console.log(`\n✅ Found ${data.totalCount} total attractions`);
    console.log(`   Showing ${data.attractions.length} results:\n`);

    // Display attractions
    data.attractions.forEach((attraction, index) => {
      console.log(`${index + 1}. ${attraction.name}`);
      console.log(`   ID: ${attraction.attractionId}`);
      console.log(`   Products: ${attraction.productCount} tours/activities available`);
      
      if (attraction.reviews) {
        console.log(`   Reviews: ${attraction.reviews.averageRating}/5 (${attraction.reviews.totalReviews} reviews)`);
      }
      
      if (attraction.freeAttraction !== undefined) {
        console.log(`   Admission: ${attraction.freeAttraction ? 'FREE' : 'Paid'}`);
      }
      
      if (attraction.address) {
        const addr = attraction.address;
        console.log(`   Address: ${[addr.street, addr.city, addr.state, addr.postcode].filter(Boolean).join(', ')}`);
      }
      
      if (attraction.center) {
        console.log(`   Location: ${attraction.center.latitude}, ${attraction.center.longitude}`);
      }
      
      if (attraction.openingHours) {
        console.log(`   Hours: ${attraction.openingHours}`);
      }
      
      console.log(`   Sample Product Codes: ${attraction.productCodes.slice(0, 3).join(', ')}${attraction.productCodes.length > 3 ? '...' : ''}`);
      console.log();
    });

    return data;

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Autocomplete simulation using destinations + attractions
async function autocompleteLocation(searchTerm: string) {
  console.log('\n🎯 AUTOCOMPLETE SIMULATION');
  console.log(`User typed: "${searchTerm}"`);
  console.log('─'.repeat(60));
  
  // Step 1: Search destinations (you would have this cached)
  const destinationMatches = [
    { id: 479, name: 'Paris', type: 'CITY' },
    { id: 357, name: 'Sydney', type: 'CITY' },
    { id: 687, name: 'New York City', type: 'CITY' },
    { id: 334, name: 'Tokyo', type: 'CITY' },
  ];
  
  const filtered = destinationMatches.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log('\n📍 Matching Destinations:');
  filtered.forEach(dest => {
    console.log(`   • ${dest.name} (ID: ${dest.id}, Type: ${dest.type})`);
  });
  
  // Step 2: For the first match, show top attractions
  if (filtered.length > 0) {
    const firstMatch = filtered[0];
    console.log(`\n🏛️  Top Attractions in ${firstMatch.name}:`);
    const attractions = await searchAttractions(firstMatch.id, 5);
    
    console.log('\n💡 AUTOCOMPLETE SUGGESTIONS:');
    console.log(`   1. ${firstMatch.name} (destination)`);
    attractions.attractions.slice(0, 4).forEach((attr, idx) => {
      console.log(`   ${idx + 2}. ${attr.name} (attraction in ${firstMatch.name})`);
    });
  }
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Viator Attractions Search API Test                       ║');
  console.log('║  Location/Place Autocomplete Demonstration                ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    // Test 1: Search Paris attractions
    await searchAttractions(479, 10); // Paris
    
    console.log('\n' + '═'.repeat(60) + '\n');
    
    // Test 2: Search Sydney attractions  
    await searchAttractions(357, 5); // Sydney
    
    console.log('\n' + '═'.repeat(60) + '\n');
    
    // Test 3: Autocomplete simulation
    await autocompleteLocation('par');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { searchAttractions, autocompleteLocation };
