// Test script for Edge Functions compatibility
// Simulates the Vercel Edge Runtime environment

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mock Edge Runtime globals
global.Request = class MockRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
    this._body = options.body;
  }

  async json() {
    return JSON.parse(this._body);
  }

  async text() {
    return this._body;
  }
};

global.Response = class MockResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.headers = new Map(Object.entries(options.headers || {}));
    this.ok = this.status >= 200 && this.status < 300;
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }
};

// Test Edge Function endpoints
async function testEdgeFunction(functionPath, request) {
  try {
    console.log(`\n🧪 Testing ${functionPath}...`);

    // Import the Edge Function
    const moduleUrl = `file://${join(__dirname, functionPath)}`;
    const module = await import(moduleUrl);
    const handler = module.default;

    // Call the handler
    const response = await handler(request);

    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Headers:`, Object.fromEntries(response.headers));

    const responseText = await response.text();
    console.log(
      `📋 Response:`,
      responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
    );

    return response;
  } catch (error) {
    console.error(`❌ Error testing ${functionPath}:`, error.message);
    throw error;
  }
}

async function runTests() {
  console.log('🚀 Testing Edge Functions Compatibility\n');

  try {
    // Test health endpoint
    const healthRequest = new global.Request('http://localhost/api/llm/health', {
      method: 'GET',
    });

    await testEdgeFunction('./api/llm/health.js', healthRequest);

    // Test route endpoint
    const routeRequest = new global.Request('http://localhost/api/llm/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Test query for edge function',
        options: { maxTokens: 100 },
        metadata: { complexity: 'low', agentId: 1, agentName: 'TestAgent' },
      }),
    });

    await testEdgeFunction('./api/llm/route.js', routeRequest);

    console.log('\n✅ All Edge Functions tests passed!');
  } catch (error) {
    console.error('\n❌ Edge Functions test failed:', error.message);
    process.exit(1);
  }
}

runTests();
