// src/utils/test-helpers.tsx
import { beforeAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global test setup
beforeAll(() => {
  // Any global setup can go here
});