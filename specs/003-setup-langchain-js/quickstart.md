# Quickstart: LangChain.js Multi-LLM Routing Infrastructure

**Feature**: 003-setup-langchain-js  
**Date**: September 17, 2025  
**Purpose**: Validate feature implementation through executable scenarios

## Prerequisites

Before running these scenarios, ensure:

1. **Environment Setup**:

   ```bash
   # Install dependencies
   npm install

   # Set up environment variables
   cp .env.example .env.local
   ```

2. **Required Environment Variables**:

   ```env
   # LLM Provider API Keys
   CEREBRAS_API_KEY=your_cerebras_key
   GOOGLE_API_KEY=your_gemini_key
   GROQ_API_KEY=your_groq_key

   # LangSmith Tracing (optional but recommended)
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
   LANGCHAIN_API_KEY=your_langsmith_key
   LANGCHAIN_PROJECT=hylo-llm-routing

   # Vercel Edge Function Configuration
   VERCEL_ENV=development
   ```

3. **Development Server**:

   ```bash
   # Start development server
   npm run dev

   # Verify Edge Functions are running
   curl http://localhost:3000/api/health
   ```

## Validation Scenarios

### Scenario 1: Simple Query Routing (Fast Provider)

**Objective**: Verify simple queries route to Groq for speed

**Test Steps**:

1. Open browser to `http://localhost:3000`
2. Submit query: "Best restaurants in Tokyo"
3. Observe routing decision in developer tools Network tab

**Expected Behavior**:

- Response headers include `X-Provider-Used: groq`
- Response headers include `X-Complexity-Score: <5`
- Response time < 3 seconds
- Itinerary contains relevant Tokyo restaurant recommendations

**Validation Command**:

```bash
curl -X POST http://localhost:3000/api/llm/route \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Best restaurants in Tokyo",
    "context": {
      "userId": "quickstart_user",
      "sessionId": "scenario_1"
    }
  }' \
  -v | jq '.metadata.providerId'
```

**Success Criteria**:

- Returns `"groq"`
- Complexity score between 1-4
- Response contains restaurant recommendations

---

### Scenario 2: Complex Query Routing (Capable Provider)

**Objective**: Verify complex queries route to Cerebras for capability

**Test Steps**:

1. Submit complex query through UI or API
2. Monitor provider selection and fallback chain
3. Verify comprehensive response quality

**Test Query**:

```
Plan a 14-day multi-generational family trip to Japan for 6 people including elderly grandparents and young children. Budget is $15,000 total. Must include accessible accommodations, cultural experiences suitable for all ages, transportation between Tokyo, Kyoto, and Osaka, special dietary requirements for vegetarians, and recommendations for both traditional and modern attractions. Consider seasonal factors for April travel.
```

**Expected Behavior**:

- Response headers include `X-Provider-Used: cerebras`
- Response headers include `X-Complexity-Score: >7`
- Response includes detailed daily itineraries
- Accessibility considerations mentioned
- Transportation details provided

**Validation Command**:

```bash
curl -X POST http://localhost:3000/api/llm/route \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Plan a 14-day multi-generational family trip to Japan for 6 people including elderly grandparents and young children. Budget is $15,000 total. Must include accessible accommodations, cultural experiences suitable for all ages, transportation between Tokyo, Kyoto, and Osaka, special dietary requirements for vegetarians, and recommendations for both traditional and modern attractions. Consider seasonal factors for April travel.",
    "context": {
      "userId": "quickstart_user",
      "sessionId": "scenario_2",
      "preferences": ["cultural experiences", "family-friendly", "accessibility"],
      "constraints": {
        "budget": {"min": 12000, "max": 15000, "currency": "USD"},
        "dates": {"start": "2025-04-01", "end": "2025-04-14"},
        "travelers": 6
      }
    }
  }' \
  -v | jq '.metadata'
```

**Success Criteria**:

- Provider ID is `"cerebras"`
- Complexity score ≥ 7
- Response length > 2000 characters
- Contains accessibility mentions

---

### Scenario 3: Provider Fallback Chain

**Objective**: Verify automatic fallback when primary provider fails

**Test Steps**:

1. Simulate Cerebras provider failure (mock/test mode)
2. Submit complex query that would normally route to Cerebras
3. Verify automatic fallback to Gemini

**Expected Behavior**:

- Initial attempt routes to Cerebras
- Automatic fallback to Gemini on failure
- Response headers include `X-Fallback-Chain: cerebras->gemini`
- Final response still meets quality requirements

**Validation Command**:

```bash
# This test requires provider failure simulation
curl -X POST http://localhost:3000/api/llm/route \
  -H "Content-Type: application/json" \
  -H "X-Test-Simulate-Failure: cerebras" \
  -d '{
    "query": "Plan a complex 10-day European tour",
    "context": {
      "userId": "quickstart_user",
      "sessionId": "scenario_3"
    }
  }' \
  -v | jq '.metadata.fallbackChain'
```

**Success Criteria**:

- Fallback chain shows `["cerebras", "gemini"]`
- Final provider is `"gemini"`
- Response quality maintained despite fallback

---

### Scenario 4: API Key Rotation

**Objective**: Verify seamless API key rotation under quota pressure

**Test Steps**:

1. Configure multiple API keys for one provider
2. Submit multiple requests to approach quota limit
3. Verify automatic key rotation occurs
4. Confirm no service interruption

**Expected Behavior**:

- Initial requests use first API key
- Automatic rotation when quota threshold reached (80%)
- Seamless transition between keys
- No failed requests due to quota exhaustion

**Validation Command**:

```bash
# Submit 20 requests rapidly to trigger rotation
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/llm/route \
    -H "Content-Type: application/json" \
    -d "{
      \"query\": \"Plan a trip number $i\",
      \"context\": {
        \"userId\": \"rotation_test_user\",
        \"sessionId\": \"scenario_4_$i\"
      }
    }" \
    -H "X-User-Id: rotation_test" \
    -s | jq '.metadata.keyId' &
done
wait
```

**Success Criteria**:

- Different `keyId` values appear in responses
- All requests succeed (no quota errors)
- Key rotation logged in application logs

---

### Scenario 5: Real-time Provider Health Monitoring

**Objective**: Verify provider health status is accurately reported

**Test Steps**:

1. Check provider status endpoint
2. Verify health metrics are current
3. Confirm status affects routing decisions

**Expected Behavior**:

- All providers show current health status
- Metrics updated within last 5 minutes
- Unhealthy providers excluded from routing

**Validation Command**:

```bash
# Check overall provider status
curl http://localhost:3000/api/llm/providers | jq '.providers[] | {id, status, availability}'

# Check detailed health for specific provider
curl http://localhost:3000/api/llm/providers/gemini/health | jq '.metrics'
```

**Success Criteria**:

- Status values are valid: `healthy|degraded|unhealthy|maintenance`
- Availability percentages are realistic (0-100)
- Last update timestamp is recent (< 5 minutes ago)

---

### Scenario 6: Streaming Response Handling

**Objective**: Verify streaming responses work for long-form content

**Test Steps**:

1. Submit query requesting detailed itinerary
2. Observe Server-Sent Events stream
3. Verify progressive content delivery

**Expected Behavior**:

- Response starts streaming within 2 seconds
- Content delivered progressively in chunks
- Stream ends with complete itinerary
- No data loss or corruption

**Validation Command**:

```bash
curl -X POST http://localhost:3000/api/llm/route \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "query": "Create a detailed 21-day European grand tour with daily itineraries, transportation, accommodations, and cultural highlights for each city",
    "context": {
      "userId": "quickstart_user",
      "sessionId": "scenario_6"
    }
  }' \
  --no-buffer
```

**Success Criteria**:

- Stream starts within 2 seconds
- Multiple SSE chunks received
- Final response is complete and coherent
- No timeout errors

---

### Scenario 7: Cost Tracking and Optimization

**Objective**: Verify cost tracking and optimization features

**Test Steps**:

1. Submit queries with different complexity levels
2. Check cost reporting in response metadata
3. Verify cheaper providers used when appropriate

**Expected Behavior**:

- Each response includes cost estimate
- Higher complexity queries show higher costs
- System optimizes for cost-effectiveness

**Validation Command**:

```bash
# Simple query (should be low cost)
curl -X POST http://localhost:3000/api/llm/route \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Weather in Paris",
    "context": {"userId": "cost_test", "sessionId": "simple"}
  }' | jq '.metadata.cost'

# Complex query (should be higher cost but efficient)
curl -X POST http://localhost:3000/api/llm/route \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Plan comprehensive 30-day world tour with detailed daily activities",
    "context": {"userId": "cost_test", "sessionId": "complex"}
  }' | jq '.metadata.cost'
```

**Success Criteria**:

- Cost values are reasonable and proportional
- Simple queries cost < $0.01
- Complex queries efficiently handled
- Cost tracking is accurate

---

## Troubleshooting

### Common Issues

**Issue**: Provider always returns "unhealthy" status

- **Solution**: Check API keys in environment variables
- **Debug**: `curl http://localhost:3000/api/llm/providers`

**Issue**: Fallback chain not working

- **Solution**: Verify at least 2 providers are healthy
- **Debug**: Check logs for provider health check results

**Issue**: Streaming responses not working

- **Solution**: Ensure `Accept: text/event-stream` header is set
- **Debug**: Check for buffering issues in client

**Issue**: Rate limiting too aggressive

- **Solution**: Adjust rate limiting configuration
- **Debug**: Check `X-RateLimit-*` headers in responses

### Debugging Commands

```bash
# Check Edge Function logs
vercel logs --follow

# Test provider connectivity directly
curl -X POST http://localhost:3000/api/llm/providers/test

# Validate environment variables
npm run validate-env

# Run contract tests
npm run test:contracts
```

### Performance Benchmarks

- Simple query response time: < 3 seconds
- Complex query response time: < 10 seconds
- Provider health check: < 500ms
- Edge function cold start: < 150ms
- Fallback chain execution: < 5 seconds additional

### Success Metrics

At the end of quickstart execution:

- ✅ All 7 scenarios pass validation
- ✅ Provider health monitoring active
- ✅ Cost tracking functional
- ✅ Fallback chains tested
- ✅ Streaming responses working
- ✅ API key rotation verified
- ✅ Performance benchmarks met

**Ready for Production**: When all scenarios pass and performance meets targets, the multi-LLM routing infrastructure is ready for production deployment.
