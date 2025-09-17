# Hylo Travel AI - Quick Start Guide

**Last Updated**: September 17, 2025  
**Version**: 1.0.0  
**Target Audience**: Developers, DevOps, Product Teams

## Overview

Hylo Travel AI is a multi-agent travel planning system that uses intelligent LLM routing across multiple providers (Cerebras, Gemini, Groq) to create personalized travel itineraries. This guide will get you up and running in under 15 minutes.

## Prerequisites

- Node.js 18+ with npm
- Git
- Vercel CLI (for deployment)
- API keys for LLM providers

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
git clone https://github.com/cbanluta2700/hylo.git
cd hylo
npm install
```

### 2. Environment Configuration

Create `.env.local` file:

```bash
# LLM Provider API Keys
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
CEREBRAS_API_KEY=your_cerebras_api_key_here

# Observability (Optional but recommended)
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_PROJECT=hylo-travel-ai

# Application Settings
NODE_ENV=development
VERCEL_ENV=development
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## API Keys Setup

### Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Create account and navigate to API Keys
3. Generate new API key
4. Add to `.env.local` as `GROQ_API_KEY`

### Google Gemini API Key

1. Visit [ai.google.dev](https://ai.google.dev)
2. Sign in with Google account
3. Go to "Get API Key" section
4. Generate API key for Gemini
5. Add to `.env.local` as `GEMINI_API_KEY`

### Cerebras API Key

1. Visit [cloud.cerebras.ai](https://cloud.cerebras.ai)
2. Create account and verify email
3. Navigate to API section
4. Generate new API key
5. Add to `.env.local` as `CEREBRAS_API_KEY`

### LangSmith (Optional)

1. Visit [smith.langchain.com](https://smith.langchain.com)
2. Create account and project
3. Generate API key
4. Add to `.env.local` as `LANGSMITH_API_KEY`

## Basic Usage

### 1. Access the Application

Open `http://localhost:3000` in your browser.

### 2. Fill Travel Form

Complete the travel planning form with:

- **Destination**: Where you want to go
- **Dates**: Start and end dates
- **Group Size**: Number of travelers
- **Travel Vibe**: Relaxed, Adventure, Cultural, Luxury, or Budget
- **Interests**: Select from available categories
- **Preferences**: Accommodation, dining, and budget preferences

### 3. Watch Agent Processing

The "Behind the Scenes" panel shows real-time progress:

- **Agent 1**: Data Gatherer validates your form
- **Agent 2**: Information Gatherer researches your destination
- **Agent 3**: Planning Strategist creates framework
- **Agent 4**: Content Compiler assembles final itinerary

### 4. Review Generated Itinerary

Your personalized travel itinerary will include:

- Day-by-day schedule
- Accommodation recommendations
- Dining suggestions
- Activities and attractions
- Transportation options
- Budget estimates

## Architecture Overview

### Frontend (React + TypeScript)

- **Components**: Travel forms, real-time monitoring, itinerary display
- **Services**: Multi-agent orchestration, LLM routing
- **Styling**: Tailwind CSS with responsive design

### Backend (Vercel Edge Functions)

- **API Routes**: `/api/llm/route`, `/api/health/system`, `/api/providers/status`
- **Provider Management**: Intelligent routing based on query complexity
- **Observability**: Comprehensive tracking via LangSmith

### Multi-Agent System

- **Agent 1 (Data Gatherer)**: Extracts and validates form data
- **Agent 2 (Information Gatherer)**: Performs real-time web searches
- **Agent 3 (Planning Strategist)**: Creates data-driven itinerary framework
- **Agent 4 (Content Compiler)**: Assembles final personalized output

## API Testing

### Health Check

```bash
curl http://localhost:3000/api/health/system
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-09-17T10:00:00Z",
  "version": "1.0.0",
  "uptime": 300,
  "components": [
    {
      "name": "LLM Provider Groq",
      "status": "healthy",
      "lastCheck": "2025-09-17T10:00:00Z"
    }
  ],
  "metrics": {
    "requestsPerMinute": 0,
    "averageLatency": 150,
    "errorRate": 0,
    "costPerRequest": 0.001
  }
}
```

### Provider Status

```bash
curl http://localhost:3000/api/providers/status
```

### LLM Request (Manual Testing)

```bash
curl -X POST http://localhost:3000/api/llm/route \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "agentId": 1,
    "prompt": "Plan a weekend trip to San Francisco",
    "maxTokens": 1000,
    "temperature": 0.7,
    "metadata": {
      "requestId": "123e4567-e89b-12d3-a456-426614174000",
      "timestamp": "2025-09-17T10:00:00Z"
    }
  }'
```

## Monitoring and Debugging

### Real-Time Monitoring

1. **Behind the Scenes Panel**: Watch agent processing in real-time
2. **Health Monitor**: Check system and provider status
3. **Browser DevTools**: Network tab for API requests
4. **Console Logs**: Application logs in browser console

### LangSmith Observability (If Configured)

1. Visit [smith.langchain.com](https://smith.langchain.com)
2. Navigate to your project
3. View request traces and performance metrics
4. Analyze cost and token usage

### Common Issues

**Provider Not Responding**

- Check API keys in `.env.local`
- Verify network connectivity
- Check provider status at `/api/providers/status`

**Agent Processing Stuck**

- Check browser console for errors
- Verify all required form fields are filled
- Restart development server

**High Latency**

- Monitor provider response times
- Check complexity scoring in network requests
- Consider adjusting provider routing thresholds

## Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# Or using CLI:
vercel env add GROQ_API_KEY
vercel env add GEMINI_API_KEY
vercel env add CEREBRAS_API_KEY
vercel env add LANGSMITH_API_KEY
```

### Environment Variables for Production

```bash
# Required
GROQ_API_KEY=your_production_groq_key
GEMINI_API_KEY=your_production_gemini_key
CEREBRAS_API_KEY=your_production_cerebras_key

# Recommended
LANGSMITH_API_KEY=your_production_langsmith_key
LANGSMITH_PROJECT=hylo-travel-ai-prod

# Production Settings
NODE_ENV=production
VERCEL_ENV=production
```

## Testing

### Run Test Suite

```bash
# Unit tests
npm run test

# Contract tests
npm run test:contract

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### Manual Testing Scenarios

1. **Simple Trip Planning**:

   - Destination: "Paris"
   - Duration: 3 days
   - Expected: Fast response using Groq provider

2. **Complex Multi-City Planning**:

   - Destination: "Europe (Paris, Rome, Barcelona)"
   - Duration: 14 days
   - Group: 8 people with different interests
   - Expected: Cerebras provider for complex reasoning

3. **Provider Failover**:
   - Temporarily disable primary provider
   - Expected: Automatic fallback to secondary provider

## Next Steps

### Development

1. **Custom Features**: Add new travel preferences or agent capabilities
2. **Provider Integration**: Add new LLM providers
3. **Enhanced Monitoring**: Custom metrics and alerting

### Production

1. **Performance Optimization**: Bundle analysis and caching strategies
2. **Security Hardening**: Rate limiting and input validation
3. **Scaling**: Multi-region deployment and load balancing

### Documentation

1. **API Documentation**: Generate OpenAPI docs from contracts
2. **Architecture Decision Records**: Document major design decisions
3. **User Guides**: End-user documentation and tutorials

## Support and Contributing

### Getting Help

- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: GitHub discussions for questions and ideas
- **Documentation**: Refer to `/specs/` directory for detailed docs

### Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow constitution**: Ensure constitutional compliance
4. **Add tests**: Contract and integration tests required
5. **Submit PR**: Include description and testing steps

### Constitutional Compliance

All changes must adhere to the Hylo Travel AI Constitution:

- **Edge-First Architecture**: Vercel Edge Functions only
- **Multi-LLM Resilience**: Maintain provider diversity
- **Observable AI Operations**: LangSmith integration required
- **Type-Safe Development**: TypeScript + Zod validation
- **Cost-Conscious Design**: Optimize provider selection

---

**Quick Start Complete!** 🎉

You now have Hylo Travel AI running locally with multi-agent travel planning capabilities. The system will intelligently route requests across LLM providers and provide real-time insights into the planning process.

For advanced configuration and production deployment, refer to the detailed documentation in `/specs/main-analysis/`.
