import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

/**
 * Integration test for Vercel deployment success
 * Tests that the deployment process completes without function limit errors
 *
 * This test validates that the application can be deployed to Vercel
 * within the Hobby plan limits (12 serverless functions max).
 */

describe('Vercel Deployment Integration Tests', () => {
  it('should validate vercel.json function count is within limits', async () => {
    // Read vercel.json and count functions
    const fs = await import('fs');
    const path = await import('path');

    const vercelJsonPath = path.join(process.cwd(), 'vercel.json');

    try {
      const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
      const functionCount = Object.keys(vercelJson.functions || {}).length;

      // Vercel Hobby plan allows maximum 12 functions
      expect(functionCount).toBeLessThanOrEqual(12);
      expect(functionCount).toBeGreaterThan(0);

      console.log(`✅ Vercel function count: ${functionCount}/12 (within limits)`);
    } catch (error) {
      // Should be able to read and parse vercel.json
      expect(error).toBeUndefined();
    }
  });

  it('should validate all function runtimes are edge', async () => {
    // Ensure all functions use edge runtime
    const fs = await import('fs');
    const path = await import('path');

    const vercelJsonPath = path.join(process.cwd(), 'vercel.json');

    try {
      const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));

      for (const [, config] of Object.entries(vercelJson.functions || {})) {
        expect((config as any).runtime).toBe('edge');
      }

      console.log('✅ All functions use edge runtime');
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });

  it('should validate deployment configuration is valid', async () => {
    // Test that vercel.json is valid JSON and has required fields
    const fs = await import('fs');
    const path = await import('path');

    const vercelJsonPath = path.join(process.cwd(), 'vercel.json');

    try {
      const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));

      // Required fields for Vercel deployment
      expect(vercelJson).toHaveProperty('functions');
      expect(vercelJson).toHaveProperty('env');
      expect(vercelJson).toHaveProperty('regions');
      expect(vercelJson).toHaveProperty('framework');

      // Validate regions
      expect(vercelJson.regions).toContain('iad1');
      expect(vercelJson.regions).toContain('sfo1');

      console.log('✅ Vercel configuration is valid');
    } catch (error) {
      expect(error).toBeUndefined();
    }
  });

  it('should simulate deployment dry-run', async () => {
    // Test that Vercel CLI can validate the project without actual deployment
    try {
      // This would normally require Vercel CLI and authentication
      // For now, just validate that the build process works
      const output = execSync('npm run build', {
        encoding: 'utf8',
        cwd: process.cwd(),
      });

      expect(output).toBeDefined();
      expect(output).not.toContain('error');
      expect(output).not.toContain('Error');

      console.log('✅ Build process successful (deployment prerequisite)');
    } catch (error: any) {
      // Build should succeed for deployment
      expect(error.status).toBe(0);
    }
  });
});
