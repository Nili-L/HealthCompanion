import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
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
  CheckSquare
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { PatientProfile } from "./PatientProfile";
import { MedicationManager } from "./MedicationManager";
import { HealthHistory } from "./HealthHistory";
import { MedicalDocuments } from "./MedicalDocuments";
import { AppointmentScheduling } from "./AppointmentScheduling";
import { LabResultsVitals } from "./LabResultsVitals";
import { SymptomTracking } from "./SymptomTracking";
import { SecureMessages } from "./SecureMessages";
import { CareTeam } from "./CareTeam";
import { InsuranceBilling } from "./InsuranceBilling";
import { HealthGoals } from "./HealthGoals";
import { MentalHealthQuestionnaires } from "./MentalHealthQuestionnaires";
import { PeriodTracking } from "./PeriodTracking";
import { MediaLibrary } from "./MediaLibrary";
import { OCRScanning } from "./OCRScanning";
import { CommunityPlatform } from "./CommunityPlatform";
import { PatientJournal } from "./PatientJournal";
import { TodoLists } from "./TodoLists";
import { InsightReports } from "./InsightReports";
import { FollowUpPlans } from "./FollowUpPlans";
import { FinancialManagement } from "./FinancialManagement";
import { TicketSystem } from "./TicketSystem";
import { TimelineVisualization } from "./TimelineVisualization";
import { RequestTemplates } from "./RequestTemplates";
import { MindMaps } from "./MindMaps";
import { HelpManual } from "./HelpManual";
import { MedicalImaging } from "./MedicalImaging";

interface ModuleDetailViewProps {
  moduleTitle: string;
  role: 'patient' | 'provider';
  accessToken: string;
}

function ModuleDetailView({ moduleTitle, role, accessToken }: ModuleDetailViewProps) {
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
}

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status?: "active" | "pending" | "completed";
  count?: number;
  isNew?: boolean;
  onClick?: () => void;
}

function ModuleCard({ title, description, icon, status, count, isNew, onClick }: ModuleCardProps) {
  return (
    <Card className="relative cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      {isNew && <Badge className="absolute -top-2 -right-2 bg-blue-500">New</Badge>}
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

interface HealthcareDashboardProps {
  accessToken: string;
  role: 'patient' | 'provider';
  onLogout: () => void;
}

export function HealthcareDashboard({ accessToken, role, onLogout }: HealthcareDashboardProps) {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
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
  // Patient-focused modules (flat list)
  const patientModules = [
    {
      title: "My Profile",
      description: "Personal information, demographics, contact details",
      icon: <User className="h-4 w-4" />,
      status: "active" as const
    },
    {
      title: "Health History",
      description: "Mental, physical, familial, and genetic health history",
      icon: <ClipboardList className="h-4 w-4" />,
      status: "active" as const,
      isNew: true
    },
    {
      title: "Period Tracking",
      description: "Menstrual cycle tracking and symptom monitoring",
      icon: <Calendar className="h-4 w-4" />,
      status: "active" as const,
      isNew: true
    },
    {
      title: "Patient Journal",
      description: "Personal knowledge base and reflections",
      icon: <FileText className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Medical Documents",
      description: "Medical records, prescriptions, lab results",
      icon: <FileText className="h-4 w-4" />,
      count: 24,
      status: "active" as const,
      isNew: true
    },
    {
      title: "Medical Imaging",
      description: "X-rays, MRI, CT scans, ultrasounds",
      icon: <Scan className="h-4 w-4" />,
      count: 8
    },
    {
      title: "OCR Scanning",
      description: "Extract text from medical documents",
      icon: <Scan className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Media Library",
      description: "Uploaded art, music, photos, and other media",
      icon: <Image className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Medication Tracking",
      description: "Current medications, dosages, schedules",
      icon: <Pill className="h-4 w-4" />,
      status: "active" as const,
      count: 5
    },
    {
      title: "Symptom Tracking",
      description: "Daily symptoms, pain levels, mood tracking",
      icon: <Activity className="h-4 w-4" />,
      count: 15,
      status: "active" as const,
      isNew: true
    },
    {
      title: "Lab Results",
      description: "Blood work, urine tests, diagnostic reports",
      icon: <BarChart3 className="h-4 w-4" />,
      count: 12,
      status: "active" as const,
      isNew: true
    },
    {
      title: "Vital Signs Chart",
      description: "Blood pressure, heart rate, temperature trends",
      icon: <TrendingUp className="h-4 w-4" />,
      status: "active" as const,
      isNew: true
    },
    {
      title: "Appointment Scheduling",
      description: "Book, reschedule, and manage appointments",
      icon: <Calendar className="h-4 w-4" />,
      count: 3,
      isNew: true
    },
    {
      title: "Mental Health Questionnaires",
      description: "PHQ-9, GAD-7, PCL-5, ASRS, PSS-10, Y-BOCS assessments",
      icon: <Brain className="h-4 w-4" />,
      status: "active" as const,
      isNew: true
    },
    {
      title: "Messages",
      description: "Secure messaging with healthcare providers",
      icon: <MessageSquare className="h-4 w-4" />,
      count: 7,
      status: "active" as const,
      isNew: true
    },
    {
      title: "Community Platform",
      description: "Connect with other patients and share experiences",
      icon: <MessageSquare className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Care Team",
      description: "Primary care, specialists, emergency contacts",
      icon: <UserPlus className="h-4 w-4" />,
      count: 4,
      status: "active" as const,
      isNew: true
    },
    {
      title: "Follow-Up Plans",
      description: "Post-appointment care plans and tracking",
      icon: <Calendar className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Insurance & Billing",
      description: "Insurance info, claims, payment history",
      icon: <FileCheck className="h-4 w-4" />,
      status: "active" as const,
      isNew: true
    },
    {
      title: "Financial Management",
      description: "Receipts, refunds, payments, authorizations, permits",
      icon: <FileCheck className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Health Goals",
      description: "Set and track wellness objectives",
      icon: <Heart className="h-4 w-4" />,
      status: "active" as const,
      count: 3,
      isNew: true
    },
    {
      title: "To-Do Lists",
      description: "Generated tasks from documents and appointments",
      icon: <CheckSquare className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Self-Care Tracker",
      description: "Exercise, nutrition, sleep, mental health",
      icon: <Stethoscope className="h-4 w-4" />,
      count: 30
    },
    {
      title: "Health Insights",
      description: "AI-generated reports with side-by-side comparisons",
      icon: <TrendingUp className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Health Timeline",
      description: "3D visualization of health journey over time",
      icon: <Activity className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Mind Maps",
      description: "Visualize connections between health factors",
      icon: <Brain className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Request Templates",
      description: "Pre-filled forms for common requests",
      icon: <FileText className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Support Tickets",
      description: "Submit and track support requests",
      icon: <HelpCircle className="h-4 w-4" />,
      isNew: true
    },
    {
      title: "Help & FAQs",
      description: "Documentation, tutorials, and support",
      icon: <HelpCircle className="h-4 w-4" />
    },
    {
      title: "Health Resources",
      description: "Educational materials, support groups",
      icon: <Search className="h-4 w-4" />,
      count: 156
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

  const handleModuleClick = (moduleTitle: string) => {
    setActiveModule(moduleTitle);
  };

  const handleBackToDashboard = () => {
    setActiveModule(null);
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
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {modules.map((module, index) => (
              <ModuleCard
                key={index}
                title={module.title}
                description={module.description}
                icon={module.icon}
                status={module.status}
                count={module.count}
                isNew={module.isNew}
                onClick={() => handleModuleClick(module.title)}
              />
            ))}
          </div>
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
    </div>
  );
}