// HIPAA-compliant audit logging
// Logs access to PHI without logging the PHI itself

interface AuditLogEntry {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'unauthorized';
  metadata?: Record<string, any>; // Non-PHI metadata only
}

const AUDIT_LOG_ENABLED = import.meta.env.VITE_ENABLE_AUDIT_LOGGING !== 'false';

/**
 * Log an audit event for HIPAA compliance
 * IMPORTANT: Never pass PHI in this function
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  if (!AUDIT_LOG_ENABLED) {
    return;
  }

  const auditEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };

  try {
    // In production, this should send to a secure audit log service
    // For now, we'll use Supabase's logging capabilities

    if (import.meta.env.DEV) {
      console.log('[AUDIT]', {
        ...auditEntry,
        // Sanitize metadata to ensure no PHI
        metadata: sanitizeMetadata(auditEntry.metadata)
      });
    }

    // TODO: Send to Supabase audit_logs table
    // await supabase.from('audit_logs').insert(auditEntry);

  } catch (error) {
    // Critical: audit logging failure should not break the app
    // but should be monitored separately
    console.error('[AUDIT ERROR]', 'Failed to log audit event', {
      action: entry.action,
      resourceType: entry.resourceType,
      status: entry.status
    });
  }
}

/**
 * Remove any potential PHI from metadata
 */
function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
  if (!metadata) return undefined;

  const sanitized: Record<string, any> = {};
  const allowedKeys = ['count', 'page', 'limit', 'type', 'category', 'status'];

  for (const key of Object.keys(metadata)) {
    if (allowedKeys.includes(key)) {
      sanitized[key] = metadata[key];
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * Audit action types
 */
export const AuditAction = {
  // Authentication
  LOGIN: 'user.login',
  LOGOUT: 'user.logout',
  LOGIN_FAILED: 'user.login.failed',
  SESSION_TIMEOUT: 'user.session.timeout',

  // Profile & PHI Access
  PROFILE_VIEW: 'profile.view',
  PROFILE_UPDATE: 'profile.update',
  HEALTH_HISTORY_VIEW: 'health_history.view',
  HEALTH_HISTORY_UPDATE: 'health_history.update',

  // Medical Records
  MEDICATION_VIEW: 'medication.view',
  MEDICATION_CREATE: 'medication.create',
  MEDICATION_UPDATE: 'medication.update',
  MEDICATION_DELETE: 'medication.delete',

  LAB_RESULT_VIEW: 'lab_result.view',
  LAB_RESULT_CREATE: 'lab_result.create',
  LAB_RESULT_DOWNLOAD: 'lab_result.download',

  VITAL_SIGNS_VIEW: 'vital_signs.view',
  VITAL_SIGNS_CREATE: 'vital_signs.create',

  DOCUMENT_VIEW: 'document.view',
  DOCUMENT_UPLOAD: 'document.upload',
  DOCUMENT_DOWNLOAD: 'document.download',
  DOCUMENT_DELETE: 'document.delete',

  // Appointments
  APPOINTMENT_VIEW: 'appointment.view',
  APPOINTMENT_CREATE: 'appointment.create',
  APPOINTMENT_UPDATE: 'appointment.update',
  APPOINTMENT_CANCEL: 'appointment.cancel',

  // Messages
  MESSAGE_VIEW: 'message.view',
  MESSAGE_SEND: 'message.send',
  MESSAGE_READ: 'message.read',

  // Exports & Reports
  DATA_EXPORT: 'data.export',
  REPORT_GENERATE: 'report.generate',
  REPORT_DOWNLOAD: 'report.download',

  // Administrative
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  PERMISSION_GRANT: 'permission.grant',
  PERMISSION_REVOKE: 'permission.revoke',

  // Security
  PASSWORD_CHANGE: 'security.password_change',
  MFA_ENABLE: 'security.mfa_enable',
  MFA_DISABLE: 'security.mfa_disable',
  UNAUTHORIZED_ACCESS: 'security.unauthorized_access'
} as const;

/**
 * Resource types for audit logging
 */
export const ResourceType = {
  PROFILE: 'profile',
  HEALTH_HISTORY: 'health_history',
  MEDICATION: 'medication',
  PROVIDER: 'provider',
  EMERGENCY_CONTACT: 'emergency_contact',
  APPOINTMENT: 'appointment',
  LAB_RESULT: 'lab_result',
  VITAL_SIGNS: 'vital_signs',
  SYMPTOM: 'symptom',
  MESSAGE: 'message',
  DOCUMENT: 'document',
  INSURANCE: 'insurance',
  BILLING: 'billing',
  HEALTH_GOAL: 'health_goal',
  USER: 'user'
} as const;

/**
 * Convenience functions for common audit events
 */
export const audit = {
  async login(userId: string, success: boolean) {
    return logAuditEvent({
      userId,
      action: success ? AuditAction.LOGIN : AuditAction.LOGIN_FAILED,
      resourceType: ResourceType.USER,
      resourceId: userId,
      status: success ? 'success' : 'failure'
    });
  },

  async logout(userId: string) {
    return logAuditEvent({
      userId,
      action: AuditAction.LOGOUT,
      resourceType: ResourceType.USER,
      resourceId: userId,
      status: 'success'
    });
  },

  async accessPHI(userId: string, resourceType: string, resourceId: string) {
    return logAuditEvent({
      userId,
      action: `${resourceType}.view`,
      resourceType,
      resourceId,
      status: 'success'
    });
  },

  async modifyPHI(userId: string, resourceType: string, resourceId: string, action: 'create' | 'update' | 'delete') {
    return logAuditEvent({
      userId,
      action: `${resourceType}.${action}`,
      resourceType,
      resourceId,
      status: 'success'
    });
  },

  async downloadData(userId: string, resourceType: string, format: string) {
    return logAuditEvent({
      userId,
      action: AuditAction.DATA_EXPORT,
      resourceType,
      status: 'success',
      metadata: { format }
    });
  },

  async unauthorizedAccess(userId: string, resourceType: string, resourceId?: string) {
    return logAuditEvent({
      userId,
      action: AuditAction.UNAUTHORIZED_ACCESS,
      resourceType,
      resourceId,
      status: 'unauthorized'
    });
  }
};

/**
 * Get browser/client information for audit logs
 * Does not include PHI
 */
export function getClientInfo() {
  return {
    userAgent: navigator.userAgent,
    // IP address should be captured server-side
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
