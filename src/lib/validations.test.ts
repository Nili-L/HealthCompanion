import { describe, it, expect } from 'vitest';
import {
  profileSchema,
  medicationSchema,
  emergencyContactSchema,
  validateData,
  sanitizeString
} from './validations';

describe('Validation Schemas', () => {
  describe('profileSchema', () => {
    it('should validate a valid profile', () => {
      const validProfile = {
        legalName: 'John Doe',
        chosenName: 'Johnny',
        pronouns: 'he/him',
        dateOfBirth: '1990-01-01',
        bloodType: 'A+',
        height: '180cm',
        weight: '75kg'
      };

      const result = validateData(profileSchema, validProfile);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validProfile);
    });

    it('should reject profile with empty legal name', () => {
      const invalidProfile = {
        legalName: '',
        bloodType: 'A+'
      };

      const result = validateData(profileSchema, invalidProfile);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid blood type', () => {
      const invalidProfile = {
        legalName: 'John Doe',
        bloodType: 'Z+' // Invalid blood type
      };

      const result = validateData(profileSchema, invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject future date of birth', () => {
      const invalidProfile = {
        legalName: 'John Doe',
        dateOfBirth: '2030-01-01' // Future date
      };

      const result = validateData(profileSchema, invalidProfile);
      expect(result.success).toBe(false);
    });
  });

  describe('medicationSchema', () => {
    it('should validate a valid medication', () => {
      const validMed = {
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'Once daily',
        active: true
      };

      const result = validateData(medicationSchema, validMed);
      expect(result.success).toBe(true);
    });

    it('should reject medication without name', () => {
      const invalidMed = {
        dosage: '100mg'
      };

      const result = validateData(medicationSchema, invalidMed);
      expect(result.success).toBe(false);
    });
  });

  describe('emergencyContactSchema', () => {
    it('should validate a valid emergency contact', () => {
      const validContact = {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1-555-1234',
        email: 'jane@example.com'
      };

      const result = validateData(emergencyContactSchema, validContact);
      expect(result.success).toBe(true);
    });

    it('should reject contact with invalid phone', () => {
      const invalidContact = {
        name: 'Jane Doe',
        phone: 'abc123' // Invalid phone
      };

      const result = validateData(emergencyContactSchema, invalidContact);
      expect(result.success).toBe(false);
    });

    it('should reject contact with invalid email', () => {
      const invalidContact = {
        name: 'Jane Doe',
        phone: '+1-555-1234',
        email: 'not-an-email' // Invalid email
      };

      const result = validateData(emergencyContactSchema, invalidContact);
      expect(result.success).toBe(false);
    });
  });
});

describe('sanitizeString', () => {
  it('should remove script tags', () => {
    const malicious = '<script>alert("XSS")</script>Hello';
    const sanitized = sanitizeString(malicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Hello');
  });

  it('should remove iframe tags', () => {
    const malicious = '<iframe src="evil.com"></iframe>Content';
    const sanitized = sanitizeString(malicious);
    expect(sanitized).not.toContain('<iframe>');
    expect(sanitized).toContain('Content');
  });

  it('should remove event handlers', () => {
    const malicious = '<div onclick="alert(1)">Click me</div>';
    const sanitized = sanitizeString(malicious);
    expect(sanitized).not.toContain('onclick');
  });

  it('should trim whitespace', () => {
    const input = '  Hello World  ';
    const sanitized = sanitizeString(input);
    expect(sanitized).toBe('Hello World');
  });

  it('should handle empty strings', () => {
    const sanitized = sanitizeString('');
    expect(sanitized).toBe('');
  });
});
