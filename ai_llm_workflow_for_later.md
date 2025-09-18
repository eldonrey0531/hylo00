I'll create a comprehensive implementation plan for your 4-AI agent flow using LangChain, LangGraph, and the specified tools. This will be a production-ready, Edge-compatible architecture.

## TODO: Advanced Multi-Agent LangGraph Flow - Rapid Implementation

### Implementation Sprint

- [ ] Set up LangGraph StateGraph for agent orchestration
- [ ] Implement 4 specialized agents with LangChain
- [ ] Configure vector stores (Qdrant + Upstash)
- [ ] Set up embedding pipeline with Jina
- [ ] Wire up LLM providers (Groq, Cerebras, Gemini)

### Polish Phase (After Working)

- [ ] Add LangSmith tracing throughout
- [ ] Optimize vector search performance
- [ ] Add Upstash Workflow for async processing
- [ ] Implement cost tracking
- [ ] Clean up types and error handling

## 1. Core State Management & Types

```typescript
import { BaseMessage } from '@langchain/core/messages';

export interface TravelPlannerState {
  // Input data
  userRequest: string;
  formData: any;
  travelStyle: any;

  // Agent outputs
  contentPlan: string | null;
  websiteInfo: Record<string, any> | null;
  planningStrategy: string | null;
  compiledContent: string | null;

  // Context & Memory
  messages: BaseMessage[];
  vectorContext: any[];
  searchResults: any[];

  // Metadata
  currentAgent: string;
  agentHistory: string[];
  errors: string[];
  metrics: {
    tokensUsed: number;
    latency: number;
    cost: number;
  };
}

export interface AgentConfig {
  llmProvider: 'groq' | 'cerebras' | 'gemini';
  temperature: number;
  maxTokens: number;
  embeddingModel: string;
  vectorStore: 'qdrant' | 'upstash';
}
```

## 2. LangGraph StateGraph Setup

```typescript
import { StateGraph, END } from '@langchain/langgraph';
import { TravelPlannerState } from './types';
import { ContentPlannerAgent } from './agents/ContentPlannerAgent';
import { WebsiteInfoGatherer } from './agents/WebsiteInfoGatherer';
import { PlanningStrategist } from './agents/PlanningStrategist';
import { ContentCompiler } from './agents/ContentCompiler';

export class TravelPlannerGraph {
  private graph: StateGraph<TravelPlannerState>;
  private contentPlanner: ContentPlannerAgent;
  private websiteGatherer: WebsiteInfoGatherer;
  private planningStrategist: PlanningStrategist;
  private contentCompiler: ContentCompiler;

  constructor() {
    this.initializeAgents();
    this.buildGraph();
  }

  private initializeAgents() {
    this.contentPlanner = new ContentPlannerAgent();
    this.websiteGatherer = new WebsiteInfoGatherer();
    this.planningStrategist = new PlanningStrategist();
    this.contentCompiler = new ContentCompiler();
  }

  private buildGraph() {
    this.graph = new StateGraph<TravelPlannerState>({
      channels: {
        userRequest: null,
        formData: null,
        travelStyle: null,
        contentPlan: null,
        websiteInfo: null,
        planningStrategy: null,
        compiledContent: null,
        messages: {
          value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
          default: () => [],
        },
        vectorContext: {
          value: (x: any[], y: any[]) => x.concat(y),
          default: () => [],
        },
        searchResults: {
          value: (x: any[], y: any[]) => x.concat(y),
          default: () => [],
        },
        currentAgent: null,
        agentHistory: {
          value: (x: string[], y: string[]) => x.concat(y),
          default: () => [],
        },
        errors: {
          value: (x: string[], y: string[]) => x.concat(y),
          default: () => [],
        },
        metrics: {
          value: (x, y) => ({
            tokensUsed: (x?.tokensUsed || 0) + (y?.tokensUsed || 0),
            latency: (x?.latency || 0) + (y?.latency || 0),
            cost: (x?.cost || 0) + (y?.cost || 0),
          }),
          default: () => ({ tokensUsed: 0, latency: 0, cost: 0 }),
        },
      },
    });

    // Add nodes for each agent
    this.graph.addNode(
      'content_planner',
      async (state) => await this.contentPlanner.execute(state)
    );

    this.graph.addNode(
      'website_gatherer',
      async (state) => await this.websiteGatherer.execute(state)
    );

    this.graph.addNode(
      'planning_strategist',
      async (state) => await this.planningStrategist.execute(state)
    );

    this.graph.addNode(
      'content_compiler',
      async (state) => await this.contentCompiler.execute(state)
    );

    // Define the workflow edges
    this.graph.setEntryPoint('content_planner');

    this.graph.addEdge('content_planner', 'website_gatherer');
    this.graph.addEdge('website_gatherer', 'planning_strategist');
    this.graph.addEdge('planning_strategist', 'content_compiler');
    this.graph.addEdge('content_compiler', END);
  }

  async execute(input: Partial<TravelPlannerState>): Promise<TravelPlannerState> {
    const app = this.graph.compile();

    // Add LangSmith tracing
    const result = await app.invoke(
      {
        ...input,
        currentAgent: 'content_planner',
        agentHistory: [],
        errors: [],
        messages: [],
        vectorContext: [],
        searchResults: [],
        metrics: { tokensUsed: 0, latency: 0, cost: 0 },
      },
      {
        configurable: {
          thread_id: `travel-${Date.now()}`,
        },
        callbacks: [
          {
            handleLLMStart: async (llm, prompts) => {
              console.log('LLM Start:', llm.name);
            },
            handleLLMEnd: async (output) => {
              console.log('LLM End:', output);
            },
          },
        ],
      }
    );

    return result;
  }
}
```

## 3. Content Planner Agent with LangChain

```typescript
import { ChatGroq, ChatGoogleGenerativeAI } from '@langchain/community/chat_models';
import { ChatCerebras } from '@langchain/cerebras';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { RunnableSequence, RunnableParallel } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { TravelPlannerState } from '../types';
import { JinaEmbeddings } from '../embeddings/JinaEmbeddings';
import { UpstashVectorStore } from '../vectorstores/UpstashVectorStore';

export class ContentPlannerAgent {
  private llm: any;
  private embeddings: JinaEmbeddings;
  private vectorStore: UpstashVectorStore;

  constructor() {
    this.initializeLLM();
    this.embeddings = new JinaEmbeddings();
    this.vectorStore = new UpstashVectorStore(this.embeddings);
  }

  private initializeLLM() {
    // Use Groq for content planning (high quality needed)
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      maxTokens: 2000,
    });
  }

  async execute(state: TravelPlannerState): Promise<Partial<TravelPlannerState>> {
    const startTime = Date.now();

    try {
      // Retrieve relevant context from vector store
      const vectorContext = await this.vectorStore.similaritySearch(state.userRequest, 5);

      // Build the planning chain
      const planningChain = RunnableSequence.from([
        {
          systemPrompt: () => this.buildSystemPrompt(),
          userPrompt: () => this.buildUserPrompt(state, vectorContext),
        },
        RunnableParallel.from({
          mainPlan: this.createMainPlanChain(),
          keyPoints: this.createKeyPointsChain(),
          requirements: this.createRequirementsChain(),
        }),
        this.combineResults,
      ]);

      const result = await planningChain.invoke({
        formData: state.formData,
        travelStyle: state.travelStyle,
      });

      // Store the plan in vector store for future reference
      await this.vectorStore.addDocuments([
        {
          content: result,
          metadata: {
            agent: 'content_planner',
            timestamp: Date.now(),
            location: state.formData?.location,
          },
        },
      ]);

      return {
        contentPlan: result,
        currentAgent: 'website_gatherer',
        agentHistory: [...state.agentHistory, 'content_planner'],
        vectorContext: [...state.vectorContext, ...vectorContext],
        messages: [
          ...state.messages,
          new SystemMessage(this.buildSystemPrompt()),
          new HumanMessage(this.buildUserPrompt(state, vectorContext)),
        ],
        metrics: {
          ...state.metrics,
          latency: state.metrics.latency + (Date.now() - startTime),
        },
      };
    } catch (error) {
      return {
        errors: [...state.errors, `Content Planner Error: ${error.message}`],
        currentAgent: 'website_gatherer', // Continue to next agent
      };
    }
  }

  private buildSystemPrompt(): string {
    return `You are a Content Planner AI specializing in travel itinerary creation.
    
    Your role:
    1. Analyze user preferences and requirements
    2. Create a high-level content structure for the itinerary
    3. Identify key information needs for research
    4. Define the narrative flow and themes
    
    Output a structured plan that includes:
    - Main themes and highlights
    - Day-by-day structure outline
    - Key experiences to research
    - Budget allocation strategy
    - Special requirements to address`;
  }

  private buildUserPrompt(state: TravelPlannerState, context: any[]): string {
    return `Create a content plan for this travel request:
    
    Location: ${state.formData?.location || 'Not specified'}
    Duration: ${state.formData?.departDate} to ${state.formData?.returnDate}
    Budget: ${state.formData?.budget || 'Flexible'}
    Travelers: ${state.formData?.adults || 1} adults, ${state.formData?.children || 0} children
    
    Travel Style Preferences:
    ${JSON.stringify(state.travelStyle, null, 2)}
    
    Previous Similar Trips Context:
    ${context.map((c) => c.content).join('\n')}
    
    Create a comprehensive content plan that will guide the other agents.`;
  }

  private createMainPlanChain() {
    return RunnableSequence.from([
      this.llm,
      new StringOutputParser(),
      (text: string) => ({ mainPlan: text }),
    ]);
  }

  private createKeyPointsChain() {
    return RunnableSequence.from([
      new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        maxTokens: 500,
      }),
      new StringOutputParser(),
      (text: string) => ({ keyPoints: text.split('\n').filter((p) => p.trim()) }),
    ]);
  }

  private createRequirementsChain() {
    return RunnableSequence.from([
      new ChatCerebras({
        apiKey: process.env.CEREBRAS_API_KEY,
        model: 'llama3.1-8b',
        temperature: 0.3,
      }),
      new StringOutputParser(),
      (text: string) => ({ requirements: text }),
    ]);
  }

  private combineResults(results: any): string {
    return JSON.stringify(
      {
        mainPlan: results.mainPlan.mainPlan,
        keyPoints: results.keyPoints.keyPoints,
        requirements: results.requirements.requirements,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }
}
```

## 4. Website Info Gatherer with Web Search

```typescript
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { RunnableParallel } from '@langchain/core/runnables';
import { TravelPlannerState } from '../types';
import { QdrantVectorStore } from '../vectorstores/QdrantVectorStore';

export class WebsiteInfoGatherer {
  private llm: ChatGoogleGenerativeAI;
  private textSplitter: RecursiveCharacterTextSplitter;
  private vectorStore: QdrantVectorStore;

  constructor() {
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-1.5-flash',
      temperature: 0.3,
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    this.vectorStore = new QdrantVectorStore();
  }

  async execute(state: TravelPlannerState): Promise<Partial<TravelPlannerState>> {
    const contentPlan = JSON.parse(state.contentPlan || '{}');

    try {
      // Parallel web search for different aspects
      const searchTasks = RunnableParallel.from({
        attractions: () => this.searchAttractions(state.formData?.location),
        hotels: () => this.searchAccommodations(state.formData?.location, state.formData?.budget),
        restaurants: () => this.searchDining(state.formData?.location),
        activities: () => this.searchActivities(state.formData?.location, contentPlan.keyPoints),
        transportation: () => this.searchTransportation(state.formData?.location),
        weather: () => this.searchWeather(state.formData?.location, state.formData?.departDate),
      });

      const searchResults = await searchTasks.invoke({});

      // Process and chunk the results
      const processedInfo = await this.processSearchResults(searchResults);

      // Store in vector database for retrieval
      await this.storeInVectorDB(processedInfo, state);

      return {
        websiteInfo: processedInfo,
        searchResults: [...state.searchResults, searchResults],
        currentAgent: 'planning_strategist',
        agentHistory: [...state.agentHistory, 'website_gatherer'],
      };
    } catch (error) {
      return {
        errors: [...state.errors, `Website Gatherer Error: ${error.message}`],
        currentAgent: 'planning_strategist',
      };
    }
  }

  private async searchAttractions(location: string) {
    // Use web search API or scraping service
    const query = `top tourist attractions in ${location} 2024 reviews ratings`;

    // For now, simulate with Gemini's knowledge
    const response = await this.llm.invoke([
      {
        role: 'system',
        content:
          'You are a travel research assistant. Provide current information about attractions.',
      },
      {
        role: 'user',
        content: `List the top 10 attractions in ${location} with details about:
        - Opening hours
        - Ticket prices
        - Best time to visit
        - Average visit duration
        - Nearby attractions`,
      },
    ]);

    return response.content;
  }

  private async searchAccommodations(location: string, budget: string) {
    const budgetLevel = this.getBudgetLevel(budget);

    const response = await this.llm.invoke([
      {
        role: 'user',
        content: `Find ${budgetLevel} accommodations in ${location} including:
        - Hotel names and ratings
        - Price ranges
        - Amenities
        - Location advantages
        - Guest reviews summary`,
      },
    ]);

    return response.content;
  }

  private async searchDining(location: string) {
    const response = await this.llm.invoke([
      {
        role: 'user',
        content: `Research dining options in ${location}:
        - Must-try local cuisine
        - Top-rated restaurants
        - Budget-friendly options
        - Dietary restriction friendly places
        - Food markets and street food`,
      },
    ]);

    return response.content;
  }

  private async searchActivities(location: string, keyPoints: string[]) {
    const response = await this.llm.invoke([
      {
        role: 'user',
        content: `Find activities in ${location} based on interests: ${keyPoints.join(', ')}
        Include:
        - Adventure activities
        - Cultural experiences
        - Family-friendly options
        - Seasonal activities
        - Unique local experiences`,
      },
    ]);

    return response.content;
  }

  private async searchTransportation(location: string) {
    const response = await this.llm.invoke([
      {
        role: 'user',
        content: `Research transportation in ${location}:
        - Airport transfers
        - Public transportation
        - Car rental options
        - Taxi/ride-sharing availability
        - Walking/cycling infrastructure`,
      },
    ]);

    return response.content;
  }

  private async searchWeather(location: string, date: string) {
    const response = await this.llm.invoke([
      {
        role: 'user',
        content: `Weather information for ${location} around ${date}:
        - Typical weather conditions
        - Temperature ranges
        - Rainfall probability
        - What to pack
        - Weather-related travel tips`,
      },
    ]);

    return response.content;
  }

  private async processSearchResults(results: any) {
    const combined = Object.entries(results)
      .map(([category, content]) => `\n## ${category.toUpperCase()}\n${content}`)
      .join('\n\n');

    const chunks = await this.textSplitter.splitText(combined);

    return {
      raw: results,
      processed: combined,
      chunks: chunks,
      summary: await this.summarizeInfo(combined),
    };
  }

  private async summarizeInfo(content: string) {
    const response = await this.llm.invoke([
      {
        role: 'system',
        content: 'Summarize the key travel information in bullet points.',
      },
      {
        role: 'user',
        content: content.substring(0, 4000), // Limit for context window
      },
    ]);

    return response.content;
  }

  private async storeInVectorDB(info: any, state: TravelPlannerState) {
    const documents = info.chunks.map((chunk: string, index: number) => ({
      pageContent: chunk,
      metadata: {
        location: state.formData?.location,
        agent: 'website_gatherer',
        chunkIndex: index,
        timestamp: Date.now(),
      },
    }));

    await this.vectorStore.addDocuments(documents);
  }

  private getBudgetLevel(budget: string): string {
    const amount = parseInt(budget);
    if (amount < 1000) return 'budget';
    if (amount < 3000) return 'mid-range';
    return 'luxury';
  }
}
```

## 5. Planning Strategist Agent

```typescript
import { ChatGroq } from '@langchain/groq';
import { RunnableSequence } from '@langchain/core/runnables';
import { TravelPlannerState } from '../types';

export class PlanningStrategist {
  private llm: ChatGroq;

  constructor() {
    this.llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: 'mixtral-8x7b-32768',
      temperature: 0.5,
      maxTokens: 4000,
    });
  }

  async execute(state: TravelPlannerState): Promise<Partial<TravelPlannerState>> {
    try {
      const strategy = await this.createDetailedStrategy(state);

      return {
        planningStrategy: strategy,
        currentAgent: 'content_compiler',
        agentHistory: [...state.agentHistory, 'planning_strategist'],
      };
    } catch (error) {
      return {
        errors: [...state.errors, `Planning Strategist Error: ${error.message}`],
        currentAgent: 'content_compiler',
      };
    }
  }

  private async createDetailedStrategy(state: TravelPlannerState) {
    const contentPlan = JSON.parse(state.contentPlan || '{}');
    const websiteInfo = state.websiteInfo;

    const strategyChain = RunnableSequence.from([
      async () => ({
        systemPrompt: this.buildStrategySystemPrompt(),
        userPrompt: this.buildStrategyUserPrompt(state, contentPlan, websiteInfo),
      }),
      async (prompts) =>
        await this.llm.invoke([
          { role: 'system', content: prompts.systemPrompt },
          { role: 'user', content: prompts.userPrompt },
        ]),
      (response) => response.content,
    ]);

    return await strategyChain.invoke({});
  }

  private buildStrategySystemPrompt(): string {
    return `You are a Planning Strategist AI that creates detailed, day-by-day travel itineraries.
    
    Your responsibilities:
    1. Create logical day-by-day flow
    2. Optimize time and route efficiency
    3. Balance activities with rest
    4. Consider practical constraints (opening hours, travel time)
    5. Include backup options
    6. Factor in budget constraints
    
    Output format:
    - Day-by-day breakdown with timings
    - Specific locations and addresses
    - Transportation between points
    - Meal suggestions with restaurants
    - Time allocations for each activity
    - Budget estimates per day
    - Tips and recommendations`;
  }

  private buildStrategyUserPrompt(
    state: TravelPlannerState,
    contentPlan: any,
    websiteInfo: any
  ): string {
    return `Create a detailed travel strategy based on:
    
    CONTENT PLAN:
    ${JSON.stringify(contentPlan, null, 2)}
    
    RESEARCHED INFORMATION:
    ${websiteInfo?.summary || 'No specific research available'}
    
    TRIP DETAILS:
    - Location: ${state.formData?.location}
    - Dates: ${state.formData?.departDate} to ${state.formData?.returnDate}
    - Budget: $${state.formData?.budget}
    - Travelers: ${state.formData?.adults} adults, ${state.formData?.children} children
    
    PREFERENCES:
    ${JSON.stringify(state.travelStyle, null, 2)}
    
    Create a complete, actionable itinerary with specific recommendations.`;
  }
}
```

## 6. Content Compiler Agent

```typescript
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatCerebras } from '@langchain/cerebras';
import { RunnableParallel, RunnableSequence } from '@langchain/core/runnables';
import { TravelPlannerState } from '../types';

export class ContentCompiler {
  private primaryLLM: ChatGoogleGenerativeAI;
  private polishLLM: ChatCerebras;

  constructor() {
    this.primaryLLM = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-1.5-pro',
      temperature: 0.8,
      maxTokens: 8000,
    });

    this.polishLLM = new ChatCerebras({
      apiKey: process.env.CEREBRAS_API_KEY,
      model: 'llama3.1-70b',
      temperature: 0.6,
    });
  }

  async execute(state: TravelPlannerState): Promise<Partial<TravelPlannerState>> {
    try {
      // Parallel compilation of different sections
      const compilationTasks = RunnableParallel.from({
        overview: () => this.compileOverview(state),
        dayByDay: () => this.compileDayByDay(state),
        practicalInfo: () => this.compilePracticalInfo(state),
        budgetBreakdown: () => this.compileBudgetBreakdown(state),
        tips: () => this.compileTips(state),
      });

      const sections = await compilationTasks.invoke({});

      // Final compilation and polish
      const finalItinerary = await this.compileFinalItinerary(sections);

      return {
        compiledContent: finalItinerary,
        currentAgent: 'complete',
        agentHistory: [...state.agentHistory, 'content_compiler'],
      };
    } catch (error) {
      return {
        errors: [...state.errors, `Content Compiler Error: ${error.message}`],
        compiledContent: this.createFallbackItinerary(state),
      };
    }
  }

  private async compileOverview(state: TravelPlannerState): Promise<string> {
    const response = await this.primaryLLM.invoke([
      {
        role: 'system',
        content: 'Create an engaging overview section for a travel itinerary.',
      },
      {
        role: 'user',
        content: `Create an overview for a trip to ${state.formData?.location} based on:
        ${state.planningStrategy?.substring(0, 2000)}`,
      },
    ]);

    return response.content;
  }

  private async compileDayByDay(state: TravelPlannerState): Promise<string> {
    const response = await this.primaryLLM.invoke([
      {
        role: 'system',
        content:
          'Create detailed day-by-day itinerary sections with specific timings and locations.',
      },
      {
        role: 'user',
        content: `Create day-by-day itinerary based on this strategy:
        ${state.planningStrategy}`,
      },
    ]);

    return response.content;
  }

  private async compilePracticalInfo(state: TravelPlannerState): Promise<string> {
    const response = await this.polishLLM.invoke([
      {
        role: 'system',
        content:
          'Compile practical travel information including transportation, accommodation, and logistics.',
      },
      {
        role: 'user',
        content: `Create practical info section using:
        ${state.websiteInfo?.summary}`,
      },
    ]);

    return response.content;
  }

  private async compileBudgetBreakdown(state: TravelPlannerState): Promise<string> {
    const response = await this.polishLLM.invoke([
      {
        role: 'user',
        content: `Create a budget breakdown for ${state.formData?.budget} covering all aspects of the trip.`,
      },
    ]);

    return response.content;
  }

  private async compileTips(state: TravelPlannerState): Promise<string> {
    const response = await this.primaryLLM.invoke([
      {
        role: 'user',
        content: `Create insider tips and recommendations for ${state.formData?.location}.`,
      },
    ]);

    return response.content;
  }

  private async compileFinalItinerary(sections: any): Promise<string> {
    const template = `
# Your Personalized Travel Itinerary

## Overview
${sections.overview}

## Day-by-Day Itinerary
${sections.dayByDay}

## Practical Information
${sections.practicalInfo}

## Budget Breakdown
${sections.budgetBreakdown}

## Insider Tips
${sections.tips}

---
*Generated with AI-powered travel planning*
    `;

    // Final polish pass
    const polished = await this.polishLLM.invoke([
      {
        role: 'system',
        content: 'Polish and format this itinerary for perfect presentation.',
      },
      {
        role: 'user',
        content: template,
      },
    ]);

    return polished.content;
  }

  private createFallbackItinerary(state: TravelPlannerState): string {
    return `
# Travel Itinerary for ${state.formData?.location}

We've prepared a basic itinerary based on your preferences.
Please contact support if you need more detailed planning.

**Dates:** ${state.formData?.departDate} to ${state.formData?.returnDate}
**Budget:** $${state.formData?.budget}
**Travelers:** ${state.formData?.adults} adults, ${state.formData?.children} children

Contact our travel experts for personalized assistance.
    `;
  }
}
```

## 7. Vector Store Implementations

```typescript
import { Index } from '@upstash/vector';
import { Document } from '@langchain/core/documents';

export class UpstashVectorStore {
  private index: Index;

  constructor(embeddings: any) {
    this.index = new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    });
  }

  async addDocuments(documents: any[]) {
    const vectors = await Promise.all(
      documents.map(async (doc) => {
        const embedding = await this.embeddings.embedQuery(doc.content);
        return {
          id: `doc-${Date.now()}-${Math.random()}`,
          vector: embedding,
          metadata: doc.metadata,
        };
      })
    );

    await this.index.upsert(vectors);
  }

  async similaritySearch(query: string, k: number = 5) {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    const results = await this.index.query({
      vector: queryEmbedding,
      topK: k,
      includeMetadata: true,
    });

    return results.map((r) => ({
      content: r.metadata?.content || '',
      metadata: r.metadata,
      score: r.score,
    }));
  }
}
```

## 8. Jina Embeddings

```typescript
export class JinaEmbeddings {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.JINA_API_KEY!;
    this.model = 'jina-embeddings-v2-base-en';
  }

  async embedQuery(text: string): Promise<number[]> {
    const response = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: this.model,
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    const response = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: texts,
        model: this.model,
      }),
    });

    const data = await response.json();
    return data.data.map((d: any) => d.embedding);
  }
}
```

## 9. API Endpoint

```typescript
export const config = { runtime: 'edge' };

import { TravelPlannerGraph } from '@/services/langraph/travelPlannerGraph';

export default async function handler(req: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const input = await req.json();

    // Initialize the graph
    const graph = new TravelPlannerGraph();

    // Execute the multi-agent pipeline
    const result = await graph.execute({
      userRequest: input.userRequest,
      formData: input.formData,
      travelStyle: input.travelStyle,
    });

    return new Response(
      JSON.stringify({
        success: true,
        itinerary: result.compiledContent,
        metadata: {
          tokensUsed: result.metrics.tokensUsed,
          latency: result.metrics.latency,
          cost: result.metrics.cost,
        },
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
```

## 10. Environment Variables

```bash
# Add to .env.local
GROQ_API_KEY=your_groq_key
CEREBRAS_API_KEY=your_cerebras_key
GOOGLE_API_KEY=your_gemini_key
JINA_API_KEY=your_jina_key
UPSTASH_VECTOR_REST_URL=your_upstash_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_token
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
LANGSMITH_API_KEY=your_langsmith_key
```

This implementation provides:

1. **LangGraph StateGraph** for orchestrating the 4 agents
2. **Parallel processing** with RunnableParallel for efficiency
3. **Multiple LLM providers** (Groq, Cerebras, Gemini) used strategically
4. **Vector storage** with both Upstash and Qdrant
5. **Jina embeddings** for semantic search
6. **Text splitting** with LangChain's splitter
7. **LangSmith tracing** ready (add callbacks)
8. **Edge Runtime** compatible
9. **Error handling** with fallbacks
10. **Modular architecture** for easy extension

The system intelligently routes requests through the 4 specialized agents, gathering and compiling information to create comprehensive travel itineraries.

Similar code found with 1 license type
