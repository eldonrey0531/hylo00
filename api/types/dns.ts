/**
 * DNS Verification Models and Types
 *
 * This file defines TypeScript interfaces and Zod schemas for DNS verification
 * functionality, ensuring type safety for DNS propagation monitoring.
 */

import { z } from 'zod';

// =============================================================================
// DNS Verification Request Types
// =============================================================================

export interface DNSVerificationRequest {
  readonly domain: string;
  readonly expectedIP?: string;
  readonly recordType: 'A' | 'AAAA' | 'CNAME';
  readonly timeout: number; // milliseconds
  readonly retryInterval: number; // milliseconds
  readonly maxRetries: number;
}

export const DNSVerificationRequestSchema = z.object({
  domain: z.string().min(1).max(253), // Valid domain length
  expectedIP: z.string().ip().optional(),
  recordType: z.enum(['A', 'AAAA', 'CNAME']),
  timeout: z.number().int().min(60000).max(1800000), // 1 minute to 30 minutes
  retryInterval: z.number().int().min(10000).max(300000), // 10 seconds to 5 minutes
  maxRetries: z.number().int().min(1).max(100),
});

// =============================================================================
// DNS Verification Response Types
// =============================================================================

export interface DNSVerificationInitiated {
  readonly verificationId: string;
  readonly status: 'pending';
  readonly estimatedCompletion: string; // ISO datetime
}

export const DNSVerificationInitiatedSchema = z.object({
  verificationId: z.string().uuid(),
  status: z.literal('pending'),
  estimatedCompletion: z.string().datetime(),
});

export interface DNSVerificationResponse {
  readonly domain: string;
  readonly verified: boolean;
  readonly recordType: string;
  readonly resolvedValue: string | null;
  readonly propagationTime: number; // milliseconds
  readonly attempts: number;
  readonly timestamp: string; // ISO datetime
  readonly error?: string;
}

export const DNSVerificationResponseSchema = z.object({
  domain: z.string(),
  verified: z.boolean(),
  recordType: z.enum(['A', 'AAAA', 'CNAME']),
  resolvedValue: z.string().nullable(),
  propagationTime: z.number(),
  attempts: z.number(),
  timestamp: z.string().datetime(),
  error: z.string().optional(),
});

// =============================================================================
// DNS Propagation Status Types
// =============================================================================

export type DNSPropagationStatus = 'pending' | 'propagating' | 'verified' | 'failed' | 'timeout';

export interface DNSPropagationEvent {
  readonly id: string;
  readonly domain: string;
  readonly status: DNSPropagationStatus;
  readonly timestamp: string;
  readonly metadata: {
    readonly deploymentId: string;
    readonly branch: string;
    readonly environment: 'preview' | 'production';
  };
}

export const DNSPropagationEventSchema = z.object({
  id: z.string().uuid(),
  domain: z.string().min(1),
  status: z.enum(['pending', 'propagating', 'verified', 'failed', 'timeout']),
  timestamp: z.string().datetime(),
  metadata: z.object({
    deploymentId: z.string(),
    branch: z.string(),
    environment: z.enum(['preview', 'production']),
  }),
});

// =============================================================================
// DNS Cache and Storage Types
// =============================================================================

export interface DNSVerificationRecord {
  readonly verificationId: string;
  readonly request: DNSVerificationRequest;
  readonly status: DNSPropagationStatus;
  readonly result?: DNSVerificationResponse;
  readonly createdAt: number; // timestamp
  readonly updatedAt: number; // timestamp
  readonly expiresAt: number; // timestamp
}

export interface DNSCacheEntry {
  readonly domain: string;
  readonly recordType: string;
  readonly resolvedValue: string | null;
  readonly verified: boolean;
  readonly cachedAt: number; // timestamp
  readonly ttl: number; // seconds
}

// =============================================================================
// Error Types
// =============================================================================

export interface DNSError {
  readonly code:
    | 'TIMEOUT'
    | 'NXDOMAIN'
    | 'SERVFAIL'
    | 'REFUSED'
    | 'NETWORK_ERROR'
    | 'INVALID_DOMAIN';
  readonly message: string;
  readonly domain: string;
  readonly recordType: string;
  readonly timestamp: string;
  readonly details?: Record<string, unknown>;
}

export const DNSErrorSchema = z.object({
  code: z.enum(['TIMEOUT', 'NXDOMAIN', 'SERVFAIL', 'REFUSED', 'NETWORK_ERROR', 'INVALID_DOMAIN']),
  message: z.string(),
  domain: z.string(),
  recordType: z.string(),
  timestamp: z.string().datetime(),
  details: z.record(z.unknown()).optional(),
});

// =============================================================================
// Utility Types
// =============================================================================

export type ValidatedDNSVerificationRequest = z.infer<typeof DNSVerificationRequestSchema>;
export type ValidatedDNSVerificationResponse = z.infer<typeof DNSVerificationResponseSchema>;
export type ValidatedDNSPropagationEvent = z.infer<typeof DNSPropagationEventSchema>;
export type ValidatedDNSError = z.infer<typeof DNSErrorSchema>;

// =============================================================================
// Type Guards
// =============================================================================

export function isDNSVerificationRequest(obj: unknown): obj is DNSVerificationRequest {
  return DNSVerificationRequestSchema.safeParse(obj).success;
}

export function isDNSVerificationResponse(obj: unknown): obj is DNSVerificationResponse {
  return DNSVerificationResponseSchema.safeParse(obj).success;
}

export function isDNSPropagationEvent(obj: unknown): obj is DNSPropagationEvent {
  return DNSPropagationEventSchema.safeParse(obj).success;
}

export function isDNSError(obj: unknown): obj is DNSError {
  return DNSErrorSchema.safeParse(obj).success;
}

// =============================================================================
// Constants
// =============================================================================

export const DNS_DEFAULTS = {
  timeout: 300000, // 5 minutes
  retryInterval: 30000, // 30 seconds
  maxRetries: 10,
  cacheTimeout: 300, // 5 minutes
  maxConcurrentVerifications: 5,
} as const;

export const DNS_RECORD_TYPES = ['A', 'AAAA', 'CNAME'] as const;

export const DNS_ERROR_CODES = [
  'TIMEOUT',
  'NXDOMAIN',
  'SERVFAIL',
  'REFUSED',
  'NETWORK_ERROR',
  'INVALID_DOMAIN',
] as const;
