# HealthCompanion

A comprehensive healthcare management platform providing inclusive, patient-centered care with robust mental health support, advanced trend analysis, and file management. Built with React, TypeScript, Vite, and Supabase.

🔗 **GitHub Repository**: [https://github.com/Nili-L/HealthCompanion](https://github.com/Nili-L/HealthCompanion)

## Overview

HealthCompanion is a full-featured healthcare portal supporting both patient and provider workflows. The platform emphasizes mental health tracking, evidence-based assessments, inclusive care practices, and intelligent data analytics with AI-powered insights.

## ✨ Latest Features (v1.1.0)

### 📊 Intelligent Trend Analysis
- **Symptom Tracking Trends**: Week-over-week comparison with AI-powered pattern recognition
  - Visual trend indicators (TrendingUp/Down) with color-coded alerts
  - Correlation detection (e.g., "Higher stress correlates with poorer sleep")
  - Multi-metric analysis tracking anxiety, depression, stress, pain, and sleep quality
  - Smart insights: "Anxiety improved 25%" or "Pattern: stress affects sleep"

- **Mental Health Questionnaire Score Trends**: Track treatment effectiveness over time
  - Latest score prominently displayed on questionnaire cards
  - Percentage change between assessments with visual arrows
  - Progress detection: "Your symptoms have improved by 5 points since your last assessment"
  - Historical comparison in assessment history view
  - Smart retake buttons based on completion status

### 📁 File Upload/Download System
- **Medical Documents with Supabase Storage**:
  - Real file upload (not just references) with 10MB limit
  - Supported formats: PDF, Word docs, images (JPG, PNG, GIF), text files
  - Secure signed URL downloads (60-second expiration)
  - Automatic file deletion when documents are removed
  - File metadata tracking (name, size, type, storage path)
  - Upload progress indicators and file preview
  - See `SUPABASE_STORAGE_SETUP.md` for configuration details

## Features

### 🏥 Patient Portal

#### Personal Health Management
- **Patient Profile**: Demographics, contact details, insurance information, chosen name & pronouns support
- **Health History**: Comprehensive intake forms covering:
  - Personal mental & physical health history
  - Familial health patterns
  - Genetic information with support for 23andMe, Ancestry, and other genetic testing services
  - Gender-affirming care tracking
  - Activity & exercise history tracking (NEW)

- **Medical Documents**: Secure document storage with **real file upload/download**
  - Upload files directly (PDF, images, Word docs, text files)
  - Download with one-click using secure signed URLs
  - Categorization: prescriptions, lab results, imaging, referrals, etc.
  - File size and type validation
  - Visual file indicators (Upload/Download icons)

- **Medication Tracking**: Current medications, dosages, schedules, and adherence monitoring

#### Clinical Data with Trend Analysis
- **Lab Results & Vital Signs**:
  - Interactive charts with Recharts visualization
  - **Trend indicators** showing if vitals are improving/declining (COMING SOON)
  - Vital sign trends (BP, heart rate, temperature, O2, weight, BMI, glucose)
  - Lab result tracking with normal/abnormal flagging
  - Week-over-week and month-over-month comparisons

- **Appointment Scheduling**: Book, reschedule, and manage healthcare appointments
- **Care Team**: Manage primary care physicians, specialists, and emergency contacts with specialty icons

#### Mental Health & Symptom Tracking

##### Comprehensive Symptom Tracking with AI Insights
Track symptoms across multiple categories:
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

**NEW: Intelligent Trend Analysis & Pattern Recognition**
- **Enhanced Stats Cards** with week-over-week trends:
  - Total symptom entries with frequency trends
  - Average Anxiety with improvement indicators
  - Average Stress with "Decreasing ✓" or "Increasing" status
  - Average Sleep Quality with trend arrows

- **AI-Powered Insights Card**:
  - Automatic pattern detection across all metrics
  - Color-coded insights (green = positive, amber = warning, blue = info)
  - Examples:
    - ✅ "Anxiety levels improved by 25% compared to last week. Keep up the great work!"
    - ⚠️ "Depression symptoms worsened by 30%. Please consult with your provider."
    - ℹ️ "Pattern detected: Higher stress correlates with poorer sleep"
    - 🎉 "Excellent progress! 3 key metrics are improving this week"
  - Correlation analysis between metrics
  - Multi-metric improvement tracking

- **Visual Trend Indicators**:
  - TrendingUp (red) = Worsening symptoms
  - TrendingDown (green) = Improving symptoms
  - Minus (gray) = Stable trends
  - Smart thresholds to reduce noise

##### Mental Health Questionnaires (23 Evidence-Based Assessments)

**NEW: Score Trend Tracking & Progress Monitoring**
- Latest score displayed on each questionnaire card
- Trend badges comparing current vs. previous assessment
- Percentage change calculation with visual indicators
- "Retake" button for completed questionnaires
- Historical score comparison in assessment history
- Progress messages: "Your symptoms have improved by 5 points since your last assessment. Keep up the great work!"
- Treatment effectiveness tracking over time

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
- **Progress visualization with trend analysis (NEW)**
- **Score comparison between assessments (NEW)**
- **Smart insights for significant changes (NEW)**

#### Communication & Support
- **Secure Messaging**:
  - Bidirectional messaging (patient ↔ provider)
  - Patient-to-patient forum-style messaging
  - Threaded conversations with reply functionality
  - Read receipts and unread count tracking
  - Keyboard shortcuts (Ctrl/Cmd+Enter to send)

- **Insurance & Billing**: Policy tracking, claims management, payment history

- **Health Goals**: Goal setting with progress tracking and reminders
  - Progress trend analysis (COMING SOON)
  - Milestone visualization (COMING SOON)

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
  - **Track patient progress with score trends (NEW)**

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
- **Lucide React** for icons (TrendingUp/Down, Upload/Download, etc.)

### Backend
- **Supabase** for authentication and backend services
- **Supabase Storage** for file uploads (medical documents)
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
document:{userId}:{docId} - Medical documents (with storage metadata)
lab-result:{userId}:{resultId} - Lab results
vital:{userId}:{vitalId} - Vital signs
care-team:{userId}:{memberId} - Care team members
insurance:{userId} - Insurance information
goal:{userId}:{goalId} - Health goals
```

### Supabase Storage
```
medical-documents/{userId}/{fileId}.{ext} - Patient medical document files
```
See `SUPABASE_STORAGE_SETUP.md` for detailed storage configuration including:
- Bucket creation
- RLS (Row Level Security) policies
- File validation rules
- Security best practices

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Supabase Storage bucket configured (see `SUPABASE_STORAGE_SETUP.md`)

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

4. Configure Supabase Storage (IMPORTANT for file uploads):
Follow the instructions in `SUPABASE_STORAGE_SETUP.md` to:
- Create the `medical-documents` storage bucket
- Set up Row Level Security policies
- Configure file validation rules

5. Start the development server:
```bash
npm run dev
```

6. Build for production:
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
│   ├── MentalHealthQuestionnaires.tsx  # With trend analysis
│   ├── SymptomTracking.tsx             # With AI insights
│   ├── MedicalDocuments.tsx            # With file upload/download
│   ├── SecureMessages.tsx
│   └── ...
├── supabase/
│   └── functions/
│       └── server/      # Deno Edge Functions
│           ├── index.tsx
│           └── kv_store.tsx
└── utils/               # Utility functions

build/                   # Production build output
SUPABASE_STORAGE_SETUP.md # Storage configuration guide
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
- `GET/POST/DELETE /make-server-50d6a062/documents/:id` - Medical documents (metadata)
- `POST /make-server-50d6a062/documents/upload` - **File upload to storage (NEW)**
- `GET /make-server-50d6a062/documents/:id/download` - **Generate signed download URL (NEW)**
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
- **Trend analysis and progress tracking** for treatment effectiveness monitoring
- **AI-powered insights** detecting patterns and correlations
- **Score comparison** between assessments with visual indicators
- **Comprehensive age coverage:**
  - Preschool (3-5): SDQ behavioral/emotional screening
  - Elementary (6-12): SCAS anxiety, SDQ, PSC-17
  - Adolescent (13-17): Child tools + adult assessments
  - Adults: 18 specialized assessments
  - Older adults (65+): GDS-15 + adult tools
  - Perinatal: EPDS postnatal depression screening
- **Assessment categories:** Depression (4), Anxiety/PTSD (7), OCD (2), ADHD, Stress, Bipolar, Borderline, Anger, Suicide risk, Substance use, Eating disorders, Sleep disorders
- Comprehensive symptom tracking with **intelligent pattern recognition**
- Provider-managed assessment assignments
- Automated scoring and clinical interpretation
- Treatment recommendations based on severity

### Data Visualization & Analytics
- Interactive vital sign charts with Recharts
- **Trend analysis** for health metrics with color-coded indicators
- **AI-powered pattern recognition** across symptom data
- Visual progress tracking for goals
- **Symptom correlation detection** (e.g., stress ↔ sleep)
- Week-over-week and month-over-month comparisons
- **Smart insights** with actionable recommendations

### File Management
- **Real file uploads** to Supabase Storage (not just metadata)
- Secure signed URLs for downloads (60-second expiration)
- File type validation (PDF, images, Word docs, text files)
- 10MB file size limit with client-side validation
- Automatic cleanup when documents are deleted
- User-isolated storage (files organized by userId)
- Upload progress indicators and file preview

### Security & Privacy
- Supabase authentication with JWT
- **Row Level Security (RLS)** for file storage
- Secure message encryption
- **Signed URLs** for temporary file access
- User data isolation in KV store
- HIPAA-compliant data handling practices

## Contributing

This is a healthcare application. All contributions should prioritize:
1. Patient safety and data privacy
2. Clinical accuracy of assessments
3. Accessibility (WCAG 2.1 AA)
4. Inclusive language and design
5. Evidence-based practices
6. Data security and HIPAA compliance

## Roadmap

### Planned Features
- [ ] Vital signs trend indicators with TrendingUp/Down arrows
- [ ] Health Goals progress trend analysis and trajectory prediction
- [ ] Activity/exercise history section completion
- [ ] Lifestyle tracking questionnaires (sleep, nutrition, energy)
- [ ] Enhanced data visualization with more chart types
- [ ] Batch file upload functionality
- [ ] PDF preview in browser
- [ ] Image thumbnail generation
- [ ] File versioning system
- [ ] OCR for scanned documents

## License

This project was generated with Claude Code.

## Acknowledgments

- Mental health questionnaires based on validated clinical instruments
- shadcn/ui for beautiful, accessible components
- Supabase for backend infrastructure and file storage
- Psychology Tools for assessment standards
- Recharts for data visualization
- Lucide React for iconography

---

**Built with ❤️ for inclusive, compassionate healthcare**

**Current Version:** v1.1.0 (December 2024)

**Key Improvements in v1.1.0:**
- ✅ Real file upload/download for medical documents
- ✅ Symptom tracking with AI-powered trend analysis
- ✅ Mental health questionnaire score trend tracking
- ✅ Intelligent pattern recognition and correlation detection
- ✅ Visual progress indicators across all health metrics

🤖 Generated with [Claude Code](https://claude.com/claude-code)
