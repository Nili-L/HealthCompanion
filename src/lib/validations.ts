import { z } from 'zod';

// Common validators
const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
const emailSchema = z.string().email('Invalid email address');
const phoneSchema = z.string().regex(phoneRegex, 'Invalid phone number').or(z.literal(''));

// Profile validation
export const profileSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required').max(100),
  chosenName: z.string().max(100).optional(),
  otherNames: z.string().max(200).optional(),
  pronouns: z.string().max(50).optional(),
  dateOfBirth: z.string().refine((date) => !date || new Date(date) < new Date(), {
    message: 'Date of birth must be in the past'
  }).optional(),
  genderIdentity: z.string().max(100).optional(),
  sexAssignedAtBirth: z.string().max(50).optional(),
  sexualOrientation: z.string().max(100).optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']).optional(),
  height: z.string().max(20).optional(),
  weight: z.string().max(20).optional(),
  allergies: z.string().max(1000).optional(),
  medicalConditions: z.string().max(2000).optional(),
  genderAffirmingCare: z.string().max(1000).optional()
});

// Medication validation
export const medicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required').max(200),
  dosage: z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
  prescriber: z.string().max(200).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  active: z.boolean().optional()
});

// Healthcare provider validation
export const healthcareProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required').max(200),
  specialty: z.string().max(100).optional(),
  clinicName: z.string().max(200).optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  isPrimary: z.boolean().optional()
});

// Emergency contact validation
export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required').max(200),
  relationship: z.string().max(100).optional(),
  phone: phoneSchema,
  email: emailSchema.optional(),
  address: z.string().max(500).optional(),
  priority: z.number().int().min(1).max(10).optional()
});

// Appointment validation
export const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  location: z.string().max(500).optional(),
  type: z.enum(['in-person', 'telehealth', 'phone']).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']).optional(),
  notes: z.string().max(2000).optional()
});

// Lab result validation
export const labResultSchema = z.object({
  testName: z.string().min(1, 'Test name is required').max(200),
  testDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  resultValue: z.string().max(100).optional(),
  unit: z.string().max(50).optional(),
  referenceRange: z.string().max(100).optional(),
  status: z.enum(['normal', 'abnormal', 'critical']).optional(),
  orderingProvider: z.string().max(200).optional(),
  labName: z.string().max(200).optional(),
  notes: z.string().max(1000).optional()
});

// Vital signs validation
export const vitalSignsSchema = z.object({
  recordedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  bloodPressureSystolic: z.number().int().min(40).max(300).optional(),
  bloodPressureDiastolic: z.number().int().min(20).max(200).optional(),
  heartRate: z.number().int().min(20).max(300).optional(),
  temperature: z.number().min(90).max(115).optional(),
  temperatureUnit: z.enum(['C', 'F']).optional(),
  respiratoryRate: z.number().int().min(5).max(60).optional(),
  oxygenSaturation: z.number().int().min(70).max(100).optional(),
  weight: z.number().min(1).max(1000).optional(),
  weightUnit: z.enum(['kg', 'lbs']).optional(),
  notes: z.string().max(1000).optional()
});

// Symptom tracking validation
export const symptomSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  symptom: z.string().min(1, 'Symptom description is required').max(200),
  severity: z.number().int().min(1).max(10),
  duration: z.string().max(100).optional(),
  triggers: z.string().max(500).optional(),
  notes: z.string().max(1000).optional()
});

// Message validation
export const messageSchema = z.object({
  recipientId: z.string().uuid('Invalid recipient ID'),
  subject: z.string().max(200).optional(),
  body: z.string().min(1, 'Message body is required').max(10000),
  isUrgent: z.boolean().optional(),
  hasAttachments: z.boolean().optional(),
  attachmentMetadata: z.any().optional()
});

// Health goal validation
export const healthGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['physical', 'mental', 'nutrition', 'sleep', 'medication_adherence']).optional(),
  targetValue: z.string().max(100).optional(),
  currentValue: z.string().max(100).optional(),
  targetDate: z.string().optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
  progressPercentage: z.number().int().min(0).max(100).optional()
});

// Insurance policy validation
export const insurancePolicySchema = z.object({
  providerName: z.string().min(1, 'Insurance provider name is required').max(200),
  policyNumber: z.string().max(100).optional(),
  groupNumber: z.string().max(100).optional(),
  coverageType: z.enum(['medical', 'dental', 'vision', 'mental_health']).optional(),
  effectiveDate: z.string().optional(),
  expirationDate: z.string().optional(),
  copay: z.number().min(0).max(10000).optional(),
  deductible: z.number().min(0).max(100000).optional(),
  deductibleMet: z.number().min(0).max(100000).optional(),
  outOfPocketMax: z.number().min(0).max(100000).optional(),
  outOfPocketMet: z.number().min(0).max(100000).optional(),
  notes: z.string().max(1000).optional()
});

// Medical document validation
export const medicalDocumentSchema = z.object({
  title: z.string().min(1, 'Document title is required').max(200),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().max(1000).optional(),
  fileUrl: z.string().url('Invalid file URL').optional(),
  fileType: z.string().max(50).optional(),
  fileSize: z.number().int().min(0).max(100000000).optional(), // 100MB max
  date: z.string().optional(),
  tags: z.array(z.string().max(50)).optional()
});

// Sanitization helper
export function sanitizeString(input: string): string {
  // Remove any potential XSS attacks
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
}

// Validation helper function
export function validateData<T>(schema: z.Schema<T>, data: unknown): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// HIPAA compliant field validation (no PHI in logs)
export function validateWithoutLogging<T>(schema: z.Schema<T>, data: unknown): T {
  return schema.parse(data); // Will throw on validation error without logging sensitive data
}
