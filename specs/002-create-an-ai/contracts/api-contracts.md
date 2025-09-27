# API Contracts: AI-Generated Personalized Itinerary

**Date**: 2025-09-27  
**Feature**: AI-Generated Personalized Itinerary  
**Version**: 1.0.0

## Overview

REST API contracts for AI-powered itinerary generation system. All endpoints follow RESTful conventions and return JSON responses with consistent error handling.

## Base Configuration

**Base URL**: `/api`  
**Content-Type**: `application/json`  
**Authentication**: None (static site)  
**Rate Limiting**: Applied per endpoint  

## Core Endpoints

### Generate Itinerary

**Endpoint**: `POST /api/itinerary/generate`  
**Purpose**: Main itinerary generation from form data

**Request Schema**:
```json
{
  "type": "object",
  "required": ["formData", "sessionId"],
  "properties": {
    "formData": {
      "$ref": "#/components/schemas/TripFormData"
    },
    "sessionId": {
      "type": "string",
      "description": "Unique session identifier for tracking",
      "minLength": 1,
      "maxLength": 50
    },
    "options": {
      "type": "object",
      "properties": {
        "enableDetailedLogging": {
          "type": "boolean",
          "default": true
        },
        "priority": {
          "type": "string", 
          "enum": ["normal", "high"],
          "default": "normal"
        }
      }
    }
  }
}
```

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "workflowId": {
      "type": "string",
      "description": "Inngest workflow identifier"
    },
    "estimatedCompletion": {
      "type": "string",
      "format": "date-time",
      "description": "Expected completion time"
    },
    "statusEndpoint": {
      "type": "string", 
      "description": "URL to check generation progress"
    },
    "message": {
      "type": "string"
    }
  },
  "required": ["success", "workflowId", "statusEndpoint"]
}
```

**Error Responses**:
- `400`: Invalid form data or validation errors
- `429`: Rate limit exceeded  
- `500`: Internal server error
- `503`: AI service unavailable

### Check Generation Status

**Endpoint**: `GET /api/itinerary/status/{workflowId}`  
**Purpose**: Monitor itinerary generation progress

**Path Parameters**:
- `workflowId`: String, workflow identifier from generate endpoint

**Response Schema**:
```json
{
  "type": "object", 
  "properties": {
    "status": {
      "type": "string",
      "enum": ["pending", "processing", "complete", "error"]
    },
    "progress": {
      "type": "integer",
      "minimum": 0,
      "maximum": 24,
      "description": "Current processing step (1-24)"
    },
    "currentStep": {
      "type": "string",
      "description": "Description of current processing step"
    },
    "itinerary": {
      "$ref": "#/components/schemas/Itinerary",
      "description": "Complete itinerary (only when status=complete)"
    },
    "error": {
      "type": "string",
      "description": "Error message (only when status=error)"
    },
    "logs": {
      "type": "array",
      "items": {
        "$ref": "#/components/schemas/ConsoleLogEntry"
      },
      "description": "Console log entries for debugging"
    }
  },
  "required": ["status", "progress"]
}
```

### Export PDF

**Endpoint**: `POST /api/itinerary/export/pdf`  
**Purpose**: Generate PDF export of completed itinerary

**Request Schema**:
```json
{
  "type": "object",
  "required": ["itineraryId", "format"],
  "properties": {
    "itineraryId": {
      "type": "string"
    },
    "format": {
      "type": "string", 
      "enum": ["standard", "compact", "detailed"],
      "default": "standard"
    },
    "includeMap": {
      "type": "boolean",
      "default": true
    },
    "includeLogs": {
      "type": "boolean", 
      "default": false
    }
  }
}
```

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "pdfUrl": {
      "type": "string",
      "format": "uri",
      "description": "Temporary URL for PDF download"
    },
    "filename": {
      "type": "string"
    },
    "expiresAt": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["success"]
}
```

### Prepare Email

**Endpoint**: `POST /api/itinerary/email/prepare`  
**Purpose**: Generate email content for browser email client

**Request Schema**:
```json
{
  "type": "object",
  "required": ["itineraryId"],
  "properties": {
    "itineraryId": {
      "type": "string"
    },
    "includeAttachment": {
      "type": "boolean",
      "default": true,
      "description": "Whether to include PDF attachment"
    },
    "customMessage": {
      "type": "string",
      "maxLength": 500,
      "description": "Optional personal message"
    }
  }
}
```

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"  
    },
    "emailData": {
      "type": "object",
      "properties": {
        "subject": {
          "type": "string"
        },
        "body": {
          "type": "string",
          "description": "HTML email body"
        },
        "attachmentUrl": {
          "type": "string",
          "format": "uri",
          "description": "PDF attachment URL (if requested)"
        }
      },
      "required": ["subject", "body"]
    }
  },
  "required": ["success"]
}
```

## Supporting Endpoints

### AI Service Health

**Endpoint**: `GET /api/ai/health`  
**Purpose**: Check AI service availability

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "healthy": {
      "type": "boolean"
    },
    "services": {
      "type": "object", 
      "properties": {
        "groq": {
          "type": "object",
          "properties": {
            "status": {"type": "string"},
            "latency": {"type": "number"}
          }
        },
        "tavily": {
          "type": "object",
          "properties": {
            "status": {"type": "string"},
            "latency": {"type": "number"}
          }
        },
        "exa": {
          "type": "object",
          "properties": {
            "status": {"type": "string"}, 
            "latency": {"type": "number"}
          }
        }
      }
    }
  },
  "required": ["healthy"]
}
```

### Maps Service

**Endpoint**: `GET /api/maps/static`  
**Purpose**: Generate static map image for location

**Query Parameters**:
- `location`: String, location name or coordinates
- `zoom`: Number, zoom level (1-20)
- `size`: String, image dimensions (e.g., "400x300")
- `maptype`: String, map type ("roadmap", "satellite", "terrain")

**Response Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean"
    },
    "imageUrl": {
      "type": "string",
      "format": "uri"
    },
    "cached": {
      "type": "boolean",
      "description": "Whether image was served from cache"
    }
  },
  "required": ["success"]
}
```

## Data Schemas

### TripFormData Schema
```json
{
  "type": "object",
  "required": ["location", "adults", "budget", "currency"],
  "properties": {
    "location": {
      "type": "string",
      "minLength": 1,
      "maxLength": 100
    },
    "departDate": {
      "type": "string",
      "format": "date",
      "nullable": true
    },
    "returnDate": {
      "type": "string", 
      "format": "date",
      "nullable": true
    },
    "flexibleDates": {
      "type": "boolean",
      "default": false
    },
    "plannedDays": {
      "type": "integer",
      "minimum": 1,
      "maximum": 31,
      "nullable": true
    },
    "adults": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10
    },
    "children": {
      "type": "integer",
      "minimum": 0,
      "maximum": 10,
      "default": 0
    },
    "childrenAges": {
      "type": "array",
      "items": {
        "type": "integer",
        "minimum": 0,
        "maximum": 17
      }
    },
    "budget": {
      "type": "number",
      "minimum": 0,
      "maximum": 10000
    },
    "currency": {
      "type": "string",
      "enum": ["USD", "EUR", "GBP", "CAD", "AUD"]
    },
    "budgetMode": {
      "type": "string",
      "enum": ["total", "per-person"],
      "default": "total"
    },
    "flexibleBudget": {
      "type": "boolean", 
      "default": false
    },
    "selectedGroups": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "customGroupText": {
      "type": "string",
      "maxLength": 200,
      "nullable": true
    },
    "selectedInterests": {
      "type": "array", 
      "items": {
        "type": "string"
      }
    },
    "customInterestsText": {
      "type": "string",
      "maxLength": 200,
      "nullable": true
    },
    "selectedInclusions": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "customInclusionsText": {
      "type": "string",
      "maxLength": 200, 
      "nullable": true
    },
    "inclusionPreferences": {
      "type": "object",
      "additionalProperties": true
    },
    "travelStyleAnswers": {
      "type": "object",
      "additionalProperties": true
    },
    "contactInfo": {
      "$ref": "#/components/schemas/ContactInfo"
    }
  }
}
```

### Itinerary Schema
```json
{
  "type": "object",
  "required": ["id", "tripNickname", "generatedAt", "status", "tripSummary", "keyDetails", "dailyItinerary", "travelTips"],
  "properties": {
    "id": {
      "type": "string"
    },
    "tripNickname": {
      "type": "string",
      "minLength": 3,
      "maxLength": 100
    },
    "generatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "processing", "complete", "error"]
    },
    "tripSummary": {
      "$ref": "#/components/schemas/TripSummary"
    },
    "keyDetails": {
      "$ref": "#/components/schemas/KeyDetails"
    },
    "mapImageUrl": {
      "type": "string",
      "format": "uri"
    },
    "dailyItinerary": {
      "type": "array",
      "minItems": 1,
      "maxItems": 31,
      "items": {
        "$ref": "#/components/schemas/DailyActivity"
      }
    },
    "travelTips": {
      "type": "array",
      "minItems": 3,
      "maxItems": 20,
      "items": {
        "$ref": "#/components/schemas/TravelTip"
      }
    },
    "metadata": {
      "$ref": "#/components/schemas/ItineraryMetadata"
    }
  }
}
```

### ConsoleLogEntry Schema
```json
{
  "type": "object",
  "required": ["stepNumber", "action", "fileName", "functionName", "timestamp", "status"],
  "properties": {
    "stepNumber": {
      "type": "integer",
      "minimum": 1,
      "maximum": 24
    },
    "action": {
      "type": "string",
      "maxLength": 200
    },
    "fileName": {
      "type": "string",
      "maxLength": 100
    },
    "functionName": {
      "type": "string",
      "maxLength": 100
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "data": {
      "type": "object",
      "additionalProperties": true
    },
    "duration": {
      "type": "number",
      "minimum": 0,
      "nullable": true,
      "description": "Processing time in milliseconds"
    },
    "status": {
      "type": "string",
      "enum": ["Success", "Error", "Warning"]
    }
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "type": "object",
  "properties": {
    "success": {
      "type": "boolean",
      "const": false
    },
    "error": {
      "type": "object",
      "properties": {
        "code": {
          "type": "string"
        },
        "message": {
          "type": "string"
        },
        "details": {
          "type": "object",
          "additionalProperties": true
        },
        "timestamp": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": ["code", "message", "timestamp"]
    }
  },
  "required": ["success", "error"]
}
```

### Error Codes
- `VALIDATION_ERROR`: Request validation failed
- `AI_SERVICE_ERROR`: AI service unavailable or failed
- `RATE_LIMIT_ERROR`: Too many requests
- `WORKFLOW_ERROR`: Inngest workflow failed
- `DATA_SOURCE_ERROR`: External data source unavailable
- `EXPORT_ERROR`: PDF generation failed
- `INTERNAL_ERROR`: Unexpected server error

## Rate Limiting

- **Generate Itinerary**: 10 requests per minute per IP
- **Status Check**: 60 requests per minute per IP  
- **Export PDF**: 30 requests per minute per IP
- **Email Prepare**: 20 requests per minute per IP
- **Health Check**: 120 requests per minute per IP

## Caching Strategy

- **Static Maps**: 24 hours cache
- **AI Health Status**: 5 minutes cache  
- **Generated PDFs**: 1 hour temporary storage
- **Email Content**: No caching (dynamic)

## Security Considerations

- Input validation on all endpoints
- Rate limiting to prevent abuse
- No authentication required (static site)
- CORS configured for Vercel domain
- Sanitization of user-provided content
- Temporary URL expiration for exports

## Testing Requirements

Each endpoint requires:
1. **Contract Test**: Validates request/response schemas
2. **Integration Test**: End-to-end functionality  
3. **Error Test**: Error condition handling
4. **Performance Test**: Response time validation

Contract tests must be generated and must fail initially (no implementation exists yet).

## API Versioning

- Version 1.0.0: Initial implementation
- Future versions: Semantic versioning
- Backward compatibility for minor versions
- Migration guides for breaking changes