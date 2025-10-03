import { describe, it, expect, vi, beforeEach } from 'vitest';
import { audit, AuditAction, ResourceType, logAuditEvent } from './auditLog';

describe('Audit Logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on console.log to verify audit logs in development
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('logAuditEvent', () => {
    it('should log audit event in development mode', async () => {
      const userId = 'user-123';
      const action = AuditAction.LOGIN;
      const resourceType = ResourceType.USER;

      await logAuditEvent({
        userId,
        action,
        resourceType,
        resourceId: userId,
        status: 'success'
      });

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.objectContaining({
          userId,
          action,
          resourceType,
          status: 'success',
          timestamp: expect.any(String)
        })
      );
    });

    it('should not log PHI in metadata', async () => {
      await logAuditEvent({
        userId: 'user-123',
        action: AuditAction.PROFILE_VIEW,
        resourceType: ResourceType.PROFILE,
        status: 'success',
        metadata: {
          patientName: 'John Doe', // PHI - should be filtered out
          count: 1, // Allowed
          type: 'profile' // Allowed
        }
      });

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.objectContaining({
          metadata: {
            count: 1,
            type: 'profile'
            // patientName should NOT be here
          }
        })
      );
    });

    it('should handle audit logging errors gracefully', async () => {
      // Force an error by passing invalid data
      const invalidAudit: any = null;

      await expect(
        logAuditEvent(invalidAudit)
      ).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('audit convenience functions', () => {
    it('should log successful login', async () => {
      const userId = 'user-456';

      await audit.login(userId, true);

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.objectContaining({
          userId,
          action: AuditAction.LOGIN,
          status: 'success'
        })
      );
    });

    it('should log failed login', async () => {
      const userId = 'user-789';

      await audit.login(userId, false);

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.objectContaining({
          userId,
          action: AuditAction.LOGIN_FAILED,
          status: 'failure'
        })
      );
    });

    it('should log logout', async () => {
      const userId = 'user-999';

      await audit.logout(userId);

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.objectContaining({
          userId,
          action: AuditAction.LOGOUT,
          status: 'success'
        })
      );
    });

    it('should log PHI access', async () => {
      const userId = 'user-111';
      const resourceId = 'profile-222';

      await audit.accessPHI(userId, ResourceType.PROFILE, resourceId);

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.objectContaining({
          userId,
          action: `${ResourceType.PROFILE}.view`,
          resourceType: ResourceType.PROFILE,
          resourceId,
          status: 'success'
        })
      );
    });

    it('should log unauthorized access attempts', async () => {
      const userId = 'user-333';
      const resourceId = 'document-444';

      await audit.unauthorizedAccess(userId, ResourceType.DOCUMENT, resourceId);

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.objectContaining({
          userId,
          action: AuditAction.UNAUTHORIZED_ACCESS,
          resourceType: ResourceType.DOCUMENT,
          resourceId,
          status: 'unauthorized'
        })
      );
    });

    it('should log data modifications', async () => {
      const userId = 'user-555';
      const resourceId = 'medication-666';

      await audit.modifyPHI(userId, ResourceType.MEDICATION, resourceId, 'update');

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.objectContaining({
          userId,
          action: `${ResourceType.MEDICATION}.update`,
          resourceType: ResourceType.MEDICATION,
          resourceId,
          status: 'success'
        })
      );
    });

    it('should log data downloads', async () => {
      const userId = 'user-777';

      await audit.downloadData(userId, ResourceType.DOCUMENT, 'pdf');

      expect(console.log).toHaveBeenCalledWith(
        '[AUDIT]',
        expect.objectContaining({
          userId,
          action: AuditAction.DATA_EXPORT,
          resourceType: ResourceType.DOCUMENT,
          status: 'success',
          metadata: { format: 'pdf' }
        })
      );
    });
  });

  describe('AuditAction constants', () => {
    it('should have expected action types', () => {
      expect(AuditAction.LOGIN).toBe('user.login');
      expect(AuditAction.LOGOUT).toBe('user.logout');
      expect(AuditAction.PROFILE_VIEW).toBe('profile.view');
      expect(AuditAction.MEDICATION_CREATE).toBe('medication.create');
      expect(AuditAction.UNAUTHORIZED_ACCESS).toBe('security.unauthorized_access');
    });
  });

  describe('ResourceType constants', () => {
    it('should have expected resource types', () => {
      expect(ResourceType.PROFILE).toBe('profile');
      expect(ResourceType.MEDICATION).toBe('medication');
      expect(ResourceType.DOCUMENT).toBe('document');
      expect(ResourceType.MESSAGE).toBe('message');
    });
  });
});
