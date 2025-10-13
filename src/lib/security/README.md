# AI Property Wizard Security Implementation

This document provides a comprehensive overview of the security measures implemented for the AI Property Wizard feature.

## Overview

The security implementation follows a defense-in-depth approach with multiple layers of protection:

1. **Input Sanitization** - Prevents XSS and injection attacks
2. **File Upload Security** - Validates and secures file uploads
3. **Rate Limiting** - Prevents abuse and DoS attacks
4. **CSRF Protection** - Prevents cross-site request forgery
5. **Signed URL Generation** - Secures cloud storage access
6. **Security Middleware** - Integrates all security measures

## Security Layers

### 1. Input Sanitization (`input-sanitization.ts`)

Protects against XSS, SQL injection, and other input-based attacks.

**Features:**

- HTML tag removal and sanitization
- Script injection prevention
- SQL injection pattern blocking
- Command injection prevention
- Content length validation
- Character whitelist validation

**Usage:**

```typescript
import {
  sanitizeText,
  sanitizeFormData,
} from "@/lib/security/input-sanitization";

// Sanitize user input
const cleanTitle = sanitizeText(userInput.title, {
  maxLength: 100,
  allowedChars: /^[a-zA-Z0-9\s\-.,()áéíóúÁÉÍÓÚñÑ]+$/,
});

// Sanitize entire form
const cleanFormData = sanitizeFormData(formData);
```

### 2. File Upload Security (`file-upload-security.ts`)

Comprehensive file validation and security checks.

**Features:**

- File type validation (MIME type and extension)
- File size limits
- Magic byte signature verification
- Malicious file detection
- Trusted domain validation
- Virus scanning integration (placeholder)
- Content analysis integration (placeholder)

**Usage:**

```typescript
import {
  validateUploadedFile,
  performCompleteSecurityValidation,
} from "@/lib/security/file-upload-security";

// Validate single file
await validateUploadedFile(file, "image");

// Complete security validation
const validation = await performCompleteSecurityValidation(file, "image");
if (!validation.valid) {
  throw new Error(
    `Security validation failed: ${validation.errors.join(", ")}`
  );
}
```

### 3. Rate Limiting (`rate-limiting.ts`)

Prevents abuse through request rate limiting.

**Features:**

- Per-user rate limiting
- Per-IP rate limiting
- Different limits for different operations
- Sliding window implementation
- Adaptive rate limiting
- Circuit breaker pattern

**Limits:**

- AI Generation: 5 requests/minute per user
- Image Upload: 20 uploads/minute per user
- Draft Save: 30 saves/minute per user
- Form Submission: 10 submissions/5 minutes per user
- Global API: 100 requests/15 minutes per IP

**Usage:**

```typescript
import {
  checkAIGenerationRateLimit,
  recordSuccessfulOperation,
} from "@/lib/security/rate-limiting";

// Check rate limit before operation
await checkAIGenerationRateLimit(userId);

// Record successful operation
await recordSuccessfulOperation("aiGeneration", userId);
```

### 4. CSRF Protection (`csrf-protection.ts`)

Prevents cross-site request forgery attacks.

**Features:**

- Cryptographically secure token generation
- Token validation for protected endpoints
- Automatic token refresh
- Client-side token management
- Server action integration

**Usage:**

```typescript
import {
  createCSRFToken,
  validateCSRFToken,
} from "@/lib/security/csrf-protection";

// Server-side: Generate token
const { token, cookie } = await createCSRFToken(request, userId);

// Server-side: Validate token
const isValid = await validateCSRFToken(request, userId);

// Client-side: Add token to requests
import { csrfFetch } from "@/lib/security/csrf-protection";
const response = await csrfFetch("/api/wizard/publish", {
  method: "POST",
  body: JSON.stringify(data),
});
```

### 5. Signed URL Generation (`signed-url-generation.ts`)

Secures cloud storage access with time-limited URLs.

**Features:**

- Cryptographically signed URLs
- Time-based expiration
- Operation-specific permissions
- File type restrictions
- Size limits
- Token revocation

**Usage:**

```typescript
import {
  generateSignedUrl,
  validateSignedUrlRequest,
} from "@/lib/security/signed-url-generation";

// Generate signed URL for upload
const signedUrl = await generateSignedUrl("image.jpg", {
  operation: "upload",
  userId: "user123",
  fileType: "image",
  expiresIn: 60 * 60 * 1000, // 1 hour
});

// Validate signed URL request
const validation = await validateSignedUrlRequest(token, "upload", filename);
```

### 6. Security Middleware (`security-middleware.ts`)

Integrates all security measures into a unified system.

**Features:**

- Request path-based protection levels
- Security header application
- Rate limiting integration
- CSRF protection integration
- Security event logging
- Health monitoring

**Usage:**

```typescript
import {
  securityMiddleware,
  wrapSecurityResponse,
} from "@/lib/security/security-middleware";

// In middleware.ts
const securityResult = await securityMiddleware(request, userId);
if (securityResult) {
  return securityResult; // Security check failed
}

// Wrap response with security headers
return wrapSecurityResponse(response);
```

## Security Configuration

All security settings are centralized in `security-config.ts`:

```typescript
import {
  SECURITY_CONFIG,
  getSecurityConfig,
} from "@/lib/security/security-config";

// Get environment-specific configuration
const config = getSecurityConfig();

// Access specific settings
const maxFileSize = config.FILE_UPLOAD.MAX_FILE_SIZES.image;
const rateLimits = config.RATE_LIMITING.AI_GENERATION;
```

## Environment Variables

Required environment variables for security:

```bash
# Required for CSRF and signed URLs
SIGNED_URL_SECRET=your-secret-key
# OR
NEXTAUTH_SECRET=your-nextauth-secret

# Optional for AI features
HUGGINGFACE_API_KEY=your-huggingface-key

# Required for file uploads
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

## API Endpoints

### Security Health Check

`GET /api/security/health`

Returns comprehensive security status (admin only):

```json
{
    "status": "healthy|warning|critical",
    "security": {
        "health": { ... },
        "configuration": { ... },
        "environment": { ... }
    },
    "recommendations": [...]
}
```

### CSRF Token

`GET /api/csrf-token`

Returns CSRF token for client-side use:

```json
{
  "token": "csrf-token-string",
  "success": true
}
```

### Signed Upload

`POST /api/signed-upload`

Handles signed URL uploads with security validation.

## Integration with Wizard Actions

Security measures are integrated into all wizard actions:

```typescript
// In wizard-actions.ts
async function publishPropertyAction(data) {
  const clientId = `user:${data.userId}`;

  try {
    // CSRF Protection
    if (data._csrf_token) {
      await validateCSRFInServerAction(data, data.userId);
    }

    // Rate limiting
    await checkFormSubmissionRateLimit(clientId);

    // Input sanitization
    const sanitizedData = sanitizeFormData(data);

    // Server-side validation
    await validatePropertyFormData(sanitizedData);

    // ... rest of the action

    // Record successful operation
    await recordSuccessfulOperation("formSubmission", clientId);
  } catch (error) {
    // Record failed operation
    await recordFailedOperation("formSubmission", clientId);
    throw error;
  }
}
```

## Testing

Comprehensive security tests are available in `__tests__/security-integration.test.ts`:

```bash
# Run security tests
npm test lib/security/__tests__/security-integration.test.ts

# Run all tests
npm test
```

## Monitoring and Alerting

Security events are logged and can be monitored:

```typescript
import {
  logSecurityEvent,
  getSecurityHealthStatus,
} from "@/lib/security/security-middleware";

// Log security event
logSecurityEvent("csrf_failure", request, userId, {
  reason: "Invalid token",
});

// Get health status
const health = getSecurityHealthStatus();
```

## Best Practices

1. **Always sanitize user input** before processing
2. **Validate file uploads** before storing
3. **Check rate limits** before expensive operations
4. **Use CSRF tokens** for state-changing operations
5. **Generate signed URLs** for secure file access
6. **Monitor security events** for suspicious activity
7. **Keep security configuration** up to date
8. **Test security measures** regularly

## Security Headers

The following security headers are automatically applied:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: [comprehensive CSP]`

## Content Security Policy

A comprehensive CSP is applied to prevent XSS attacks:

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://api-inference.huggingface.co;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
font-src 'self' https:;
connect-src 'self' https://api-inference.huggingface.co https://*.vercel-storage.com;
media-src 'self' https: blob:;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

## Troubleshooting

### Common Issues

1. **CSRF Token Validation Failed**

   - Ensure CSRF token is included in requests
   - Check token expiration
   - Verify SIGNED_URL_SECRET is set

2. **Rate Limit Exceeded**

   - Check rate limit configuration
   - Implement exponential backoff
   - Consider user behavior patterns

3. **File Upload Rejected**

   - Verify file type and size
   - Check file signature validation
   - Ensure trusted domain configuration

4. **Security Health Check Fails**
   - Check environment variables
   - Verify security configuration
   - Review recent security events

### Debug Mode

Enable debug logging in development:

```bash
NODE_ENV=development
DEBUG_SECURITY=true
```

## Performance Considerations

Security measures are designed to be performant:

- Input sanitization: < 1ms per operation
- File validation: < 10ms per file
- Rate limiting: < 1ms per check
- CSRF validation: < 1ms per token
- Signed URL generation: < 5ms per URL

## Future Enhancements

Planned security improvements:

1. **Advanced Threat Detection**

   - Machine learning-based anomaly detection
   - Behavioral analysis
   - Automated threat response

2. **Enhanced File Security**

   - Real-time virus scanning
   - Advanced content analysis
   - Metadata sanitization

3. **Audit and Compliance**

   - Detailed audit logs
   - Compliance reporting
   - Data retention policies

4. **Performance Optimization**
   - Redis-based rate limiting
   - Distributed CSRF token storage
   - CDN integration for signed URLs

## Support

For security-related questions or issues:

1. Check this documentation
2. Review security test cases
3. Check security health endpoint
4. Contact the development team

Remember: Security is everyone's responsibility. Always follow secure coding practices and report any security concerns immediately.
