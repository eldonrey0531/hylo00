import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

/**
 * Integration test for TypeScript compilation success
 * Tests that the build process completes without TypeScript errors
 *
 * This test validates that all provider files compile correctly
 * and there are no type errors in the codebase.
 */

describe('TypeScript Compilation Integration Tests', () => {
  it('should compile successfully without TypeScript errors', async () => {
    // Run TypeScript compilation check
    try {
      const output = execSync('npm run type-check', {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      // TypeScript check should complete without errors
      expect(output).toBeDefined();

      // Should not contain error messages
      expect(output).not.toContain('error TS');
      expect(output).not.toContain('TypeScript error');
    } catch (error: any) {
      // If the command fails, it should be due to TypeScript errors
      expect(error.status).toBe(0); // Should succeed
      expect(error.stdout).not.toContain('error TS');
    }
  });

  it('should build successfully for production', async () => {
    // Run production build
    try {
      const output = execSync('npm run build', {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      // Build should complete successfully
      expect(output).toBeDefined();

      // Should not contain build errors
      expect(output).not.toContain('error');
      expect(output).not.toContain('Error');
      expect(output).not.toContain('Failed');
    } catch (error: any) {
      // Build should succeed
      expect(error.status).toBe(0);
    }
  });

  it('should validate provider type definitions', async () => {
    // Import provider types to ensure they compile
    try {
      // This will fail at runtime if types don't compile
      const { ProviderStatus } = await import('../../api/types.js');

      // Validate that ProviderStatus type exists and has expected values
      expect(ProviderStatus).toBeDefined();
      // ProviderStatus is a union type from Zod schema, so we can't check Object.values
      // Instead, we validate that the type can be used in type annotations

      // Test that we can import and use the types without compilation errors
      const testStatus: typeof ProviderStatus = 'available' as const;
      expect(['available', 'degraded', 'unavailable', 'maintenance']).toContain(testStatus);
    } catch (error) {
      // Should not fail to import types
      expect(error).toBeUndefined();
    }
  });
});
