# Viator API Integration Guide for Your Itinerary App

## ✅ What Works with Basic Access Tier

Based on testing, here's what you can actually use:

### 1. ✅ `/destinations` - Get list of all travel destinations

**Use Case:** Convert city names to destination IDs

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
const paris = data.destinations.find(d => d.name === 'Paris' && d.type === 'CITY');
// Paris ID: 479
// Tokyo ID: 334
// New York ID: 687
```

**Result:** 3,374 destinations available globally

---

### 2. ✅ `/products/{product-code}` - Get detailed product information

**Use Case:** Fetch complete details for a specific tour/activity

```typescript
const productCode = '5010SYDNEY'; // Example: Big Bus Sydney
const response = await fetch(`https://api.viator.com/partner/products/${productCode}`, {
  method: 'GET',
  headers: {
    'exp-api-key': VIATOR_API_KEY,
    'Accept': 'application/json;version=2.0',
    'Accept-Language': 'en-US',
  },
});

const product = await response.json();
```

**Returns:**
- Product title, description
- Pricing (from price, currency)
- Reviews (rating, count)
- Duration
- Images (multiple sizes)
- Inclusions/exclusions
- Booking URL
- Itinerary details

---

### 3. ❌ `/search/freetext` - NOT WORKING (Returns 500 error)

This endpoint appears to require a higher access tier or is currently unavailable.

---

## 🎯 Recommended Integration Strategy

Since you can't search by keyword with Basic Access, here's the practical approach:

### Option 1: Use Product Codes (Recommended)

**How it works:**
1. Create a curated list of popular product codes for major destinations
2. When AI suggests an activity, map it to pre-selected product codes
3. Fetch details with `/products/{product-code}`

**Example Product Code List:**
```typescript
const CURATED_PRODUCTS = {
  paris: {
    'eiffel-tower': '2050TOWER',
    'louvre': '2050LOUVRE',
    'versailles': '2050VERS',
  },
  tokyo: {
    'mt-fuji': '2050FUJI',
    'tokyo-tour': '2050TOKYO',
  },
  // ... more cities
};
```

### Option 2: External Product Discovery

**How it works:**
1. Use Viator's public website to find relevant product codes
2. Build your own product database/cache
3. Use `/products/{code}` to keep data fresh

**Benefits:**
- Full control over which tours you recommend
- Better quality curation
- No dependency on search API

### Option 3: Request Higher Access Tier

Contact Viator to upgrade from Basic Access to Standard or Full Access, which includes:
- `/products/search` (POST with filters)
- `/search/freetext` (keyword search)
- More endpoints for availability, booking, etc.

---

## 📝 Implementation Plan for Your App

### Phase 1: Manual Curation (Immediate)

1. **Create product mapping file:**
```typescript
// src/lib/viator/products.ts
export const VIATOR_PRODUCTS = {
  paris: [
    { code: '2050TOWER', category: 'landmark', keywords: ['eiffel', 'tower'] },
    { code: '2050LOUVRE', category: 'museum', keywords: ['louvre', 'art'] },
  ],
  tokyo: [
    { code: '2050FUJI', category: 'nature', keywords: ['mt fuji', 'mountain'] },
  ],
};
```

2. **Update viatorAI.ts:**
```typescript
export async function enrichItineraryWithViator(
  aiSuggestion: string,
  destination: string,
  currency = 'USD'
) {
  // Match AI suggestion to product
  const products = VIATOR_PRODUCTS[destination.toLowerCase()] || [];
  const match = products.find(p => 
    p.keywords.some(kw => aiSuggestion.toLowerCase().includes(kw))
  );

  if (!match) return null;

  // Fetch product details
  const response = await fetch(
    `https://api.viator.com/partner/products/${match.code}`,
    {
      headers: {
        'exp-api-key': process.env.VIATOR_API_KEY!,
        'Accept': 'application/json;version=2.0',
        'Accept-Language': 'en-US',
      },
    }
  );

  if (!response.ok) return null;

  const product = await response.json();
  
  return {
    title: product.title,
    description: product.description,
    price: product.pricing?.summary?.fromPrice,
    currency: product.pricing?.summary?.currency,
    rating: product.reviews?.combinedAverageRating,
    reviewCount: product.reviews?.totalReviews,
    duration: product.duration,
    bookingUrl: product.productUrl,
    imageUrl: product.images?.[0]?.variants?.find(v => v.width === 720)?.url,
  };
}
```

### Phase 2: Database Integration (Future)

1. Build a database of Viator products
2. Sync periodically using `/products/modified-since`
3. Use vector search to match AI suggestions to products

### Phase 3: Upgrade API Access (Future)

Request Full Access tier for:
- Real-time search
- Availability checking
- Booking capabilities

---

## 🚀 Quick Start

Run this to see working example:

```bash
npx tsx scripts/test-viator-direct.ts
```

This demonstrates:
- ✅ Destinations list works
- ✅ Product details work
- ✅ Authentication is correct

---

## 📊 Summary

**What you CAN do with Basic Access:**
- ✅ Get product details by code
- ✅ Get list of destinations
- ✅ Enrich itineraries with real tour data

**What you CAN'T do (requires upgrade):**
- ❌ Search by keywords
- ❌ Search by destination with filters
- ❌ Check availability
- ❌ Make bookings

**Best approach for now:**
- Create curated product list for popular destinations
- Use product codes to fetch details
- Enhance AI suggestions with real Viator data
- Consider API upgrade when you need search functionality
