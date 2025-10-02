# HealthCompanion

A comprehensive healthcare management platform providing inclusive, patient-centered care with robust mental health support. Built with React, TypeScript, Vite, and Supabase.

🔗 **GitHub Repository**: [https://github.com/Nili-L/HealthCompanion](https://github.com/Nili-L/HealthCompanion)

## Overview

HealthCompanion is a full-featured healthcare portal supporting both patient and provider workflows. The platform emphasizes mental health tracking, evidence-based assessments, and inclusive care practices.

## Features

### 🏥 Patient Portal

#### Personal Health Management
- **Patient Profile**: Demographics, contact details, insurance information, chosen name & pronouns support
- **Health History**: Comprehensive intake forms covering:
  - Personal mental & physical health history
  - Familial health patterns
  - Genetic information with support for 23andMe, Ancestry, and other genetic testing services
  - Gender-affirming care tracking
- **Medical Documents**: Secure document storage with categorization (prescriptions, lab results, referrals)
- **Medication Tracking**: Current medications, dosages, schedules, and adherence monitoring

#### Clinical Data
- **Lab Results & Vital Signs**:
  - Interactive charts with Recharts visualization
  - Vital sign trends (BP, heart rate, temperature, O2, weight, BMI, glucose)
  - Lab result tracking with normal/abnormal flagging
- **Appointment Scheduling**: Book, reschedule, and manage healthcare appointments
- **Care Team**: Manage primary care physicians, specialists, and emergency contacts

#### Mental Health & Symptom Tracking
- **Comprehensive Symptom Tracking**:
  - Depression symptoms (13 specific items)
  - Anxiety symptoms (15 specific items)
  - Panic attack tracking (13 symptoms)
  - PTSD symptoms (12 items)
  - Complex PTSD symptoms (10 items)
  - Dissociation scale
  - EDS/Hypermobility symptoms (15 items + 15 joint locations)
  - Migraine tracking with phases, aura symptoms
  - Hormonal tracking for men and women (including period tracking)
  - Cross-cutting: pain scale, fatigue, sleep quality, stress, mood, triggers

- **Mental Health Questionnaires** (23 Evidence-Based Assessments):

  **Depression Screening (4 tools):**
  - PHQ-9 (Patient Health Questionnaire-9) - 9 items
  - CES-D (Center for Epidemiologic Studies Depression Scale) - 20 items
  - GDS-15 (Geriatric Depression Scale) - 15 items for older adults (65+)
  - EPDS (Edinburgh Postnatal Depression Scale) - 10 items for perinatal depression

  **Anxiety Disorders (7 tools):**
  - GAD-7 (Generalized Anxiety Disorder-7) - 7 items for generalized anxiety
  - SPIN (Social Phobia Inventory) - 17 items for social anxiety
  - PSWQ (Penn State Worry Questionnaire) - 8 items for pathological worry
  - PDSS (Panic Disorder Severity Scale) - 5 items for panic attacks
  - PCL-5 (PTSD Checklist for DSM-5) - 20 items for trauma/PTSD
  - SCAS (Spence Children's Anxiety Scale) - 10 items for ages 6-18 (parent report)

  **OCD (2 tools):**
  - Y-BOCS (Yale-Brown Obsessive Compulsive Scale) - 10 items
  - OCI-R (Obsessive Compulsive Inventory-Revised) - 6 items

  **Other Mental Health (5 tools):**
  - ASRS-v1.1 (Adult ADHD Self-Report Scale) - 6 items
  - PSS-10 (Perceived Stress Scale) - 10 items
  - MDQ (Mood Disorder Questionnaire) - 13 items for bipolar screening
  - BSL-23 (Borderline Symptom List) - 5 items for personality disorder
  - CAS (Clinical Anger Scale) - 5 items for anger assessment

  **Specialized Assessments (5 tools):**
  - C-SSRS (Columbia-Suicide Severity Rating Scale) - 6 items with emergency flagging
  - CAGE (Substance Use Screening) - 4 items for alcohol use disorder
  - EAT-26 (Eating Attitudes Test) - 7 items for eating disorders
  - ISI (Insomnia Severity Index) - 7 items for sleep disorders
  - PSC-17 (Pediatric Symptom Checklist) - 17 items for ages 4-16

  **Child/Adolescent Specific (3 tools):**
  - SCAS (Spence Children's Anxiety) - Ages 6-18
  - SDQ (Strengths & Difficulties Questionnaire) - Ages 3-16, comprehensive behavioral/emotional screening
  - PSC-17 (Pediatric Symptom Checklist) - Ages 4-16

  **Age Coverage:**
  - Preschool/Early Childhood (3-5): SDQ
  - Elementary (6-12): SCAS, SDQ, PSC-17
  - Adolescent (13-17): All child tools + adult versions
  - Adults (18-64): 18 adult assessments
  - Older Adults (65+): GDS-15 + adult tools
  - Perinatal: EPDS

  Each questionnaire includes:
  - Automatic score calculation
  - Severity interpretation with clinical cutoffs
  - Treatment recommendations
  - Response history tracking
  - Progress visualization

#### Communication & Support
- **Secure Messaging**:
  - Bidirectional messaging (patient ↔ provider)
  - Patient-to-patient forum-style messaging
  - Threaded conversations with reply functionality
  - Read receipts and unread count tracking
- **Insurance & Billing**: Policy tracking, claims management, payment history
- **Health Goals**: Goal setting with progress tracking and reminders

### 👨‍⚕️ Provider Portal

#### Patient Management
- **Patient Records**: Access to comprehensive patient medical records
- **Appointment Management**: Schedule and manage patient appointments
- **Medical Documentation**: Clinical notes and documentation
- **Lab Review**: Review and approve lab test results
- **Prescription Management**: Write and manage patient prescriptions
- **Treatment Plans**: Create and monitor patient treatment plans

#### Mental Health Tools
- **Questionnaire Assignment System**:
  - Select specific questionnaires for each patient
  - Manage assignments through dedicated UI
  - Patients only see assigned questionnaires
  - Visual assignment tracking (X of 23 assigned)
  - Real-time sync and updates

#### Communication
- **Patient Messaging**: Secure communication with patients
- **Referrals**: Manage specialist referrals
- **Reports & Analytics**: Patient outcomes and practice analytics

## Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **shadcn/ui** component library (Radix UI-based)
- **Recharts** for data visualization
- **React Router** for navigation
- **Sonner** for toast notifications

### Backend
- **Supabase** for authentication and backend services
- **Deno** runtime for Edge Functions
- **Hono** web framework for API routes
- **KV Store** for data persistence (prefix-based key-value storage)

### Key Data Patterns
```
user:{userId} - User profile data
profile:{userId} - Patient demographics
medication:{userId}:{medId} - Medication tracking
questionnaire:{userId}:{responseId} - Questionnaire responses
assigned-questionnaires:{userId} - Provider assignments
symptom:{userId}:{symptomId} - Symptom entries
message:{userId}:{messageId} - Secure messages
appointment:{userId}:{apptId} - Appointments
health-history:{userId} - Health history intake
document:{userId}:{docId} - Medical documents
lab-result:{userId}:{resultId} - Lab results
vital:{userId}:{vitalId} - Vital signs
care-team:{userId}:{memberId} - Care team members
insurance:{userId} - Insurance information
goal:{userId}:{goalId} - Health goals
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Nili-L/HealthCompanion.git
cd HealthCompanion
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

### Demo Accounts

**Patient Account:**
- Email: `patient@demo.com`
- Password: `demo123`

**Provider Account:**
- Email: `provider@demo.com`
- Password: `demo123`

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── HealthcareDashboard.tsx
│   ├── PatientProfile.tsx
│   ├── MentalHealthQuestionnaires.tsx
│   ├── SymptomTracking.tsx
│   ├── SecureMessages.tsx
│   └── ...
├── supabase/
│   └── functions/
│       └── server/      # Deno Edge Functions
│           ├── index.tsx
│           └── kv_store.tsx
└── utils/               # Utility functions

build/                   # Production build output
```

## API Endpoints

### Authentication
- `POST /make-server-50d6a062/signup` - User registration
- `POST /make-server-50d6a062/login` - User authentication
- `GET /make-server-50d6a062/user` - Get current user

### Patient Data
- `GET/PUT /make-server-50d6a062/profile` - Patient profile
- `GET/PUT /make-server-50d6a062/health-history` - Health history
- `GET/POST/PUT/DELETE /make-server-50d6a062/medications/:id` - Medications
- `GET/POST/DELETE /make-server-50d6a062/documents/:id` - Medical documents
- `GET/POST/PUT/DELETE /make-server-50d6a062/appointments/:id` - Appointments
- `GET/POST /make-server-50d6a062/lab-results` - Lab results
- `GET/POST /make-server-50d6a062/vitals` - Vital signs
- `GET/POST/DELETE /make-server-50d6a062/symptoms/:id` - Symptom tracking

### Mental Health
- `GET/POST /make-server-50d6a062/questionnaires` - Mental health assessments
- `GET/PUT /make-server-50d6a062/assigned-questionnaires` - Questionnaire assignments (provider)

### Communication
- `GET/POST /make-server-50d6a062/messages` - Secure messaging
- `GET/POST/DELETE /make-server-50d6a062/care-team/:id` - Care team management

### Other
- `GET/PUT /make-server-50d6a062/insurance` - Insurance & billing
- `GET/POST/PUT/DELETE /make-server-50d6a062/goals/:id` - Health goals

## Features Highlights

### Inclusive Care
- Chosen name and pronouns support
- Gender-affirming care tracking
- LGBTQ+ friendly demographics
- Inclusive language throughout

### Mental Health Focus
- **23 evidence-based screening tools** covering all age groups (3+ through older adults)
- **Comprehensive age coverage:**
  - Preschool (3-5): SDQ behavioral/emotional screening
  - Elementary (6-12): SCAS anxiety, SDQ, PSC-17
  - Adolescent (13-17): Child tools + adult assessments
  - Adults: 18 specialized assessments
  - Older adults (65+): GDS-15 + adult tools
  - Perinatal: EPDS postnatal depression screening
- **Assessment categories:** Depression (4), Anxiety/PTSD (7), OCD (2), ADHD, Stress, Bipolar, Borderline, Anger, Suicide risk, Substance use, Eating disorders, Sleep disorders
- Comprehensive symptom tracking covering depression, anxiety, PTSD, EDS, migraines, hormonal changes
- Provider-managed assessment assignments
- Automated scoring and clinical interpretation
- Treatment recommendations based on severity

### Data Visualization
- Interactive vital sign charts
- Trend analysis for health metrics
- Visual progress tracking for goals
- Symptom pattern identification

### Security & Privacy
- Supabase authentication
- JWT-based access control
- Secure message encryption
- HIPAA-compliant data handling practices

## Contributing

This is a healthcare application. All contributions should prioritize:
1. Patient safety and data privacy
2. Clinical accuracy of assessments
3. Accessibility (WCAG 2.1 AA)
4. Inclusive language and design
5. Evidence-based practices

## License

This project was generated with Claude Code.

## Acknowledgments

- Mental health questionnaires based on validated clinical instruments
- shadcn/ui for beautiful, accessible components
- Supabase for backend infrastructure
- Psychology Tools for assessment standards

---

**Built with ❤️ for inclusive, compassionate healthcare**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
