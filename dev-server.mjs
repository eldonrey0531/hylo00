#!/usr/bin/env node

/**
 * Development server for Hylo Travel AI API endpoints
 *
 * This server simulates the Vercel Edge Runtime environment for local development
 * and testing of API contracts before deployment.
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.text());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health System Endpoint Implementation
app.get('/api/health/system', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();

    // Simulate component health checks with expected component names
    const components = [
      {
        id: 'edge_function_001',
        component: 'edge_function',
        status: 'healthy',
        responseTime: 12,
        lastCheck: timestamp,
        dependencies: [],
        version: '1.0.0',
      },
      {
        id: 'llm_provider_001',
        component: 'llm_provider',
        status: 'healthy',
        responseTime: 156,
        lastCheck: timestamp,
        dependencies: ['cerebras', 'gemini', 'groq'],
        version: '2.1.0',
      },
      {
        id: 'frontend_001',
        component: 'frontend',
        status: 'healthy',
        responseTime: 8,
        lastCheck: timestamp,
        dependencies: [],
        version: '1.5.0',
      },
      {
        id: 'system_001',
        component: 'system',
        status: 'healthy',
        responseTime: 5,
        lastCheck: timestamp,
        dependencies: [],
        version: '3.0.0',
      },
    ];

    // Calculate overall status
    const statuses = components.map((c) => c.status);
    const overallStatus = statuses.includes('unhealthy')
      ? 'unhealthy'
      : statuses.includes('degraded')
      ? 'degraded'
      : 'healthy';

    const overall = {
      status: overallStatus,
      availability: 0.98,
      uptime: 99847,
      memoryUsage: {
        used: 234567890,
        total: 512000000,
      },
    };

    const response = {
      success: true,
      timestamp,
      data: {
        status: overallStatus,
        timestamp,
        components,
        overall,
      },
    };

    console.log(`System health check completed - Status: ${overallStatus}`);
    res.json(response);
  } catch (error) {
    console.error('Error in /api/health/system:', error);
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        status: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Health Providers Endpoint Implementation
app.get('/api/health/providers', async (req, res) => {
  try {
    console.log('GET /api/health/providers - Checking provider health status');

    const { provider, depth } = req.query;
    const now = new Date().toISOString();

    // Mock provider data matching contract test expectations
    const generateProviderHealth = (name, baseHealth = 'available') => {
      const responseTime = Math.floor(Math.random() * 200) + 50; // 50-250ms
      const errorRate = Math.random() * 0.1; // 0-10% error rate
      const requestCount = Math.floor(Math.random() * 1000) + 100;

      return {
        name,
        status: baseHealth,
        availability: {
          isAvailable: baseHealth === 'available',
          hasCapacity: baseHealth !== 'unavailable',
          responseTime,
        },
        lastChecked: now,
        metrics: {
          requestCount: {
            last1h: Math.floor(requestCount * 0.1),
            last24h: requestCount,
          },
          errorRate: {
            last1h: errorRate * 0.8,
            last24h: errorRate,
          },
          averageLatency: {
            last1h: responseTime * 1.1,
            last24h: responseTime,
          },
          ...(Math.random() > 0.5 && {
            quotaUsage: {
              current: Math.floor(Math.random() * 80),
              limit: 100,
              resetTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
            },
          }),
          ...(depth === 'detailed' && {
            detailedLatency: {
              p50: responseTime * 0.9,
              p95: responseTime * 1.5,
              p99: responseTime * 2.0,
            },
            errorBreakdown: {
              timeout: Math.floor(errorRate * 0.3 * 100),
              rateLimit: Math.floor(errorRate * 0.2 * 100),
              serverError: Math.floor(errorRate * 0.5 * 100),
            },
          }),
        },
        ...(name === 'cerebras' && {
          fallbackChain: ['gemini', 'groq'],
        }),
        ...(provider === name && {
          detailedMetrics: {
            connectionPool: {
              active: 5,
              idle: 10,
              total: 15,
            },
            throughput: {
              tokensPerSecond: Math.floor(Math.random() * 1000) + 500,
              requestsPerSecond: Math.floor(Math.random() * 50) + 10,
            },
          },
        }),
      };
    };

    const providers = {
      cerebras: generateProviderHealth('cerebras', 'available'),
      gemini: generateProviderHealth('gemini', Math.random() > 0.8 ? 'degraded' : 'available'),
      groq: generateProviderHealth('groq', Math.random() > 0.9 ? 'unavailable' : 'available'),
    };

    // Calculate summary
    const summary = {
      total: 3,
      available: Object.values(providers).filter((p) => p.status === 'available').length,
      degraded: Object.values(providers).filter((p) => p.status === 'degraded').length,
      unavailable: Object.values(providers).filter((p) => p.status === 'unavailable').length,
    };

    const response = {
      success: true,
      timestamp: now,
      data: {
        providers,
        summary,
        timestamp: now,
        ...(provider && { requestedProvider: provider }),
        ...(depth && { depth }),
      },
    };

    // Add cache control headers for health status
    const maxAge = Math.floor(Math.random() * 59) + 1; // 1-59 seconds
    res.set({
      'Cache-Control': `public, max-age=${maxAge}`,
      ETag: `"${Buffer.from(JSON.stringify(response.data)).toString('base64').slice(0, 16)}"`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, If-None-Match',
    });

    // Handle conditional requests
    const ifNoneMatch = req.get('If-None-Match');
    const currentETag = res.get('ETag');
    if (ifNoneMatch === currentETag) {
      return res.status(304).end();
    }

    console.log(
      `Providers health check completed - Available: ${summary.available}, Degraded: ${summary.degraded}, Unavailable: ${summary.unavailable}`
    );
    res.json(response);
  } catch (error) {
    console.error('Error in /api/health/providers:', error);
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        status: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Monitoring Errors Endpoint Implementation
app.get('/api/monitoring/errors', async (req, res) => {
  try {
    console.log('GET /api/monitoring/errors - Fetching error monitoring data');

    const { level, component, start, end, page = 1, limit = 50, stream } = req.query;
    const now = new Date().toISOString();

    // Handle streaming requests
    if (stream === 'true') {
      res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      // Mock streaming response
      res.write('data: {"type":"connected","timestamp":"' + now + '"}\n\n');

      // Send periodic error updates
      const interval = setInterval(() => {
        const mockError = {
          type: 'error',
          data: {
            id: `error_${Date.now()}`,
            timestamp: new Date().toISOString(),
            level: 'error',
            component: 'llm',
            message: 'Mock streaming error for demo',
            context: { requestId: `req_${Date.now()}` },
          },
        };
        res.write(`data: ${JSON.stringify(mockError)}\n\n`);
      }, 5000);

      // Clean up after 30 seconds
      setTimeout(() => {
        clearInterval(interval);
        res.end();
      }, 30000);

      return;
    }

    // Generate mock error data
    const generateMockError = (id, level, component) => {
      const baseTime = Date.now() - Math.random() * 24 * 60 * 60 * 1000; // Last 24 hours
      return {
        id: `error_${id}`,
        timestamp: new Date(baseTime).toISOString(),
        level,
        component,
        message: `Mock ${level} error in ${component} component`,
        context: {
          requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
          traceId: `trace_${Math.random().toString(36).substr(2, 12)}`,
          userAgent: 'Mozilla/5.0 (Test Browser)',
          path: '/api/test',
          method: 'GET',
        },
        stack:
          level === 'critical' || level === 'error'
            ? 'Error: Mock error\n    at mockFunction (file.js:10:5)\n    at anotherFunction (file.js:20:10)'
            : undefined,
      };
    };

    // Create mock error dataset
    const allErrors = [];
    const levels = ['critical', 'error', 'warning', 'info'];
    const components = ['llm', 'routing', 'auth', 'frontend', 'system'];

    for (let i = 0; i < 100; i++) {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const component = components[Math.floor(Math.random() * components.length)];
      allErrors.push(generateMockError(i, level, component));
    }

    // Apply filters
    let filteredErrors = allErrors;

    if (level) {
      filteredErrors = filteredErrors.filter((error) => error.level === level);
    }

    if (component) {
      filteredErrors = filteredErrors.filter((error) => error.component === component);
    }

    if (start && end) {
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      filteredErrors = filteredErrors.filter((error) => {
        const errorTime = new Date(error.timestamp).getTime();
        return errorTime >= startTime && errorTime <= endTime;
      });
    }

    // Sort by timestamp (newest first)
    filteredErrors.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const totalErrors = filteredErrors.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    const paginatedErrors = filteredErrors.slice(offset, offset + limitNum);

    // Sanitize errors for security
    const sanitizedErrors = paginatedErrors.map((error) => ({
      ...error,
      message: error.message.replace(/api[_-]?key|token|password|secret/gi, '[REDACTED]'),
      stack: error.stack ? error.stack.substring(0, 1500) : undefined,
      context: {
        ...error.context,
        headers: undefined, // Remove headers to avoid leaking auth info
      },
    }));

    // Calculate summary statistics
    const summary = {
      total: totalErrors,
      byLevel: {
        critical: allErrors.filter((e) => e.level === 'critical').length,
        error: allErrors.filter((e) => e.level === 'error').length,
        warning: allErrors.filter((e) => e.level === 'warning').length,
        info: allErrors.filter((e) => e.level === 'info').length,
      },
      byComponent: {
        llm: allErrors.filter((e) => e.component === 'llm').length,
        routing: allErrors.filter((e) => e.component === 'routing').length,
        auth: allErrors.filter((e) => e.component === 'auth').length,
        frontend: allErrors.filter((e) => e.component === 'frontend').length,
        system: allErrors.filter((e) => e.component === 'system').length,
      },
      recentTrends: {
        last1h: {
          count: Math.floor(Math.random() * 20),
          percentageChange: (Math.random() - 0.5) * 100, // -50% to +50%
        },
        last24h: {
          count: Math.floor(Math.random() * 100),
          percentageChange: (Math.random() - 0.5) * 80,
        },
        last7d: {
          count: Math.floor(Math.random() * 500),
          percentageChange: (Math.random() - 0.5) * 60,
        },
      },
    };

    // Determine time range
    const timeRange = {
      start: start || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      end: end || now,
      period: start && end ? 'custom' : '24h',
    };

    const response = {
      success: true,
      timestamp: now,
      data: {
        errors: sanitizedErrors,
        summary,
        timeRange,
        timestamp: now,
        ...(level || component
          ? {
              filters: {
                ...(level && { level }),
                ...(component && { component }),
              },
            }
          : {}),
        ...(page && limit
          ? {
              pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalErrors,
                totalPages: Math.ceil(totalErrors / limitNum),
              },
            }
          : {}),
      },
    };

    // Add cache control headers for error monitoring
    const maxAge = Math.floor(Math.random() * 99) + 1; // 1-99 seconds
    res.set({
      'Cache-Control': `public, max-age=${maxAge}`,
      ETag: `"${Buffer.from(JSON.stringify(response.data)).toString('base64').slice(0, 16)}"`,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });

    console.log(
      `Error monitoring completed - Total errors: ${totalErrors}, Filters: ${JSON.stringify({
        level,
        component,
      })}`
    );
    res.json(response);
  } catch (error) {
    console.error('Error in /api/monitoring/errors:', error);
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        status: 500,
        timestamp: new Date().toISOString(),
      },
    });
  }
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} not found`,
      status: 404,
      timestamp: new Date().toISOString(),
    },
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      status: 500,
      timestamp: new Date().toISOString(),
    },
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Hylo API Development Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API endpoints: http://localhost:${PORT}/api/*`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  GET /api/health/system - System health check ✅');
  console.log('  GET /api/health/providers - LLM provider status ✅');
  console.log('  GET /api/monitoring/errors - Error monitoring ✅');
  console.log('');
});
