/**
 * Practical Viator Integration Example
 * 
 * This shows the ACTUAL working approach with Basic Access tier
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
};

// Curated product codes for demonstration
// In a real app, you'd have a larger database of these
const CURATED_PRODUCTS: Record<string, Array<{code: string, title: string, keywords: string[]}>> = {
  'paris': [
    { code: '3569EIFFEL', title: 'Eiffel Tower Visit', keywords: ['eiffel', 'tower', 'landmark'] },
    { code: '2050LOUVRE', title: 'Louvre Museum', keywords: ['louvre', 'museum', 'art'] },
  ],
  'sydney': [
    { code: '5010SYDNEY', title: 'Big Bus Sydney', keywords: ['bus', 'tour', 'sightseeing'] },
  ],
  'new-york': [
    { code: '2110EMPIRE', title: 'Empire State Building', keywords: ['empire', 'building', 'skyscraper'] },
  ],
};

async function getDestinationId(cityName: string): Promise<number | null> {
  console.log(`\n📍 Looking up destination ID for "${cityName}"...`);
  
  const response = await fetch(`${BASE_URL}/destinations`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    console.error(`  ❌ Error: ${response.status}`);
    return null;
  }

  const data = await response.json();
  const destination = data.destinations.find((d: any) => 
    d.name.toLowerCase() === cityName.toLowerCase() && d.type === 'CITY'
  );

  if (destination) {
    console.log(`  ✅ Found: ${destination.name} (ID: ${destination.destinationId})`);
    return destination.destinationId;
  }

  console.log(`  ℹ️  Not found`);
  return null;
}

async function getProductDetails(productCode: string) {
  console.log(`\n📦 Fetching product details for: ${productCode}`);
  
  const response = await fetch(`${BASE_URL}/products/${productCode}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    console.error(`  ❌ Error: ${response.status} ${response.statusText}`);
    return null;
  }

  const product = await response.json();

  console.log(`  ✅ ${product.title}`);
  
  if (product.pricing?.summary) {
    console.log(`     💰 From ${product.pricing.summary.currency} ${product.pricing.summary.fromPrice}`);
  }
  
  if (product.reviews) {
    console.log(`     ⭐ ${product.reviews.combinedAverageRating}/5 (${product.reviews.totalReviews} reviews)`);
  }

  if (product.duration?.fixedDurationInMinutes) {
    const hours = Math.floor(product.duration.fixedDurationInMinutes / 60);
    const mins = product.duration.fixedDurationInMinutes % 60;
    console.log(`     ⏱️  ${hours > 0 ? `${hours}h ` : ''}${mins}m`);
  }

  if (product.productUrl) {
    console.log(`     🔗 ${product.productUrl}`);
  }

  return {
    code: product.productCode,
    title: product.title,
    description: product.description,
    price: product.pricing?.summary?.fromPrice,
    currency: product.pricing?.summary?.currency,
    rating: product.reviews?.combinedAverageRating,
    reviewCount: product.reviews?.totalReviews,
    duration: product.duration,
    bookingUrl: product.productUrl,
    images: product.images,
  };
}

async function enrichAISuggestion(
  suggestion: string,
  destination: string,
  currency = 'USD'
) {
  console.log(`\n🤖 AI suggested: "${suggestion}" in ${destination}`);
  
  // Find matching product from curated list
  const destKey = destination.toLowerCase().replace(/\s+/g, '-');
  const products = CURATED_PRODUCTS[destKey] || [];
  
  const match = products.find(p => 
    p.keywords.some(kw => suggestion.toLowerCase().includes(kw))
  );

  if (!match) {
    console.log(`  ℹ️  No Viator product match found`);
    return null;
  }

  console.log(`  🎯 Matched to: ${match.title}`);
  
  // Fetch full details
  return await getProductDetails(match.code);
}

async function demonstrateWorkflow() {
  console.log('\n' + '═'.repeat(80));
  console.log('🎯 PRACTICAL VIATOR INTEGRATION WORKFLOW');
  console.log('═'.repeat(80));

  // Scenario: User creates a Paris itinerary
  console.log('\n📝 Scenario: User creates a 3-day Paris itinerary');
  
  // Step 1: Get destination ID (useful for future features)
  const parisId = await getDestinationId('Paris');

  // Step 2: AI generates suggestions, we enrich with Viator
  console.log('\n' + '─'.repeat(80));
  console.log('AI-generated suggestions → Viator enrichment:');
  console.log('─'.repeat(80));

  const aiSuggestions = [
    { day: 1, activity: 'Take a bus tour around the city', destination: 'Sydney' },
    { day: 2, activity: 'Visit the Eiffel Tower', destination: 'Paris' },
  ];

  for (const suggestion of aiSuggestions) {
    const enriched = await enrichAISuggestion(
      suggestion.activity,
      suggestion.destination
    );

    if (enriched) {
      console.log(`\n  ✨ Enriched itinerary item:`);
      console.log(`     Original: ${suggestion.activity}`);
      console.log(`     Enhanced: ${enriched.title}`);
      console.log(`     Rating: ⭐ ${enriched.rating}/5`);
      console.log(`     Price: ${enriched.currency} ${enriched.price}`);
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('✅ DEMONSTRATION COMPLETE!\n');
  console.log('💡 Key Takeaways:\n');
  console.log('1. Basic Access gives you product details by code');
  console.log('2. Create curated product mappings for popular destinations');
  console.log('3. Match AI suggestions to product keywords');
  console.log('4. Enrich itineraries with real pricing, reviews, booking links');
  console.log('5. Users get bookable tours instead of just suggestions!\n');
  console.log('🚀 Next: Add this to your viatorAI.ts file\n');
  console.log('═'.repeat(80) + '\n');
}

demonstrateWorkflow();
