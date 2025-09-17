// Test setup for Edge Runtime environment
import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';

// Setup MSW for API mocking
export const server = setupServer();

beforeAll(() => {
  // Setup MSW - allow bypass for contract tests (endpoints don't exist yet)
  server.listen({ onUnhandledRequest: 'bypass' });

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

  // Mock window.matchMedia for responsive design tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver for lazy loading components
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock ResizeObserver for responsive components
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
  vi.clearAllMocks();
});
