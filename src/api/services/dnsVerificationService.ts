/**
 * DNS Verification Service
 *
 * Provides DNS propagation monitoring and verification functionality
 * for deployment monitoring and custom domain setup.
 */

import {
  DNSVerificationResponse,
  DNSVerificationRecord,
  ValidatedDNSVerificationRequest,
  DNSVerificationRequestSchema,
} from '../types/dns';

// Simple ID generator for edge runtime
function createId(): string {
  return `dns_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// =============================================================================
// DNS Resolution Interface
// =============================================================================

interface DNSResolver {
  resolve(domain: string, recordType: 'A' | 'AAAA' | 'CNAME'): Promise<string[]>;
}

// =============================================================================
// Edge Runtime DNS Resolver
// =============================================================================

class EdgeDNSResolver implements DNSResolver {
  private readonly baseUrl = 'https://cloudflare-dns.com/dns-query';

  async resolve(domain: string, recordType: 'A' | 'AAAA' | 'CNAME'): Promise<string[]> {
    const params = new URLSearchParams({
      name: domain,
      type: recordType,
      ct: 'application/dns-json',
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: {
        Accept: 'application/dns-json',
      },
    });

    if (!response.ok) {
      throw new Error(`DNS query failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      Status: number;
      Answer?: Array<{ data: string }>;
    };

    if (data.Status !== 0) {
      throw new Error(`DNS resolution failed with status: ${data.Status}`);
    }

    return data.Answer?.map((answer) => answer.data) || [];
  }
}

// =============================================================================
// In-Memory Storage for Verification Records
// =============================================================================

class DNSVerificationStorage {
  private readonly records = new Map<string, DNSVerificationRecord>();
  private readonly maxRecords = 1000;
  private readonly cleanupInterval = 300000; // 5 minutes

  constructor() {
    // Periodic cleanup of expired records
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  store(record: DNSVerificationRecord): void {
    // Cleanup if we're at capacity
    if (this.records.size >= this.maxRecords) {
      this.cleanup();
    }

    this.records.set(record.verificationId, record);
  }

  get(verificationId: string): DNSVerificationRecord | undefined {
    const record = this.records.get(verificationId);

    // Check if record is expired
    if (record && Date.now() > record.expiresAt) {
      this.records.delete(verificationId);
      return undefined;
    }

    return record;
  }

  update(verificationId: string, updates: Partial<DNSVerificationRecord>): void {
    const existing = this.records.get(verificationId);
    if (existing) {
      this.records.set(verificationId, {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      });
    }
  }

  list(): DNSVerificationRecord[] {
    const now = Date.now();
    const validRecords: DNSVerificationRecord[] = [];

    for (const [id, record] of this.records) {
      if (now <= record.expiresAt) {
        validRecords.push(record);
      } else {
        this.records.delete(id);
      }
    }

    return validRecords;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, record] of this.records) {
      if (now > record.expiresAt) {
        this.records.delete(id);
      }
    }
  }
}

// =============================================================================
// DNS Verification Service Implementation
// =============================================================================

export class DNSVerificationService {
  private readonly resolver: DNSResolver;
  private readonly storage: DNSVerificationStorage;
  private readonly activeVerifications = new Map<string, Promise<DNSVerificationResponse>>();

  constructor(resolver?: DNSResolver) {
    this.resolver = resolver || new EdgeDNSResolver();
    this.storage = new DNSVerificationStorage();
  }

  /**
   * Start DNS verification for a domain
   */
  async startVerification(
    request: unknown
  ): Promise<{ verificationId: string; estimatedCompletion: string }> {
    // Validate request
    const validatedRequest = this.validateRequest(request);

    const verificationId = createId();
    const now = Date.now();
    const estimatedCompletion = new Date(now + validatedRequest.timeout).toISOString();

    // Store verification record
    const record: DNSVerificationRecord = {
      verificationId,
      request: validatedRequest,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      expiresAt: now + validatedRequest.timeout + 60000, // Add 1 minute buffer
    };

    this.storage.store(record);

    // Start verification process asynchronously
    this.performVerification(verificationId, validatedRequest);

    return {
      verificationId,
      estimatedCompletion,
    };
  }

  /**
   * Get verification status and result
   */
  async getVerificationStatus(verificationId: string): Promise<DNSVerificationRecord | null> {
    return this.storage.get(verificationId) || null;
  }

  /**
   * List all active verifications
   */
  async listVerifications(): Promise<DNSVerificationRecord[]> {
    return this.storage.list();
  }

  /**
   * Verify DNS propagation immediately (synchronous check)
   */
  async verifyNow(request: unknown): Promise<DNSVerificationResponse> {
    const validatedRequest = this.validateRequest(request);
    return this.performSingleVerification(validatedRequest);
  }

  /**
   * Validate and parse DNS verification request
   */
  private validateRequest(request: unknown): ValidatedDNSVerificationRequest {
    const parseResult = DNSVerificationRequestSchema.safeParse(request);

    if (!parseResult.success) {
      throw new Error(`Invalid DNS verification request: ${parseResult.error.message}`);
    }

    return parseResult.data;
  }

  /**
   * Perform verification with retries and timeout handling
   */
  private async performVerification(
    verificationId: string,
    request: ValidatedDNSVerificationRequest
  ): Promise<void> {
    try {
      // Check if already in progress
      if (this.activeVerifications.has(verificationId)) {
        return;
      }

      // Start verification
      const verificationPromise = this.retryVerification(request);
      this.activeVerifications.set(verificationId, verificationPromise);

      // Update status to propagating
      this.storage.update(verificationId, { status: 'propagating' });

      // Wait for result
      const result = await verificationPromise;

      // Update with final result
      this.storage.update(verificationId, {
        status: result.verified ? 'verified' : 'failed',
        result,
      });
    } catch (error) {
      // Handle verification failure
      const errorResult: DNSVerificationResponse = {
        domain: request.domain,
        verified: false,
        recordType: request.recordType,
        resolvedValue: null,
        propagationTime: 0,
        attempts: request.maxRetries,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      this.storage.update(verificationId, {
        status: 'failed',
        result: errorResult,
      });
    } finally {
      // Cleanup active verification
      this.activeVerifications.delete(verificationId);
    }
  }

  /**
   * Perform verification with retry logic
   */
  private async retryVerification(
    request: ValidatedDNSVerificationRequest
  ): Promise<DNSVerificationResponse> {
    const startTime = Date.now();
    let attempts = 0;
    let lastError: Error | null = null;

    while (attempts < request.maxRetries) {
      attempts++;

      try {
        const result = await this.performSingleVerification(request);

        if (result.verified) {
          return {
            ...result,
            propagationTime: Date.now() - startTime,
            attempts,
          };
        }

        // If not verified and we have more attempts, wait and retry
        if (attempts < request.maxRetries) {
          await this.sleep(request.retryInterval);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // If this is our last attempt, don't wait
        if (attempts < request.maxRetries) {
          await this.sleep(request.retryInterval);
        }
      }

      // Check timeout
      if (Date.now() - startTime > request.timeout) {
        break;
      }
    }

    // Return failed result
    return {
      domain: request.domain,
      verified: false,
      recordType: request.recordType,
      resolvedValue: null,
      propagationTime: Date.now() - startTime,
      attempts,
      timestamp: new Date().toISOString(),
      error: lastError?.message || 'DNS verification failed after maximum attempts',
    };
  }

  /**
   * Perform a single DNS verification attempt
   */
  private async performSingleVerification(
    request: ValidatedDNSVerificationRequest
  ): Promise<DNSVerificationResponse> {
    try {
      const resolvedValues = await this.resolver.resolve(request.domain, request.recordType);

      if (resolvedValues.length === 0) {
        return {
          domain: request.domain,
          verified: false,
          recordType: request.recordType,
          resolvedValue: null,
          propagationTime: 0,
          attempts: 1,
          timestamp: new Date().toISOString(),
          error: 'No DNS records found',
        };
      }

      const resolvedValue = resolvedValues[0];
      const verified = request.expectedIP ? resolvedValue === request.expectedIP : true;

      return {
        domain: request.domain,
        verified,
        recordType: request.recordType,
        resolvedValue,
        propagationTime: 0,
        attempts: 1,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(
        `DNS resolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

export const dnsVerificationService = new DNSVerificationService();
