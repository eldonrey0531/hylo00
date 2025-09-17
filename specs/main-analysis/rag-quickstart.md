# RAG Multi-Agent System Quickstart Guide

**Date**: September 17, 2025  
**Context**: Session-aware RAG travel planning system  
**Status**: Phase 1 Implementation Ready

## Overview

This quickstart guide provides step-by-step instructions for setting up, testing, and deploying the RAG (Retrieval-Augmented Generation) multi-agent travel planning system within the Hylo Travel AI architecture.

## Prerequisites

### Required Services

- **Qdrant Cloud**: Vector database for semantic search
- **Supabase**: PostgreSQL database with real-time capabilities
- **Upstash Redis**: Fast session caching layer
- **Hugging Face API**: Embedding model access
- **GROQ API**: Browser search capabilities
- **Vercel**: Edge runtime deployment platform

### Development Environment

- Node.js 18+ with TypeScript 5.x
- Docker and Docker Compose for local services
- Git with branch management
- VS Code with recommended extensions

### API Keys Required

```bash
# Environment variables needed
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-key

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key

UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

HUGGINGFACE_API_KEY=hf_your-huggingface-key

GROQ_API_KEY=gsk_your-groq-key
GEMINI_API_KEY=your-gemini-key
CEREBRAS_API_KEY=your-cerebras-key

LANGSMITH_API_KEY=your-langsmith-key
LANGSMITH_PROJECT_NAME=hylo-rag-system
```

## Quick Setup (15 minutes)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/hylo.git
cd hylo

# Install dependencies
npm install

# Install additional RAG dependencies
npm install @qdrant/js-client-rest @supabase/supabase-js @upstash/redis langsmith
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your API keys
# Use the API keys list above as reference
```

### 3. Database Setup

```bash
# Start local development services
docker-compose up -d postgres redis

# Run Supabase migrations
npm run db:migrate

# Seed test data
npm run db:seed:rag
```

### 4. Vector Database Setup

```bash
# Initialize Qdrant collections
npm run qdrant:setup

# Create test vectors for development
npm run qdrant:seed
```

### 5. Verify Installation

```bash
# Run health checks
npm run health:check

# Run RAG system tests
npm run test:rag:quick

# Start development server
npm run dev
```

## Core Functionality Test (5 minutes)

### Test the Complete RAG Pipeline

```bash
# Terminal 1: Start the development server
npm run dev

# Terminal 2: Test the RAG endpoints
curl -X POST http://localhost:3000/api/rag/save-form \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "123e4567-e89b-12d3-a456-426614174000",
    "form_id": "TripDetailsForm",
    "form_data": {
      "destination": "Tokyo",
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-10-07T00:00:00.000Z",
      "groupSize": 2
    }
  }'

# Wait for vectorization (check status)
curl "http://localhost:3000/api/rag/session-status?session_id=123e4567-e89b-12d3-a456-426614174000"

# Generate itinerary
curl -X POST http://localhost:3000/api/rag/generate-itinerary \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "123e4567-e89b-12d3-a456-426614174000",
    "operation": "generate_itinerary",
    "request_id": "456e7890-e89b-12d3-a456-426614174001",
    "options": {
      "include_web_search": true,
      "include_citations": true
    }
  }'
```

### Expected Response Structure

```json
{
  "request_id": "456e7890-e89b-12d3-a456-426614174001",
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2025-09-17T12:00:00.000Z",
  "data": {
    "type": "itinerary",
    "itinerary": [
      {
        "date": "2025-10-01",
        "location": "Tokyo",
        "activities": [
          {
            "id": "activity-1",
            "name": "Senso-ji Temple Visit",
            "description": "Historic Buddhist temple in Asakusa",
            "location": {
              "name": "Senso-ji Temple",
              "city": "Tokyo",
              "country": "Japan"
            },
            "time_slot": {
              "start_time": "09:00",
              "end_time": "11:00",
              "flexibility": "flexible"
            },
            "duration_minutes": 120,
            "category": "culture",
            "accessibility_friendly": true
          }
        ]
      }
    ],
    "summary": "A 7-day cultural journey through Tokyo...",
    "actions": [
      {
        "type": "booking",
        "label": "Book Temple Tour",
        "url": "https://example.com/book-temple-tour"
      }
    ]
  },
  "processing_time_ms": 4500,
  "tokens_used": {
    "provider": "gemini",
    "operation": "generation",
    "total_tokens": 2500,
    "cost_usd": 0.015
  },
  "citations": [
    {
      "id": "citation-1",
      "source_type": "web_search",
      "url": "https://www.japan-guide.com/e/e3001.html",
      "title": "Senso-ji Temple - Tokyo's Oldest Temple",
      "snippet": "Senso-ji is Tokyo's oldest temple...",
      "accessed_at": "2025-09-17T12:00:00.000Z"
    }
  ],
  "confidence_score": 0.89
}
```

## Development Workflow

### 1. Form Data Submission Flow

```typescript
// Frontend: Submit form data
const formData = {
  destination: 'Barcelona',
  startDate: '2025-10-15T00:00:00.000Z',
  endDate: '2025-10-18T00:00:00.000Z',
  groupSize: 2,
  interests: [
    { category: 'food', intensity: 'high' },
    { category: 'culture', intensity: 'medium' },
  ],
};

const response = await fetch('/api/rag/save-form', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: sessionId,
    form_id: 'TripDetailsForm',
    form_data: formData,
  }),
});

const result = await response.json();
console.log('Form saved:', result.success);
console.log('Vectorization status:', result.vectorization_status);
```

### 2. Session Monitoring

```typescript
// Monitor session processing status
const checkStatus = async (sessionId: string) => {
  const response = await fetch(`/api/rag/session-status?session_id=${sessionId}`);
  const status = await response.json();

  return {
    isReady: status.vectorization_status === 'completed',
    formCount: status.form_count,
    lastActivity: status.last_activity_at,
  };
};

// Poll until vectorization is complete
const waitForVectorization = async (sessionId: string) => {
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max wait

  while (attempts < maxAttempts) {
    const status = await checkStatus(sessionId);
    if (status.isReady) return true;

    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error('Vectorization timeout');
};
```

### 3. Itinerary Generation

```typescript
// Generate personalized itinerary
const generateItinerary = async (sessionId: string, options = {}) => {
  const request = {
    session_id: sessionId,
    operation: 'generate_itinerary',
    request_id: crypto.randomUUID(),
    options: {
      include_web_search: true,
      include_citations: true,
      response_format: 'structured',
      max_results: 5,
      ...options,
    },
  };

  const response = await fetch('/api/rag/generate-itinerary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Generation failed: ${error.message}`);
  }

  return await response.json();
};

// Usage example
try {
  await waitForVectorization(sessionId);
  const itinerary = await generateItinerary(sessionId, {
    complexity_override: 'medium',
    preferred_provider: 'gemini',
  });

  console.log('Generated itinerary:', itinerary.data.itinerary);
  console.log('Processing time:', itinerary.processing_time_ms, 'ms');
  console.log('Cost:', itinerary.tokens_used.cost_usd, 'USD');
} catch (error) {
  console.error('Itinerary generation failed:', error);
}
```

### 4. Follow-up Questions

```typescript
// Ask contextual questions about the itinerary
const askQuestion = async (sessionId: string, question: string) => {
  const request = {
    session_id: sessionId,
    question: question,
    request_id: crypto.randomUUID(),
    options: {
      include_context: true,
      max_context_items: 5,
    },
  };

  const response = await fetch('/api/rag/ask-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  return await response.json();
};

// Example usage
const qa = await askQuestion(sessionId, 'What are some vegetarian restaurants in the area?');
console.log('Answer:', qa.data.answer);
console.log('Related suggestions:', qa.data.related_suggestions);
console.log('Context used:', qa.data.context_used);
```

## Frontend Integration

### React Hook for RAG Operations

```typescript
import { useState, useCallback } from 'react';

interface UseRAGOptions {
  sessionId: string;
  onError?: (error: Error) => void;
}

export const useRAG = ({ sessionId, onError }: UseRAGOptions) => {
  const [loading, setLoading] = useState(false);
  const [sessionStatus, setSessionStatus] = useState(null);

  const saveForm = useCallback(
    async (formId: string, formData: any) => {
      setLoading(true);
      try {
        const response = await fetch('/api/rag/save-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            form_id: formId,
            form_data: formData,
          }),
        });

        if (!response.ok) throw new Error('Failed to save form');

        const result = await response.json();
        return result;
      } catch (error) {
        onError?.(error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [sessionId, onError]
  );

  const generateItinerary = useCallback(
    async (options = {}) => {
      setLoading(true);
      try {
        const response = await fetch('/api/rag/generate-itinerary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            operation: 'generate_itinerary',
            request_id: crypto.randomUUID(),
            options,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to generate itinerary');
        }

        return await response.json();
      } catch (error) {
        onError?.(error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [sessionId, onError]
  );

  const askQuestion = useCallback(
    async (question: string) => {
      setLoading(true);
      try {
        const response = await fetch('/api/rag/ask-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            question,
            request_id: crypto.randomUUID(),
          }),
        });

        if (!response.ok) throw new Error('Failed to ask question');

        return await response.json();
      } catch (error) {
        onError?.(error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [sessionId, onError]
  );

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/rag/session-status?session_id=${sessionId}`);

      if (!response.ok) throw new Error('Failed to check status');

      const status = await response.json();
      setSessionStatus(status);
      return status;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }, [sessionId, onError]);

  return {
    loading,
    sessionStatus,
    saveForm,
    generateItinerary,
    askQuestion,
    checkStatus,
  };
};
```

### Example Component Integration

```typescript
import React, { useState, useEffect } from 'react';
import { useRAG } from './hooks/useRAG';

export const TravelPlanningFlow: React.FC = () => {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const { loading, sessionStatus, saveForm, generateItinerary, checkStatus } = useRAG({
    sessionId,
    onError: (err) => setError(err.message),
  });

  // Check session status periodically
  useEffect(() => {
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleFormSubmit = async (formData: any) => {
    try {
      await saveForm('TripDetailsForm', formData);

      // Wait for vectorization then generate itinerary
      setTimeout(async () => {
        const result = await generateItinerary({
          include_web_search: true,
          include_citations: true,
        });
        setItinerary(result);
      }, 3000);
    } catch (err) {
      console.error('Form submission failed:', err);
    }
  };

  const isReady = sessionStatus?.vectorization_status === 'completed';

  return (
    <div className="travel-planning-flow">
      <h1>Plan Your Trip</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="session-status">
        Session ID: {sessionId}
        <br />
        Forms Submitted: {sessionStatus?.form_count || 0}
        <br />
        Status: {sessionStatus?.vectorization_status || 'pending'}
        <br />
        Ready for Generation: {isReady ? '✅' : '⏳'}
      </div>

      {/* Form components */}
      <TripDetailsForm onSubmit={handleFormSubmit} />

      {/* Loading states */}
      {loading && <div className="loading">Processing...</div>}

      {/* Generated itinerary */}
      {itinerary && (
        <div className="itinerary-display">
          <h2>Your Personalized Itinerary</h2>
          <ItineraryDisplay data={itinerary.data} />

          <div className="metadata">
            <p>Generated in {itinerary.processing_time_ms}ms</p>
            <p>Cost: ${itinerary.tokens_used.cost_usd}</p>
            <p>Confidence: {Math.round(itinerary.confidence_score * 100)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};
```

## Debugging and Monitoring

### 1. LangSmith Observability

Access your LangSmith dashboard to monitor:

- Request traces and performance
- Provider routing decisions
- Token usage and costs
- Error rates and patterns

```typescript
// View traces in development
console.log('LangSmith Project:', process.env.LANGSMITH_PROJECT_NAME);
console.log('Trace URL: https://smith.langchain.com/projects/{project-id}/traces');
```

### 2. Health Monitoring

```bash
# Check overall system health
curl http://localhost:3000/api/rag/health

# Expected response
{
  "overall_status": "healthy",
  "timestamp": "2025-09-17T12:00:00.000Z",
  "components": [
    {
      "name": "qdrant",
      "status": "healthy",
      "response_time_ms": 45
    },
    {
      "name": "supabase",
      "status": "healthy",
      "response_time_ms": 23
    }
  ],
  "performance_metrics": {
    "p95_response_time_ms": 250,
    "active_sessions": 12,
    "error_rate_5m": 0.001
  }
}
```

### 3. Common Debugging Commands

```bash
# Check vector database status
npm run qdrant:status

# View session data
npm run debug:session -- --session-id=your-session-id

# Test provider connectivity
npm run test:providers

# Check vector search performance
npm run benchmark:vectors

# Validate schema compliance
npm run validate:contracts
```

## Performance Optimization

### 1. Vector Search Optimization

```typescript
// Optimize vector queries for better performance
const optimizedSearch = async (sessionId: string, query: string) => {
  // Use appropriate similarity threshold
  const threshold = query.length > 100 ? 0.75 : 0.8;

  // Limit results based on query complexity
  const maxResults = query.includes('detailed') ? 10 : 5;

  return await vectorService.searchVectors(sessionId, query, maxResults, {
    similarity_threshold: threshold,
    include_metadata: true,
  });
};
```

### 2. Caching Strategy

```typescript
// Implement caching for expensive operations
const cachedWebSearch = async (query: string, options: any) => {
  const cacheKey = `web-search:${hashQuery(query)}`;

  // Check cache first (1 hour TTL for web results)
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Perform search and cache results
  const results = await webSearchService.search(query, options);
  await redis.setex(cacheKey, 3600, JSON.stringify(results));

  return results;
};
```

### 3. Provider Load Balancing

```typescript
// Balance load across healthy providers
const selectBalancedProvider = async (complexity: ComplexityScore) => {
  const healthyProviders = await getHealthyProviders();
  const suitable = healthyProviders.filter((p) => canHandleComplexity(p, complexity));

  // Round-robin among suitable providers
  return suitable[requestCount++ % suitable.length];
};
```

## Deployment

### Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Vector collections created and indexed
- [ ] Health checks passing
- [ ] Rate limiting configured
- [ ] Monitoring and alerting set up
- [ ] Backup and recovery procedures documented
- [ ] Security audit completed

### Vercel Deployment

```bash
# Deploy to Vercel
vercel --prod

# Verify deployment
curl https://your-app.vercel.app/api/rag/health
```

### Environment-Specific Configuration

```javascript
// vercel.json
{
  "functions": {
    "api/rag/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "LANGSMITH_TRACING": "true",
    "NODE_ENV": "production"
  }
}
```

## Support and Troubleshooting

### Common Issues

1. **Vectorization Timeout**: Check Qdrant connectivity and API limits
2. **Budget Exceeded**: Review token usage patterns and optimize queries
3. **Provider Failures**: Verify API keys and health status
4. **Session Expiration**: Check TTL settings and cleanup jobs

### Getting Help

- **Documentation**: Check the data model and API specifications
- **Logs**: Review LangSmith traces for detailed request flows
- **Health Checks**: Use `/api/rag/health` for system status
- **Support**: Contact the team with specific error messages and trace IDs

This quickstart guide provides everything needed to implement, test, and deploy the RAG multi-agent system successfully while maintaining constitutional compliance and optimal performance.
