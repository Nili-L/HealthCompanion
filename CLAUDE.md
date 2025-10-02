# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Healthcare portal application with dual interfaces (patient and provider) built with React, Vite, Supabase, and shadcn/ui components. Originally derived from a Figma wireframe design.

## Development Commands

- `npm i` - Install dependencies
- `npm run dev` - Start development server (runs on port 3000, opens browser automatically)
- `npm run build` - Build for production (outputs to `build/` directory)

## Architecture

### Frontend Structure

**Entry Point**: `src/main.tsx` → `src/App.tsx`

**Authentication Flow**:
- `App.tsx` manages auth state and role-based routing
- Session checking on mount, stores `accessToken` and `role` ('patient' | 'provider')
- Renders `AuthForm` for unauthenticated users, `HealthcareDashboard` for authenticated users
- Supabase client singleton pattern in `src/utils/supabase/client.tsx`

**Dashboard System**:
- `HealthcareDashboard.tsx` is the main authenticated view
- Dynamically renders module cards based on user role (17 patient modules, 12 provider modules)
- Module navigation: clicking cards switches to detail views via `activeModule` state
- **Active Custom Modules** (fully implemented):
  - `PatientProfile.tsx` - Patient demographics, providers, emergency contacts, kupat holim
  - `MedicationManager.tsx` - Medication tracking with schedules and adherence
  - `HealthHistory.tsx` - Comprehensive health intake (mental, physical, familial, genetic history)
  - `MedicalDocuments.tsx` - Document management with categories and search
  - `AppointmentScheduling.tsx` - Calendar-like appointment booking and management
  - `LabResultsVitals.tsx` - Lab results tracking and vital signs charting with Recharts
  - `SymptomTracking.tsx` - Daily symptom journal with pain/mood scales
  - `SecureMessages.tsx` - Threaded messaging between patients and providers (supports patient-to-patient forum-style messaging)
  - `CareTeam.tsx` - Healthcare provider directory management
  - `InsuranceBilling.tsx` - Insurance policy, claims, and payment history
  - `HealthGoals.tsx` - Goal setting with progress tracking and health reminders
- Other modules use generic `ModuleDetailView` placeholder component

**Component Organization**:
- `/components` - Feature components (Dashboard, Auth, Profile, etc.)
- `/components/ui` - shadcn/ui components (50+ components from Radix UI)
- `/components/figma` - Figma-specific utilities (`ImageWithFallback.tsx`)

### Backend (Supabase Edge Function)

**Location**: `src/supabase/functions/server/index.tsx`

**Framework**: Hono server running on Deno

**Data Storage**: Custom KV store (`kv_store.tsx`) - not using Supabase database tables

**Key Endpoints**:
- Auth: `/make-server-50d6a062/signup`, `/login`, `/user`
- Health: `/make-server-50d6a062/health`, `/init-demo-accounts`
- Patient Profile: `/make-server-50d6a062/profile` (GET/PUT)
- Health History: `/make-server-50d6a062/health-history` (GET/PUT)
- Medications: `/make-server-50d6a062/medications` (GET/POST/PUT/DELETE)
- Providers: `/make-server-50d6a062/providers` (GET/POST/PUT/DELETE)
- Emergency Contacts: `/make-server-50d6a062/emergency-contacts` (GET/POST/PUT/DELETE)
- Kupat Holim: `/make-server-50d6a062/kupat-holim` (GET/POST/PUT/DELETE)
- Medical Documents: `/make-server-50d6a062/documents` (GET/POST/DELETE)
- Appointments: `/make-server-50d6a062/appointments` (GET/POST/PUT/DELETE)
- Lab Results: `/make-server-50d6a062/lab-results` (GET/POST)
- Vital Signs: `/make-server-50d6a062/vitals` (GET/POST)
- Symptoms: `/make-server-50d6a062/symptoms` (GET/POST/DELETE)
- Messages: `/make-server-50d6a062/messages` (GET/POST)
- Care Team: `/make-server-50d6a062/care-team` (GET/POST/DELETE)
- Insurance: `/make-server-50d6a062/insurance` (GET/PUT)
- Health Goals: `/make-server-50d6a062/goals` (GET/POST/PUT/DELETE)

**Demo Accounts**:
- Patient: `patient@demo.com` / `demo123`
- Provider: `provider@demo.com` / `demo123`
- Auto-initialized on server startup, can manually reinit via `/init-demo-accounts`

**Authentication**: Uses Authorization header with Bearer token from Supabase auth session

**KV Store Patterns**:
- User data: `user:{userId}`
- Demo flags: `demo:{email}`
- Profiles: `profile:{userId}`
- Health History: `health-history:{userId}`
- Medications: `medication:{userId}:{medicationId}`
- Providers: `provider:{userId}:{providerId}`
- Emergency contacts: `emergency-contact:{userId}:{contactId}`
- Kupat Holim: `kupat-holim:{userId}:{kupatHolimId}`
- Documents: `document:{userId}:{documentId}`
- Appointments: `appointment:{userId}:{appointmentId}`
- Lab Results: `lab-result:{userId}:{labResultId}`
- Vital Signs: `vital:{userId}:{vitalId}`
- Symptoms: `symptom:{userId}:{symptomId}`
- Messages: `message:{userId}:{messageId}`
- Care Team: `care-team:{userId}:{memberId}`
- Insurance: `insurance:{userId}`
- Health Goals: `goal:{userId}:{goalId}`

### Configuration

**Vite Config** (`vite.config.ts`):
- Extensive version-specific package aliases (handles @radix-ui dependencies)
- Path alias: `@` → `./src`
- SWC for React transformation
- Build target: `esnext`

**Supabase Config**: Project ID and anon key in `src/utils/supabase/info.tsx`

## Key Implementation Patterns

**Role-Based Rendering**: Dashboard modules, quick stats, and actions all switch based on `role` prop ('patient' | 'provider')

**Module System**: Each healthcare feature is a "module" - can be placeholder or custom component. To add new working module:
1. Add custom component to `/components`
2. Add module definition to `patientModules` or `providerModules` arrays
3. Add conditional rendering in `ModuleDetailView`

**API Integration**: Components use fetch with Authorization header containing Supabase access token. Pattern:
```typescript
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/{endpoint}`,
  {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }
);
```

**State Management**: Component-level React state only, no Redux/Context (except Supabase client singleton)

**Styling**: Tailwind CSS with shadcn/ui design system, custom globals in `src/styles/globals.css`

## Messaging System

**Bidirectional Communication**:
- Patients can message providers (doctors, nurses, therapists, admin staff)
- Providers can message patients
- Patients can message other patients (forum-style peer support)
- Thread-based conversations with reply functionality
- Real-time unread count tracking
- Read receipts
- Urgent message flagging
- Support for attachments (metadata only)

**Features**:
- Compose new messages with subject and recipient selection
- View conversation threads organized by most recent activity
- Reply directly within threads (Ctrl/Cmd+Enter keyboard shortcut)
- Search across message content, subjects, and participants
- Role-aware recipient options (changes based on patient/provider role)

## Important Notes

- This is a prototype/wireframe implementation with 11 fully functional modules
- No real database tables - all data in KV store (ephemeral)
- Email confirmation bypassed (auto-confirmed users)
- Server function name `make-server-50d6a062` appears hardcoded across files
- No TypeScript config file present, relies on Vite defaults
- No test setup configured
- Bundle size: ~1.07 MB (291 KB gzipped) - consider code splitting for production
