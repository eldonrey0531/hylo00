// Test setup for Edge Runtime environment
import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables for testing
beforeAll(() => {
  // Mock Edge Runtime globals
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
  global.fetch = fetch;

  // Mock environment variables
  process.env.TEST_MODE = 'true';
  process.env.CEREBRAS_API_KEY_1 = 'test_cerebras_key_1';
  process.env.GOOGLE_API_KEY_1 = 'test_google_key_1';
  process.env.GROQ_API_KEY_1 = 'test_groq_key_1';
  process.env.LANGCHAIN_TRACING_V2 = 'false';
  process.env.ENABLE_FALLBACK_CHAINS = 'true';
  process.env.MAX_FALLBACK_ATTEMPTS = '3';
  process.env.HEALTH_CHECK_INTERVAL_MS = '30000';
  process.env.PROVIDER_TIMEOUT_MS = '10000';
});

afterAll(() => {
  vi.clearAllMocks();
});
