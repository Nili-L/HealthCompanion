import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "./ui/tabs";
import {
  Heart,
  Save,
  Plus,
  X,
  Baby,
  Calendar,
  Info,
  AlertCircle
} from "lucide-react";
import { projectId } from "../utils/supabase/info";

interface ReproductiveHealthProps {
  accessToken: string;
}

interface FertilityOption {
  id: string;
  type: 'egg-freezing' | 'sperm-banking' | 'embryo-freezing' | 'ovarian-tissue' | 'other';
  date: string;
  facility: string;
  cost: string;
  status: 'considering' | 'scheduled' | 'completed';
  notes: string;
}

interface PregnancyTracking {
  isPregnant: boolean;
  dueDate: string;
  gestationalAge: string;
  pronounsForBaby: string;
  birthPlan: {
    preferredTerminology: string; // e.g., "birthing person" instead of "mother"
    supportPeople: string[];
    feedingPlan: string; // chest-feeding, bottle, etc
    genderAffirmingCare: string;
    notes: string;
  };
  prenatalCare: {
    provider: string;
    nextAppointment: string;
    concerns: string[];
  };
}

interface ContraceptionTracking {
  currentMethod: string;
  startDate: string;
  effectiveness: string;
  sideEffects: string[];
  hrtCompatibility: string;
  notes: string;
}

interface ReproductiveHealthData {
  fertilityPreservation: FertilityOption[];
  pregnancy: PregnancyTracking;
  contraception: ContraceptionTracking;
  reproductiveGoals: string;
  parenting: {
    isParent: boolean;
    numberOfChildren: number;
    agesOfChildren: string;
    coParentingNotes: string;
  };
  terminology: {
    preferredParentTerm: string; // parent, dad, mom, baba, etc
    preferredFeedingTerm: string; // chest-feeding, nursing, bottle-feeding
    preferredGestationTerm: string; // pregnant, gestating, expecting
  };
  menstrualHealth: {
    tracking: boolean;
    suppressionDesired: boolean;
    dysphoriaNotes: string;
  };
}

export function ReproductiveHealth({ accessToken }: ReproductiveHealthProps) {
  const [data, setData] = useState<ReproductiveHealthData>({
    fertilityPreservation: [],
    pregnancy: {
      isPregnant: false,
      dueDate: '',
      gestationalAge: '',
      pronounsForBaby: '',
      birthPlan: {
        preferredTerminology: '',
        supportPeople: [],
        feedingPlan: '',
        genderAffirmingCare: '',
        notes: ''
      },
      prenatalCare: {
        provider: '',
        nextAppointment: '',
        concerns: []
      }
    },
    contraception: {
      currentMethod: '',
      startDate: '',
      effectiveness: '',
      sideEffects: [],
      hrtCompatibility: '',
      notes: ''
    },
    reproductiveGoals: '',
    parenting: {
      isParent: false,
      numberOfChildren: 0,
      agesOfChildren: '',
      coParentingNotes: ''
    },
    terminology: {
      preferredParentTerm: 'parent',
      preferredFeedingTerm: 'feeding',
      preferredGestationTerm: 'pregnant'
    },
    menstrualHealth: {
      tracking: false,
      suppressionDesired: false,
      dysphoriaNotes: ''
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/reproductive-health`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching reproductive health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/reproductive-health`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      if (response.ok) {
        // Success feedback
      }
    } catch (error) {
      console.error('Error saving reproductive health:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addFertilityOption = () => {
    const newOption: FertilityOption = {
      id: Date.now().toString(),
      type: 'egg-freezing',
      date: '',
      facility: '',
      cost: '',
      status: 'considering',
      notes: ''
    };
    setData(prev => ({
      ...prev,
      fertilityPreservation: [...prev.fertilityPreservation, newOption]
    }));
  };

  const updateFertilityOption = (id: string, updates: Partial<FertilityOption>) => {
    setData(prev => ({
      ...prev,
      fertilityPreservation: prev.fertilityPreservation.map(o =>
        o.id === id ? { ...o, ...updates } : o
      )
    }));
  };

  const removeFertilityOption = (id: string) => {
    setData(prev => ({
      ...prev,
      fertilityPreservation: prev.fertilityPreservation.filter(o => o.id !== id)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Baby className="h-8 w-8 text-pink-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading reproductive health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-pink-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Baby className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <CardTitle>Reproductive Health</CardTitle>
              <CardDescription>
                Gender-neutral reproductive care, fertility options, and family planning
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Affirming Message */}
      <Card className="bg-pink-50 border-pink-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Heart className="h-5 w-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-pink-900">
              <p className="font-semibold mb-1">All bodies, all families</p>
              <p>Reproductive health is for everyone, regardless of gender. We use affirming, inclusive language for all family-building paths.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fertility">Fertility</TabsTrigger>
          <TabsTrigger value="pregnancy">Pregnancy</TabsTrigger>
          <TabsTrigger value="contraception">Contraception</TabsTrigger>
          <TabsTrigger value="parenting">Parenting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Terminology Preferences</CardTitle>
              <CardDescription>How you want to be referred to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="parentTerm">Preferred Parent Term</Label>
                  <Input
                    id="parentTerm"
                    value={data.terminology.preferredParentTerm}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      terminology: { ...prev.terminology, preferredParentTerm: e.target.value }
                    }))}
                    placeholder="e.g., parent, dad, mom, baba"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="feedingTerm">Preferred Feeding Term</Label>
                  <Input
                    id="feedingTerm"
                    value={data.terminology.preferredFeedingTerm}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      terminology: { ...prev.terminology, preferredFeedingTerm: e.target.value }
                    }))}
                    placeholder="e.g., chest-feeding, nursing"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="gestationTerm">Preferred Gestation Term</Label>
                  <Input
                    id="gestationTerm"
                    value={data.terminology.preferredGestationTerm}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      terminology: { ...prev.terminology, preferredGestationTerm: e.target.value }
                    }))}
                    placeholder="e.g., pregnant, gestating, expecting"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reproductive Goals</CardTitle>
              <CardDescription>Your plans and wishes for family building</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.reproductiveGoals}
                onChange={(e) => setData(prev => ({ ...prev, reproductiveGoals: e.target.value }))}
                placeholder="Do you want biological children? Adoption? Fostering? Timing? Fertility preservation needs?"
                rows={6}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Menstrual Health</CardTitle>
              <CardDescription>Period tracking and management preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="menstrualTracking"
                    checked={data.menstrualHealth.tracking}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      menstrualHealth: { ...prev.menstrualHealth, tracking: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="menstrualTracking">Currently tracking menstrual cycle</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="suppressionDesired"
                    checked={data.menstrualHealth.suppressionDesired}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      menstrualHealth: { ...prev.menstrualHealth, suppressionDesired: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="suppressionDesired">Interested in menstrual suppression options</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="dysphoriaNotes">Dysphoria or Concerns</Label>
                <Textarea
                  id="dysphoriaNotes"
                  value={data.menstrualHealth.dysphoriaNotes}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    menstrualHealth: { ...prev.menstrualHealth, dysphoriaNotes: e.target.value }
                  }))}
                  placeholder="Any dysphoria related to menstruation, or other concerns..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fertility Preservation Tab */}
        <TabsContent value="fertility" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Fertility Preservation</CardTitle>
                  <CardDescription>Options for preserving fertility before HRT or surgery</CardDescription>
                </div>
                <Button onClick={addFertilityOption} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.fertilityPreservation.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Baby className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No fertility preservation options tracked yet</p>
                </div>
              ) : (
                data.fertilityPreservation.map(option => (
                  <Card key={option.id} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={option.type}
                              onValueChange={(value: any) => updateFertilityOption(option.id, { type: value })}
                            >
                              <SelectTrigger className="mt-1.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="egg-freezing">Egg Freezing (Oocyte Cryopreservation)</SelectItem>
                                <SelectItem value="sperm-banking">Sperm Banking</SelectItem>
                                <SelectItem value="embryo-freezing">Embryo Freezing</SelectItem>
                                <SelectItem value="ovarian-tissue">Ovarian Tissue Freezing</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Status</Label>
                            <Select
                              value={option.status}
                              onValueChange={(value: any) => updateFertilityOption(option.id, { status: value })}
                            >
                              <SelectTrigger className="mt-1.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="considering">Considering</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Date</Label>
                            <Input
                              type="date"
                              value={option.date}
                              onChange={(e) => updateFertilityOption(option.id, { date: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Facility/Provider</Label>
                            <Input
                              value={option.facility}
                              onChange={(e) => updateFertilityOption(option.id, { facility: e.target.value })}
                              placeholder="Clinic or provider name"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Estimated Cost</Label>
                            <Input
                              value={option.cost}
                              onChange={(e) => updateFertilityOption(option.id, { cost: e.target.value })}
                              placeholder="$X,XXX"
                              className="mt-1.5"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={option.notes}
                              onChange={(e) => updateFertilityOption(option.id, { notes: e.target.value })}
                              placeholder="Insurance coverage, timeline, concerns..."
                              className="mt-1.5"
                              rows={2}
                            />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFertilityOption(option.id)}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Fertility Preservation Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-900">
                <li><strong>Timing:</strong> Best done before starting HRT for maximum effectiveness</li>
                <li><strong>Cost:</strong> Typically $5,000-$15,000; some insurance covers it</li>
                <li><strong>Time required:</strong> Egg freezing: 2-4 weeks; Sperm banking: 1-2 visits</li>
                <li><strong>Success rates:</strong> Vary by age and method; discuss with fertility specialist</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pregnancy Tab */}
        <TabsContent value="pregnancy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pregnancy Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPregnant"
                  checked={data.pregnancy.isPregnant}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    pregnancy: { ...prev.pregnancy, isPregnant: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="isPregnant">Currently {data.terminology.preferredGestationTerm}</Label>
              </div>

              {data.pregnancy.isPregnant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={data.pregnancy.dueDate}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        pregnancy: { ...prev.pregnancy, dueDate: e.target.value }
                      }))}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Gestational Age</Label>
                    <Input
                      value={data.pregnancy.gestationalAge}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        pregnancy: { ...prev.pregnancy, gestationalAge: e.target.value }
                      }))}
                      placeholder="e.g., 24 weeks"
                      className="mt-1.5"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Prenatal Care Provider</Label>
                    <Input
                      value={data.pregnancy.prenatalCare.provider}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        pregnancy: {
                          ...prev.pregnancy,
                          prenatalCare: { ...prev.pregnancy.prenatalCare, provider: e.target.value }
                        }
                      }))}
                      placeholder="OB, midwife, or care team"
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Next Appointment</Label>
                    <Input
                      type="date"
                      value={data.pregnancy.prenatalCare.nextAppointment}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        pregnancy: {
                          ...prev.pregnancy,
                          prenatalCare: { ...prev.pregnancy.prenatalCare, nextAppointment: e.target.value }
                        }
                      }))}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {data.pregnancy.isPregnant && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gender-Affirming Birth Plan</CardTitle>
                <CardDescription>Your preferences for a respectful, affirming birth experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Preferred Terminology</Label>
                  <Input
                    value={data.pregnancy.birthPlan.preferredTerminology}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      pregnancy: {
                        ...prev.pregnancy,
                        birthPlan: { ...prev.pregnancy.birthPlan, preferredTerminology: e.target.value }
                      }
                    }))}
                    placeholder="e.g., 'birthing person' instead of 'mother'"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Feeding Plan</Label>
                  <Input
                    value={data.pregnancy.birthPlan.feedingPlan}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      pregnancy: {
                        ...prev.pregnancy,
                        birthPlan: { ...prev.pregnancy.birthPlan, feedingPlan: e.target.value }
                      }
                    }))}
                    placeholder="Chest-feeding, bottle feeding, formula..."
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Gender-Affirming Care Requests</Label>
                  <Textarea
                    value={data.pregnancy.birthPlan.genderAffirmingCare}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      pregnancy: {
                        ...prev.pregnancy,
                        birthPlan: { ...prev.pregnancy.birthPlan, genderAffirmingCare: e.target.value }
                      }
                    }))}
                    placeholder="Specific requests for respectful, affirming care during labor and delivery..."
                    className="mt-1.5"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={data.pregnancy.birthPlan.notes}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      pregnancy: {
                        ...prev.pregnancy,
                        birthPlan: { ...prev.pregnancy.birthPlan, notes: e.target.value }
                      }
                    }))}
                    placeholder="Any other preferences or concerns..."
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Contraception Tab */}
        <TabsContent value="contraception" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contraception Tracking</CardTitle>
              <CardDescription>Current birth control method and compatibility with HRT</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Current Method</Label>
                  <Input
                    value={data.contraception.currentMethod}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      contraception: { ...prev.contraception, currentMethod: e.target.value }
                    }))}
                    placeholder="e.g., IUD, pills, condoms, none"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={data.contraception.startDate}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      contraception: { ...prev.contraception, startDate: e.target.value }
                    }))}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Effectiveness Rating</Label>
                  <Input
                    value={data.contraception.effectiveness}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      contraception: { ...prev.contraception, effectiveness: e.target.value }
                    }))}
                    placeholder="e.g., 99% effective"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>HRT Compatibility</Label>
                  <Input
                    value={data.contraception.hrtCompatibility}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      contraception: { ...prev.contraception, hrtCompatibility: e.target.value }
                    }))}
                    placeholder="Compatible, conflicts, unknown"
                    className="mt-1.5"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={data.contraception.notes}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      contraception: { ...prev.contraception, notes: e.target.value }
                    }))}
                    placeholder="Side effects, concerns, future plans..."
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parenting Tab */}
        <TabsContent value="parenting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parenting Information</CardTitle>
              <CardDescription>For current parents or co-parents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isParent"
                  checked={data.parenting.isParent}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    parenting: { ...prev.parenting, isParent: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="isParent">I am a {data.terminology.preferredParentTerm}</Label>
              </div>

              {data.parenting.isParent && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Number of Children</Label>
                      <Input
                        type="number"
                        value={data.parenting.numberOfChildren}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          parenting: { ...prev.parenting, numberOfChildren: parseInt(e.target.value) || 0 }
                        }))}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label>Ages of Children</Label>
                      <Input
                        value={data.parenting.agesOfChildren}
                        onChange={(e) => setData(prev => ({
                          ...prev,
                          parenting: { ...prev.parenting, agesOfChildren: e.target.value }
                        }))}
                        placeholder="e.g., 5, 8, 12"
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Co-Parenting Notes</Label>
                    <Textarea
                      value={data.parenting.coParentingNotes}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        parenting: { ...prev.parenting, coParentingNotes: e.target.value }
                      }))}
                      placeholder="Co-parent relationships, custody arrangements, support needs..."
                      className="mt-1.5"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Important Info */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Reproductive Health & HRT</p>
              <p>Some HRT regimens can affect fertility. Discuss fertility preservation options with your provider before starting HRT if you want biological children in the future.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
