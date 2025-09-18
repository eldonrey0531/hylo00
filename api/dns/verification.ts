/**
 * DNS Verification API Endpoints
 * 
 * Standalone Edge Function with zero external dependencies except Zod
 * Constitutional compliance: Edge-first architecture, no Node.js dependencies
 */

import { z } from 'zod';

export const config = { runtime: 'edge' };

// DNS Verification Request Schema
const DNSVerificationRequestSchema = z.object({
  domain: z.string().min(1).max(253),
  expectedIP: z.string().ip().optional(),
  recordType: z.enum(['A', 'AAAA', 'CNAME']),
  timeout: z.number().int().min(60000).max(1800000),
  retryInterval: z.number().int().min(10000).max(300000),
  maxRetries: z.number().int().min(1).max(100),
});

// DNS Response Schemas
const DNSVerificationInitiatedSchema = z.object({
  verificationId: z.string(),
  status: z.literal('pending'),
  estimatedCompletion: z.string(),
});

const DNSVerificationResponseSchema = z.object({
  domain: z.string(),
  verified: z.boolean(),
  recordType: z.enum(['A', 'AAAA', 'CNAME']),
  resolvedValue: z.string().nullable(),
  propagationTime: z.number(),
  attempts: z.number(),
  timestamp: z.string(),
  error: z.string().optional(),
});

// Types
type DNSRequest = z.infer<typeof DNSVerificationRequestSchema>;
type DNSResponse = z.infer<typeof DNSVerificationResponseSchema>;

// Simple DNS resolver using Cloudflare DNS over HTTPS
class EdgeDNSResolver {
  private readonly baseUrl = 'https://cloudflare-dns.com/dns-query';

  async resolve(domain: string, recordType: 'A' | 'AAAA' | 'CNAME'): Promise<string[]> {
    const params = new URLSearchParams({
      name: domain,
      type: recordType,
      ct: 'application/dns-json',
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: { Accept: 'application/dns-json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`DNS query failed: ${response.status}`);
    }

    const data = await response.json() as {
      Status: number;
      Answer?: Array<{ data: string }>;
    };

    if (data.Status !== 0) {
      throw new Error(`DNS resolution failed with status: ${data.Status}`);
    }

    return data.Answer?.map(answer => answer.data) || [];
  }
}

// DNS service
class DNSVerificationService {
  private resolver = new EdgeDNSResolver();

  async verifyNow(request: unknown): Promise<DNSResponse> {
    const validated = DNSVerificationRequestSchema.parse(request);
    
    try {
      const resolvedValues = await this.resolver.resolve(validated.domain, validated.recordType);
      
      if (resolvedValues.length === 0) {
        return {
          domain: validated.domain,
          verified: false,
          recordType: validated.recordType,
          resolvedValue: null,
          propagationTime: 0,
          attempts: 1,
          timestamp: new Date().toISOString(),
          error: 'No DNS records found',
        };
      }

      const resolvedValue = resolvedValues[0];
      const verified = validated.expectedIP ? resolvedValue === validated.expectedIP : true;

      return {
        domain: validated.domain,
        verified,
        recordType: validated.recordType,
        resolvedValue,
        propagationTime: 0,
        attempts: 1,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        domain: validated.domain,
        verified: false,
        recordType: validated.recordType,
        resolvedValue: null,
        propagationTime: 0,
        attempts: 1,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

const dnsService = new DNSVerificationService();

// Utility functions
function createCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function createJsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...createCorsHeaders(),
      'Content-Type': 'application/json',
    },
  });
}

// Main handler
export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: createCorsHeaders() });
  }

  try {
    const url = new URL(req.url);
    
    if (req.method === 'POST' && url.pathname.endsWith('/verify-now')) {
      const body = await req.json();
      const result = await dnsService.verifyNow(body);
      return createJsonResponse(result);
    }

    return createJsonResponse({ error: 'Not found' }, 404);
  } catch (error) {
    return createJsonResponse({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
}
