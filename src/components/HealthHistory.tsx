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
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import {
  Save,
  Edit,
  Brain,
  Heart,
  Users,
  Dna,
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  Activity,
} from "lucide-react";
import { projectId } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface HealthHistoryProps {
  accessToken: string;
}

interface MentalHealthCondition {
  condition: string;
  diagnosedYear: string;
  status: string;
}

interface PhysicalCondition {
  condition: string;
  diagnosedYear: string;
  status: string;
}

interface Surgery {
  procedure: string;
  year: string;
  notes: string;
}

interface Hospitalization {
  reason: string;
  year: string;
  duration: string;
}

interface FamilyMember {
  relationship: string;
  condition: string;
  ageOfOnset: string;
}

interface GeneticCondition {
  condition: string;
  inheritance: string;
  testedPositive: boolean;
}

interface GeneticTestResult {
  id: string;
  provider: string;
  testDate: string;
  reportFile?: string;
  keyFindings: string;
  traits: string;
  healthRisks: string;
  carrierStatus: string;
  ancestry: string;
}

interface HealthHistoryData {
  // Mental Health
  mentalHealthConditions: MentalHealthCondition[];
  currentMentalHealthTreatment: string;
  pastMentalHealthTreatment: string;
  psychiatricHospitalizations: Hospitalization[];
  currentMedications: string;
  substanceUse: {
    alcohol: string;
    tobacco: string;
    recreationalDrugs: string;
    cannabis: string;
  };
  // Physical Health
  chronicConditions: PhysicalCondition[];
  surgeries: Surgery[];
  hospitalizations: Hospitalization[];
  currentPhysicalSymptoms: string;
  reproductiveHealth: {
    menstrualHistory: string;
    pregnancies: string;
    sexualHealth: string;
  };
  // Familial History
  familyMentalHealth: FamilyMember[];
  familyPhysicalHealth: FamilyMember[];
  // Genetic History
  geneticConditions: GeneticCondition[];
  geneticTestResults: GeneticTestResult[];
  geneticTesting: string;
  ethnicity: string;
  consanguinity: boolean;
}

export function HealthHistory({ accessToken }: HealthHistoryProps) {
  const [history, setHistory] = useState<HealthHistoryData>({
    mentalHealthConditions: [],
    currentMentalHealthTreatment: "",
    pastMentalHealthTreatment: "",
    psychiatricHospitalizations: [],
    currentMedications: "",
    substanceUse: {
      alcohol: "",
      tobacco: "",
      recreationalDrugs: "",
      cannabis: "",
    },
    chronicConditions: [],
    surgeries: [],
    hospitalizations: [],
    currentPhysicalSymptoms: "",
    reproductiveHealth: {
      menstrualHistory: "",
      pregnancies: "",
      sexualHealth: "",
    },
    familyMentalHealth: [],
    familyPhysicalHealth: [],
    geneticConditions: [],
    geneticTestResults: [],
    geneticTesting: "",
    ethnicity: "",
    consanguinity: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalHistory, setOriginalHistory] = useState<HealthHistoryData | null>(null);

  useEffect(() => {
    fetchHealthHistory();
  }, []);

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

  const fetchHealthHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/health-history`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
        setOriginalHistory(data);
      } else {
        toast.error("Failed to load health history");
      }
    } catch (error) {
      console.error("Error fetching health history:", error);
      toast.error("Error loading health history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/health-history`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(history),
        }
      );

      if (response.ok) {
        toast.success("Health history updated successfully");
        setIsEditing(false);
        setHasUnsavedChanges(false);
        setOriginalHistory(history);
      } else {
        toast.error("Failed to update health history");
      }
    } catch (error) {
      console.error("Error updating health history:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        return;
      }
    }
    setHistory(originalHistory || history);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const updateField = <K extends keyof HealthHistoryData>(
    field: K,
    value: HealthHistoryData[K]
  ) => {
    setHistory((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const updateNestedField = <K extends keyof HealthHistoryData, NK extends keyof HealthHistoryData[K]>(
    field: K,
    nestedField: NK,
    value: HealthHistoryData[K][NK]
  ) => {
    setHistory((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as object),
        [nestedField]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

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
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
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
          <h2 className="text-2xl font-semibold">Health History Intake</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive mental, physical, familial, and genetic health information
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit History
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && isEditing && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-900">
                You have unsaved changes. Remember to save before leaving this page.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">
                Confidential Health Information
              </h3>
              <p className="text-sm text-blue-800">
                All information provided here is strictly confidential and protected by HIPAA.
                This information helps your healthcare team provide you with the best possible care.
                You may skip any questions you're not comfortable answering.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mental Health History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>Mental Health History</CardTitle>
          </div>
          <CardDescription>
            Information about your mental health, treatments, and current wellbeing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Mental Health Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Current Mental Health Conditions</Label>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateField("mentalHealthConditions", [
                      ...history.mentalHealthConditions,
                      { condition: "", diagnosedYear: "", status: "active" },
                    ]);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Condition
                </Button>
              )}
            </div>
            {history.mentalHealthConditions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conditions added</p>
            ) : (
              <div className="space-y-3">
                {history.mentalHealthConditions.map((cond, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Condition</Label>
                        <Input
                          value={cond.condition}
                          onChange={(e) => {
                            const updated = [...history.mentalHealthConditions];
                            updated[index].condition = e.target.value;
                            updateField("mentalHealthConditions", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="e.g., Depression, Anxiety"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Year Diagnosed</Label>
                        <Input
                          value={cond.diagnosedYear}
                          onChange={(e) => {
                            const updated = [...history.mentalHealthConditions];
                            updated[index].diagnosedYear = e.target.value;
                            updateField("mentalHealthConditions", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="YYYY"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={cond.status}
                          onValueChange={(value) => {
                            const updated = [...history.mentalHealthConditions];
                            updated[index].status = value;
                            updateField("mentalHealthConditions", updated);
                          }}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="managed">Managed</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = history.mentalHealthConditions.filter(
                            (_, i) => i !== index
                          );
                          updateField("mentalHealthConditions", updated);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentMentalTreatment">
                Current Mental Health Treatment
              </Label>
              <Textarea
                id="currentMentalTreatment"
                value={history.currentMentalHealthTreatment}
                onChange={(e) =>
                  updateField("currentMentalHealthTreatment", e.target.value)
                }
                disabled={!isEditing}
                placeholder="Therapy, counseling, support groups, etc."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pastMentalTreatment">
                Past Mental Health Treatment
              </Label>
              <Textarea
                id="pastMentalTreatment"
                value={history.pastMentalHealthTreatment}
                onChange={(e) =>
                  updateField("pastMentalHealthTreatment", e.target.value)
                }
                disabled={!isEditing}
                placeholder="Previous treatments, therapies, or interventions"
                rows={4}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications">
              Current Mental Health Medications
            </Label>
            <Textarea
              id="currentMedications"
              value={history.currentMedications}
              onChange={(e) => updateField("currentMedications", e.target.value)}
              disabled={!isEditing}
              placeholder="List all current psychiatric medications, dosages, and frequency"
              rows={3}
            />
          </div>

          {/* Substance Use */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Substance Use</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="alcohol">Alcohol Use</Label>
                <Select
                  value={history.substanceUse.alcohol}
                  onValueChange={(value) =>
                    updateNestedField("substanceUse", "alcohol", value)
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="occasionally">Occasionally (1-2x/month)</SelectItem>
                    <SelectItem value="socially">Socially (1-2x/week)</SelectItem>
                    <SelectItem value="regularly">Regularly (3-4x/week)</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="past">Past use, currently abstinent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tobacco">Tobacco Use</Label>
                <Select
                  value={history.substanceUse.tobacco}
                  onValueChange={(value) =>
                    updateNestedField("substanceUse", "tobacco", value)
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="former">Former user</SelectItem>
                    <SelectItem value="occasional">Occasional</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cannabis">Cannabis Use</Label>
                <Select
                  value={history.substanceUse.cannabis}
                  onValueChange={(value) =>
                    updateNestedField("substanceUse", "cannabis", value)
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                    <SelectItem value="regularly">Regularly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="medical">Medical use only</SelectItem>
                    <SelectItem value="past">Past use</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recreationalDrugs">Other Substances</Label>
                <Input
                  id="recreationalDrugs"
                  value={history.substanceUse.recreationalDrugs}
                  onChange={(e) =>
                    updateNestedField("substanceUse", "recreationalDrugs", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="Any other substance use"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Health History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            <CardTitle>Physical Health History</CardTitle>
          </div>
          <CardDescription>
            Information about your physical health conditions and medical procedures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chronic Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Chronic Physical Conditions</Label>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateField("chronicConditions", [
                      ...history.chronicConditions,
                      { condition: "", diagnosedYear: "", status: "active" },
                    ]);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Condition
                </Button>
              )}
            </div>
            {history.chronicConditions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conditions added</p>
            ) : (
              <div className="space-y-3">
                {history.chronicConditions.map((cond, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Condition</Label>
                        <Input
                          value={cond.condition}
                          onChange={(e) => {
                            const updated = [...history.chronicConditions];
                            updated[index].condition = e.target.value;
                            updateField("chronicConditions", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="e.g., Diabetes, Hypertension"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Year Diagnosed</Label>
                        <Input
                          value={cond.diagnosedYear}
                          onChange={(e) => {
                            const updated = [...history.chronicConditions];
                            updated[index].diagnosedYear = e.target.value;
                            updateField("chronicConditions", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="YYYY"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={cond.status}
                          onValueChange={(value) => {
                            const updated = [...history.chronicConditions];
                            updated[index].status = value;
                            updateField("chronicConditions", updated);
                          }}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="managed">Managed/Controlled</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = history.chronicConditions.filter(
                            (_, i) => i !== index
                          );
                          updateField("chronicConditions", updated);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Surgeries */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Surgical History</Label>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateField("surgeries", [
                      ...history.surgeries,
                      { procedure: "", year: "", notes: "" },
                    ]);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Surgery
                </Button>
              )}
            </div>
            {history.surgeries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No surgeries added</p>
            ) : (
              <div className="space-y-3">
                {history.surgeries.map((surgery, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Procedure</Label>
                        <Input
                          value={surgery.procedure}
                          onChange={(e) => {
                            const updated = [...history.surgeries];
                            updated[index].procedure = e.target.value;
                            updateField("surgeries", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="Type of surgery"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Year</Label>
                        <Input
                          value={surgery.year}
                          onChange={(e) => {
                            const updated = [...history.surgeries];
                            updated[index].year = e.target.value;
                            updateField("surgeries", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="YYYY"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Notes</Label>
                        <Input
                          value={surgery.notes}
                          onChange={(e) => {
                            const updated = [...history.surgeries];
                            updated[index].notes = e.target.value;
                            updateField("surgeries", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="Additional details"
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = history.surgeries.filter((_, i) => i !== index);
                          updateField("surgeries", updated);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentSymptoms">Current Physical Symptoms</Label>
            <Textarea
              id="currentSymptoms"
              value={history.currentPhysicalSymptoms}
              onChange={(e) => updateField("currentPhysicalSymptoms", e.target.value)}
              disabled={!isEditing}
              placeholder="Any current symptoms, pain, or physical concerns"
              rows={4}
            />
          </div>

          {/* Reproductive Health */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm">Reproductive Health (Optional)</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="menstrualHistory">Menstrual History</Label>
                <Textarea
                  id="menstrualHistory"
                  value={history.reproductiveHealth.menstrualHistory}
                  onChange={(e) =>
                    updateNestedField("reproductiveHealth", "menstrualHistory", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="Age of first period, cycle regularity, current status, etc."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pregnancies">Pregnancy History</Label>
                <Textarea
                  id="pregnancies"
                  value={history.reproductiveHealth.pregnancies}
                  onChange={(e) =>
                    updateNestedField("reproductiveHealth", "pregnancies", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="Number of pregnancies, births, complications, etc."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexualHealth">Sexual Health</Label>
                <Textarea
                  id="sexualHealth"
                  value={history.reproductiveHealth.sexualHealth}
                  onChange={(e) =>
                    updateNestedField("reproductiveHealth", "sexualHealth", e.target.value)
                  }
                  disabled={!isEditing}
                  placeholder="STI history, contraception, concerns (all confidential)"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Familial Health History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <CardTitle>Familial Health History</CardTitle>
          </div>
          <CardDescription>
            Health conditions in your biological family members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Family Mental Health */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Family Mental Health History</Label>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateField("familyMentalHealth", [
                      ...history.familyMentalHealth,
                      { relationship: "", condition: "", ageOfOnset: "" },
                    ]);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Family Member
                </Button>
              )}
            </div>
            {history.familyMentalHealth.length === 0 ? (
              <p className="text-sm text-muted-foreground">No family history added</p>
            ) : (
              <div className="space-y-3">
                {history.familyMentalHealth.map((member, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Relationship</Label>
                        <Select
                          value={member.relationship}
                          onValueChange={(value) => {
                            const updated = [...history.familyMentalHealth];
                            updated[index].relationship = value;
                            updateField("familyMentalHealth", updated);
                          }}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="sister">Sister</SelectItem>
                            <SelectItem value="brother">Brother</SelectItem>
                            <SelectItem value="grandmother">Grandmother</SelectItem>
                            <SelectItem value="grandfather">Grandfather</SelectItem>
                            <SelectItem value="aunt">Aunt</SelectItem>
                            <SelectItem value="uncle">Uncle</SelectItem>
                            <SelectItem value="cousin">Cousin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Condition</Label>
                        <Input
                          value={member.condition}
                          onChange={(e) => {
                            const updated = [...history.familyMentalHealth];
                            updated[index].condition = e.target.value;
                            updateField("familyMentalHealth", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="Mental health condition"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Age of Onset (if known)</Label>
                        <Input
                          value={member.ageOfOnset}
                          onChange={(e) => {
                            const updated = [...history.familyMentalHealth];
                            updated[index].ageOfOnset = e.target.value;
                            updateField("familyMentalHealth", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="Age"
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = history.familyMentalHealth.filter(
                            (_, i) => i !== index
                          );
                          updateField("familyMentalHealth", updated);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Family Physical Health */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Family Physical Health History</Label>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateField("familyPhysicalHealth", [
                      ...history.familyPhysicalHealth,
                      { relationship: "", condition: "", ageOfOnset: "" },
                    ]);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Family Member
                </Button>
              )}
            </div>
            {history.familyPhysicalHealth.length === 0 ? (
              <p className="text-sm text-muted-foreground">No family history added</p>
            ) : (
              <div className="space-y-3">
                {history.familyPhysicalHealth.map((member, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Relationship</Label>
                        <Select
                          value={member.relationship}
                          onValueChange={(value) => {
                            const updated = [...history.familyPhysicalHealth];
                            updated[index].relationship = value;
                            updateField("familyPhysicalHealth", updated);
                          }}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mother">Mother</SelectItem>
                            <SelectItem value="father">Father</SelectItem>
                            <SelectItem value="sister">Sister</SelectItem>
                            <SelectItem value="brother">Brother</SelectItem>
                            <SelectItem value="grandmother">Grandmother</SelectItem>
                            <SelectItem value="grandfather">Grandfather</SelectItem>
                            <SelectItem value="aunt">Aunt</SelectItem>
                            <SelectItem value="uncle">Uncle</SelectItem>
                            <SelectItem value="cousin">Cousin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Condition</Label>
                        <Input
                          value={member.condition}
                          onChange={(e) => {
                            const updated = [...history.familyPhysicalHealth];
                            updated[index].condition = e.target.value;
                            updateField("familyPhysicalHealth", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="e.g., Heart disease, Cancer, Diabetes"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Age of Onset (if known)</Label>
                        <Input
                          value={member.ageOfOnset}
                          onChange={(e) => {
                            const updated = [...history.familyPhysicalHealth];
                            updated[index].ageOfOnset = e.target.value;
                            updateField("familyPhysicalHealth", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="Age"
                        />
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = history.familyPhysicalHealth.filter(
                            (_, i) => i !== index
                          );
                          updateField("familyPhysicalHealth", updated);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Genetic Health History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-green-600" />
            <CardTitle>Genetic Health Information</CardTitle>
          </div>
          <CardDescription>
            Genetic testing results and hereditary conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Genetic Testing Panel Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Commercial Genetic Testing Results</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Results from 23andMe, AncestryDNA, MyHeritage, etc.
                </p>
              </div>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateField("geneticTestResults", [
                      ...history.geneticTestResults,
                      {
                        id: crypto.randomUUID(),
                        provider: "",
                        testDate: "",
                        reportFile: "",
                        keyFindings: "",
                        traits: "",
                        healthRisks: "",
                        carrierStatus: "",
                        ancestry: "",
                      },
                    ]);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Test Result
                </Button>
              )}
            </div>

            {history.geneticTestResults.length === 0 ? (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Dna className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">
                  No genetic test results added yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Add results from genetic testing services to help your healthcare team
                  provide personalized care
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.geneticTestResults.map((test, index) => (
                  <Card key={test.id} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Dna className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold">
                            {test.provider || "Genetic Test"} {test.testDate && `(${test.testDate})`}
                          </h4>
                        </div>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const updated = history.geneticTestResults.filter(
                                (t) => t.id !== test.id
                              );
                              updateField("geneticTestResults", updated);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Testing Company/Provider</Label>
                          <Select
                            value={test.provider}
                            onValueChange={(value) => {
                              const updated = [...history.geneticTestResults];
                              updated[index].provider = value;
                              updateField("geneticTestResults", updated);
                            }}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="23andMe">23andMe</SelectItem>
                              <SelectItem value="AncestryDNA">AncestryDNA</SelectItem>
                              <SelectItem value="MyHeritage DNA">MyHeritage DNA</SelectItem>
                              <SelectItem value="FamilyTreeDNA">FamilyTreeDNA</SelectItem>
                              <SelectItem value="Nebula Genomics">Nebula Genomics</SelectItem>
                              <SelectItem value="Living DNA">Living DNA</SelectItem>
                              <SelectItem value="Dante Labs">Dante Labs</SelectItem>
                              <SelectItem value="Color Genomics">Color Genomics</SelectItem>
                              <SelectItem value="Invitae">Invitae</SelectItem>
                              <SelectItem value="GeneDx">GeneDx</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Test Date</Label>
                          <Input
                            type="date"
                            value={test.testDate}
                            onChange={(e) => {
                              const updated = [...history.geneticTestResults];
                              updated[index].testDate = e.target.value;
                              updateField("geneticTestResults", updated);
                            }}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Report File Reference</Label>
                        <Input
                          value={test.reportFile || ""}
                          onChange={(e) => {
                            const updated = [...history.geneticTestResults];
                            updated[index].reportFile = e.target.value;
                            updateField("geneticTestResults", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="File name or reference number for your records"
                        />
                        <p className="text-xs text-muted-foreground">
                          Note: Do not upload actual files here. Keep reference for your records.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Key Findings</Label>
                          <Textarea
                            value={test.keyFindings}
                            onChange={(e) => {
                              const updated = [...history.geneticTestResults];
                              updated[index].keyFindings = e.target.value;
                              updateField("geneticTestResults", updated);
                            }}
                            disabled={!isEditing}
                            placeholder="Important findings from the report"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Health Predispositions/Risks</Label>
                          <Textarea
                            value={test.healthRisks}
                            onChange={(e) => {
                              const updated = [...history.geneticTestResults];
                              updated[index].healthRisks = e.target.value;
                              updateField("geneticTestResults", updated);
                            }}
                            disabled={!isEditing}
                            placeholder="e.g., Increased risk for Type 2 Diabetes, Celiac Disease"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Carrier Status</Label>
                          <Textarea
                            value={test.carrierStatus}
                            onChange={(e) => {
                              const updated = [...history.geneticTestResults];
                              updated[index].carrierStatus = e.target.value;
                              updateField("geneticTestResults", updated);
                            }}
                            disabled={!isEditing}
                            placeholder="Carrier status for genetic conditions (e.g., Sickle Cell, Cystic Fibrosis)"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Traits & Characteristics</Label>
                          <Textarea
                            value={test.traits}
                            onChange={(e) => {
                              const updated = [...history.geneticTestResults];
                              updated[index].traits = e.target.value;
                              updateField("geneticTestResults", updated);
                            }}
                            disabled={!isEditing}
                            placeholder="e.g., Lactose intolerance, Caffeine metabolism, etc."
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Ancestry Composition</Label>
                          <Textarea
                            value={test.ancestry}
                            onChange={(e) => {
                              const updated = [...history.geneticTestResults];
                              updated[index].ancestry = e.target.value;
                              updateField("geneticTestResults", updated);
                            }}
                            disabled={!isEditing}
                            placeholder="Ancestry breakdown from the test"
                            rows={2}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Additional Genetic Information
              </span>
            </div>
          </div>

          {/* Genetic Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Known Genetic Conditions</Label>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateField("geneticConditions", [
                      ...history.geneticConditions,
                      { condition: "", inheritance: "", testedPositive: false },
                    ]);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Condition
                </Button>
              )}
            </div>
            {history.geneticConditions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No genetic conditions added</p>
            ) : (
              <div className="space-y-3">
                {history.geneticConditions.map((cond, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Condition/Gene</Label>
                        <Input
                          value={cond.condition}
                          onChange={(e) => {
                            const updated = [...history.geneticConditions];
                            updated[index].condition = e.target.value;
                            updateField("geneticConditions", updated);
                          }}
                          disabled={!isEditing}
                          placeholder="e.g., BRCA1, Sickle Cell"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Inheritance Pattern</Label>
                        <Select
                          value={cond.inheritance}
                          onValueChange={(value) => {
                            const updated = [...history.geneticConditions];
                            updated[index].inheritance = value;
                            updateField("geneticConditions", updated);
                          }}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="autosomal-dominant">Autosomal Dominant</SelectItem>
                            <SelectItem value="autosomal-recessive">Autosomal Recessive</SelectItem>
                            <SelectItem value="x-linked">X-Linked</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Test Result</Label>
                        <Select
                          value={cond.testedPositive ? "positive" : "carrier"}
                          onValueChange={(value) => {
                            const updated = [...history.geneticConditions];
                            updated[index].testedPositive = value === "positive";
                            updateField("geneticConditions", updated);
                          }}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">Positive</SelectItem>
                            <SelectItem value="carrier">Carrier</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = history.geneticConditions.filter(
                            (_, i) => i !== index
                          );
                          updateField("geneticConditions", updated);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="geneticTesting">Genetic Testing History</Label>
              <Textarea
                id="geneticTesting"
                value={history.geneticTesting}
                onChange={(e) => updateField("geneticTesting", e.target.value)}
                disabled={!isEditing}
                placeholder="List any genetic tests performed, dates, and providers"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnic Background</Label>
              <Textarea
                id="ethnicity"
                value={history.ethnicity}
                onChange={(e) => updateField("ethnicity", e.target.value)}
                disabled={!isEditing}
                placeholder="Ethnic heritage (relevant for genetic risk assessment)"
                rows={4}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="consanguinity"
              checked={history.consanguinity}
              onChange={(e) => updateField("consanguinity", e.target.checked)}
              disabled={!isEditing}
              className="rounded"
            />
            <Label htmlFor="consanguinity" className="cursor-pointer text-sm">
              Parents are blood relatives (consanguinity)
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
