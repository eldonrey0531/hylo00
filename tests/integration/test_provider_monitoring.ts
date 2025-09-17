/**
 * Integration Tests: Provider Status Monitoring
 *
 * Tests the complete provider status monitoring workflow including healt      /      statusHistory.forEach(status => {
        const providerNames = status.providers.map(p => p.name).sort((a, b) => a.localeCompare(b));
        expect(providerNames).toEqual(firstProviderNames);
      });ovider names should be consistent
      const firstProviderNames = statusHistory[0]?.providers.map(p => p.name).sort((a, b) => a.localeCompare(b));
      statusHistory.forEach(status => {
        const providerNames = status.providers.map(p => p.name).sort((a, b) => a.localeCompare(b));
        expect(providerNames).toEqual(firstProviderNames);
      });ks,
 * status updates, and monitoring integration. These tests should fail initially
 * as the enhanced provider status service doesn't exist yet.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Test configuration
const API_BASE_URL = process.env['API_BASE_URL'] || 'http://localhost:3000/api';
const PROVIDERS = ['cerebras', 'gemini', 'groq'] as const;
const MAX_RESPONSE_TIME = 1000; // 1 second

type ProviderName = (typeof PROVIDERS)[number];

interface ProviderMonitoringSession {
  startTime: number;
  healthChecks: Array<{
    provider: ProviderName;
    timestamp: number;
    status: string;
    responseTime: number;
    isHealthy: boolean;
  }>;
  summary: {
    totalChecks: number;
    averageResponseTime: number;
    healthyChecks: number;
  };
}

describe('Provider Status Monitoring Integration Tests', () => {
  let monitoringSession: ProviderMonitoringSession;

  beforeAll(async () => {
    monitoringSession = {
      startTime: Date.now(),
      healthChecks: [],
      summary: {
        totalChecks: 0,
        averageResponseTime: 0,
        healthyChecks: 0,
      },
    };

    console.log('Starting provider status monitoring integration tests');
  });

  afterAll(async () => {
    // Calculate summary statistics
    const totalResponseTime = monitoringSession.healthChecks.reduce(
      (sum, check) => sum + check.responseTime,
      0
    );

    monitoringSession.summary = {
      totalChecks: monitoringSession.healthChecks.length,
      averageResponseTime: totalResponseTime / monitoringSession.healthChecks.length || 0,
      healthyChecks: monitoringSession.healthChecks.filter((check) => check.isHealthy).length,
    };

    console.log('Provider monitoring session summary:', monitoringSession.summary);
  });

  describe('Provider Status Summary Monitoring', () => {
    it('should retrieve provider status summary within performance limits', async () => {
      const startTime = Date.now();

      const response = await fetch(`${API_BASE_URL}/providers/status`);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // This test MUST FAIL initially (implementation doesn't exist)
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);

      const data = await response.json();

      // Validate response structure
      expect(data.providers).toBeDefined();
      expect(Array.isArray(data.providers)).toBe(true);
      expect(data.providers).toHaveLength(3);
      expect(data.timestamp).toBeDefined();
      expect(typeof data.healthy).toBe('boolean');

      // Track this health check
      monitoringSession.healthChecks.push({
        provider: 'cerebras', // Summary represents all providers
        timestamp: Date.now(),
        status: data.healthy ? 'healthy' : 'degraded',
        responseTime,
        isHealthy: data.healthy,
      });
    });

    it('should have consistent provider status across multiple requests', async () => {
      const numberOfRequests = 5;
      const interval = 2000; // 2 seconds between requests

      const statusHistory: Array<{
        timestamp: number;
        providers: any[];
        healthy: boolean;
      }> = [];

      for (let i = 0; i < numberOfRequests; i++) {
        const response = await fetch(`${API_BASE_URL}/providers/status`);
        expect(response.status).toBe(200);

        const data = await response.json();
        statusHistory.push({
          timestamp: Date.now(),
          providers: data.providers,
          healthy: data.healthy,
        });

        if (i < numberOfRequests - 1) {
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      }

      // Validate consistency
      expect(statusHistory).toHaveLength(numberOfRequests);

      // All responses should have the same number of providers
      const providerCounts = statusHistory.map((status) => status.providers.length);
      expect(new Set(providerCounts).size).toBe(1);
      expect(providerCounts[0]).toBe(3);

      // Provider names should be consistent
      const firstProviderNames = statusHistory[0]?.providers
        .map((p) => p.name)
        .sort((a, b) => a.localeCompare(b));
      statusHistory.forEach((status) => {
        const providerNames = status.providers
          .map((p) => p.name)
          .sort((a, b) => a.localeCompare(b));
        expect(providerNames).toEqual(firstProviderNames);
      });
    });
  });

  describe('Individual Provider Monitoring', () => {
    PROVIDERS.forEach((provider) => {
      describe(`Provider: ${provider}`, () => {
        it(`should provide detailed status for ${provider}`, async () => {
          const startTime = Date.now();

          const response = await fetch(`${API_BASE_URL}/providers/${provider}/status`);

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          // This test MUST FAIL initially (implementation doesn't exist)
          expect(response.status).toBe(200);
          expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME);

          const data = await response.json();

          // Validate detailed status structure
          expect(data.provider).toBe(provider);
          expect(typeof data.isEnabled).toBe('boolean');
          expect(typeof data.isHealthy).toBe('boolean');
          expect(typeof data.isAvailable).toBe('boolean');
          expect(typeof data.hasCapacity).toBe('boolean');
          expect(Array.isArray(data.keys)).toBe(true);
          expect(typeof data.activeKeyId).toBe('string');
          expect(typeof data.lastHealthCheck).toBe('number');
          expect(typeof data.nextQuotaReset).toBe('number');

          // Validate metrics
          expect(typeof data.metrics.totalRequests).toBe('number');
          expect(typeof data.metrics.successfulRequests).toBe('number');
          expect(typeof data.metrics.failedRequests).toBe('number');
          expect(typeof data.metrics.avgLatency).toBe('number');

          // Validate rate limits
          expect(typeof data.rateLimits.requestsPerMinute).toBe('number');
          expect(typeof data.rateLimits.currentRpm).toBe('number');

          // Track this health check
          monitoringSession.healthChecks.push({
            provider,
            timestamp: Date.now(),
            status: data.isHealthy ? 'healthy' : 'degraded',
            responseTime,
            isHealthy: data.isHealthy,
          });
        });

        it(`should validate key status for ${provider}`, async () => {
          const response = await fetch(`${API_BASE_URL}/providers/${provider}/status`);
          expect(response.status).toBe(200);

          const data = await response.json();

          if (data.keys && data.keys.length > 0) {
            const activeKey = data.keys.find((key: any) => key.keyId === data.activeKeyId);
            expect(activeKey).toBeDefined();
            expect(activeKey?.isActive).toBe(true);

            // Validate key metrics
            data.keys.forEach((key: any) => {
              expect(typeof key.keyId).toBe('string');
              expect(['primary', 'secondary', 'tertiary']).toContain(key.type);
              expect(typeof key.isActive).toBe('boolean');
              expect(typeof key.quotaUsed).toBe('number');
              expect(typeof key.quotaLimit).toBe('number');
              expect(key.quotaUsed).toBeLessThanOrEqual(key.quotaLimit);
              expect(key.successRate).toBeGreaterThanOrEqual(0);
              expect(key.successRate).toBeLessThanOrEqual(1);
            });
          }
        });

        it(`should track health check timing for ${provider}`, async () => {
          const response = await fetch(`${API_BASE_URL}/providers/${provider}/status`);
          expect(response.status).toBe(200);

          const data = await response.json();
          const currentTime = Date.now();

          // Health check timestamp should be recent (within last 5 minutes)
          const timeSinceLastCheck = currentTime - data.lastHealthCheck;
          expect(timeSinceLastCheck).toBeLessThan(5 * 60 * 1000);

          // Next quota reset should be in the future
          expect(data.nextQuotaReset).toBeGreaterThan(currentTime);
        });
      });
    });
  });

  describe('Health Check Monitoring Workflow', () => {
    it('should perform continuous health monitoring', async () => {
      const monitoringDuration = 60000; // 1 minute
      const checkInterval = 10000; // 10 seconds
      const startTime = Date.now();

      const healthCheckResults: Array<{
        timestamp: number;
        allHealthy: boolean;
        responseTime: number;
        providerDetails: Record<ProviderName, boolean>;
      }> = [];

      while (Date.now() - startTime < monitoringDuration) {
        const checkStartTime = Date.now();

        // Check overall status
        const summaryResponse = await fetch(`${API_BASE_URL}/providers/status`);
        expect(summaryResponse.status).toBe(200);

        const summaryData = await summaryResponse.json();

        // Check individual providers
        const providerDetails: Record<ProviderName, boolean> = {} as Record<ProviderName, boolean>;

        for (const provider of PROVIDERS) {
          const providerResponse = await fetch(`${API_BASE_URL}/providers/${provider}/status`);
          expect(providerResponse.status).toBe(200);

          const providerData = await providerResponse.json();
          providerDetails[provider] = providerData.isHealthy;
        }

        const checkEndTime = Date.now();
        const responseTime = checkEndTime - checkStartTime;

        healthCheckResults.push({
          timestamp: checkStartTime,
          allHealthy: summaryData.healthy,
          responseTime,
          providerDetails,
        });

        console.log(
          `Health check completed in ${responseTime}ms, all healthy: ${summaryData.healthy}`
        );

        // Wait for next check interval
        const remainingTime = checkInterval - responseTime;
        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }
      }

      // Validate monitoring results
      expect(healthCheckResults.length).toBeGreaterThan(3); // At least 4 checks in 1 minute

      // All checks should complete within acceptable time
      healthCheckResults.forEach((result) => {
        expect(result.responseTime).toBeLessThan(MAX_RESPONSE_TIME * 2);
      });

      // Calculate uptime percentage
      const healthyChecks = healthCheckResults.filter((result) => result.allHealthy).length;
      const uptimePercentage = (healthyChecks / healthCheckResults.length) * 100;

      console.log(`Health monitoring completed: ${uptimePercentage.toFixed(2)}% uptime`);

      // Update monitoring session
      monitoringSession.healthChecks.push(
        ...healthCheckResults.map((result) => ({
          provider: 'cerebras' as ProviderName, // Representative
          timestamp: result.timestamp,
          status: result.allHealthy ? 'healthy' : 'degraded',
          responseTime: result.responseTime,
          isHealthy: result.allHealthy,
        }))
      );
    });

    it('should detect and report provider status changes', async () => {
      // Collect baseline status
      const baselineResponse = await fetch(`${API_BASE_URL}/providers/status`);
      expect(baselineResponse.status).toBe(200);

      const baselineData = await baselineResponse.json();
      const baselineStatus = baselineData.providers.reduce(
        (acc: Record<string, string>, provider: any) => {
          acc[provider.name] = provider.status;
          return acc;
        },
        {}
      );

      // Monitor for changes over 30 seconds
      const monitoringPeriod = 30000;
      const checkInterval = 5000;
      const startTime = Date.now();

      const statusChanges: Array<{
        timestamp: number;
        provider: string;
        oldStatus: string;
        newStatus: string;
      }> = [];

      let previousStatus = { ...baselineStatus };

      while (Date.now() - startTime < monitoringPeriod) {
        const response = await fetch(`${API_BASE_URL}/providers/status`);
        expect(response.status).toBe(200);

        const data = await response.json();
        const currentStatus = data.providers.reduce(
          (acc: Record<string, string>, provider: any) => {
            acc[provider.name] = provider.status;
            return acc;
          },
          {}
        );

        // Check for status changes
        Object.keys(currentStatus).forEach((providerName) => {
          if (previousStatus[providerName] !== currentStatus[providerName]) {
            statusChanges.push({
              timestamp: Date.now(),
              provider: providerName,
              oldStatus: previousStatus[providerName] || 'unknown',
              newStatus: currentStatus[providerName] || 'unknown',
            });
          }
        });

        previousStatus = { ...currentStatus };

        await new Promise((resolve) => setTimeout(resolve, checkInterval));
      }

      // Log any detected changes
      if (statusChanges.length > 0) {
        console.log('Detected provider status changes:', statusChanges);
      } else {
        console.log('No provider status changes detected during monitoring period');
      }

      // Status changes should be properly tracked
      expect(
        statusChanges.every(
          (change) =>
            ['available', 'degraded', 'unavailable', 'maintenance'].includes(change.oldStatus) &&
            ['available', 'degraded', 'unavailable', 'maintenance'].includes(change.newStatus)
        )
      ).toBe(true);
    });
  });

  describe('Monitoring Performance Validation', () => {
    it('should maintain acceptable response times under load', async () => {
      const concurrentRequests = 10;
      const requestRounds = 3;

      const performanceResults: number[] = [];

      for (let round = 0; round < requestRounds; round++) {
        const roundStartTime = Date.now();

        const requests = Array.from({ length: concurrentRequests }, () =>
          fetch(`${API_BASE_URL}/providers/status`)
        );

        const responses = await Promise.all(requests);

        const roundEndTime = Date.now();
        const roundTime = roundEndTime - roundStartTime;

        // All requests should succeed
        responses.forEach((response) => {
          expect(response.status).toBe(200);
        });

        performanceResults.push(roundTime);
        console.log(
          `Load test round ${round + 1}: ${concurrentRequests} requests in ${roundTime}ms`
        );

        // Brief pause between rounds
        if (round < requestRounds - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Validate performance consistency
      const averageTime =
        performanceResults.reduce((sum, time) => sum + time, 0) / performanceResults.length;
      const maxTime = Math.max(...performanceResults);

      expect(averageTime).toBeLessThan(MAX_RESPONSE_TIME * 2);
      expect(maxTime).toBeLessThan(MAX_RESPONSE_TIME * 3);

      console.log(`Load test completed: avg ${averageTime.toFixed(2)}ms, max ${maxTime}ms`);
    });
  });
});
