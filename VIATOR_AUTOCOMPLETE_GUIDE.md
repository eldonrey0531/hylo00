# Viator Location Autocomplete Guide

## Overview

The Viator Partner API v2.0 provides **two complementary endpoints** for implementing location/place autocomplete functionality in your trip planning application.

## Available Endpoints

### 1. `/destinations` - Primary Autocomplete Source ✅

**Access Level:** Basic Access (Available with your API key)

**Purpose:** Returns all 3,374 destinations in the Viator catalog

**Best Use:** Primary autocomplete for cities, regions, countries, and other geographic areas

**Implementation Strategy:**
1. **Cache the full destination list** (call once, refresh weekly)
2. **Implement client-side fuzzy search** for instant autocomplete
3. **Return matching results** as user types

**Example Response:**
```json
{
  "destinations": [
    {
      "destinationId": 479,
      "name": "Paris",
      "type": "CITY",
      "parentDestinationId": 73,
      "lookupId": "8.73.479",
      "images": [...]
    },
    {
      "destinationId": 357,
      "name": "Sydney",
      "type": "CITY",
      ...
    }
  ]
}
```

**Destination Types:**
- `CITY` - Major cities (Paris, New York, Tokyo)
- `COUNTRY` - Countries (France, USA, Japan)
- `REGION` - Geographic regions (Tuscany, Scottish Highlands)
- `STATE` - US States/provinces
- `NATIONAL PARK` - Protected areas
- `ISLAND` - Islands (Hawaii, Bali)
- And more...

---

### 2. `/attractions/search` - Secondary Autocomplete ✅

**Access Level:** Basic Access (Available with your API key)

**Purpose:** Returns attractions/landmarks for a specific destination

**Best Use:** Secondary autocomplete showing famous landmarks and attractions

**Parameters:**
```typescript
{
  "destinationId": number,       // Required: from /destinations
  "sorting": {
    "sort": "REVIEW_AVG_RATING" | "DEFAULT" | "ALPHABETICAL"
  },
  "pagination": {
    "start": 1,                  // 1-based index
    "count": 30                  // Max 30 per request
  }
}
```

**Example Request:**
```bash
POST https://api.viator.com/partner/attractions/search
Headers:
  exp-api-key: YOUR_API_KEY
  Accept: application/json;version=2.0
  Content-Type: application/json;version=2.0

Body:
{
  "destinationId": 479,
  "sorting": { "sort": "REVIEW_AVG_RATING" },
  "pagination": { "start": 1, "count": 10 }
}
```

**Example Response:**
```json
{
  "totalCount": 218,
  "attractions": [
    {
      "attractionId": 18018,
      "name": "Musée du Luxembourg",
      "productCount": 4,
      "productCodes": ["110804P38", "110804P304", "110804P72"],
      "reviews": {
        "totalReviews": 8,
        "averageRating": 4.5
      },
      "freeAttraction": false,
      "address": {
        "street": "19 Rue de Vaugirard",
        "city": "Paris",
        "state": "Île-de-France",
        "postcode": "75006"
      },
      "center": {
        "latitude": 48.84908041,
        "longitude": 2.33415249
      },
      "images": [...]
    }
  ]
}
```

**What You Get:**
- ✅ Attraction name and ID
- ✅ Number of available tours/activities
- ✅ Product codes for booking
- ✅ Review ratings and counts
- ✅ Address and geolocation
- ✅ Free vs. paid admission
- ✅ Opening hours
- ✅ Images

---

## Recommended Autocomplete Implementation

### Architecture: Two-Tier Autocomplete

```
User Types "par"
     ↓
┌────────────────────────────────────────┐
│ 1. Search Cached Destinations          │
│    → "Paris" (CITY)                    │
│    → "Paraguay" (COUNTRY)              │
│    → "Paracas" (CITY)                  │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│ 2. Fetch Top Attractions (Optional)    │
│    For "Paris":                        │
│    → Eiffel Tower                      │
│    → Louvre Museum                     │
│    → Arc de Triomphe                   │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│ Display Combined Suggestions:          │
│   1. 📍 Paris (destination)            │
│   2. 🏛️ Eiffel Tower (Paris)          │
│   3. 🏛️ Louvre Museum (Paris)         │
│   4. 📍 Paraguay (destination)         │
└────────────────────────────────────────┘
```

### Implementation Steps

#### Step 1: Cache Destinations (Run Once on Startup)

```typescript
async function cacheDestinations() {
  const response = await fetch('https://api.viator.com/partner/destinations', {
    headers: {
      'exp-api-key': process.env.VIATOR_API_KEY,
      'Accept': 'application/json;version=2.0'
    }
  });
  
  const data = await response.json();
  
  // Store in Redis/Memory/Database
  await cache.set('viator:destinations', data.destinations);
  
  // Refresh weekly
  setTimeout(cacheDestinations, 7 * 24 * 60 * 60 * 1000);
}
```

#### Step 2: Implement Client-Side Fuzzy Search

```typescript
import Fuse from 'fuse.js';

const destinations = await cache.get('viator:destinations');

const fuse = new Fuse(destinations, {
  keys: ['name', 'type'],
  threshold: 0.3,
  minMatchCharLength: 2
});

function searchDestinations(query: string) {
  return fuse.search(query).slice(0, 5);
}
```

#### Step 3: Optional - Fetch Top Attractions

```typescript
async function getTopAttractions(destinationId: number, limit: number = 5) {
  const response = await fetch('https://api.viator.com/partner/attractions/search', {
    method: 'POST',
    headers: {
      'exp-api-key': process.env.VIATOR_API_KEY,
      'Accept': 'application/json;version=2.0',
      'Content-Type': 'application/json;version=2.0'
    },
    body: JSON.stringify({
      destinationId,
      sorting: { sort: 'REVIEW_AVG_RATING' },
      pagination: { start: 1, count: limit }
    })
  });
  
  return await response.json();
}
```

#### Step 4: API Endpoint for Autocomplete

```typescript
// API route: /api/autocomplete/locations
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query || query.length < 2) {
    return Response.json({ suggestions: [] });
  }
  
  // Search destinations
  const destinations = searchDestinations(query);
  
  // Optionally fetch attractions for top result
  const suggestions = [];
  
  for (const dest of destinations) {
    suggestions.push({
      type: 'destination',
      id: dest.item.destinationId,
      name: dest.item.name,
      category: dest.item.type
    });
    
    // Fetch top 3 attractions for first result
    if (suggestions.length === 1) {
      const attractions = await getTopAttractions(dest.item.destinationId, 3);
      
      for (const attr of attractions.attractions) {
        suggestions.push({
          type: 'attraction',
          id: attr.attractionId,
          name: attr.name,
          parentDestination: dest.item.name,
          productCount: attr.productCount
        });
      }
    }
  }
  
  return Response.json({ suggestions });
}
```

---

## Performance Considerations

### Caching Strategy

| Endpoint | Cache Duration | Cache Location |
|----------|---------------|----------------|
| `/destinations` | 1 week | Redis/Memory |
| `/attractions/search` | 1 day | Redis (per destination) |

### Rate Limiting

- **Destinations:** Called once on startup, weekly refresh
- **Attractions:** Called on-demand, cache aggressively
- **Recommended:** Pre-cache attractions for top 50 destinations

### Optimization Tips

1. **Pre-fetch Common Destinations**
   ```typescript
   const TOP_DESTINATIONS = [479, 357, 687, 334]; // Paris, Sydney, NYC, Tokyo
   
   async function preCacheAttractions() {
     for (const destId of TOP_DESTINATIONS) {
       await getTopAttractions(destId, 10);
     }
   }
   ```

2. **Client-Side Filtering**
   - Keep all 3,374 destinations in memory (~500KB)
   - Use Fuse.js or similar for instant fuzzy search
   - No API calls needed for basic autocomplete

3. **Debounce User Input**
   ```typescript
   const debouncedSearch = debounce(async (query) => {
     const results = await fetch(`/api/autocomplete/locations?q=${query}`);
     // Update UI
   }, 300);
   ```

---

## Test Results

### Paris (ID: 479)
- **Total Attractions:** 218
- **Top Attractions:**
  1. Musée du Luxembourg (4 products)
  2. Museum of Illusions Paris (3 products)
  3. Paris Aquarium (2 products)
  4. Parc des Princes (1 product)

### Sydney (ID: 357)
- **Total Attractions:** 108
- **Top Attractions:**
  1. Justice and Police Museum (2 products)
  2. Museum of Sydney (5 products)
  3. Australian Museum (3 products)

---

## Example UI Component

```tsx
import { useState, useEffect } from 'react';

function LocationAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  
  useEffect(() => {
    if (query.length < 2) return;
    
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/autocomplete/locations?q=${query}`);
      const data = await res.json();
      setSuggestions(data.suggestions);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search destinations..."
      />
      
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              {item.type === 'destination' ? '📍' : '🏛️'} {item.name}
              {item.parentDestination && (
                <span className="subtitle"> in {item.parentDestination}</span>
              )}
              {item.productCount && (
                <span className="count"> ({item.productCount} activities)</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Summary

✅ **Yes, Viator has autocomplete functionality!**

- Use `/destinations` for primary location search (3,374 destinations)
- Use `/attractions/search` for landmark/attraction suggestions
- Both endpoints available in your Basic Access tier
- Implement client-side fuzzy search for instant results
- Cache aggressively to minimize API calls

See `scripts/test-attractions-search.ts` for a working example!
