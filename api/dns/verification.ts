/**
 * DNS Verification API Endpoints
 *
 * Edge function endpoints for DNS propagation monitoring and verification.
 * Provides REST API for starting, checking, and managing DNS verifications.
 *
 * Constitutional compliance: Edge-first architecture, no Node.js dependencies
 */

import { z } from 'zod';

// =============================================================================
// DNS VERIFICATION SCHEMAS (inline to avoid transitive imports)
// =============================================================================

const DNSVerificationRequestSchema = z.object({
  domain: z.string().min(1).max(253),
  expectedIP: z.string().ip().optional(),
  recordType: z.enum(['A', 'AAAA', 'CNAME']),
  timeout: z.number().int().min(60000).max(1800000),
  retryInterval: z.number().int().min(10000).max(300000),
  maxRetries: z.number().int().min(1).max(100),
});

const DNSVerificationInitiatedSchema = z.object({
  verificationId: z.string().uuid(),
  status: z.literal('pending'),
  estimatedCompletion: z.string().datetime(),
});

const DNSVerificationResponseSchema = z.object({
  domain: z.string(),
  verified: z.boolean(),
  recordType: z.enum(['A', 'AAAA', 'CNAME']),
  resolvedValue: z.string().nullable(),
  propagationTime: z.number(),
  attempts: z.number(),
  timestamp: z.string().datetime(),
  error: z.string().optional(),
});

const DNSVerificationRecordSchema = z.object({
  verificationId: z.string().uuid(),
  request: DNSVerificationRequestSchema,
  status: z.enum(['pending', 'propagating', 'verified', 'failed']),
  createdAt: z.number(),
  updatedAt: z.number(),
  expiresAt: z.number(),
  result: DNSVerificationResponseSchema.optional(),
});

// =============================================================================
// EDGE-COMPATIBLE DNS RESOLVER
// =============================================================================

class EdgeDNSResolver {
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
// IN-MEMORY STORAGE FOR VERIFICATION RECORDS
// =============================================================================

class DNSVerificationStorage {
  private readonly records = new Map<string, z.infer<typeof DNSVerificationRecordSchema>>();
  private readonly maxRecords = 1000;
  private readonly cleanupInterval = 300000; // 5 minutes

  constructor() {
    // Periodic cleanup of expired records
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  store(record: z.infer<typeof DNSVerificationRecordSchema>): void {
    // Cleanup if we're at capacity
    if (this.records.size >= this.maxRecords) {
      this.cleanup();
    }

    this.records.set(record.verificationId, record);
  }

  get(verificationId: string): z.infer<typeof DNSVerificationRecordSchema> | undefined {
    const record = this.records.get(verificationId);

    // Check if record is expired
    if (record && Date.now() > record.expiresAt) {
      this.records.delete(verificationId);
      return undefined;
    }

    return record;
  }

  update(
    verificationId: string,
    updates: Partial<z.infer<typeof DNSVerificationRecordSchema>>
  ): void {
    const existing = this.records.get(verificationId);
    if (existing) {
      this.records.set(verificationId, {
        ...existing,
        ...updates,
        updatedAt: Date.now(),
      });
    }
  }

  list(): z.infer<typeof DNSVerificationRecordSchema>[] {
    const now = Date.now();
    const validRecords: z.infer<typeof DNSVerificationRecordSchema>[] = [];

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
// DNS VERIFICATION SERVICE (inline to avoid transitive imports)
// =============================================================================

class DNSVerificationService {
  private readonly resolver: EdgeDNSResolver;
  private readonly storage: DNSVerificationStorage;
  private readonly activeVerifications = new Map<
    string,
    Promise<z.infer<typeof DNSVerificationResponseSchema>>
  >();

  constructor() {
    this.resolver = new EdgeDNSResolver();
    this.storage = new DNSVerificationStorage();
  }

  async startVerification(
    request: unknown
  ): Promise<{ verificationId: string; estimatedCompletion: string }> {
    const validatedRequest = this.validateRequest(request);

    const verificationId = `dns_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const now = Date.now();
    const estimatedCompletion = new Date(now + validatedRequest.timeout).toISOString();

    const record: z.infer<typeof DNSVerificationRecordSchema> = {
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

  async getVerificationStatus(
    verificationId: string
  ): Promise<z.infer<typeof DNSVerificationRecordSchema> | null> {
    return this.storage.get(verificationId) || null;
  }

  async listVerifications(): Promise<z.infer<typeof DNSVerificationRecordSchema>[]> {
    return this.storage.list();
  }

  async verifyNow(request: unknown): Promise<z.infer<typeof DNSVerificationResponseSchema>> {
    const validatedRequest = this.validateRequest(request);
    return this.performSingleVerification(validatedRequest);
  }

  private validateRequest(request: unknown): z.infer<typeof DNSVerificationRequestSchema> {
    const parseResult = DNSVerificationRequestSchema.safeParse(request);

    if (!parseResult.success) {
      throw new Error(`Invalid DNS verification request: ${parseResult.error.message}`);
    }

    return parseResult.data;
  }

  private async performVerification(
    verificationId: string,
    request: z.infer<typeof DNSVerificationRequestSchema>
  ): Promise<void> {
    try {
      if (this.activeVerifications.has(verificationId)) {
        return;
      }

      const verificationPromise = this.retryVerification(request);
      this.activeVerifications.set(verificationId, verificationPromise);

      this.storage.update(verificationId, { status: 'propagating' });

      const result = await verificationPromise;

      this.storage.update(verificationId, {
        status: result.verified ? 'verified' : 'failed',
        result,
      });
    } catch (error) {
      const errorResult: z.infer<typeof DNSVerificationResponseSchema> = {
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
      this.activeVerifications.delete(verificationId);
    }
  }

  private async retryVerification(
    request: z.infer<typeof DNSVerificationRequestSchema>
  ): Promise<z.infer<typeof DNSVerificationResponseSchema>> {
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

        if (attempts < request.maxRetries) {
          await this.sleep(request.retryInterval);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempts < request.maxRetries) {
          await this.sleep(request.retryInterval);
        }
      }
    }

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

  private async performSingleVerification(
    request: z.infer<typeof DNSVerificationRequestSchema>
  ): Promise<z.infer<typeof DNSVerificationResponseSchema>> {
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

const dnsVerificationService = new DNSVerificationService();

// =============================================================================
// API HANDLERS
// =============================================================================

export const config = { runtime: 'edge' };

/**
 * Handle DNS verification requests
 */
export default async function handler(req: Request): Promise<Response> {
  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Route based on path and method
    if (req.method === 'POST' && pathname.endsWith('/verify')) {
      return await handleStartVerification(req, corsHeaders);
    }

    if (req.method === 'POST' && pathname.endsWith('/verify-now')) {
      return await handleVerifyNow(req, corsHeaders);
    }

    if (req.method === 'GET' && pathname.includes('/status/')) {
      return await handleGetStatus(req, corsHeaders);
    }

    if (req.method === 'GET' && pathname.endsWith('/list')) {
      return await handleListVerifications(req, corsHeaders);
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('DNS verification API error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Start DNS verification process
 */
async function handleStartVerification(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body = await req.json();

    // Validate request body
    const parseResult = DNSVerificationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body',
          details: parseResult.error.errors,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Start verification
    const result = await dnsVerificationService.startVerification(parseResult.data);

    // Validate response
    const validatedResponse = DNSVerificationInitiatedSchema.parse({
      verificationId: result.verificationId,
      status: 'pending' as const,
      estimatedCompletion: result.estimatedCompletion,
    });

    return new Response(JSON.stringify(validatedResponse), {
      status: 202, // Accepted
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to start verification',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Perform immediate DNS verification
 */
async function handleVerifyNow(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const body = await req.json();

    // Validate request body
    const parseResult = DNSVerificationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request body',
          details: parseResult.error.errors,
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Perform immediate verification
    const result = await dnsVerificationService.verifyNow(parseResult.data);

    // Validate response
    const validatedResponse = DNSVerificationResponseSchema.parse(result);

    return new Response(JSON.stringify(validatedResponse), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Verification failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Get verification status by ID
 */
async function handleGetStatus(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const verificationId = pathParts[pathParts.length - 1];

    if (!verificationId) {
      return new Response(JSON.stringify({ error: 'Verification ID is required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    const record = await dnsVerificationService.getVerificationStatus(verificationId);

    if (!record) {
      return new Response(JSON.stringify({ error: 'Verification not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify(record), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to get verification status',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * List all active verifications
 */
async function handleListVerifications(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const verifications = await dnsVerificationService.listVerifications();

    return new Response(
      JSON.stringify({
        verifications,
        count: verifications.length,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to list verifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
