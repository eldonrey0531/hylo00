/**
 * Search Paris activities using freetext search
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const BASE_URL = 'https://api.viator.com/partner';

async function searchParisFreetext() {
  console.log('\n🗼 Searching for Paris Activities (Freetext Search)\n');

  if (!VIATOR_API_KEY) {
    console.error('❌ VIATOR_API_KEY not found');
    process.exit(1);
  }

  const headers = {
    'exp-api-key': VIATOR_API_KEY,
    'Accept': 'application/json;version=2.0',
    'Accept-Language': 'en-US',
  };

  try {
    console.log('🔍 Searching for "Eiffel Tower tours Paris"...\n');
    
    const response = await fetch(`${BASE_URL}/search/freetext?searchTerm=${encodeURIComponent('Eiffel Tower tours Paris')}&currency=USD&start=1&count=10`, {
      method: 'GET',
      headers,
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

    data.products.slice(0, 5).forEach((product: any, idx: number) => {
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
        console.log(`   Duration: ${product.duration.fixedDurationInMinutes ? `${product.duration.fixedDurationInMinutes} minutes` : JSON.stringify(product.duration)}`);
      }
      
      console.log('   ─'.repeat(40));
    });

    console.log('\n✅ Success! Found Paris activities via freetext search.\n');

  } catch (error) {
    console.error('\n❌ Error:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

searchParisFreetext();
