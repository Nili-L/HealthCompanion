# Security Implementation Guide

This document outlines the security improvements made to the Health Companion application.

## Quick Start

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual Supabase credentials
   ```

2. **Run database migrations**
   ```bash
   # Connect to your Supabase project
   # Go to SQL Editor and run migrations in order:
   # - 001_create_healthcare_schema.sql
   # - 002_create_audit_logs.sql
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Enable HIPAA mode in Supabase**
   - Upgrade to Supabase Pro plan (required for BAA)
   - Request HIPAA BAA from Supabase
   - Enable encryption at rest
   - Configure SSL enforcement

## Security Features

### 1. Environment Variables
All sensitive configuration now uses environment variables:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server only)

**Never commit `.env` files to version control.**

### 2. Database Security

#### Row Level Security (RLS)
All tables have RLS policies ensuring users can only access their own data:

```sql
-- Example policy
CREATE POLICY "Users can view their own data"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);
```

#### Normalized Schema
Replaced KV store pattern with proper normalized tables for:
- Better data integrity
- Improved query performance
- Easier backup and recovery
- HIPAA compliance

### 3. Input Validation

All user input is validated using Zod schemas before processing:

```typescript
import { validateData, medicationSchema } from '@/lib/validations';

const result = validateData(medicationSchema, formData);
if (!result.success) {
  // Handle validation errors
  console.error(result.errors);
  return;
}
// Use validated data
const medication = result.data;
```

Available schemas:
- `profileSchema`
- `medicationSchema`
- `healthcareProviderSchema`
- `emergencyContactSchema`
- `appointmentSchema`
- `labResultSchema`
- `vitalSignsSchema`
- `symptomSchema`
- `messageSchema`
- `healthGoalSchema`
- `insurancePolicySchema`
- `medicalDocumentSchema`

### 4. XSS Prevention

Input sanitization prevents Cross-Site Scripting attacks:

```typescript
import { sanitizeString } from '@/lib/validations';

const safeName = sanitizeString(userInput);
```

For HTML content, use DOMPurify:

```typescript
import DOMPurify from 'dompurify';

const safeHTML = DOMPurify.sanitize(userHTML);
```

### 5. Error Boundaries

React error boundaries catch and handle errors gracefully:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

Features:
- Prevents app crashes
- User-friendly error messages
- No PHI in error logs (HIPAA compliant)
- Automatic error reporting in production

### 6. Audit Logging

HIPAA-compliant audit logging tracks all PHI access:

```typescript
import { audit, AuditAction, ResourceType } from '@/lib/auditLog';

// Log profile view
await audit.accessPHI(
  userId,
  ResourceType.PROFILE,
  profileId
);

// Log data modification
await audit.modifyPHI(
  userId,
  ResourceType.MEDICATION,
  medicationId,
  'update'
);

// Log unauthorized access attempt
await audit.unauthorizedAccess(
  userId,
  ResourceType.DOCUMENT,
  documentId
);
```

**Important**: Never pass PHI to audit functions. Only log metadata (IDs, types, timestamps).

## HIPAA Compliance

See [HIPAA_COMPLIANCE.md](./HIPAA_COMPLIANCE.md) for full details.

### Key Requirements

1. **Encryption**
   - ✅ In transit: HTTPS/TLS
   - ✅ At rest: PostgreSQL encryption
   - ✅ Passwords: bcrypt hashing

2. **Access Controls**
   - ✅ Authentication required
   - ✅ RLS policies enforced
   - ✅ Session timeouts
   - ⚠️ MFA recommended (configure via Supabase)

3. **Audit Logs**
   - ✅ All PHI access logged
   - ✅ 7-year retention
   - ✅ Immutable logs

4. **Business Associates**
   - ⚠️ Obtain BAA from Supabase (Pro plan)
   - ⚠️ Sign BAAs with any other vendors

## Common Security Patterns

### Fetching PHI
```typescript
import { audit, ResourceType } from '@/lib/auditLog';

async function fetchPatientData(userId: string, patientId: string) {
  try {
    // Fetch data
    const response = await fetch(`/api/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      await audit.unauthorizedAccess(userId, ResourceType.PROFILE, patientId);
      throw new Error('Unauthorized access');
    }

    // Log successful access
    await audit.accessPHI(userId, ResourceType.PROFILE, patientId);

    const data = await response.json();
    return data;
  } catch (error) {
    // Log error without PHI
    console.error('Failed to fetch patient data');
    throw error;
  }
}
```

### Form Validation
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { medicationSchema } from '@/lib/validations';

function MedicationForm() {
  const form = useForm({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      dosage: '',
      frequency: ''
    }
  });

  const onSubmit = async (data: z.infer<typeof medicationSchema>) => {
    // Data is automatically validated
    await saveMedication(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### File Upload Security
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/plain'
];

function validateFile(file: File): boolean {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large (max 10MB)');
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // Additional: scan for malware in production
  return true;
}
```

## Security Checklist

### Before Deployment

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] Supabase BAA obtained
- [ ] Audit logging verified
- [ ] Session timeout configured (30 min)
- [ ] HTTPS/SSL enforced
- [ ] Error boundaries in place
- [ ] Input validation on all forms
- [ ] File upload restrictions configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers configured

### Ongoing Maintenance

- [ ] Review audit logs monthly
- [ ] Rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Security audit annually
- [ ] Penetration testing annually
- [ ] Staff HIPAA training annually
- [ ] Review BAAs annually
- [ ] Test backup/recovery quarterly

## Incident Response

If you suspect a security breach:

1. **Immediate** (< 1 hour)
   - Isolate affected systems
   - Preserve evidence
   - Notify Security Officer

2. **Assessment** (< 24 hours)
   - Review audit logs
   - Identify affected data
   - Determine scope

3. **Notification** (< 60 days)
   - Notify affected individuals
   - Report to authorities if required
   - Document incident

## Testing

### Security Testing
```bash
# Install security audit tools
npm install -g snyk
npm install -g npm-audit

# Run security scans
npm audit
snyk test

# Check for vulnerable dependencies
npm audit fix
```

### Penetration Testing
Consider hiring professional penetration testers annually:
- OWASP Top 10 testing
- SQL injection testing
- XSS vulnerability testing
- Authentication bypass attempts
- Authorization testing

## Resources

### Documentation
- [HIPAA Compliance Guide](./HIPAA_COMPLIANCE.md)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Tools
- [Supabase Dashboard](https://app.supabase.com)
- [Snyk](https://snyk.io) - Dependency scanning
- [OWASP ZAP](https://www.zaproxy.org/) - Penetration testing

### Contacts
- Security Officer: [DESIGNATE]
- Privacy Officer: [DESIGNATE]
- Incident Response: [SETUP HOTLINE]

---

**Last Updated:** 2025-10-03
**Version:** 1.0
