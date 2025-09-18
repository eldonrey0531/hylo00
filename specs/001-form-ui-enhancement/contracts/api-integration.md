# API Integration Contracts

## Overview

This document defines the API contracts and integration requirements for the form UI enhancements, ensuring proper data flow and interaction with existing backend services while maintaining constitutional compliance.

## Form Data API Contracts

### 1. Enhanced Form Submission Contract

```typescript
// Enhanced form data submission interface
interface FormSubmissionAPI {
  // Endpoint configuration
  endpoint: '/api/forms/travel-details';
  method: 'POST';

  // Request interface
  request: {
    headers: {
      'Content-Type': 'application/json';
      'X-Form-Version': '2.0'; // Enhanced version identifier
    };
    body: EnhancedFormDataPayload;
  };

  // Response interface
  response: {
    success: boolean;
    formId: string;
    validationErrors?: ValidationError[];
    timestamp: number;
  };
}

// Enhanced form data payload
interface EnhancedFormDataPayload {
  // Base form data (unchanged)
  location: string;
  departDate: string;
  returnDate: string;
  flexibleDates: boolean;
  plannedDays?: number;
  adults: number;
  children: number;
  childrenAges: number[];
  budget: number;
  currency: Currency;

  // Enhanced form data (new)
  flexibleBudget?: boolean;
  accommodationOther?: string;
  rentalCarPreferences?: string[];
  travelStyleChoice?: TravelStyleChoice;
  travelStyleAnswers?: TravelStyleAnswers;

  // Metadata
  formVersion: '2.0';
  enhancementFlags: string[];
  submissionTimestamp: number;
}
```

### 2. Backward Compatibility Contract

```typescript
// Backward compatibility handler
interface BackwardCompatibilityAPI {
  // Convert enhanced data to legacy format
  convertToLegacy: (enhanced: EnhancedFormDataPayload) => LegacyFormDataPayload;

  // Handle mixed version submissions
  handleSubmission: (data: EnhancedFormDataPayload | LegacyFormDataPayload) => void;

  // Version detection
  detectFormVersion: (payload: any) => '1.0' | '2.0';
}

// Legacy form data structure (preserved)
interface LegacyFormDataPayload {
  location: string;
  departDate: string;
  returnDate: string;
  flexibleDates: boolean;
  plannedDays?: number;
  adults: number;
  children: number;
  childrenAges: number[];
  budget: number;
  currency: Currency;
}
```

### 3. Validation API Contract

```typescript
// Form validation service contract
interface FormValidationAPI {
  // Real-time validation endpoint
  endpoint: '/api/forms/validate';
  method: 'POST';

  // Validation request
  request: {
    field: string;
    value: any;
    context: Partial<EnhancedFormDataPayload>;
  };

  // Validation response
  response: {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    suggestions?: string[];
  };
}

// Validation error structure
interface ValidationError {
  field: string;
  code: string;
  message: string;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, any>;
}
```

## Preference Management API Contracts

### 1. Preference Storage Contract

```typescript
// User preference management
interface PreferenceStorageAPI {
  // Save preferences endpoint
  saveEndpoint: '/api/user/preferences';

  // Load preferences endpoint
  loadEndpoint: '/api/user/preferences';

  // Preference data structure
  data: {
    accommodations?: {
      preferredTypes: string[];
      customRequirements?: string;
    };
    rentalCar?: {
      preferredVehicleTypes: string[];
      additionalRequirements?: string;
    };
    travelStyle?: {
      answeredQuestions: boolean;
      responses: TravelStyleAnswers;
    };
    budget?: {
      preferFlexible: boolean;
      typicalRange: [number, number];
      currency: Currency;
    };
  };
}
```

### 2. Session Storage Contract

```typescript
// Client-side session storage for form state
interface SessionStorageContract {
  // Storage keys
  keys: {
    formData: 'hylo_form_enhanced_data';
    preferences: 'hylo_form_preferences';
    travelStyle: 'hylo_form_travel_style';
    sessionId: 'hylo_form_session_id';
  };

  // Storage operations
  operations: {
    save: (key: string, data: any) => void;
    load: (key: string) => any | null;
    clear: (key: string) => void;
    clearAll: () => void;
  };

  // Auto-save configuration
  autoSave: {
    enabled: boolean;
    debounceMs: 1000;
    maxStorageSize: 1024 * 1024; // 1MB
  };
}
```

## Performance Monitoring API Contracts

### 1. Client-Side Metrics Contract

```typescript
// Client-side performance tracking
interface ClientMetricsAPI {
  // Metrics collection endpoint
  endpoint: '/api/metrics/client';
  method: 'POST';

  // Metrics payload
  request: {
    sessionId: string;
    timestamp: number;
    metrics: PerformanceMetric[];
  };

  // Metrics data structure
  metric: {
    component: string;
    action: string;
    duration: number;
    success: boolean;
    errorMessage?: string;
    userAgent: string;
    viewport: { width: number; height: number };
  };
}

// Performance metric types
type PerformanceMetric = {
  type: 'render' | 'interaction' | 'validation' | 'submission';
  component: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
};
```

### 2. Error Reporting Contract

```typescript
// Client-side error reporting
interface ErrorReportingAPI {
  // Error reporting endpoint
  endpoint: '/api/errors/client';
  method: 'POST';

  // Error report structure
  request: {
    error: {
      message: string;
      stack: string;
      component: string;
      action: string;
      timestamp: number;
    };
    context: {
      formData: Partial<EnhancedFormDataPayload>;
      userAgent: string;
      url: string;
      sessionId: string;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
}
```

## Event Tracking API Contracts

### 1. User Interaction Tracking

```typescript
// User interaction analytics
interface InteractionTrackingAPI {
  // Analytics endpoint
  endpoint: '/api/analytics/interactions';
  method: 'POST';

  // Interaction event structure
  event: {
    type: 'click' | 'input' | 'focus' | 'scroll' | 'submit';
    element: string;
    component: string;
    timestamp: number;
    value?: any;
    metadata: {
      position?: { x: number; y: number };
      duration?: number;
      sequence: number;
    };
  };
}
```

### 2. Form Completion Analytics

```typescript
// Form completion tracking
interface CompletionAnalyticsAPI {
  // Completion tracking endpoint
  endpoint: '/api/analytics/form-completion';
  method: 'POST';

  // Completion data
  data: {
    sessionId: string;
    startTime: number;
    endTime: number;
    completionRate: number;
    abandonedAt?: string;
    enhancementsUsed: string[];
    userSatisfaction?: number;
    errorCount: number;
  };
}
```

## Third-Party Integration Contracts

### 1. Calendar Service Integration

```typescript
// External calendar service (if needed)
interface CalendarServiceAPI {
  // Calendar availability check
  endpoint: '/api/calendar/availability';
  method: 'GET';

  // Request parameters
  params: {
    startDate: string;
    endDate: string;
    location?: string;
  };

  // Response structure
  response: {
    available: boolean;
    pricing?: {
      flights: number;
      hotels: number;
      total: number;
    };
    recommendations?: string[];
  };
}
```

### 2. Location Services Integration

```typescript
// Location validation and suggestions
interface LocationServiceAPI {
  // Location autocomplete
  endpoint: '/api/locations/autocomplete';
  method: 'GET';

  // Request parameters
  params: {
    query: string;
    limit: number;
  };

  // Response structure
  response: {
    suggestions: Array<{
      name: string;
      code: string;
      country: string;
      type: 'city' | 'airport' | 'region';
    }>;
  };
}
```

## Security Contracts

### 1. Data Protection Contract

```typescript
// Data protection requirements
interface DataProtectionAPI {
  // Encryption requirements
  encryption: {
    inTransit: 'TLS 1.3';
    atRest: 'AES-256';
  };

  // PII handling
  piiHandling: {
    anonymization: boolean;
    retention: '30 days';
    deletion: 'automatic';
  };

  // GDPR compliance
  gdprCompliance: {
    consentRequired: boolean;
    rightToErasure: boolean;
    dataPortability: boolean;
  };
}
```

### 2. Input Sanitization Contract

```typescript
// Input sanitization requirements
interface InputSanitizationAPI {
  // Sanitization rules
  rules: {
    textFields: 'strip_html | escape_quotes | limit_length:500';
    dateFields: 'date_format_validation | future_date_check';
    numericFields: 'numeric_only | range_validation';
    selectFields: 'whitelist_validation';
  };

  // Validation patterns
  patterns: {
    dateFormat: /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
    currencyCode: /^[A-Z]{3}$/;
    positiveNumber: /^\d+(\.\d{1,2})?$/;
  };
}
```

## Rate Limiting Contracts

### 1. API Rate Limits

```typescript
// API rate limiting configuration
interface RateLimitingAPI {
  // Rate limit configuration
  limits: {
    formSubmission: '10 requests/minute';
    validation: '60 requests/minute';
    preferences: '30 requests/minute';
    analytics: '120 requests/minute';
  };

  // Rate limit headers
  headers: {
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
    'X-RateLimit-Reset': string;
  };

  // Rate limit exceeded response
  errorResponse: {
    status: 429;
    message: 'Rate limit exceeded';
    retryAfter: number;
  };
}
```

## Constitutional Compliance

### 1. Edge-First Architecture Compliance

```typescript
// Edge function compatibility
interface EdgeCompatibilityAPI {
  // Supported runtime
  runtime: 'edge';

  // Bundle size limits
  bundleSize: {
    max: '1MB';
    warning: '512KB';
  };

  // Cold start requirements
  coldStart: {
    target: '<50ms';
    maximum: '<100ms';
  };

  // Edge-compatible dependencies only
  dependencies: 'edge-compatible-only';
}
```

### 2. Observable Operations Compliance

```typescript
// LangSmith integration requirements
interface ObservabilityAPI {
  // Tracing integration
  tracing: {
    enabled: boolean;
    provider: 'LangSmith';
    sampleRate: 1.0;
  };

  // Logging requirements
  logging: {
    level: 'info';
    structured: boolean;
    includeRequestId: boolean;
  };

  // Monitoring endpoints
  healthCheck: '/api/health/form-enhancements';
}
```

## Migration Strategy Contracts

### 1. Gradual Rollout Contract

```typescript
// Feature flag management
interface FeatureFlagAPI {
  // Feature flag configuration
  flags: {
    enhancedDateInput: boolean;
    budgetSliderSync: boolean;
    preferenceModal: boolean;
    travelStyleProgressive: boolean;
  };

  // Rollout strategy
  rollout: {
    percentage: number;
    userSegments: string[];
    regions: string[];
  };

  // Fallback behavior
  fallback: 'legacy-components';
}
```

### 2. A/B Testing Contract

```typescript
// A/B testing framework
interface ABTestingAPI {
  // Test configuration
  experiments: {
    enhanced_form_ui: {
      variants: ['control', 'enhanced'];
      allocation: [50, 50];
      metrics: ['completion_rate', 'error_rate', 'user_satisfaction'];
    };
  };

  // Results tracking
  tracking: {
    endpoint: '/api/experiments/track';
    events: ['variant_assigned', 'goal_reached', 'experiment_completed'];
  };
}
```
