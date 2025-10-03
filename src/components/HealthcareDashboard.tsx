import { useState, useEffect, lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import {
  User,
  FileText,
  Scan,
  Pill,
  Activity,
  Calendar,
  BarChart3,
  Upload,
  MessageSquare,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  Heart,
  Stethoscope,
  ClipboardList,
  TrendingUp,
  UserPlus,
  FileCheck,
  Bell,
  Download,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Brain,
  Image,
  CheckSquare,
  Shield,
  Baby,
  Accessibility,
  Star
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

// Lazy load all heavy components
const PatientProfile = lazy(() => import("./PatientProfile").then(m => ({ default: m.PatientProfile })));
const MedicationManager = lazy(() => import("./MedicationManager").then(m => ({ default: m.MedicationManager })));
const HealthHistory = lazy(() => import("./HealthHistory").then(m => ({ default: m.HealthHistory })));
const MedicalDocuments = lazy(() => import("./MedicalDocuments").then(m => ({ default: m.MedicalDocuments })));
const AppointmentScheduling = lazy(() => import("./AppointmentScheduling").then(m => ({ default: m.AppointmentScheduling })));
const LabResultsVitals = lazy(() => import("./LabResultsVitals").then(m => ({ default: m.LabResultsVitals })));
const SymptomTracking = lazy(() => import("./SymptomTracking").then(m => ({ default: m.SymptomTracking })));
const SecureMessages = lazy(() => import("./SecureMessages").then(m => ({ default: m.SecureMessages })));
const CareTeam = lazy(() => import("./CareTeam").then(m => ({ default: m.CareTeam })));
const InsuranceBilling = lazy(() => import("./InsuranceBilling").then(m => ({ default: m.InsuranceBilling })));
const HealthGoals = lazy(() => import("./HealthGoals").then(m => ({ default: m.HealthGoals })));
const MentalHealthQuestionnaires = lazy(() => import("./MentalHealthQuestionnaires").then(m => ({ default: m.MentalHealthQuestionnaires })));
const PeriodTracking = lazy(() => import("./PeriodTracking").then(m => ({ default: m.PeriodTracking })));
const MediaLibrary = lazy(() => import("./MediaLibrary").then(m => ({ default: m.MediaLibrary })));
const OCRScanning = lazy(() => import("./OCRScanning").then(m => ({ default: m.OCRScanning })));
const CommunityPlatform = lazy(() => import("./CommunityPlatform").then(m => ({ default: m.CommunityPlatform })));
const PatientJournal = lazy(() => import("./PatientJournal").then(m => ({ default: m.PatientJournal })));
const TodoLists = lazy(() => import("./TodoLists").then(m => ({ default: m.TodoLists })));
const InsightReports = lazy(() => import("./InsightReports").then(m => ({ default: m.InsightReports })));
const FollowUpPlans = lazy(() => import("./FollowUpPlans").then(m => ({ default: m.FollowUpPlans })));
const FinancialManagement = lazy(() => import("./FinancialManagement").then(m => ({ default: m.FinancialManagement })));
const TicketSystem = lazy(() => import("./TicketSystem").then(m => ({ default: m.TicketSystem })));
const TimelineVisualization = lazy(() => import("./TimelineVisualization").then(m => ({ default: m.TimelineVisualization })));
const RequestTemplates = lazy(() => import("./RequestTemplates").then(m => ({ default: m.RequestTemplates })));
const MindMaps = lazy(() => import("./MindMaps").then(m => ({ default: m.MindMaps })));
const HelpManual = lazy(() => import("./HelpManual").then(m => ({ default: m.HelpManual })));
const MedicalImaging = lazy(() => import("./MedicalImaging").then(m => ({ default: m.MedicalImaging })));
const GenderIdentity = lazy(() => import("./GenderIdentity").then(m => ({ default: m.GenderIdentity })));
const ConsentBoundaries = lazy(() => import("./ConsentBoundaries").then(m => ({ default: m.ConsentBoundaries })));
const TransitionCareTracking = lazy(() => import("./TransitionCareTracking").then(m => ({ default: m.TransitionCareTracking })));
const SafetyPlanning = lazy(() => import("./SafetyPlanning").then(m => ({ default: m.SafetyPlanning })));
const BodyMapping = lazy(() => import("./BodyMapping").then(m => ({ default: m.BodyMapping })));
const ReproductiveHealth = lazy(() => import("./ReproductiveHealth").then(m => ({ default: m.ReproductiveHealth })));
const SexualHealth = lazy(() => import("./SexualHealth").then(m => ({ default: m.SexualHealth })));
const MedicalAdvocacy = lazy(() => import("./MedicalAdvocacy").then(m => ({ default: m.MedicalAdvocacy })));
const AccessibilityAccommodations = lazy(() => import("./AccessibilityAccommodations").then(m => ({ default: m.AccessibilityAccommodations })));
const VisualAccessibilitySettings = lazy(() => import("./VisualAccessibilitySettings").then(m => ({ default: m.VisualAccessibilitySettings })));

interface ModuleDetailViewProps {
  moduleTitle: string;
  role: 'patient' | 'provider';
  accessToken: string;
}

// Loading fallback component
function ModuleLoadingFallback() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-pulse">
              <Heart className="h-12 w-12 text-blue-600" />
            </div>
            <p className="text-gray-600">Loading module...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ModuleDetailView({ moduleTitle, role, accessToken }: ModuleDetailViewProps) {
  // Wrap all lazy-loaded components in Suspense
  const renderModule = () => {
    // Check if this is a module with a custom component
    if (moduleTitle === "My Profile") {
      return <PatientProfile accessToken={accessToken} />;
  }

  if (moduleTitle === "Medication Tracking") {
    return <MedicationManager accessToken={accessToken} />;
  }

  if (moduleTitle === "Health History") {
    return <HealthHistory accessToken={accessToken} />;
  }

  if (moduleTitle === "Medical Documents") {
    return <MedicalDocuments accessToken={accessToken} />;
  }

  if (moduleTitle === "Appointment Scheduling") {
    return <AppointmentScheduling accessToken={accessToken} />;
  }

  if (moduleTitle === "Lab Results" || moduleTitle === "Vital Signs Chart") {
    return <LabResultsVitals accessToken={accessToken} />;
  }

  if (moduleTitle === "Symptom Tracking") {
    return <SymptomTracking accessToken={accessToken} />;
  }

  if (moduleTitle === "Messages" || moduleTitle === "Patient Messages") {
    return <SecureMessages accessToken={accessToken} role={role} />;
  }

  if (moduleTitle === "Care Team") {
    return <CareTeam accessToken={accessToken} />;
  }

  if (moduleTitle === "Insurance & Billing") {
    return <InsuranceBilling accessToken={accessToken} />;
  }

  if (moduleTitle === "Health Goals") {
    return <HealthGoals accessToken={accessToken} />;
  }

  if (moduleTitle === "Mental Health Questionnaires") {
    return <MentalHealthQuestionnaires accessToken={accessToken} role={role} />;
  }

  if (moduleTitle === "Period Tracking") {
    return <PeriodTracking accessToken={accessToken} />;
  }

  if (moduleTitle === "Media Library") {
    return <MediaLibrary accessToken={accessToken} />;
  }

  if (moduleTitle === "Medical Imaging") {
    return <MedicalImaging accessToken={accessToken} />;
  }

  if (moduleTitle === "OCR Scanning") {
    return <OCRScanning accessToken={accessToken} />;
  }

  if (moduleTitle === "Community Platform") {
    return <CommunityPlatform accessToken={accessToken} />;
  }

  if (moduleTitle === "Patient Journal") {
    return <PatientJournal accessToken={accessToken} />;
  }

  if (moduleTitle === "To-Do Lists") {
    return <TodoLists accessToken={accessToken} />;
  }

  if (moduleTitle === "Health Insights") {
    return <InsightReports accessToken={accessToken} />;
  }

  if (moduleTitle === "Follow-Up Plans") {
    return <FollowUpPlans accessToken={accessToken} />;
  }

  if (moduleTitle === "Financial Management") {
    return <FinancialManagement accessToken={accessToken} />;
  }

  if (moduleTitle === "Support Tickets") {
    return <TicketSystem accessToken={accessToken} />;
  }

  if (moduleTitle === "Health Timeline") {
    return <TimelineVisualization accessToken={accessToken} />;
  }

  if (moduleTitle === "Request Templates") {
    return <RequestTemplates accessToken={accessToken} />;
  }

  if (moduleTitle === "Mind Maps") {
    return <MindMaps accessToken={accessToken} />;
  }

  if (moduleTitle === "Help & FAQs") {
    return <HelpManual accessToken={accessToken} />;
  }

  if (moduleTitle === "Gender Identity & Pronouns") {
    return <GenderIdentity accessToken={accessToken} />;
  }

  if (moduleTitle === "Consent & Boundaries") {
    return <ConsentBoundaries accessToken={accessToken} />;
  }

  if (moduleTitle === "Transition Care Tracking") {
    return <TransitionCareTracking accessToken={accessToken} />;
  }

  if (moduleTitle === "Safety Planning") {
    return <SafetyPlanning accessToken={accessToken} />;
  }

  if (moduleTitle === "Body Mapping") {
    return <BodyMapping accessToken={accessToken} />;
  }

  if (moduleTitle === "Reproductive Health") {
    return <ReproductiveHealth accessToken={accessToken} />;
  }

  if (moduleTitle === "Sexual Health") {
    return <SexualHealth accessToken={accessToken} />;
  }

  if (moduleTitle === "Medical Advocacy") {
    return <MedicalAdvocacy accessToken={accessToken} />;
  }

  if (moduleTitle === "Accessibility & Accommodations") {
    return <AccessibilityAccommodations accessToken={accessToken} />;
  }

    // Default view for modules without custom components yet
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{moduleTitle}</CardTitle>
            <CardDescription>Manage your {moduleTitle.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                This module is ready for data. Add items to get started.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </div>

            {/* Sample data display */}
            <div className="border rounded-lg divide-y">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Sample Item {item}</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Coming soon:</strong> This module will include advanced features for managing {moduleTitle.toLowerCase()},
                including data entry forms, search and filtering, detailed views, and integration with your health records.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Suspense fallback={<ModuleLoadingFallback />}>
      {renderModule()}
    </Suspense>
  );
}

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: "active" | "pending" | "completed";
  count?: number;
  isNew?: boolean;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

function ModuleCard({ title, description, icon, status, count, isNew, onClick, isFavorite, onToggleFavorite }: ModuleCardProps) {
  return (
    <Card className="relative cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      {isNew && <Badge className="absolute -top-2 -right-2 bg-blue-500">New</Badge>}
      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
        </button>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            {icon}
          </div>
          <div>
            <CardTitle className="text-sm">{title}</CardTitle>
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">{count} items</p>
            )}
          </div>
        </div>
        {status && (
          <Badge
            variant={status === 'active' ? 'default' : status === 'completed' ? 'secondary' : 'outline'}
            className="text-xs"
          >
            {status}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

interface UserData {
  id: string;
  email: string;
  name?: string;
  role: 'patient' | 'provider';
  createdAt?: string;
}

interface HealthcareDashboardProps {
  accessToken: string;
  role: 'patient' | 'provider';
  onLogout: () => void;
}

export function HealthcareDashboard({ accessToken, role, onLogout }: HealthcareDashboardProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'categories'>('categories');
  const [favoriteModules, setFavoriteModules] = useState<string[]>([]);
  const [recentModules, setRecentModules] = useState<string[]>([]);

  useEffect(() => {
    fetchUserData();
    // Load favorites and recent modules from localStorage
    const savedFavorites = localStorage.getItem('favoriteModules');
    const savedRecent = localStorage.getItem('recentModules');
    if (savedFavorites) {
      setFavoriteModules(JSON.parse(savedFavorites));
    }
    if (savedRecent) {
      setRecentModules(JSON.parse(savedRecent));
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/user`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
  };
  // Patient-focused modules (organized by category for cleaner UX)
  const patientModules = [
    {
      title: "My Profile",
      description: "Personal information, demographics, contact details",
      icon: <User className="h-4 w-4" />,
      status: "active" as const,
      category: "Medical Records"
    },
    {
      title: "Gender Identity & Pronouns",
      description: "Chosen name, pronouns, gender identity, and visibility preferences",
      icon: <Heart className="h-4 w-4" />,
      status: "active" as const,
      category: "Identity & Wellness"
    },
    {
      title: "Consent & Boundaries",
      description: "Trauma-informed care preferences and physical exam boundaries",
      icon: <Shield className="h-4 w-4" />,
      status: "active" as const,
      category: "Identity & Wellness"
    },
    {
      title: "Transition Care Tracking",
      description: "HRT tracking, procedures, milestones, and letters of support",
      icon: <Heart className="h-4 w-4" />,
      status: "active" as const,
      category: "Identity & Wellness"
    },
    {
      title: "Safety Planning",
      description: "Crisis resources, safe people, coping strategies, and emergency plans",
      icon: <Shield className="h-4 w-4" />,
      status: "active" as const,
      category: "Mental Health & Support"
    },
    {
      title: "Body Mapping",
      description: "Track dysphoria, euphoria, and sensations with custom anatomy terms",
      icon: <User className="h-4 w-4" />,
      status: "active" as const,
      category: "Identity & Wellness"
    },
    {
      title: "Reproductive Health",
      description: "Gender-neutral fertility, pregnancy, and family planning",
      icon: <Baby className="h-4 w-4" />,
      status: "active" as const,
      category: "Specialized Care"
    },
    {
      title: "Sexual Health",
      description: "STI testing, PrEP/PEP, and sexual function tracking",
      icon: <Shield className="h-4 w-4" />,
      status: "active" as const,
      category: "Specialized Care"
    },
    {
      title: "Medical Advocacy",
      description: "Report discrimination and access self-advocacy tools",
      icon: <Shield className="h-4 w-4" />,
      status: "active" as const,
      category: "Support & Resources"
    },
    {
      title: "Accessibility & Accommodations",
      description: "Neurodiversity, mobility, sensory, and communication needs",
      icon: <Accessibility className="h-4 w-4" />,
      status: "active" as const,
      category: "Identity & Wellness"
    },
    {
      title: "Health History",
      description: "Mental, physical, familial, and genetic health history",
      icon: <ClipboardList className="h-4 w-4" />,
      status: "active" as const,
      category: "Medical Records"
    },
    {
      title: "Period Tracking",
      description: "Menstrual cycle tracking and symptom monitoring",
      icon: <Calendar className="h-4 w-4" />,
      status: "active" as const,
      category: "Daily Management"
    },
    {
      title: "Patient Journal",
      description: "Personal knowledge base and reflections",
      icon: <FileText className="h-4 w-4" />,
      category: "Tools & Organization"
    },
    {
      title: "Medical Documents",
      description: "Medical records, prescriptions, lab results",
      icon: <FileText className="h-4 w-4" />,
      count: 24,
      status: "active" as const,
      category: "Medical Records"
    },
    {
      title: "Medical Imaging",
      description: "X-rays, MRI, CT scans, ultrasounds",
      icon: <Scan className="h-4 w-4" />,
      count: 8,
      category: "Medical Records"
    },
    {
      title: "OCR Scanning",
      description: "Extract text from medical documents",
      icon: <Scan className="h-4 w-4" />,
      category: "Tools & Organization"
    },
    {
      title: "Media Library",
      description: "Uploaded art, music, photos, and other media",
      icon: <Image className="h-4 w-4" />,
      category: "Tools & Organization"
    },
    {
      title: "Medication Tracking",
      description: "Current medications, dosages, schedules",
      icon: <Pill className="h-4 w-4" />,
      status: "active" as const,
      count: 5,
      category: "Daily Management"
    },
    {
      title: "Symptom Tracking",
      description: "Daily symptoms, pain levels, mood tracking",
      icon: <Activity className="h-4 w-4" />,
      count: 15,
      status: "active" as const,
      category: "Daily Management"
    },
    {
      title: "Lab Results",
      description: "Blood work, urine tests, diagnostic reports",
      icon: <BarChart3 className="h-4 w-4" />,
      count: 12,
      status: "active" as const,
      category: "Medical Records"
    },
    {
      title: "Vital Signs Chart",
      description: "Blood pressure, heart rate, temperature trends",
      icon: <TrendingUp className="h-4 w-4" />,
      status: "active" as const,
      category: "Daily Management"
    },
    {
      title: "Appointment Scheduling",
      description: "Book, reschedule, and manage appointments",
      icon: <Calendar className="h-4 w-4" />,
      count: 3,
      category: "Appointments & Care"
    },
    {
      title: "Mental Health Questionnaires",
      description: "PHQ-9, GAD-7, PCL-5, ASRS, PSS-10, Y-BOCS assessments",
      icon: <Brain className="h-4 w-4" />,
      status: "active" as const,
      category: "Mental Health & Support"
    },
    {
      title: "Messages",
      description: "Secure messaging with healthcare providers",
      icon: <MessageSquare className="h-4 w-4" />,
      count: 7,
      status: "active" as const,
      category: "Communication"
    },
    {
      title: "Community Platform",
      description: "Connect with other patients and share experiences",
      icon: <MessageSquare className="h-4 w-4" />,
      category: "Communication"
    },
    {
      title: "Care Team",
      description: "Primary care, specialists, emergency contacts",
      icon: <UserPlus className="h-4 w-4" />,
      count: 4,
      status: "active" as const,
      category: "Appointments & Care"
    },
    {
      title: "Follow-Up Plans",
      description: "Post-appointment care plans and tracking",
      icon: <Calendar className="h-4 w-4" />,
      category: "Appointments & Care"
    },
    {
      title: "Insurance & Billing",
      description: "Insurance info, claims, payment history",
      icon: <FileCheck className="h-4 w-4" />,
      status: "active" as const,
      category: "Financial"
    },
    {
      title: "Financial Management",
      description: "Receipts, refunds, payments, authorizations, permits",
      icon: <FileCheck className="h-4 w-4" />,
      category: "Financial"
    },
    {
      title: "Health Goals",
      description: "Set and track wellness objectives",
      icon: <Heart className="h-4 w-4" />,
      status: "active" as const,
      count: 3,
      category: "Daily Management"
    },
    {
      title: "To-Do Lists",
      description: "Generated tasks from documents and appointments",
      icon: <CheckSquare className="h-4 w-4" />,
      category: "Tools & Organization"
    },
    {
      title: "Self-Care Tracker",
      description: "Exercise, nutrition, sleep, mental health",
      icon: <Stethoscope className="h-4 w-4" />,
      count: 30,
      category: "Daily Management"
    },
    {
      title: "Health Insights",
      description: "AI-generated reports with side-by-side comparisons",
      icon: <TrendingUp className="h-4 w-4" />,
      isNew: true,
      category: "Analytics & Insights"
    },
    {
      title: "Health Timeline",
      description: "3D visualization of health journey over time",
      icon: <Activity className="h-4 w-4" />,
      isNew: true,
      category: "Analytics & Insights"
    },
    {
      title: "Mind Maps",
      description: "Visualize connections between health factors",
      icon: <Brain className="h-4 w-4" />,
      isNew: true,
      category: "Analytics & Insights"
    },
    {
      title: "Request Templates",
      description: "Pre-filled forms for common requests",
      icon: <FileText className="h-4 w-4" />,
      category: "Tools & Organization"
    },
    {
      title: "Support Tickets",
      description: "Submit and track support requests",
      icon: <HelpCircle className="h-4 w-4" />,
      category: "Support & Resources"
    },
    {
      title: "Help & FAQs",
      description: "Documentation, tutorials, and support",
      icon: <HelpCircle className="h-4 w-4" />,
      category: "Support & Resources"
    },
    {
      title: "Health Resources",
      description: "Educational materials, support groups",
      icon: <Search className="h-4 w-4" />,
      count: 156,
      category: "Support & Resources"
    }
  ];

  // Provider-focused modules
  const providerModules = [
    {
      title: "Patient Management",
      description: "View and manage patient records",
      icon: <UserPlus className="h-4 w-4" />,
      count: 147
    },
    {
      title: "Appointments",
      description: "Schedule and manage patient appointments",
      icon: <Calendar className="h-4 w-4" />,
      count: 23,
      status: "active" as const
    },
    {
      title: "Medical Records",
      description: "Access patient medical records and history",
      icon: <FileText className="h-4 w-4" />,
      count: 342
    },
    {
      title: "Lab Results",
      description: "Review and approve lab test results",
      icon: <BarChart3 className="h-4 w-4" />,
      count: 28,
      status: "pending" as const
    },
    {
      title: "Prescriptions",
      description: "Write and manage patient prescriptions",
      icon: <Pill className="h-4 w-4" />,
      count: 15
    },
    {
      title: "Medical Imaging",
      description: "Review X-rays, MRIs, CT scans",
      icon: <Scan className="h-4 w-4" />,
      count: 12
    },
    {
      title: "Patient Messages",
      description: "Secure communication with patients",
      icon: <MessageSquare className="h-4 w-4" />,
      count: 18,
      isNew: true
    },
    {
      title: "Treatment Plans",
      description: "Create and monitor patient treatment plans",
      icon: <ClipboardList className="h-4 w-4" />,
      count: 34
    },
    {
      title: "Referrals",
      description: "Manage specialist referrals",
      icon: <UserPlus className="h-4 w-4" />,
      count: 8
    },
    {
      title: "Reports & Analytics",
      description: "Patient outcomes and practice analytics",
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: "Documentation",
      description: "Clinical notes and documentation",
      icon: <FileCheck className="h-4 w-4" />
    },
    {
      title: "Resources",
      description: "Medical references and guidelines",
      icon: <Search className="h-4 w-4" />,
      count: 256
    }
  ];

  const modules = role === 'patient' ? patientModules : providerModules;

  // Filter modules based on search query
  const filteredModules = modules.filter(module => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      module.title.toLowerCase().includes(query) ||
      module.description.toLowerCase().includes(query)
    );
  });

  // Group modules by category
  const categorizedModules = filteredModules.reduce((acc, module) => {
    const category = (module as any).category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof modules>);

  const categoryOrder = [
    'Daily Management',
    'Medical Records',
    'Appointments & Care',
    'Communication',
    'Identity & Wellness',
    'Mental Health & Support',
    'Specialized Care',
    'Financial',
    'Analytics & Insights',
    'Tools & Organization',
    'Support & Resources',
    'Other'
  ];

  const handleModuleClick = (moduleTitle: string) => {
    setActiveModule(moduleTitle);

    // Track recently accessed modules
    const updatedRecent = [moduleTitle, ...recentModules.filter(m => m !== moduleTitle)].slice(0, 6);
    setRecentModules(updatedRecent);
    localStorage.setItem('recentModules', JSON.stringify(updatedRecent));
  };

  const handleBackToDashboard = () => {
    setActiveModule(null);
  };

  const toggleFavorite = (moduleTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedFavorites = favoriteModules.includes(moduleTitle)
      ? favoriteModules.filter(m => m !== moduleTitle)
      : [...favoriteModules, moduleTitle];
    setFavoriteModules(updatedFavorites);
    localStorage.setItem('favoriteModules', JSON.stringify(updatedFavorites));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          </div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {role === 'patient' ? 'My Health Portal' : 'Provider Portal'}
                </h1>
                <p className="text-sm text-gray-500">
                  {role === 'patient' ? 'Your Personal Health Dashboard' : 'Patient Care Management'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAccessibilitySettings(true)}>
              <Accessibility className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back, {userData?.name || 'User'}
          </h2>
          <p className="text-gray-600">
            {role === 'patient' 
              ? 'Access your health records and manage your care from one place. Your care, your identity, your way.'
              : 'Manage patient care and access medical information from your dashboard. Providing inclusive, affirming care for all.'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {role === 'patient' ? (
            <>
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">2</p>
                    <p className="text-sm text-gray-500">Upcoming Appointments</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <Pill className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">5</p>
                    <p className="text-sm text-gray-500">Active Medications</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="p-3 bg-orange-100 rounded-full mr-4">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">3</p>
                    <p className="text-sm text-gray-500">New Lab Results</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">7</p>
                    <p className="text-sm text-gray-500">Unread Messages</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">147</p>
                    <p className="text-sm text-gray-500">Active Patients</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">23</p>
                    <p className="text-sm text-gray-500">Today's Appointments</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="p-3 bg-orange-100 rounded-full mr-4">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">12</p>
                    <p className="text-sm text-gray-500">Pending Reports</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">18</p>
                    <p className="text-sm text-gray-500">Patient Messages</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Module Grid or Detail View */}
        {activeModule ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleBackToDashboard}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <ModuleDetailView moduleTitle={activeModule} role={role} accessToken={accessToken} />
          </div>
        ) : (
          <>
            {/* Search Bar and View Toggle */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search modules... (medications, appointments, etc.)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'categories' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('categories')}
                >
                  Categories
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  All Modules
                </Button>
              </div>
            </div>

            {searchQuery && (
              <p className="text-sm text-gray-500 mb-4">
                Found {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* Favorites Section */}
            {!searchQuery && favoriteModules.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  Favorites
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.filter(m => favoriteModules.includes(m.title)).slice(0, 6).map((module, index) => (
                    <ModuleCard
                      key={index}
                      title={module.title}
                      description={module.description}
                      icon={module.icon}
                      status={module.status}
                      count={module.count}
                      isNew={module.isNew}
                      isFavorite={true}
                      onToggleFavorite={(e) => toggleFavorite(module.title, e)}
                      onClick={() => handleModuleClick(module.title)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recently Accessed Section */}
            {!searchQuery && recentModules.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recently Accessed
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.filter(m => recentModules.includes(m.title)).slice(0, 6).map((module, index) => (
                    <ModuleCard
                      key={index}
                      title={module.title}
                      description={module.description}
                      icon={module.icon}
                      status={module.status}
                      count={module.count}
                      isNew={module.isNew}
                      isFavorite={favoriteModules.includes(module.title)}
                      onToggleFavorite={(e) => toggleFavorite(module.title, e)}
                      onClick={() => handleModuleClick(module.title)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Modules Heading */}
            {!searchQuery && (favoriteModules.length > 0 || recentModules.length > 0) && (
              <h3 className="text-lg font-semibold mb-4 mt-8">All Modules</h3>
            )}

            {/* Module Display - Categories or Grid */}
            {filteredModules.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No modules found matching "{searchQuery}"</p>
                <Button variant="link" onClick={() => setSearchQuery("")} className="mt-2">
                  Clear search
                </Button>
              </div>
            ) : viewMode === 'categories' && role === 'patient' ? (
              <Accordion type="multiple" defaultValue={['Daily Management', 'Medical Records', 'Communication']} className="space-y-4">
                {categoryOrder.map(category => {
                  const categoryModules = categorizedModules[category];
                  if (!categoryModules || categoryModules.length === 0) return null;

                  return (
                    <AccordionItem key={category} value={category} className="border rounded-lg px-6 bg-white">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full pr-4">
                          <h3 className="text-lg font-semibold">{category}</h3>
                          <Badge variant="secondary" className="ml-2">
                            {categoryModules.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 pb-2">
                          {categoryModules.map((module, index) => (
                            <ModuleCard
                              key={index}
                              title={module.title}
                              description={module.description}
                              icon={module.icon}
                              status={module.status}
                              count={module.count}
                              isNew={module.isNew}
                              isFavorite={favoriteModules.includes(module.title)}
                              onToggleFavorite={(e) => toggleFavorite(module.title, e)}
                              onClick={() => handleModuleClick(module.title)}
                            />
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModules.map((module, index) => (
                  <ModuleCard
                    key={index}
                    title={module.title}
                    description={module.description}
                    icon={module.icon}
                    status={module.status}
                    count={module.count}
                    isNew={module.isNew}
                    isFavorite={favoriteModules.includes(module.title)}
                    onToggleFavorite={(e) => toggleFavorite(module.title, e)}
                    onClick={() => handleModuleClick(module.title)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Quick Actions */}
        {!activeModule && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              {role === 'patient' ? (
                <>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Provider
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Records
                  </Button>
                </>
              ) : (
                <>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Patient
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Accessibility Settings Dialog */}
      <Dialog open={showAccessibilitySettings} onOpenChange={setShowAccessibilitySettings}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Accessibility Settings</DialogTitle>
          </DialogHeader>
          <Suspense fallback={<ModuleLoadingFallback />}>
            <VisualAccessibilitySettings onClose={() => setShowAccessibilitySettings(false)} />
          </Suspense>
        </DialogContent>
      </Dialog>
    </div>
  );
}