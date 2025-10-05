# How to Use Viator API Endpoints (Basic Access Tier)

## Summary

With your Basic Access tier, here's what actually works:

| Endpoint | Method | Works? | Use Case |
|----------|--------|--------|----------|
| `/destinations` | GET | ✅ Yes | Get list of 3,374+ destinations with IDs |
| `/products/{code}` | GET | ✅ Yes | Get full details for a specific tour/activity |
| `/search/freetext` | GET | ❌ No | Returns 500 error (needs higher tier) |
| `/products/search` | POST | ❌ No | Not available in Basic Access |

---

## 1. Using `/destinations`

### Purpose
Convert city names to destination IDs (useful for future features)

### Example
```typescript
const response = await fetch('https://api.viator.com/partner/destinations', {
  method: 'GET',
  headers: {
    'exp-api-key': VIATOR_API_KEY,
    'Accept': 'application/json;version=2.0',
    'Accept-Language': 'en-US',
  },
});

const data = await response.json();

// Find Paris
const paris = data.destinations.find(d => 
  d.name === 'Paris' && d.type === 'CITY'
);
// Result: { destinationId: 479, name: 'Paris', type: 'CITY', ... }
```

### Common Destination IDs
- **Paris:** 479
- **Tokyo:** 334
- **New York City:** 687
- **Sydney:** 357
- **London:** 364

### Data Returned
```json
{
  "destinations": [
    {
      "destinationId": 479,
      "name": "Paris",
      "type": "CITY",
      "parentDestinationId": 148,
      "lookupId": "9.148.479",
      "destinationUrl": "https://www.viator.com/Paris/d479-ttd?..."
    }
  ]
}
```

---

## 2. Using `/products/{product-code}`

### Purpose
Get complete details for a specific tour/activity (pricing, reviews, images, booking URL)

### Example
```typescript
const productCode = '5010SYDNEY'; // Big Bus Sydney tour

const response = await fetch(
  `https://api.viator.com/partner/products/${productCode}`,
  {
    method: 'GET',
    headers: {
      'exp-api-key': VIATOR_API_KEY,
      'Accept': 'application/json;version=2.0',
      'Accept-Language': 'en-US',
    },
  }
);

const product = await response.json();
```

### Data Returned
```json
{
  "productCode": "5010SYDNEY",
  "title": "Big Bus Sydney and Bondi Hop-on Hop-off Tour",
  "description": "See Sydney's famous sights...",
  "pricing": {
    "summary": {
      "fromPrice": 49.00,
      "currency": "USD"
    }
  },
  "reviews": {
    "combinedAverageRating": 3.97,
    "totalReviews": 2581
  },
  "duration": {
    "fixedDurationInMinutes": 120
  },
  "images": [
    {
      "isCover": true,
      "variants": [
        { "width": 720, "url": "https://..." }
      ]
    }
  ],
  "productUrl": "https://www.viator.com/tours/...",
  "inclusions": [
    { "description": "Audio guide in multiple languages" }
  ]
}
```

### Useful Product Fields
- `title` - Tour name
- `description` - Full description
- `pricing.summary.fromPrice` - Starting price
- `pricing.summary.currency` - Currency code
- `reviews.combinedAverageRating` - Average rating (out of 5)
- `reviews.totalReviews` - Number of reviews
- `duration.fixedDurationInMinutes` - Tour length
- `productUrl` - Booking link
- `images[].variants[]` - Tour images in multiple sizes
- `inclusions[]` - What's included
- `exclusions[]` - What's not included

---

## 3. `/search/freetext` - NOT AVAILABLE ❌

This endpoint returns a 500 error with Basic Access tier. You need to upgrade to Standard or Full Access to use search functionality.

---

## Practical Integration Strategy

Since you can't search by keywords, here's the recommended approach:

### Step 1: Create a Curated Product Database

Build a mapping of popular tours for each destination:

```typescript
// src/lib/viator/productCatalog.ts
export const VIATOR_CATALOG = {
  paris: [
    {
      code: '5010PARIS1',
      title: 'Eiffel Tower Priority Access',
      keywords: ['eiffel', 'tower', 'landmark'],
      category: 'attraction',
    },
    {
      code: '5010PARIS2',
      title: 'Louvre Museum Guided Tour',
      keywords: ['louvre', 'museum', 'art', 'mona lisa'],
      category: 'museum',
    },
  ],
  sydney: [
    {
      code: '5010SYDNEY',
      title: 'Big Bus Sydney Hop-on Hop-off',
      keywords: ['bus', 'tour', 'sightseeing', 'hop-on'],
      category: 'tour',
    },
  ],
  // ... more cities
};
```

### Step 2: Match AI Suggestions to Products

```typescript
export function findMatchingProduct(
  aiSuggestion: string,
  destination: string
): string | null {
  const destKey = destination.toLowerCase();
  const products = VIATOR_CATALOG[destKey] || [];
  
  // Find product with matching keywords
  const match = products.find(p =>
    p.keywords.some(keyword =>
      aiSuggestion.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  return match?.code || null;
}
```

### Step 3: Enrich Itinerary with Viator Data

```typescript
export async function enrichItineraryItem(
  aiSuggestion: string,
  destination: string
) {
  // Find matching product code
  const productCode = findMatchingProduct(aiSuggestion, destination);
  
  if (!productCode) {
    return { original: aiSuggestion, enriched: null };
  }
  
  // Fetch product details
  const response = await fetch(
    `https://api.viator.com/partner/products/${productCode}`,
    {
      headers: {
        'exp-api-key': process.env.VIATOR_API_KEY!,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
      },
    }
  );
  
  if (!response.ok) {
    return { original: aiSuggestion, enriched: null };
  }
  
  const product = await response.json();
  
  return {
    original: aiSuggestion,
    enriched: {
      title: product.title,
      price: product.pricing?.summary?.fromPrice,
      currency: product.pricing?.summary?.currency,
      rating: product.reviews?.combinedAverageRating,
      reviewCount: product.reviews?.totalReviews,
      bookingUrl: product.productUrl,
      image: product.images?.[0]?.variants?.find(v => v.width === 720)?.url,
    },
  };
}
```

### Step 4: Use in Your Itinerary Workflow

```typescript
// When AI generates itinerary
const aiItinerary = await generateGrokItineraryDraft(tripFormData);

// Enrich each day's activities
for (const day of aiItinerary.days) {
  for (const activity of day.activities) {
    const enriched = await enrichItineraryItem(
      activity.title,
      tripFormData.destination
    );
    
    if (enriched.enriched) {
      activity.viatorData = enriched.enriched;
    }
  }
}

return aiItinerary;
```

---

## How to Find Product Codes

Since you can't search via API, here are ways to build your catalog:

### Method 1: Use Viator's Website
1. Go to https://www.viator.com
2. Search for activities in your target city
3. Look at the URL: `viator.com/tours/Paris/Tour-Name/d479-PRODUCTCODE`
4. Extract the product code

### Method 2: Contact Viator
- Request a list of top products for popular destinations
- Ask for product codes for specific categories

### Method 3: Start Small
- Begin with 5-10 top tours per major destination
- Expand as you test and validate

---

## Testing Your Integration

Run the demo script to see it in action:

```bash
npx tsx scripts/viator-practical-demo.ts
```

This shows:
1. ✅ Destinations lookup (Paris ID: 479)
2. ✅ Product details fetch (5010SYDNEY works!)
3. ✅ Matching AI suggestions to products
4. ✅ Enriching itinerary with real data

---

## Next Steps

1. **Immediate:** Create a small curated product catalog for your top destinations
2. **Week 1:** Integrate `/products/{code}` into your viatorAI.ts
3. **Month 1:** Build up product catalog to 50-100 popular tours
4. **Future:** Consider upgrading to Standard/Full Access for search capabilities

---

## API Access Tiers Comparison

| Feature | Basic Access | Standard Access | Full Access |
|---------|--------------|-----------------|-------------|
| `/destinations` | ✅ | ✅ | ✅ |
| `/products/{code}` | ✅ | ✅ | ✅ |
| `/search/freetext` | ❌ | ✅ | ✅ |
| `/products/search` | ❌ | ✅ | ✅ |
| Availability check | ❌ | ✅ | ✅ |
| Make bookings | ❌ | ❌ | ✅ |

**Recommendation:** Start with Basic Access + curated catalog. Upgrade when you need real-time search.
