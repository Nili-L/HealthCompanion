-- Health Companion Database Schema Migration
-- This migration creates normalized tables to replace the KV store pattern

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'provider')),
  legal_name TEXT,
  chosen_name TEXT,
  other_names TEXT,
  pronouns TEXT,
  date_of_birth DATE,
  gender_identity TEXT,
  sex_assigned_at_birth TEXT,
  sexual_orientation TEXT,
  blood_type TEXT,
  height NUMERIC,
  weight NUMERIC,
  allergies TEXT,
  medical_conditions TEXT,
  gender_affirming_care TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health history table
CREATE TABLE health_histories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Mental Health History
  mental_health_diagnoses TEXT[],
  mental_health_medications TEXT[],
  mental_health_therapies TEXT[],
  mental_health_hospitalizations TEXT[],
  suicide_attempts BOOLEAN,
  self_harm_history BOOLEAN,

  -- Physical Health
  chronic_conditions TEXT[],
  surgeries JSONB, -- [{name, date, notes}]
  injuries TEXT[],
  disabilities TEXT[],

  -- Family History
  family_mental_health TEXT[],
  family_physical_health TEXT[],
  family_genetic_conditions TEXT[],

  -- Lifestyle
  smoking_status TEXT,
  alcohol_use TEXT,
  substance_use TEXT,
  exercise_frequency TEXT,
  diet_type TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Medications table
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  prescriber TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Healthcare providers table
CREATE TABLE healthcare_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  clinic_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency contacts table
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kupat Holim (Israeli health insurance) table
CREATE TABLE kupat_holim (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  member_id TEXT,
  branch TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical documents table
CREATE TABLE medical_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  date DATE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES healthcare_providers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  location TEXT,
  type TEXT, -- 'in-person', 'telehealth', 'phone'
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab results table
CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_date DATE NOT NULL,
  result_value TEXT,
  unit TEXT,
  reference_range TEXT,
  status TEXT CHECK (status IN ('normal', 'abnormal', 'critical')),
  ordering_provider TEXT,
  lab_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vital signs table
CREATE TABLE vital_signs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL,

  -- Measurements
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  temperature NUMERIC,
  temperature_unit TEXT DEFAULT 'C' CHECK (temperature_unit IN ('C', 'F')),
  respiratory_rate INTEGER,
  oxygen_saturation INTEGER,
  weight NUMERIC,
  weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Symptoms tracking table
CREATE TABLE symptoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  symptom TEXT NOT NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 10),
  duration TEXT,
  triggers TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (patient-provider and patient-patient communication)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  has_attachments BOOLEAN DEFAULT FALSE,
  attachment_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Care team members table
CREATE TABLE care_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES healthcare_providers(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  specialty TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance policies table
CREATE TABLE insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  policy_number TEXT,
  group_number TEXT,
  coverage_type TEXT, -- 'medical', 'dental', 'vision', 'mental_health'
  effective_date DATE,
  expiration_date DATE,
  copay NUMERIC,
  deductible NUMERIC,
  deductible_met NUMERIC DEFAULT 0,
  out_of_pocket_max NUMERIC,
  out_of_pocket_met NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing/claims table
CREATE TABLE billing_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES insurance_policies(id) ON DELETE SET NULL,
  claim_number TEXT,
  service_date DATE NOT NULL,
  provider_name TEXT,
  amount_billed NUMERIC NOT NULL,
  amount_covered NUMERIC,
  amount_owed NUMERIC,
  status TEXT CHECK (status IN ('pending', 'approved', 'denied', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health goals table
CREATE TABLE health_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'physical', 'mental', 'nutrition', 'sleep', 'medication_adherence'
  target_value TEXT,
  current_value TEXT,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  reminders JSONB, -- [{type, frequency, time}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gender identity and pronouns (trauma-informed care)
CREATE TABLE gender_identity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chosen_name TEXT,
  legal_name_visibility TEXT DEFAULT 'providers_only' CHECK (legal_name_visibility IN ('public', 'providers_only', 'private')),
  pronouns TEXT[],
  gender_identity TEXT,
  gender_identity_visibility TEXT DEFAULT 'providers_only',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Consent and boundaries
CREATE TABLE consent_boundaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Trauma-informed care preferences
  require_advance_notice BOOLEAN DEFAULT FALSE,
  advance_notice_duration TEXT,
  prefer_same_gender_provider BOOLEAN,
  avoid_physical_contact BOOLEAN DEFAULT FALSE,
  physical_exam_boundaries TEXT,
  communication_preferences TEXT,

  -- Body areas off-limits
  off_limits_areas TEXT[],

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Transition care tracking
CREATE TABLE transition_care (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- HRT tracking
  hrt_start_date DATE,
  hrt_medications JSONB, -- [{name, dosage, route, start_date}]
  hrt_labs JSONB, -- [{test_name, date, results}]

  -- Procedures
  procedures JSONB, -- [{name, date, provider, status, notes}]

  -- Milestones
  milestones JSONB, -- [{description, date, category}]

  -- Letters of support
  letters_of_support JSONB, -- [{type, provider, date, document_id}]

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Safety planning
CREATE TABLE safety_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Warning signs
  warning_signs TEXT[],

  -- Coping strategies
  internal_coping_strategies TEXT[],
  external_coping_strategies TEXT[],

  -- Safe people
  safe_people JSONB, -- [{name, phone, relationship}]

  -- Crisis resources
  crisis_resources JSONB, -- [{name, phone, type}]

  -- Emergency contacts
  emergency_actions TEXT[],

  -- Reasons for living
  reasons_for_living TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Body mapping (dysphoria/euphoria tracking)
CREATE TABLE body_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Custom anatomy terms
  custom_anatomy_terms JSONB, -- {standard_term: preferred_term}

  -- Dysphoria areas
  dysphoria_areas JSONB, -- [{area, intensity, notes}]

  -- Euphoria areas
  euphoria_areas JSONB, -- [{area, intensity, notes}]

  -- Sensations
  sensations JSONB, -- [{area, sensation, notes}]

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reproductive health tracking
CREATE TABLE reproductive_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Fertility tracking
  fertility_status TEXT,
  fertility_preservation JSONB,

  -- Pregnancy tracking (gender-neutral)
  pregnancy_status TEXT,
  pregnancy_details JSONB,

  -- Family planning
  family_planning_goals TEXT,
  contraception JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Sexual health tracking
CREATE TABLE sexual_health (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- STI testing
  sti_tests JSONB, -- [{test_name, date, result, treatment}]

  -- PrEP/PEP
  prep_status TEXT,
  prep_start_date DATE,
  pep_history JSONB,

  -- Sexual function
  sexual_function_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Medical advocacy incidents
CREATE TABLE advocacy_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  incident_date DATE NOT NULL,
  incident_type TEXT NOT NULL, -- 'discrimination', 'misgendering', 'insurance_denial', 'access_barrier'
  provider_name TEXT,
  location TEXT,
  description TEXT NOT NULL,
  actions_taken TEXT,
  resolution TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accessibility accommodations
CREATE TABLE accessibility_accommodations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Neurodiversity
  neurodiversity_type TEXT[],
  neurodiversity_accommodations TEXT[],

  -- Mobility
  mobility_needs TEXT[],
  mobility_devices TEXT[],

  -- Sensory
  sensory_sensitivities TEXT[],
  sensory_accommodations TEXT[],

  -- Communication
  communication_preferences TEXT[],
  preferred_communication_method TEXT,

  -- Other
  other_accommodations TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Period tracking
CREATE TABLE period_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  flow_intensity TEXT CHECK (flow_intensity IN ('light', 'moderate', 'heavy')),
  symptoms TEXT[],
  mood TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medications_active ON medications(user_id, active);
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(user_id, date);
CREATE INDEX idx_lab_results_user_id ON lab_results(user_id);
CREATE INDEX idx_lab_results_date ON lab_results(user_id, test_date);
CREATE INDEX idx_vital_signs_user_id ON vital_signs(user_id);
CREATE INDEX idx_vital_signs_date ON vital_signs(user_id, recorded_at);
CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX idx_symptoms_date ON symptoms(user_id, date);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_unread ON messages(recipient_id, is_read);
CREATE INDEX idx_health_goals_user_id ON health_goals(user_id);
CREATE INDEX idx_health_goals_status ON health_goals(user_id, status);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kupat_holim ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE gender_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_boundaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_care ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproductive_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE sexual_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE advocacy_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessibility_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own health history" ON health_histories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own health history" ON health_histories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health history" ON health_histories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own medications" ON medications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own providers" ON healthcare_providers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own emergency contacts" ON emergency_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own kupat holim" ON kupat_holim FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own documents" ON medical_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own appointments" ON appointments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own lab results" ON lab_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own vital signs" ON vital_signs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own symptoms" ON symptoms FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view messages sent to them" ON messages FOR SELECT USING (auth.uid() = recipient_id OR auth.uid() = sender_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their received messages" ON messages FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "Users can manage their care team" ON care_team_members FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their insurance" ON insurance_policies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their billing claims" ON billing_claims FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their health goals" ON health_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their gender identity" ON gender_identity FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their consent boundaries" ON consent_boundaries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their transition care" ON transition_care FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their safety plans" ON safety_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their body mapping" ON body_mapping FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their reproductive health" ON reproductive_health FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their sexual health" ON sexual_health FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their advocacy incidents" ON advocacy_incidents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their accessibility accommodations" ON accessibility_accommodations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their period tracking" ON period_tracking FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_histories_updated_at BEFORE UPDATE ON health_histories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_healthcare_providers_updated_at BEFORE UPDATE ON healthcare_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kupat_holim_updated_at BEFORE UPDATE ON kupat_holim FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_documents_updated_at BEFORE UPDATE ON medical_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON lab_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_symptoms_updated_at BEFORE UPDATE ON symptoms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_care_team_members_updated_at BEFORE UPDATE ON care_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_policies_updated_at BEFORE UPDATE ON insurance_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_claims_updated_at BEFORE UPDATE ON billing_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_goals_updated_at BEFORE UPDATE ON health_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gender_identity_updated_at BEFORE UPDATE ON gender_identity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consent_boundaries_updated_at BEFORE UPDATE ON consent_boundaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transition_care_updated_at BEFORE UPDATE ON transition_care FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_safety_plans_updated_at BEFORE UPDATE ON safety_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reproductive_health_updated_at BEFORE UPDATE ON reproductive_health FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sexual_health_updated_at BEFORE UPDATE ON sexual_health FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advocacy_incidents_updated_at BEFORE UPDATE ON advocacy_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accessibility_accommodations_updated_at BEFORE UPDATE ON accessibility_accommodations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
