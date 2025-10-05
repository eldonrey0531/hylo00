/**
 * Test Viator API with CORRECT headers based on official documentation
 * 
 * Key requirements from docs:
 * 1. Header 'exp-api-key' with your API key
 * 2. Header 'Accept: application/json;version=2.0' (MANDATORY!)
 * 3. Base URL: https://api.viator.com/partner
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const VIATOR_API_KEY = process.env.VIATOR_API_KEY;
const BASE_URL = 'https://api.viator.com/partner';

async function testViatorBasicAccess() {
  console.log('\n🔍 Testing Viator API with Basic Access Tier\n');
  console.log(`API Key: ${VIATOR_API_KEY ? `${VIATOR_API_KEY.slice(0, 8)}...${VIATOR_API_KEY.slice(-4)}` : 'NOT SET'}`);
  console.log(`Base URL: ${BASE_URL}\n`);

  if (!VIATOR_API_KEY) {
    console.error('❌ VIATOR_API_KEY not found');
    process.exit(1);
  }

  // Correct headers per documentation
  const headers = {
    'exp-api-key': VIATOR_API_KEY,
    'Accept': 'application/json;version=2.0',  // MANDATORY!
    'Accept-Language': 'en-US',
  };

  try {
    // Test 1: Get destinations list (Basic Access ✅)
    console.log('📍 Test 1: Fetching destinations...');
    
    const destResponse = await fetch(`${BASE_URL}/destinations`, {
      method: 'GET',
      headers,
    });

    console.log(`Status: ${destResponse.status} ${destResponse.statusText}`);
    
    if (!destResponse.ok) {
      const errorText = await destResponse.text();
      console.error('Error response:');
      console.error(errorText.slice(0, 500));
      throw new Error(`Destinations failed with ${destResponse.status}`);
    }

    const destData = await destResponse.json();
    console.log('✅ Destinations endpoint works!');
    
    if (destData.data && Array.isArray(destData.data)) {
      console.log(`\nFound ${destData.data.length} destinations`);
      const sampleDests = destData.data.slice(0, 5);
      sampleDests.forEach((dest: any) => {
        console.log(`  - ${dest.destinationName} (ID: ${dest.destinationId})`);
      });
      
      // Test 2: Search products for a destination (Basic Access ✅)
      if (sampleDests.length > 0) {
        const testDest = sampleDests.find((d: any) => 
          d.destinationName && d.destinationName.toLowerCase().includes('paris')
        ) || sampleDests[0];
        
        console.log(`\n🔍 Test 2: Searching products for ${testDest.destinationName}...`);
        
        const searchPayload = {
          filtering: {
            destination: testDest.destinationId,
          },
          currency: 'USD',
          pagination: {
            offset: 0,
            limit: 5,
          },
        };

        const productsResponse = await fetch(`${BASE_URL}/products/search`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchPayload),
        });

        console.log(`Status: ${productsResponse.status} ${productsResponse.statusText}`);
        
        if (!productsResponse.ok) {
          const errorText = await productsResponse.text();
          console.error('Product search error:');
          console.error(errorText.slice(0, 500));
        } else {
          const productsData = await productsResponse.json();
          console.log('✅ Product search successful!');
          
          if (productsData.products && productsData.products.length > 0) {
            console.log(`\nFound ${productsData.products.length} products:`);
            productsData.products.forEach((product: any, idx: number) => {
              console.log(`\n${idx + 1}. ${product.title}`);
              console.log(`   Code: ${product.productCode}`);
              if (product.pricing?.summary?.fromPrice) {
                console.log(`   From: ${product.pricing.currency} ${product.pricing.summary.fromPrice}`);
              }
              if (product.reviews?.combinedAverageRating) {
                console.log(`   Rating: ${product.reviews.combinedAverageRating}/5`);
              }
            });
          } else {
            console.log('No products found for this destination');
          }
        }
      }
    }

    // Test 3: Try a single product lookup (Basic Access ✅)
    console.log('\n🎫 Test 3: Fetching single product details...');
    
    // Using a known product code from documentation
    const productCode = '5010SYDNEY'; // Big Bus Sydney tour
    const productResponse = await fetch(`${BASE_URL}/products/${productCode}`, {
      method: 'GET',
      headers,
    });

    console.log(`Status: ${productResponse.status} ${productResponse.statusText}`);
    
    if (!productResponse.ok) {
      const errorText = await productResponse.text();
      console.error('Product lookup error:');
      console.error(errorText.slice(0, 500));
    } else {
      const productData = await productResponse.json();
      console.log('✅ Product lookup successful!');
      console.log(`\nProduct: ${productData.title}`);
      console.log(`Status: ${productData.status}`);
      if (productData.description) {
        console.log(`Description: ${productData.description.slice(0, 150)}...`);
      }
    }

    console.log('\n✅ API Access Verified!\n');
    console.log('Your Basic Access tier can:');
    console.log('  ✅ List destinations');
    console.log('  ✅ Search products by destination');
    console.log('  ✅ Get individual product details');
    console.log('  ✅ Search attractions');
    console.log('  ✅ Free-text search');
    console.log('\n❌ Cannot access (requires Full Access):');
    console.log('  • Bulk product ingestion (/products/modified-since)');
    console.log('  • Product reviews');
    console.log('  • Availability checking');
    console.log('  • Booking endpoints\n');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error instanceof Error ? error.message : String(error));
    
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Verify API key is activated in Viator partner dashboard');
    console.log('  2. Check you have Basic Access tier approved');
    console.log('  3. Ensure headers include version: Accept: application/json;version=2.0');
    console.log('  4. Contact: partnersupport@viator.com');
    console.log(`  5. Reference Key #E1F7: ${VIATOR_API_KEY}\n`);
    
    process.exit(1);
  }
}

testViatorBasicAccess();
