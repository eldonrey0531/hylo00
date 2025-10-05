/**
 * Direct Viator API test - Search for tours in Paris
 * This demonstrates what your itinerary app will use
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const BASE_URL = 'https://api.viator.com/partner';

async function searchParisActivities() {
  console.log('\n🗼 Searching for Activities in Paris\n');

  if (!VIATOR_API_KEY) {
    console.error('❌ VIATOR_API_KEY not found');
    process.exit(1);
  }

  const headers = {
    'exp-api-key': VIATOR_API_KEY,
    'Accept': 'application/json;version=2.0',
    'Accept-Language': 'en-US',
    'Content-Type': 'application/json',
  };

  try {
    // First, let's search for Paris in the destinations list
    console.log('🔍 Finding Paris destination ID...\n');
    
    let parisId = 647; // Default

    const destResponse = await fetch(`${BASE_URL}/destinations`, {
      method: 'GET',
      headers,
    });

    if (destResponse.ok) {
      const destData = await destResponse.json();
      const destinations = destData.destinations || destData;
      const paris = Array.isArray(destinations) 
        ? destinations.find((d: any) => 
            d.name.toLowerCase().includes('paris') && d.name.toLowerCase().includes('france')
          )
        : null;
      
      if (paris) {
        console.log(`✅ Found Paris: ${paris.name} (ID: ${paris.destinationId})\n`);
        parisId = paris.destinationId;
      } else {
        console.log('ℹ️  Paris not found in destinations list, using default ID\n');
      }
    } else {
      console.log('ℹ️  Using default Paris ID 647\n');
    }

    console.log('🔍 Searching for top-rated tours in Paris...\n');
    
    const searchPayload = {
      filtering: {
        destination: parisId,
      },
      currency: 'USD',
      sorting: {
        sort: 'TRAVELER_RATING', // Sort by traveler rating
        order: 'DESCENDING', // Highest rated first
      },
      pagination: {
        start: 1,
        count: 10,
      },
    };

    const response = await fetch(`${BASE_URL}/products/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify(searchPayload),
    });

    console.log(`Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error:');
      console.error(errorText);
      process.exit(1);
    }

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      console.log('No products found');
      process.exit(0);
    }

    console.log(`\n✅ Found ${data.products.length} products\n`);
    console.log('─'.repeat(80));

    data.products.forEach((product: any, idx: number) => {
      console.log(`\n${idx + 1}. ${product.title}`);
      console.log(`   Product Code: ${product.productCode}`);
      
      if (product.description) {
        const desc = product.description.replace(/\n/g, ' ').slice(0, 200);
        console.log(`   Description: ${desc}...`);
      }
      
      if (product.pricing?.summary) {
        const pricing = product.pricing.summary;
        console.log(`   Price: From ${pricing.currency} ${pricing.fromPrice}`);
      }
      
      if (product.reviews) {
        const reviews = product.reviews;
        console.log(`   Rating: ⭐ ${reviews.combinedAverageRating}/5 (${reviews.totalReviews} reviews)`);
      }
      
      if (product.duration) {
        console.log(`   Duration: ${product.duration}`);
      }
      
      if (product.productUrl) {
        console.log(`   URL: ${product.productUrl}`);
      }
      
      console.log('   ─'.repeat(40));
    });

    // Show what data structure is available
    console.log('\n📊 Available Data Fields:\n');
    const firstProduct = data.products[0];
    console.log('Product object keys:', Object.keys(firstProduct));
    
    if (firstProduct.pricing) {
      console.log('Pricing keys:', Object.keys(firstProduct.pricing));
    }
    
    if (firstProduct.images && firstProduct.images.length > 0) {
      console.log(`Images available: ${firstProduct.images.length} images`);
      console.log('Sample image:', firstProduct.images[0]);
    }

    console.log('\n✅ Success! Your API key can search and retrieve product data.\n');

  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

searchParisActivities();
