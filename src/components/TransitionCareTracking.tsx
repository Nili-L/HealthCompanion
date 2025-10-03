import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
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
  TrendingUp,
  Calendar,
  Pill,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { projectId } from "../utils/supabase/info";

interface TransitionCareTrackingProps {
  accessToken: string;
}

interface HRTMedication {
  id: string;
  name: string;
  type: 'estrogen' | 'testosterone' | 'blocker' | 'progesterone' | 'other';
  dosage: string;
  route: string;
  frequency: string;
  startDate: string;
  sideEffects: string[];
  notes: string;
}

interface LabResult {
  id: string;
  date: string;
  testType: string;
  value: string;
  unit: string;
  referenceRange: string;
  inRange: boolean;
}

interface Milestone {
  id: string;
  date: string;
  title: string;
  category: 'medical' | 'social' | 'legal' | 'personal';
  description: string;
  isAchieved: boolean;
}

interface Procedure {
  id: string;
  name: string;
  type: string;
  status: 'planning' | 'scheduled' | 'completed';
  consultDate?: string;
  scheduledDate?: string;
  completedDate?: string;
  surgeon: string;
  location: string;
  notes: string;
  requirementsChecklist: Array<{
    item: string;
    completed: boolean;
  }>;
}

interface TransitionCareData {
  transitionGoals: string;
  transitionStartDate: string;
  hrtMedications: HRTMedication[];
  labResults: LabResult[];
  milestones: Milestone[];
  procedures: Procedure[];
  voiceTraining: {
    inProgress: boolean;
    startDate: string;
    provider: string;
    progress: string;
    notes: string;
  };
  letters: Array<{
    id: string;
    type: string;
    provider: string;
    date: string;
    purpose: string;
    status: 'requested' | 'received';
  }>;
}

export function TransitionCareTracking({ accessToken }: TransitionCareTrackingProps) {
  const [data, setData] = useState<TransitionCareData>({
    transitionGoals: '',
    transitionStartDate: '',
    hrtMedications: [],
    labResults: [],
    milestones: [],
    procedures: [],
    voiceTraining: {
      inProgress: false,
      startDate: '',
      provider: '',
      progress: '',
      notes: ''
    },
    letters: []
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
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/transition-care`,
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
      console.error('Error fetching transition care data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/transition-care`,
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
      console.error('Error saving transition care data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: '',
      category: 'personal',
      description: '',
      isAchieved: false
    };
    setData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const removeMilestone = (id: string) => {
    setData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== id)
    }));
  };

  const addHRTMedication = () => {
    const newMed: HRTMedication = {
      id: Date.now().toString(),
      name: '',
      type: 'estrogen',
      dosage: '',
      route: '',
      frequency: '',
      startDate: new Date().toISOString().split('T')[0],
      sideEffects: [],
      notes: ''
    };
    setData(prev => ({
      ...prev,
      hrtMedications: [...prev.hrtMedications, newMed]
    }));
  };

  const updateHRTMedication = (id: string, updates: Partial<HRTMedication>) => {
    setData(prev => ({
      ...prev,
      hrtMedications: prev.hrtMedications.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const removeHRTMedication = (id: string) => {
    setData(prev => ({
      ...prev,
      hrtMedications: prev.hrtMedications.filter(m => m.id !== id)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Heart className="h-8 w-8 text-pink-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading your transition journey...</p>
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
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <CardTitle>Transition Care Tracking</CardTitle>
              <CardDescription>
                Your transition journey, your timeline. Track HRT, procedures, and milestones all in one place.
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
              <p className="font-semibold mb-1">You are valid</p>
              <p>Your transition is yours alone. There's no right way or timeline - this is about what feels authentic to you. We're here to support you every step of the way.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hrt">HRT</TabsTrigger>
          <TabsTrigger value="procedures">Procedures</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="letters">Letters</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transition Overview</CardTitle>
              <CardDescription>Your goals and journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="transitionStartDate">Transition Start Date</Label>
                <Input
                  id="transitionStartDate"
                  type="date"
                  value={data.transitionStartDate}
                  onChange={(e) => setData(prev => ({ ...prev, transitionStartDate: e.target.value }))}
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">When you began your transition (approximate is fine)</p>
              </div>

              <div>
                <Label htmlFor="transitionGoals">Transition Goals</Label>
                <Textarea
                  id="transitionGoals"
                  value={data.transitionGoals}
                  onChange={(e) => setData(prev => ({ ...prev, transitionGoals: e.target.value }))}
                  placeholder="What are your goals for your transition? (medical, social, legal, personal)"
                  className="mt-1.5"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Pill className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{data.hrtMedications.length}</p>
                    <p className="text-sm text-gray-500">HRT Medications</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">
                      {data.milestones.filter(m => m.isAchieved).length}/{data.milestones.length}
                    </p>
                    <p className="text-sm text-gray-500">Milestones Achieved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{data.procedures.length}</p>
                    <p className="text-sm text-gray-500">Procedures Tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Milestones */}
          {data.milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.milestones.slice(0, 5).map(milestone => (
                    <div key={milestone.id} className="flex items-center gap-3 p-2 border-l-2 border-l-pink-400 pl-3">
                      {milestone.isAchieved ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-xs text-gray-500">{new Date(milestone.date).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={milestone.isAchieved ? "default" : "outline"}>
                        {milestone.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* HRT Tab */}
        <TabsContent value="hrt" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">HRT Medications</CardTitle>
                  <CardDescription>Track your hormone replacement therapy</CardDescription>
                </div>
                <Button onClick={addHRTMedication}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.hrtMedications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No HRT medications added yet</p>
                  <p className="text-sm">Click "Add Medication" to get started</p>
                </div>
              ) : (
                data.hrtMedications.map(med => (
                  <Card key={med.id} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Medication Name</Label>
                            <Input
                              value={med.name}
                              onChange={(e) => updateHRTMedication(med.id, { name: e.target.value })}
                              placeholder="e.g., Estradiol, Testosterone"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Type</Label>
                            <Select
                              value={med.type}
                              onValueChange={(value: any) => updateHRTMedication(med.id, { type: value })}
                            >
                              <SelectTrigger className="mt-1.5">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="estrogen">Estrogen</SelectItem>
                                <SelectItem value="testosterone">Testosterone</SelectItem>
                                <SelectItem value="blocker">Blocker</SelectItem>
                                <SelectItem value="progesterone">Progesterone</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Dosage</Label>
                            <Input
                              value={med.dosage}
                              onChange={(e) => updateHRTMedication(med.id, { dosage: e.target.value })}
                              placeholder="e.g., 2mg, 100mg/week"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Route</Label>
                            <Input
                              value={med.route}
                              onChange={(e) => updateHRTMedication(med.id, { route: e.target.value })}
                              placeholder="e.g., Oral, IM injection, Patch"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Frequency</Label>
                            <Input
                              value={med.frequency}
                              onChange={(e) => updateHRTMedication(med.id, { frequency: e.target.value })}
                              placeholder="e.g., Daily, Weekly"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={med.startDate}
                              onChange={(e) => updateHRTMedication(med.id, { startDate: e.target.value })}
                              className="mt-1.5"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Notes & Side Effects</Label>
                            <Textarea
                              value={med.notes}
                              onChange={(e) => updateHRTMedication(med.id, { notes: e.target.value })}
                              placeholder="Any side effects, changes noticed, or other notes..."
                              className="mt-1.5"
                              rows={2}
                            />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeHRTMedication(med.id)}
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

          {/* Voice Training */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voice Training</CardTitle>
              <CardDescription>Track your voice feminization/masculinization progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="voiceTraining"
                  checked={data.voiceTraining.inProgress}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    voiceTraining: { ...prev.voiceTraining, inProgress: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="voiceTraining">Currently doing voice training</Label>
              </div>

              {data.voiceTraining.inProgress && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={data.voiceTraining.startDate}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        voiceTraining: { ...prev.voiceTraining, startDate: e.target.value }
                      }))}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>Provider/Coach</Label>
                    <Input
                      value={data.voiceTraining.provider}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        voiceTraining: { ...prev.voiceTraining, provider: e.target.value }
                      }))}
                      placeholder="Speech therapist or coach name"
                      className="mt-1.5"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Progress Notes</Label>
                    <Textarea
                      value={data.voiceTraining.notes}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        voiceTraining: { ...prev.voiceTraining, notes: e.target.value }
                      }))}
                      placeholder="Track your progress, exercises, achievements..."
                      className="mt-1.5"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Procedures Tab */}
        <TabsContent value="procedures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gender-Affirming Procedures</CardTitle>
              <CardDescription>Track consultations, surgeries, and recovery</CardDescription>
            </CardHeader>
            <CardContent>
              {data.procedures.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No procedures tracked yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.procedures.map(proc => (
                    <Card key={proc.id} className="border-2">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{proc.name}</h4>
                            <p className="text-sm text-gray-600">{proc.type}</p>
                          </div>
                          <Badge variant={
                            proc.status === 'completed' ? 'default' :
                            proc.status === 'scheduled' ? 'secondary' : 'outline'
                          }>
                            {proc.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Surgeon</p>
                            <p className="font-medium">{proc.surgeon}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium">{proc.location}</p>
                          </div>
                        </div>

                        {proc.requirementsChecklist.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Requirements Checklist:</p>
                            <div className="space-y-2">
                              {proc.requirementsChecklist.map((req, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={req.completed}
                                    readOnly
                                    className="rounded"
                                  />
                                  <span className="text-sm">{req.item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Transition Milestones</CardTitle>
                  <CardDescription>Celebrate every step of your journey</CardDescription>
                </div>
                <Button onClick={addMilestone}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.milestones.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No milestones added yet</p>
                  <p className="text-sm">Click "Add Milestone" to track your progress</p>
                </div>
              ) : (
                data.milestones.map(milestone => (
                  <Card key={milestone.id} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={milestone.isAchieved}
                              onChange={(e) => updateMilestone(milestone.id, { isAchieved: e.target.checked })}
                              className="rounded h-5 w-5"
                            />
                            <Input
                              value={milestone.title}
                              onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                              placeholder="Milestone title"
                              className="flex-1"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={milestone.date}
                                onChange={(e) => updateMilestone(milestone.id, { date: e.target.value })}
                                className="mt-1.5"
                              />
                            </div>

                            <div>
                              <Label>Category</Label>
                              <Select
                                value={milestone.category}
                                onValueChange={(value: any) => updateMilestone(milestone.id, { category: value })}
                              >
                                <SelectTrigger className="mt-1.5">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="medical">Medical</SelectItem>
                                  <SelectItem value="social">Social</SelectItem>
                                  <SelectItem value="legal">Legal</SelectItem>
                                  <SelectItem value="personal">Personal</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={milestone.description}
                              onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                              placeholder="Details about this milestone..."
                              className="mt-1.5"
                              rows={2}
                            />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMilestone(milestone.id)}
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
        </TabsContent>

        {/* Letters Tab */}
        <TabsContent value="letters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Letters of Support</CardTitle>
              <CardDescription>Track letters for HRT, surgery, and legal changes</CardDescription>
            </CardHeader>
            <CardContent>
              {data.letters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No letters tracked yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.letters.map(letter => (
                    <div key={letter.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{letter.type}</p>
                            <Badge variant={letter.status === 'received' ? 'default' : 'outline'}>
                              {letter.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Provider: {letter.provider}</p>
                          <p className="text-sm text-gray-600">Purpose: {letter.purpose}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(letter.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Info */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Need a letter?</p>
                  <p>Contact your therapist or healthcare provider about obtaining letters of support. Requirements vary by procedure and location.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
