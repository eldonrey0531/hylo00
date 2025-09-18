/**
 * Vercel Deployment Hook for DNS Readiness Check
 *
 * This deployment hook ensures DNS infrastructure is ready before
 * the deployment goes live, preventing DNS-related downtime.
 */

import { dnsVerificationService } from '../../src/api/services/dnsVerificationService';
import { enhancedProviderStatusService } from '../../src/api/services/enhancedProviderStatusService';

// =============================================================================
// Deployment Configuration
// =============================================================================

interface DeploymentContext {
  deploymentId: string;
  branch: string;
  environment: 'preview' | 'production';
  domain: string;
  customDomains: string[];
}

interface DNSReadinessResult {
  ready: boolean;
  checks: {
    primaryDomain: boolean;
    customDomains: boolean;
    providerStatus: boolean;
  };
  errors: string[];
  warnings: string[];
}

// =============================================================================
// DNS Readiness Checker
// =============================================================================

export class DNSReadinessChecker {
  async checkDeploymentReadiness(context: DeploymentContext): Promise<DNSReadinessResult> {
    console.log(`Starting DNS readiness check for deployment ${context.deploymentId}`);

    const result: DNSReadinessResult = {
      ready: false,
      checks: {
        primaryDomain: false,
        customDomains: false,
        providerStatus: false,
      },
      errors: [],
      warnings: [],
    };

    try {
      // Check primary domain DNS readiness
      result.checks.primaryDomain = await this.checkPrimaryDomain(context.domain);

      // Check custom domains if any
      if (context.customDomains.length > 0) {
        result.checks.customDomains = await this.checkCustomDomains(context.customDomains);
      } else {
        result.checks.customDomains = true; // No custom domains to check
      }

      // Check provider status infrastructure
      result.checks.providerStatus = await this.checkProviderStatusInfrastructure();

      // Determine overall readiness
      result.ready =
        result.checks.primaryDomain && result.checks.customDomains && result.checks.providerStatus;

      if (result.ready) {
        console.log('✅ DNS readiness check passed - deployment can proceed');
      } else {
        console.log('❌ DNS readiness check failed - deployment should be delayed');
        console.log('Failed checks:', result.checks);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`DNS readiness check failed: ${errorMessage}`);
      console.error('DNS readiness check error:', error);
      return result;
    }
  }

  private async checkPrimaryDomain(domain: string): Promise<boolean> {
    try {
      console.log(`Checking primary domain: ${domain}`);

      const verificationResult = await dnsVerificationService.verifyNow({
        domain,
        recordType: 'A',
        timeout: 30000, // 30 seconds for deployment check
        retryInterval: 5000, // 5 seconds
        maxRetries: 6,
      });

      if (verificationResult.verified) {
        console.log(`✅ Primary domain ${domain} is ready`);
        return true;
      } else {
        console.log(`❌ Primary domain ${domain} failed verification: ${verificationResult.error}`);
        return false;
      }
    } catch (error) {
      console.error(`Error checking primary domain ${domain}:`, error);
      return false;
    }
  }

  private async checkCustomDomains(customDomains: string[]): Promise<boolean> {
    try {
      console.log(`Checking ${customDomains.length} custom domains`);

      const checks = await Promise.allSettled(
        customDomains.map(async (domain) => {
          const result = await dnsVerificationService.verifyNow({
            domain,
            recordType: 'CNAME',
            timeout: 30000,
            retryInterval: 5000,
            maxRetries: 6,
          });

          if (result.verified) {
            console.log(`✅ Custom domain ${domain} is ready`);
            return true;
          } else {
            console.log(`❌ Custom domain ${domain} failed: ${result.error}`);
            return false;
          }
        })
      );

      const results = checks.map((check) => (check.status === 'fulfilled' ? check.value : false));

      const allPassed = results.every((result) => result === true);

      if (allPassed) {
        console.log('✅ All custom domains are ready');
      } else {
        console.log('❌ Some custom domains failed verification');
      }

      return allPassed;
    } catch (error) {
      console.error('Error checking custom domains:', error);
      return false;
    }
  }

  private async checkProviderStatusInfrastructure(): Promise<boolean> {
    try {
      console.log('Checking provider status infrastructure');

      // Check if enhanced provider status service is healthy
      const providerStatus = await enhancedProviderStatusService.getSimpleStatus();

      // Ensure at least one provider is available
      const availableProviders = Object.entries(providerStatus).filter(
        ([_, status]) => status === 'available'
      );

      if (availableProviders.length > 0) {
        console.log(
          `✅ Provider infrastructure ready - ${availableProviders.length} providers available`
        );
        return true;
      } else {
        console.log('❌ Provider infrastructure not ready - no providers available');
        return false;
      }
    } catch (error) {
      console.error('Error checking provider infrastructure:', error);
      return false;
    }
  }
}

// =============================================================================
// Vercel Build Hook Integration
// =============================================================================

export async function vercelDeploymentHook(): Promise<void> {
  // Only run for production deployments
  if (process.env.VERCEL_ENV !== 'production') {
    console.log('Skipping DNS readiness check for non-production deployment');
    return;
  }

  const context: DeploymentContext = {
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'unknown',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown',
    environment: (process.env.VERCEL_ENV as 'preview' | 'production') || 'preview',
    domain: process.env.VERCEL_URL || 'unknown',
    customDomains: process.env.VERCEL_CUSTOM_DOMAINS?.split(',') || [],
  };

  const checker = new DNSReadinessChecker();
  const result = await checker.checkDeploymentReadiness(context);

  if (!result.ready) {
    // Log detailed failure information
    console.error('DNS readiness check failed:', {
      checks: result.checks,
      errors: result.errors,
      warnings: result.warnings,
    });

    // In production, we might want to fail the deployment
    if (process.env.VERCEL_ENV === 'production') {
      throw new Error(`DNS readiness check failed. Errors: ${result.errors.join(', ')}`);
    }
  }

  console.log('DNS readiness check completed successfully');
}

// Export singleton instance
export const dnsReadinessChecker = new DNSReadinessChecker();
