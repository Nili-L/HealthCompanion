import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import {
  Save,
  Edit,
  User,
  Heart,
  Phone,
  Shield,
  Stethoscope,
  Building2,
  Sparkles,
  Plus,
  Trash2,
  Hospital,
  Search,
  AlertCircle,
} from "lucide-react";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface PatientProfileProps {
  accessToken: string;
}

interface ProfileData {
  // Identity fields
  legalName: string;
  chosenName: string;
  otherNames: string;
  pronouns: string;
  dateOfBirth: string;
  genderIdentity: string;
  sexAssignedAtBirth: string;
  sexualOrientation: string;
  // Medical fields
  bloodType: string;
  height: string;
  weight: string;
  allergies: string;
  medicalConditions: string;
  genderAffirmingCare: string;
}

interface HealthcareProvider {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  address: string;
  isPrimary: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

interface KupatHolim {
  id: string;
  provider: string;
  memberNumber: string;
  branch: string;
  isPrimary: boolean;
}

export function PatientProfile({
  accessToken,
}: PatientProfileProps) {
  const [profile, setProfile] = useState<ProfileData>({
    legalName: "",
    chosenName: "",
    otherNames: "",
    pronouns: "",
    dateOfBirth: "",
    genderIdentity: "",
    sexAssignedAtBirth: "",
    sexualOrientation: "",
    bloodType: "",
    height: "",
    weight: "",
    allergies: "",
    medicalConditions: "",
    genderAffirmingCare: "",
  });

  const [providers, setProviders] = useState<
    HealthcareProvider[]
  >([]);
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]);
  const [kupatHolim, setKupatHolim] = useState<KupatHolim[]>(
    [],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Dialog states
  const [providerDialogOpen, setProviderDialogOpen] =
    useState(false);
  const [contactDialogOpen, setContactDialogOpen] =
    useState(false);
  const [kupatHolimDialogOpen, setKupatHolimDialogOpen] =
    useState(false);

  // Editing states
  const [editingProvider, setEditingProvider] =
    useState<HealthcareProvider | null>(null);
  const [editingContact, setEditingContact] =
    useState<EmergencyContact | null>(null);
  const [editingKupatHolim, setEditingKupatHolim] =
    useState<KupatHolim | null>(null);

  // Delete states
  const [deletingProvider, setDeletingProvider] =
    useState<HealthcareProvider | null>(null);
  const [deletingContact, setDeletingContact] =
    useState<EmergencyContact | null>(null);
  const [deletingKupatHolim, setDeletingKupatHolim] =
    useState<KupatHolim | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchProfile(),
      fetchProviders(),
      fetchEmergencyContacts(),
      fetchKupatHolim(),
    ]);
    setIsLoading(false);
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setOriginalProfile(data);
        setHasUnsavedChanges(false);
      } else {
        console.error(
          "Failed to fetch profile:",
          await response.text(),
        );
        toast.error("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Error loading profile data");
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/providers`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  const fetchEmergencyContacts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/emergency-contacts`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setEmergencyContacts(data);
      }
    } catch (error) {
      console.error(
        "Error fetching emergency contacts:",
        error,
      );
    }
  };

  const fetchKupatHolim = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/kupat-holim`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setKupatHolim(data);
      }
    } catch (error) {
      console.error("Error fetching Kupat Holim:", error);
    }
  };

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!profile.legalName?.trim()) {
      errors.legalName = "Legal name is required";
    }
    if (!profile.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    } else {
      // Validate date is not in the future
      const dob = new Date(profile.dateOfBirth);
      if (dob > new Date()) {
        errors.dateOfBirth = "Date of birth cannot be in the future";
      }
      // Validate age is reasonable (0-150 years)
      const age = (new Date().getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (age < 0 || age > 150) {
        errors.dateOfBirth = "Please enter a valid date of birth";
      }
    }

    // Height validation (if provided)
    if (profile.height && (parseFloat(profile.height) < 30 || parseFloat(profile.height) > 300)) {
      errors.height = "Height should be between 30-300 cm";
    }

    // Weight validation (if provided)
    if (profile.weight && (parseFloat(profile.weight) < 1 || parseFloat(profile.weight) > 500)) {
      errors.weight = "Weight should be between 1-500 kg";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profile),
        },
      );

      if (response.ok) {
        toast.success("Profile updated successfully");
        setIsEditing(false);
        setHasUnsavedChanges(false);
        setOriginalProfile(profile);
        setValidationErrors({});
      } else {
        console.error(
          "Failed to update profile:",
          await response.text(),
        );
        toast.error("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    field: keyof ProfileData,
    value: string,
  ) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        return;
      }
    }
    setProfile(originalProfile || profile);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setValidationErrors({});
  };

  // Provider CRUD
  const handleSaveProvider = async (
    providerData: Omit<HealthcareProvider, "id">,
  ) => {
    try {
      const url = editingProvider
        ? `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/providers/${editingProvider.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/providers`;

      const response = await fetch(url, {
        method: editingProvider ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(providerData),
      });

      if (response.ok) {
        toast.success(
          editingProvider
            ? "Provider updated"
            : "Provider added",
        );
        setProviderDialogOpen(false);
        setEditingProvider(null);
        fetchProviders();
      } else {
        toast.error("Failed to save provider");
      }
    } catch (error) {
      console.error("Error saving provider:", error);
      toast.error("Error saving provider");
    }
  };

  const handleDeleteProvider = async (
    provider: HealthcareProvider,
  ) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/providers/${provider.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        toast.success("Provider deleted");
        setDeletingProvider(null);
        fetchProviders();
      } else {
        toast.error("Failed to delete provider");
      }
    } catch (error) {
      console.error("Error deleting provider:", error);
      toast.error("Error deleting provider");
    }
  };

  // Emergency Contact CRUD
  const handleSaveContact = async (
    contactData: Omit<EmergencyContact, "id">,
  ) => {
    try {
      const url = editingContact
        ? `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/emergency-contacts/${editingContact.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/emergency-contacts`;

      const response = await fetch(url, {
        method: editingContact ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        toast.success(
          editingContact ? "Contact updated" : "Contact added",
        );
        setContactDialogOpen(false);
        setEditingContact(null);
        fetchEmergencyContacts();
      } else {
        toast.error("Failed to save contact");
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error("Error saving contact");
    }
  };

  const handleDeleteContact = async (
    contact: EmergencyContact,
  ) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/emergency-contacts/${contact.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        toast.success("Contact deleted");
        setDeletingContact(null);
        fetchEmergencyContacts();
      } else {
        toast.error("Failed to delete contact");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Error deleting contact");
    }
  };

  // Kupat Holim CRUD
  const handleSaveKupatHolim = async (
    kupatHolimData: Omit<KupatHolim, "id">,
  ) => {
    try {
      const url = editingKupatHolim
        ? `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/kupat-holim/${editingKupatHolim.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/kupat-holim`;

      const response = await fetch(url, {
        method: editingKupatHolim ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(kupatHolimData),
      });

      if (response.ok) {
        toast.success(
          editingKupatHolim
            ? "Kupat Holim updated"
            : "Kupat Holim added",
        );
        setKupatHolimDialogOpen(false);
        setEditingKupatHolim(null);
        fetchKupatHolim();
      } else {
        toast.error("Failed to save Kupat Holim");
      }
    } catch (error) {
      console.error("Error saving Kupat Holim:", error);
      toast.error("Error saving Kupat Holim");
    }
  };

  const handleDeleteKupatHolim = async (kh: KupatHolim) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/kupat-holim/${kh.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        toast.success("Kupat Holim deleted");
        setDeletingKupatHolim(null);
        fetchKupatHolim();
      } else {
        toast.error("Failed to delete Kupat Holim");
      }
    } catch (error) {
      console.error("Error deleting Kupat Holim:", error);
      toast.error("Error deleting Kupat Holim");
    }
  };

  // Filter providers and contacts based on search
  const filteredProviders = providers.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = emergencyContacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.relation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredKupatHolim = kupatHolim.filter((k) =>
    k.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.memberNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">
            Patient Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your personal and medical information
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Validation Errors Banner */}
      {Object.keys(validationErrors).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">
                  Please fix the following errors:
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && isEditing && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-900">
                  You have unsaved changes. Remember to save your profile before leaving this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-1">
                Safe & Inclusive Care
              </h3>
              <p className="text-sm text-purple-800">
                Your identity information is private and secure.
                We use this information to provide you with
                appropriate, respectful care. You can choose to
                share only what you're comfortable with, and
                update your information at any time. Your chosen
                name and pronouns will be used in all
                communications. Additional names are only used
                for matching insurance and medical records when
                necessary.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Identity & Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <CardTitle>
              Identity & Personal Information
            </CardTitle>
          </div>
          <CardDescription>
            Your name, pronouns, and personal identity
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="legalName" className="flex items-center gap-1">
              Legal Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="legalName"
              value={profile.legalName}
              onChange={(e) =>
                handleChange("legalName", e.target.value)
              }
              disabled={!isEditing}
              placeholder="Name on insurance/ID"
              className={validationErrors.legalName ? "border-red-500 focus-visible:ring-red-500" : ""}
              aria-invalid={!!validationErrors.legalName}
              aria-describedby={validationErrors.legalName ? "legalName-error" : undefined}
              required
            />
            {validationErrors.legalName && (
              <p id="legalName-error" className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.legalName}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="chosenName">Chosen Name</Label>
            <Input
              id="chosenName"
              value={profile.chosenName}
              onChange={(e) =>
                handleChange("chosenName", e.target.value)
              }
              disabled={!isEditing}
              placeholder="Name you go by"
              aria-label="Chosen name or preferred name"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="otherNames">
              Other Names (for Insurance/Medical Records)
            </Label>
            <Input
              id="otherNames"
              value={profile.otherNames}
              onChange={(e) =>
                handleChange("otherNames", e.target.value)
              }
              disabled={!isEditing}
              placeholder="Previous names, maiden name, or other names you may be listed under"
            />
            <p className="text-xs text-muted-foreground">
              Include any previous legal names, maiden names, or
              other names that may appear on insurance documents
              or medical records
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pronouns">Pronouns</Label>
            <Select
              value={profile.pronouns}
              onValueChange={(value) =>
                handleChange("pronouns", value)
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pronouns" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="she/her">she/her</SelectItem>
                <SelectItem value="he/him">he/him</SelectItem>
                <SelectItem value="they/them">
                  they/them
                </SelectItem>
                <SelectItem value="she/they">
                  she/they
                </SelectItem>
                <SelectItem value="he/they">he/they</SelectItem>
                <SelectItem value="any">
                  any pronouns
                </SelectItem>
                <SelectItem value="other">
                  other/ask me
                </SelectItem>
                <SelectItem value="prefer-not-to-say">
                  prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="flex items-center gap-1">
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={profile.dateOfBirth}
              onChange={(e) =>
                handleChange("dateOfBirth", e.target.value)
              }
              disabled={!isEditing}
              className={validationErrors.dateOfBirth ? "border-red-500 focus-visible:ring-red-500" : ""}
              aria-invalid={!!validationErrors.dateOfBirth}
              aria-describedby={validationErrors.dateOfBirth ? "dateOfBirth-error" : undefined}
              required
            />
            {validationErrors.dateOfBirth && (
              <p id="dateOfBirth-error" className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.dateOfBirth}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="genderIdentity">
              Gender Identity
            </Label>
            <Select
              value={profile.genderIdentity}
              onValueChange={(value) =>
                handleChange("genderIdentity", value)
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender identity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="woman">Woman</SelectItem>
                <SelectItem value="man">Man</SelectItem>
                <SelectItem value="non-binary">
                  Non-binary
                </SelectItem>
                <SelectItem value="genderqueer">
                  Genderqueer
                </SelectItem>
                <SelectItem value="genderfluid">
                  Genderfluid
                </SelectItem>
                <SelectItem value="agender">Agender</SelectItem>
                <SelectItem value="two-spirit">
                  Two-Spirit
                </SelectItem>
                <SelectItem value="transgender-woman">
                  Transgender Woman
                </SelectItem>
                <SelectItem value="transgender-man">
                  Transgender Man
                </SelectItem>
                <SelectItem value="questioning">
                  Questioning
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sexAssignedAtBirth">
              Sex Assigned at Birth
            </Label>
            <Select
              value={profile.sexAssignedAtBirth}
              onValueChange={(value) =>
                handleChange("sexAssignedAtBirth", value)
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sex assigned at birth" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="intersex">
                  Intersex
                </SelectItem>
                <SelectItem value="prefer-not-to-say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="sexualOrientation">
              Sexual Orientation (optional)
            </Label>
            <Select
              value={profile.sexualOrientation}
              onValueChange={(value) =>
                handleChange("sexualOrientation", value)
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sexual orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">
                  Straight/Heterosexual
                </SelectItem>
                <SelectItem value="gay">Gay</SelectItem>
                <SelectItem value="lesbian">Lesbian</SelectItem>
                <SelectItem value="bisexual">
                  Bisexual
                </SelectItem>
                <SelectItem value="pansexual">
                  Pansexual
                </SelectItem>
                <SelectItem value="asexual">Asexual</SelectItem>
                <SelectItem value="queer">Queer</SelectItem>
                <SelectItem value="questioning">
                  Questioning
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <CardTitle>Medical Information</CardTitle>
          </div>
          <CardDescription>
            Your vital statistics and medical details
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bloodType">Blood Type</Label>
            <Select
              value={profile.bloodType}
              onValueChange={(value) =>
                handleChange("bloodType", value)
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              value={profile.height}
              onChange={(e) =>
                handleChange("height", e.target.value)
              }
              disabled={!isEditing}
              placeholder="170"
              min="30"
              max="300"
              className={validationErrors.height ? "border-red-500 focus-visible:ring-red-500" : ""}
              aria-invalid={!!validationErrors.height}
              aria-describedby={validationErrors.height ? "height-error" : undefined}
            />
            {validationErrors.height && (
              <p id="height-error" className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.height}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={profile.weight}
              onChange={(e) =>
                handleChange("weight", e.target.value)
              }
              disabled={!isEditing}
              placeholder="70"
              min="1"
              max="500"
              className={validationErrors.weight ? "border-red-500 focus-visible:ring-red-500" : ""}
              aria-invalid={!!validationErrors.weight}
              aria-describedby={validationErrors.weight ? "weight-error" : undefined}
            />
            {validationErrors.weight && (
              <p id="weight-error" className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.weight}
              </p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={profile.allergies}
              onChange={(e) =>
                handleChange("allergies", e.target.value)
              }
              disabled={!isEditing}
              placeholder="List any allergies (medications, foods, etc.)"
              rows={3}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="medicalConditions">
              Medical Conditions
            </Label>
            <Textarea
              id="medicalConditions"
              value={profile.medicalConditions}
              onChange={(e) =>
                handleChange(
                  "medicalConditions",
                  e.target.value,
                )
              }
              disabled={!isEditing}
              placeholder="List any chronic conditions or diagnoses"
              rows={3}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="genderAffirmingCare">
              Gender-Affirming Care (optional)
            </Label>
            <Textarea
              id="genderAffirmingCare"
              value={profile.genderAffirmingCare}
              onChange={(e) =>
                handleChange(
                  "genderAffirmingCare",
                  e.target.value,
                )
              }
              disabled={!isEditing}
              placeholder="Hormone therapy, surgeries, or other gender-affirming treatments you're receiving or have received"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-orange-600" />
              <div>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>
                  People to contact in case of emergency
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              {emergencyContacts.length > 0 && (
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-48"
                    aria-label="Search emergency contacts"
                  />
                </div>
              )}
              <Button
                size="sm"
                onClick={() => {
                  setEditingContact(null);
                  setContactDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {emergencyContacts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No emergency contacts added yet
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No contacts match your search
            </div>
          ) : (
            <div className="space-y-3">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {contact.name}
                      </p>
                      {contact.isPrimary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contact.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {contact.relation}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingContact(contact);
                        setContactDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDeletingContact(contact)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kupat Holim */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Hospital className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle>Kupat Holim (קופת חולים)</CardTitle>
                <CardDescription>
                  Your Israeli health fund memberships
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              {kupatHolim.length > 0 && (
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search Kupat Holim..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-48"
                    aria-label="Search Kupat Holim"
                  />
                </div>
              )}
              <Button
                size="sm"
                onClick={() => {
                  setEditingKupatHolim(null);
                  setKupatHolimDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Kupat Holim
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {kupatHolim.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No Kupat Holim memberships added yet
            </div>
          ) : filteredKupatHolim.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No Kupat Holim match your search
            </div>
          ) : (
            <div className="space-y-3">
              {filteredKupatHolim.map((kh) => (
                <div
                  key={kh.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {kh.provider}
                      </p>
                      {kh.isPrimary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Member #: {kh.memberNumber}
                    </p>
                    {kh.branch && (
                      <p className="text-sm text-muted-foreground">
                        Branch: {kh.branch}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingKupatHolim(kh);
                        setKupatHolimDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingKupatHolim(kh)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Healthcare Providers */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>Healthcare Providers</CardTitle>
                <CardDescription>
                  Your doctors, specialists, and healthcare team
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              {providers.length > 0 && (
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search providers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-48"
                    aria-label="Search healthcare providers"
                  />
                </div>
              )}
              <Button
                size="sm"
                onClick={() => {
                  setEditingProvider(null);
                  setProviderDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No healthcare providers added yet
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No providers match your search
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {provider.name}
                      </p>
                      {provider.isPrimary && (
                        <Badge variant="default">Primary</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {provider.specialty}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {provider.phone}
                    </p>
                    {provider.address && (
                      <p className="text-sm text-muted-foreground">
                        {provider.address}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProvider(provider);
                        setProviderDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDeletingProvider(provider)
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Provider Dialog */}
      <ProviderDialog
        open={providerDialogOpen}
        onOpenChange={setProviderDialogOpen}
        provider={editingProvider}
        onSave={handleSaveProvider}
      />

      {/* Emergency Contact Dialog */}
      <EmergencyContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        contact={editingContact}
        onSave={handleSaveContact}
      />

      {/* Kupat Holim Dialog */}
      <KupatHolimDialog
        open={kupatHolimDialogOpen}
        onOpenChange={setKupatHolimDialogOpen}
        kupatHolim={editingKupatHolim}
        onSave={handleSaveKupatHolim}
      />

      {/* Delete Confirmations */}
      <AlertDialog
        open={!!deletingProvider}
        onOpenChange={() => setDeletingProvider(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {deletingProvider?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingProvider &&
                handleDeleteProvider(deletingProvider)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingContact}
        onOpenChange={() => setDeletingContact(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Emergency Contact
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {deletingContact?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingContact &&
                handleDeleteContact(deletingContact)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingKupatHolim}
        onOpenChange={() => setDeletingKupatHolim(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Kupat Holim
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {deletingKupatHolim?.provider}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingKupatHolim &&
                handleDeleteKupatHolim(deletingKupatHolim)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Provider Dialog Component
function ProviderDialog({
  open,
  onOpenChange,
  provider,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: HealthcareProvider | null;
  onSave: (data: Omit<HealthcareProvider, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    address: "",
    isPrimary: false,
  });

  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        specialty: provider.specialty,
        phone: provider.phone,
        email: provider.email,
        address: provider.address,
        isPrimary: provider.isPrimary,
      });
    } else {
      setFormData({
        name: "",
        specialty: "",
        phone: "",
        email: "",
        address: "",
        isPrimary: false,
      });
    }
  }, [provider, open]);

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      toast.error("Please fill in required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {provider
              ? "Edit Provider"
              : "Add Healthcare Provider"}
          </DialogTitle>
          <DialogDescription>
            Add information about your doctor or healthcare
            provider
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="providerName">Name *</Label>
            <Input
              id="providerName"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="Dr. Sarah Cohen"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  specialty: e.target.value,
                })
              }
              placeholder="Family Medicine, Cardiology, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="providerPhone">Phone *</Label>
            <Input
              id="providerPhone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              placeholder="03-1234567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="providerEmail">Email</Label>
            <Input
              id="providerEmail"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              placeholder="doctor@clinic.co.il"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="providerAddress">Address</Label>
            <Input
              id="providerAddress"
              value={formData.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: e.target.value,
                })
              }
              placeholder="123 Dizengoff St, Tel Aviv"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrimaryProvider"
              checked={formData.isPrimary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isPrimary: e.target.checked,
                })
              }
              className="rounded"
            />
            <Label
              htmlFor="isPrimaryProvider"
              className="cursor-pointer"
            >
              Primary care provider
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Provider</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Emergency Contact Dialog Component
function EmergencyContactDialog({
  open,
  onOpenChange,
  contact,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: EmergencyContact | null;
  onSave: (data: Omit<EmergencyContact, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relation: "",
    isPrimary: false,
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        phone: contact.phone,
        relation: contact.relation,
        isPrimary: contact.isPrimary,
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        relation: "",
        isPrimary: false,
      });
    }
  }, [contact, open]);

  const handleSubmit = () => {
    if (!formData.name || !formData.phone) {
      toast.error("Please fill in required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {contact
              ? "Edit Emergency Contact"
              : "Add Emergency Contact"}
          </DialogTitle>
          <DialogDescription>
            Add someone to contact in case of emergency
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Name *</Label>
            <Input
              id="contactName"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="Yael Levi"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Phone *</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              placeholder="050-1234567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="relation">Relationship</Label>
            <Input
              id="relation"
              value={formData.relation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  relation: e.target.value,
                })
              }
              placeholder="Spouse, Parent, Sibling, Friend, etc."
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrimaryContact"
              checked={formData.isPrimary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isPrimary: e.target.checked,
                })
              }
              className="rounded"
            />
            <Label
              htmlFor="isPrimaryContact"
              className="cursor-pointer"
            >
              Primary emergency contact
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Contact</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Kupat Holim Dialog Component
function KupatHolimDialog({
  open,
  onOpenChange,
  kupatHolim,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kupatHolim: KupatHolim | null;
  onSave: (data: Omit<KupatHolim, "id">) => void;
}) {
  const [formData, setFormData] = useState({
    provider: "",
    memberNumber: "",
    branch: "",
    isPrimary: false,
  });

  useEffect(() => {
    if (kupatHolim) {
      setFormData({
        provider: kupatHolim.provider,
        memberNumber: kupatHolim.memberNumber,
        branch: kupatHolim.branch,
        isPrimary: kupatHolim.isPrimary,
      });
    } else {
      setFormData({
        provider: "",
        memberNumber: "",
        branch: "",
        isPrimary: false,
      });
    }
  }, [kupatHolim, open]);

  const handleSubmit = () => {
    if (!formData.provider || !formData.memberNumber) {
      toast.error("Please fill in required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {kupatHolim
              ? "Edit Kupat Holim"
              : "Add Kupat Holim"}
          </DialogTitle>
          <DialogDescription>
            Add your Israeli health fund membership information
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Kupat Holim *</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) =>
                setFormData({ ...formData, provider: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select health fund" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Clalit (כללית)">
                  Clalit (כללית)
                </SelectItem>
                <SelectItem value="Maccabi (מכבי)">
                  Maccabi (מכבי)
                </SelectItem>
                <SelectItem value="Meuhedet (מאוחדת)">
                  Meuhedet (מאוחדת)
                </SelectItem>
                <SelectItem value="Leumit (לאומית)">
                  Leumit (לאומית)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="memberNumber">
              Member Number *
            </Label>
            <Input
              id="memberNumber"
              value={formData.memberNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  memberNumber: e.target.value,
                })
              }
              placeholder="123456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch">Branch (optional)</Label>
            <Input
              id="branch"
              value={formData.branch}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  branch: e.target.value,
                })
              }
              placeholder="Tel Aviv Central, Jerusalem, etc."
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrimaryKupat"
              checked={formData.isPrimary}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isPrimary: e.target.checked,
                })
              }
              className="rounded"
            />
            <Label
              htmlFor="isPrimaryKupat"
              className="cursor-pointer"
            >
              Primary Kupat Holim
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Kupat Holim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}