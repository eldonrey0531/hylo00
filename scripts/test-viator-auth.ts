/**
 * Alternative Viator API test using different auth header
 * Viator sometimes uses 'Api-Key' instead of 'exp-api-key'
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const VIATOR_API_KEY = process.env.VIATOR_API_KEY;

async function testAlternativeAuth() {
  console.log('\n🔍 Testing Alternative Viator API Authentication...\n');
  console.log(`API Key: ${VIATOR_API_KEY ? `${VIATOR_API_KEY.slice(0, 8)}...${VIATOR_API_KEY.slice(-4)}` : 'NOT SET'}\n`);

  if (!VIATOR_API_KEY) {
    console.error('❌ VIATOR_API_KEY not found');
    process.exit(1);
  }

  const authMethods = [
    { name: 'exp-api-key header', headers: { 'exp-api-key': VIATOR_API_KEY, 'Accept': 'application/json' } as HeadersInit },
    { name: 'Api-Key header', headers: { 'Api-Key': VIATOR_API_KEY, 'Accept': 'application/json' } as HeadersInit },
    { name: 'X-API-Key header', headers: { 'X-API-Key': VIATOR_API_KEY, 'Accept': 'application/json' } as HeadersInit },
    { name: 'Authorization Bearer', headers: { 'Authorization': `Bearer ${VIATOR_API_KEY}`, 'Accept': 'application/json' } as HeadersInit },
  ];

  const testEndpoints = [
    'https://api.viator.com/partner/v1/taxonomy/categories',
    'https://api.viator.com/v1/taxonomy/categories',
    'https://api.viator.com/partner/products/modified-since',
  ];

  for (const endpoint of testEndpoints) {
    console.log(`\n📍 Testing endpoint: ${endpoint}`);
    
    for (const auth of authMethods) {
      try {
        console.log(`  Trying ${auth.name}...`);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: auth.headers,
        });

        console.log(`    Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log(`    ✅ SUCCESS with ${auth.name}!`);
          const data = await response.json();
          console.log(`    Response keys: ${Object.keys(data).join(', ')}`);
          
          if (data.data && Array.isArray(data.data)) {
            console.log(`    Data count: ${data.data.length} items`);
          }
          
          console.log('\n🎉 Found working configuration!');
          console.log(`Endpoint: ${endpoint}`);
          console.log(`Auth method: ${auth.name}`);
          process.exit(0);
        } else if (response.status !== 500) {
          const text = await response.text();
          console.log(`    Response: ${text.slice(0, 200)}`);
        }
        
      } catch (error) {
        console.log(`    ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  console.log('\n❌ No working configuration found');
  console.log('\n💡 Next steps:');
  console.log('  1. Verify your API key is activated in your Viator partner dashboard');
  console.log('  2. Check if you need to whitelist your IP address');
  console.log('  3. Contact Viator support: partnersupport@viator.com');
  console.log('  4. Reference Key #E1F7: e1f754be-fc5f-476e-98b2-71268c406150\n');
  
  process.exit(1);
}

testAlternativeAuth();
