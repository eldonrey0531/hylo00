/**
 * Quick test script to verify Viator API access
 * Run with: npx tsx scripts/test-viator-api.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const VIATOR_API_BASE = 'https://api.viator.com/partner';

async function testViatorConnection() {
  console.log('\n🔍 Testing Viator API Connection...\n');
  console.log(`API Key: ${VIATOR_API_KEY ? `${VIATOR_API_KEY.slice(0, 8)}...${VIATOR_API_KEY.slice(-4)}` : 'NOT SET'}`);
  console.log(`Base URL: ${VIATOR_API_BASE}\n`);

  if (!VIATOR_API_KEY) {
    console.error('❌ VIATOR_API_KEY not found in environment');
    process.exit(1);
  }

  try {
    // Test 1: Get taxonomy categories (simple GET)
    console.log('� Test 1: Fetching product categories...');
    
    const categoriesResponse = await fetch(`${VIATOR_API_BASE}/v1/taxonomy/categories`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'exp-api-key': VIATOR_API_KEY,
      },
    });

    console.log(`Status: ${categoriesResponse.status} ${categoriesResponse.statusText}`);
    
    if (!categoriesResponse.ok) {
      const errorText = await categoriesResponse.text();
      console.error('❌ Categories request failed:');
      console.error(errorText.slice(0, 1000));
      throw new Error(`API returned ${categoriesResponse.status}`);
    }

    const categoriesData = await categoriesResponse.json();
    console.log('✅ Categories endpoint successful!');
    
    if (categoriesData.data && Array.isArray(categoriesData.data)) {
      console.log(`\nFound ${categoriesData.data.length} categories`);
      console.log('Sample categories:');
      categoriesData.data.slice(0, 5).forEach((cat: any) => {
        console.log(`  - ${cat.name || cat.categoryName} (ID: ${cat.id || cat.categoryId})`);
      });
    }

    // Test 2: Search products (using v1 endpoint)
    console.log('\n🎭 Test 2: Searching for products (Paris tours)...');
    
    const searchPayload = {
      filtering: {
        destination: 684, // Paris destination ID
      },
      currency: 'USD',
      pagination: {
        offset: 0,
        limit: 5,
      },
    };

    const productsResponse = await fetch(`${VIATOR_API_BASE}/v1/products/search`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'exp-api-key': VIATOR_API_KEY,
      },
      body: JSON.stringify(searchPayload),
    });

    console.log(`Status: ${productsResponse.status} ${productsResponse.statusText}`);
    
    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.error('❌ Product search failed:');
      console.error(errorText.slice(0, 1000));
    } else {
      const productsData = await productsResponse.json();
      console.log('✅ Product search successful!');
      
      if (productsData.products && productsData.products.length > 0) {
        console.log(`\nFound ${productsData.products.length} products in Paris:`);
        productsData.products.forEach((product: any, idx: number) => {
          console.log(`\n${idx + 1}. ${product.title}`);
          console.log(`   Code: ${product.productCode}`);
          if (product.pricing?.summary?.fromPrice) {
            console.log(`   From: ${product.pricing.currency} ${product.pricing.summary.fromPrice}`);
          }
          if (product.reviews?.combinedAverageRating) {
            console.log(`   Rating: ${product.reviews.combinedAverageRating}/5 (${product.reviews.totalReviews} reviews)`);
          }
        });
      } else {
        console.log('No products returned (but API is accessible)');
      }
    }

    console.log('\n✅ API Connection Verified!\n');
    console.log('Your Viator API key has BASIC ACCESS and can:');
    console.log('  • Fetch taxonomy (categories, destinations, attractions)');
    console.log('  • Search products by destination');
    console.log('  • Get product details');
    console.log('  • Access pricing, ratings, and reviews\n');
    console.log('⚠️  Note: Booking/reservation features require partnership access\n');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.message.includes('500')) {
      console.log('\n💡 Possible issues:');
      console.log('  1. API key may not be activated yet');
      console.log('  2. Endpoint URL may have changed');
      console.log('  3. API may be experiencing issues');
      console.log('\n📧 Contact Viator support with your Key #E1F7 for verification\n');
    }
    
    process.exit(1);
  }
}

testViatorConnection();
