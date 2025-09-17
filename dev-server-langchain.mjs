// Hylo Travel AI - Development Server with LangChain Integration
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3002; // Use port 3002 to avoid conflicts

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Hylo Travel AI Development Server',
    version: '1.0.0',
    environment: 'development',
  });
});

// Import and setup API routes
async function setupAPIRoutes() {
  try {
    // Dynamic imports for ES modules
    const { default: llmRouteHandler } = await import('./api/llm/route.js');
    const { default: llmHealthHandler } = await import('./api/llm/health.js');
    const { default: llmAgentsHandler } = await import('./api/llm/agents.js');

    // LLM routing endpoint
    app.post('/api/llm/route', async (req, res) => {
      try {
        const result = await llmRouteHandler({ method: 'POST', body: req.body });
        res.status(result.status).json(result.json);
      } catch (error) {
        console.error('LLM route error:', error);
        res.status(500).json({ error: 'LLM route failed', message: error.message });
      }
    });

    // Provider health endpoint
    app.get('/api/llm/health', async (req, res) => {
      try {
        const result = await llmHealthHandler({ method: 'GET' });
        res.status(result.status).json(result.json);
      } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({ error: 'Health check failed', message: error.message });
      }
    });

    // Multi-agent workflow endpoint
    app.post('/api/llm/agents', async (req, res) => {
      try {
        const request = new Request('http://localhost:3001/api/llm/agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body),
        });

        const response = await llmAgentsHandler(request);

        // Handle streaming response
        if (response.headers.get('Content-Type') === 'text/event-stream') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          });

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            res.write(chunk);
          }

          res.end();
        } else {
          const data = await response.json();
          res.status(response.status).json(data);
        }
      } catch (error) {
        console.error('Multi-agent workflow error:', error);
        res.status(500).json({ error: 'Multi-agent workflow failed', message: error.message });
      }
    });

    console.log('✅ API routes configured successfully');
  } catch (error) {
    console.error('❌ Failed to setup API routes:', error);

    // Fallback routes for development
    app.post('/api/llm/route', (req, res) => {
      res.status(503).json({
        error: 'LLM service temporarily unavailable',
        message: 'API routes not loaded properly',
        fallback: true,
      });
    });

    app.get('/api/llm/health', (req, res) => {
      res.status(503).json({
        error: 'Health service temporarily unavailable',
        message: 'API routes not loaded properly',
        fallback: true,
      });
    });

    app.post('/api/llm/agents', (req, res) => {
      res.status(503).json({
        error: 'Multi-agent service temporarily unavailable',
        message: 'API routes not loaded properly',
        fallback: true,
      });
    });
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// Start server
async function startServer() {
  try {
    // Setup API routes
    await setupAPIRoutes();

    // Start listening
    app.listen(PORT, () => {
      console.log('\n🚀 Hylo Travel AI Development Server');
      console.log(`🌐 Server running on http://localhost:${PORT}`);
      console.log('\n📋 Available Endpoints:');
      console.log(`   GET  /health                    - Server health check`);
      console.log(`   GET  /api/llm/health           - LLM providers health`);
      console.log(`   POST /api/llm/route            - LLM routing with fallbacks`);
      console.log(`   POST /api/llm/agents           - Multi-agent workflow`);
      console.log('\n🔧 Development Features:');
      console.log(`   ✅ LangChain.js integration`);
      console.log(`   ✅ Multi-provider routing (Groq, Cerebras, Google)`);
      console.log(`   ✅ LangSmith observability (dev mode)`);
      console.log(`   ✅ Intelligent fallback chains`);
      console.log(`   ✅ Cost tracking and monitoring`);
      console.log(`   ✅ Real-time agent streaming`);
      console.log('\n💡 Next Steps:');
      console.log(`   1. Test with: curl http://localhost:${PORT}/api/llm/health`);
      console.log(`   2. Start frontend: npm run dev`);
      console.log(`   3. Use: npm run dev:full (both servers)`);
      console.log('\n🎯 Constitutional Compliance:');
      console.log(`   ✅ Edge-first architecture ready`);
      console.log(`   ✅ Multi-LLM resilience implemented`);
      console.log(`   ✅ Observable AI operations`);
      console.log(`   ✅ Type-safe development (TS ready)`);
      console.log(`   ✅ Cost-conscious design`);
      console.log(`   ✅ Security by default\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Hylo Travel AI Development Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down Hylo Travel AI Development Server...');
  process.exit(0);
});

// Start the server
startServer();
