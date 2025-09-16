# Groq AI Models Summary for Bolt.new Integration

## Overview
This document provides a comprehensive summary of Groq's AI models and systems, formatted for AI ingestion and reference when working with Bolt.new for app and website creation.

## Key Models for Development

### 1. OpenAI GPT-OSS 120B
**Model ID:** `openai/gpt-oss-120b`

#### Technical Specifications
- **Architecture:** Mixture-of-Experts (MoE) with 120B total parameters (5.1B active per forward pass)
- **Token Speed:** ~500 TPS
- **Context Window:** 131,072 tokens
- **Max Output:** 65,536 tokens
- **Pricing:** $0.15/6.7M input tokens, $0.75/1.3M output tokens

#### Capabilities
- Tool Use
- Browser Search
- Code Execution
- JSON Object/Schema Mode
- Reasoning (variable modes: low, medium, high)

#### Performance Benchmarks
- MMLU (General Reasoning): 90.0%
- SWE-Bench Verified (Coding): 62.4%
- HealthBench Realistic: 57.6%
- MMMLU (Multilingual): 81.3% average

#### Best Use Cases for Bolt.new
- Advanced coding and software engineering tasks
- Complex mathematical reasoning
- Multi-step problem solving for app architecture
- Multilingual application development (81+ languages)

### 2. OpenAI GPT-OSS 20B
**Model ID:** `openai/gpt-oss-20b`
- **Token Speed:** ~1000 TPS (2x faster than 120B model)
- **Context Window:** 131,072 tokens
- **Max Output:** 65,536 tokens
- Compact model with built-in browser search and code execution

### 3. Compound Beta System
**Model ID:** `compound-beta`

#### Architecture
- Compound AI system using multiple models
- Core reasoning: Llama 4 Scout
- Routing and tool use: Llama 3.3 70B
- **Token Speed:** ~350 TPS

#### Key Features
- **Web Search:** Automatic real-time web access for current information
- **Code Execution:** Python code execution via E2B integration
- **JSON Object Mode:** Structured output generation

#### Best Practices for Bolt.new Integration
1. Use system prompts for improved steerability
2. Implement safeguards for production deployments
3. Ideal for applications requiring real-time data access

## Production-Ready Models

### Llama Models
| Model | Context Window | Best For |
|-------|---------------|----------|
| `llama-3.1-8b-instant` | 131,072 | Fast, lightweight tasks |
| `llama-3.3-70b-versatile` | 131,072 | Versatile, high-quality outputs |

### Specialized Models
- **Whisper Large V3/V3 Turbo:** Audio transcription (100MB max file size)
- **Llama Guard 4:** Safety and content filtering

## Implementation Guidelines for Bolt.new

### Quick Start Code
```python
from groq import Groq

client = Groq()

# For advanced coding tasks
completion = client.chat.completions.create(
    model="openai/gpt-oss-120b",
    messages=[
        {"role": "user", "content": "Create a React component with TypeScript"}
    ]
)

# For real-time web search and tool use
compound_completion = client.chat.completions.create(
    model="compound-beta",
    messages=[
        {"role": "user", "content": "Search for latest React best practices and create a component"}
    ]
)
```

### Optimization Strategies
1. **Model Selection:**
   - Use GPT-OSS 120B for complex coding and reasoning
   - Use GPT-OSS 20B for faster responses with similar capabilities
   - Use Compound Beta for tasks requiring web search or code execution

2. **Context Management:**
   - Utilize full 131K context window for comprehensive document analysis
   - Structure prompts with clear role hierarchy: System > Developer > User > Assistant

3. **Performance Tuning:**
   - Balance reasoning modes (low/medium/high) based on task complexity
   - Use JSON Schema Mode for structured outputs in app generation

## Key Advantages for Bolt.new Development

1. **Speed:** Groq's TruePoint Numerics provides significant speedup without quality loss
2. **Flexibility:** Multiple models for different use cases and performance requirements
3. **Advanced Capabilities:** Built-in tool use, web search, and code execution
4. **Cost-Effective:** Competitive pricing with high token throughput
5. **Long Context:** 131K token context window for complex app architectures

## API Endpoint
Base URL: `https://api.groq.com/openai/v1`

## Notes
- All models support OpenAI-compatible API format
- Preview models should not be used in production
- Compound systems automatically handle tool selection and execution
- Rate limits vary based on model selection

This summary provides the essential information needed to effectively integrate Groq's AI models with Bolt.new for creating stunning apps and websites through AI-powered development.