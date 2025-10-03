import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "./ui/tabs";
import {
  Shield,
  Save,
  Plus,
  X,
  Phone,
  Heart,
  MapPin,
  Users,
  AlertCircle,
  Activity,
  BookOpen,
  Lightbulb
} from "lucide-react";
import { projectId } from "../utils/supabase/info";

interface SafetyPlanningProps {
  accessToken: string;
}

interface CrisisResource {
  id: string;
  name: string;
  type: 'hotline' | 'text-line' | 'online-chat' | 'app' | 'local-service';
  contact: string;
  description: string;
  availability: string;
  isLGBTQFriendly: boolean;
  isEmergency: boolean;
}

interface SafePerson {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  canCallAnytime: boolean;
  hasSafeSpace: boolean;
}

interface SafePlace {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor' | 'activity' | 'virtual';
  location: string;
  description: string;
  whenToUse: string;
}

interface CopingStrategy {
  id: string;
  name: string;
  category: 'grounding' | 'breathing' | 'movement' | 'creative' | 'social' | 'sensory';
  description: string;
  steps: string[];
  effectiveness: number;
}

interface WarningSign {
  id: string;
  sign: string;
  severity: 'early' | 'moderate' | 'severe';
  response: string;
}

interface SafetyPlanData {
  crisisResources: CrisisResource[];
  safePeople: SafePerson[];
  safePlaces: SafePlace[];
  copingStrategies: CopingStrategy[];
  warningSign: WarningSign[];
  reasonsForLiving: string[];
  environmentalSafety: {
    hasRemovedMeansOfHarm: boolean;
    hasSupportivePeople: boolean;
    hasProfessionalSupport: boolean;
    notes: string;
  };
  emergencyPlan: {
    whenToCallEmergency: string;
    hospitalPreferences: string;
    medicationsToAvoid: string;
    importantMedicalInfo: string;
  };
}

const defaultCrisisResources: CrisisResource[] = [
  {
    id: '1',
    name: 'ERAN - Emotional First Aid (Israel)',
    type: 'hotline',
    contact: '1201 or *2201',
    description: '24/7 emotional support and crisis intervention in Hebrew, Arabic, Russian, Amharic',
    availability: '24/7',
    isLGBTQFriendly: true,
    isEmergency: true
  },
  {
    id: '2',
    name: 'Sahar - Emotional Support Chat (Israel)',
    type: 'online-chat',
    contact: 'www.sahar.org.il',
    description: 'Anonymous emotional support chat for youth and adults',
    availability: 'Sun-Thu 19:00-23:00',
    isLGBTQFriendly: true,
    isEmergency: true
  },
  {
    id: '3',
    name: 'Israeli LGBT Association Hotline',
    type: 'hotline',
    contact: '*5433 (Israel)',
    description: 'Support for LGBTQ+ individuals and families',
    availability: 'Sun-Thu 16:00-22:00',
    isLGBTQFriendly: true,
    isEmergency: true
  },
  {
    id: '4',
    name: 'Jerusalem Open House Crisis Line',
    type: 'hotline',
    contact: '02-625-0502',
    description: 'Crisis intervention for LGBTQ+ community',
    availability: '24/7',
    isLGBTQFriendly: true,
    isEmergency: true
  },
  {
    id: '5',
    name: 'Natal - Trauma & Resilience Center',
    type: 'hotline',
    contact: '1-800-363-363',
    description: 'Support for trauma, PTSD, and stress-related issues',
    availability: 'Sun-Thu 18:00-22:00',
    isLGBTQFriendly: true,
    isEmergency: false
  },
  {
    id: '6',
    name: 'International Crisis Hotlines',
    type: 'hotline',
    contact: 'findahelpline.com',
    description: 'Directory of crisis helplines worldwide by country',
    availability: 'Varies by region',
    isLGBTQFriendly: true,
    isEmergency: true
  }
];

export function SafetyPlanning({ accessToken }: SafetyPlanningProps) {
  const [data, setData] = useState<SafetyPlanData>({
    crisisResources: defaultCrisisResources,
    safePeople: [],
    safePlaces: [],
    copingStrategies: [],
    warningSign: [],
    reasonsForLiving: [],
    environmentalSafety: {
      hasRemovedMeansOfHarm: false,
      hasSupportivePeople: false,
      hasProfessionalSupport: false,
      notes: ''
    },
    emergencyPlan: {
      whenToCallEmergency: '',
      hospitalPreferences: '',
      medicationsToAvoid: '',
      importantMedicalInfo: ''
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('resources');
  const [newReason, setNewReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/safety-planning`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.data) {
          setData({
            ...result.data,
            crisisResources: result.data.crisisResources?.length > 0
              ? result.data.crisisResources
              : defaultCrisisResources
          });
        }
      }
    } catch (error) {
      console.error('Error fetching safety planning data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/safety-planning`,
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
      console.error('Error saving safety planning:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSafePerson = () => {
    const newPerson: SafePerson = {
      id: Date.now().toString(),
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      canCallAnytime: false,
      hasSafeSpace: false
    };
    setData(prev => ({
      ...prev,
      safePeople: [...prev.safePeople, newPerson]
    }));
  };

  const updateSafePerson = (id: string, updates: Partial<SafePerson>) => {
    setData(prev => ({
      ...prev,
      safePeople: prev.safePeople.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const removeSafePerson = (id: string) => {
    setData(prev => ({
      ...prev,
      safePeople: prev.safePeople.filter(p => p.id !== id)
    }));
  };

  const addCopingStrategy = () => {
    const newStrategy: CopingStrategy = {
      id: Date.now().toString(),
      name: '',
      category: 'grounding',
      description: '',
      steps: [],
      effectiveness: 0
    };
    setData(prev => ({
      ...prev,
      copingStrategies: [...prev.copingStrategies, newStrategy]
    }));
  };

  const updateCopingStrategy = (id: string, updates: Partial<CopingStrategy>) => {
    setData(prev => ({
      ...prev,
      copingStrategies: prev.copingStrategies.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const removeCopingStrategy = (id: string) => {
    setData(prev => ({
      ...prev,
      copingStrategies: prev.copingStrategies.filter(s => s.id !== id)
    }));
  };

  const addReason = () => {
    if (newReason.trim()) {
      setData(prev => ({
        ...prev,
        reasonsForLiving: [...prev.reasonsForLiving, newReason.trim()]
      }));
      setNewReason('');
    }
  };

  const removeReason = (index: number) => {
    setData(prev => ({
      ...prev,
      reasonsForLiving: prev.reasonsForLiving.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="h-8 w-8 text-green-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading your safety plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Safety Planning</CardTitle>
              <CardDescription>
                A personalized plan to help you stay safe during difficult times. You deserve support and care.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Emergency Notice */}
      <Card className="bg-red-50 border-red-300">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-900">
              <p className="font-semibold mb-2">If you're in immediate danger:</p>
              <div className="space-y-1">
                <p>🆘 <strong>Israel:</strong> Call 100 (Police), 101 (Ambulance), or go to your nearest emergency room</p>
                <p>☎️ <strong>ERAN Crisis Line:</strong> 1201 or *2201 - Free, confidential, 24/7 (Hebrew, Arabic, Russian, Amharic)</p>
                <p>💬 <strong>Sahar Chat:</strong> www.sahar.org.il - Anonymous emotional support</p>
                <p>🏳️‍🌈 <strong>Israeli LGBT Association:</strong> *5433</p>
                <p>🌍 <strong>International:</strong> Visit findahelpline.com for crisis numbers in your country</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="people">Safe People</TabsTrigger>
          <TabsTrigger value="coping">Coping</TabsTrigger>
          <TabsTrigger value="reasons">Reasons</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        {/* Crisis Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Crisis Resources</CardTitle>
              <CardDescription>24/7 support when you need it most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.crisisResources.map(resource => (
                  <Card key={resource.id} className={resource.isEmergency ? "border-2 border-red-300" : "border"}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-blue-600" />
                            <h4 className="font-semibold">{resource.name}</h4>
                            {resource.isLGBTQFriendly && (
                              <Badge variant="secondary" className="text-xs">LGBTQ+ Affirming</Badge>
                            )}
                            {resource.isEmergency && (
                              <Badge variant="destructive" className="text-xs">Emergency</Badge>
                            )}
                          </div>
                          <p className="text-lg font-bold text-blue-600 mb-1">{resource.contact}</p>
                          <p className="text-sm text-gray-700 mb-1">{resource.description}</p>
                          <p className="text-xs text-gray-500">Available: {resource.availability}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add custom resource option could go here */}
        </TabsContent>

        {/* Safe People Tab */}
        <TabsContent value="people" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Safe People</CardTitle>
                  <CardDescription>People you can reach out to for support</CardDescription>
                </div>
                <Button onClick={addSafePerson}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Person
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.safePeople.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No safe people added yet</p>
                  <p className="text-sm">Add trusted friends, family, or professionals who can support you</p>
                </div>
              ) : (
                data.safePeople.map(person => (
                  <Card key={person.id} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={person.name}
                              onChange={(e) => updateSafePerson(person.id, { name: e.target.value })}
                              placeholder="Name"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Relationship</Label>
                            <Input
                              value={person.relationship}
                              onChange={(e) => updateSafePerson(person.id, { relationship: e.target.value })}
                              placeholder="e.g., Friend, Partner, Therapist"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={person.phone}
                              onChange={(e) => updateSafePerson(person.id, { phone: e.target.value })}
                              placeholder="Phone number"
                              className="mt-1.5"
                            />
                          </div>

                          <div>
                            <Label>Email</Label>
                            <Input
                              value={person.email}
                              onChange={(e) => updateSafePerson(person.id, { email: e.target.value })}
                              placeholder="Email address"
                              className="mt-1.5"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Notes</Label>
                            <Textarea
                              value={person.notes}
                              onChange={(e) => updateSafePerson(person.id, { notes: e.target.value })}
                              placeholder="When to contact them, what they can help with..."
                              className="mt-1.5"
                              rows={2}
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`anytime-${person.id}`}
                              checked={person.canCallAnytime}
                              onChange={(e) => updateSafePerson(person.id, { canCallAnytime: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor={`anytime-${person.id}`}>Can call anytime (24/7)</Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`space-${person.id}`}
                              checked={person.hasSafeSpace}
                              onChange={(e) => updateSafePerson(person.id, { hasSafeSpace: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor={`space-${person.id}`}>Has safe space I can go to</Label>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSafePerson(person.id)}
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

        {/* Coping Strategies Tab */}
        <TabsContent value="coping" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Coping Strategies</CardTitle>
                  <CardDescription>Tools and techniques that help you feel better</CardDescription>
                </div>
                <Button onClick={addCopingStrategy}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Strategy
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.copingStrategies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No coping strategies added yet</p>
                  <p className="text-sm">Add techniques that help you calm down and feel safer</p>
                </div>
              ) : (
                data.copingStrategies.map(strategy => (
                  <Card key={strategy.id} className="border-2">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Strategy Name</Label>
                              <Input
                                value={strategy.name}
                                onChange={(e) => updateCopingStrategy(strategy.id, { name: e.target.value })}
                                placeholder="e.g., 5-4-3-2-1 Grounding"
                                className="mt-1.5"
                              />
                            </div>

                            <div>
                              <Label>Category</Label>
                              <select
                                value={strategy.category}
                                onChange={(e) => updateCopingStrategy(strategy.id, { category: e.target.value as any })}
                                className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-md"
                              >
                                <option value="grounding">Grounding</option>
                                <option value="breathing">Breathing</option>
                                <option value="movement">Movement</option>
                                <option value="creative">Creative</option>
                                <option value="social">Social</option>
                                <option value="sensory">Sensory</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={strategy.description}
                              onChange={(e) => updateCopingStrategy(strategy.id, { description: e.target.value })}
                              placeholder="How does this strategy work? When do you use it?"
                              className="mt-1.5"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label>Effectiveness (1-10)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={strategy.effectiveness}
                              onChange={(e) => updateCopingStrategy(strategy.id, { effectiveness: parseInt(e.target.value) || 0 })}
                              className="mt-1.5"
                            />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCopingStrategy(strategy.id)}
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

          {/* Grounding Techniques Reference */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Common Grounding Techniques</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-900">
                <li><strong>5-4-3-2-1:</strong> Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste</li>
                <li><strong>Box Breathing:</strong> Breathe in for 4, hold for 4, out for 4, hold for 4</li>
                <li><strong>Cold water:</strong> Splash cold water on your face or hold ice cubes</li>
                <li><strong>Movement:</strong> Walk, stretch, dance, or do jumping jacks</li>
                <li><strong>Safe place visualization:</strong> Imagine a place where you feel completely safe</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reasons for Living Tab */}
        <TabsContent value="reasons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reasons for Living</CardTitle>
              <CardDescription>The things that matter to you and give your life meaning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {data.reasonsForLiving.map((reason, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-gradient-to-r from-pink-50 to-purple-50">
                    <Heart className="h-5 w-5 text-pink-600 flex-shrink-0" />
                    <p className="flex-1">{reason}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReason(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {data.reasonsForLiving.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Add things that are important to you</p>
                  <p className="text-sm">Pets, people, goals, experiences, future plans...</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Input
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Something that matters to you..."
                  onKeyPress={(e) => e.key === 'Enter' && addReason()}
                />
                <Button onClick={addReason}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <Card className="bg-purple-50 border-purple-200 mt-6">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <BookOpen className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-purple-900">
                      <p className="font-semibold mb-1">Examples of reasons</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>My pets depend on me</li>
                        <li>I want to see what my future holds</li>
                        <li>My chosen family needs me</li>
                        <li>I haven't finished my transition journey</li>
                        <li>There are places I want to visit</li>
                        <li>I want to help other trans people</li>
                        <li>My art/music/writing matters</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emergency Plan Tab */}
        <TabsContent value="emergency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Plan</CardTitle>
              <CardDescription>What to do in a crisis situation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whenToCall">When to call emergency services</Label>
                <Textarea
                  id="whenToCall"
                  value={data.emergencyPlan.whenToCallEmergency}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    emergencyPlan: { ...prev.emergencyPlan, whenToCallEmergency: e.target.value }
                  }))}
                  placeholder="Specific situations that require immediate emergency help..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="hospitalPrefs">Hospital/Provider Preferences</Label>
                <Textarea
                  id="hospitalPrefs"
                  value={data.emergencyPlan.hospitalPreferences}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    emergencyPlan: { ...prev.emergencyPlan, hospitalPreferences: e.target.value }
                  }))}
                  placeholder="LGBTQ-friendly hospitals, providers to avoid, what to tell ER staff..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="medsToAvoid">Medications to Avoid</Label>
                <Textarea
                  id="medsToAvoid"
                  value={data.emergencyPlan.medicationsToAvoid}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    emergencyPlan: { ...prev.emergencyPlan, medicationsToAvoid: e.target.value }
                  }))}
                  placeholder="Allergies, medications that interact with HRT, past adverse reactions..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="medicalInfo">Important Medical Information</Label>
                <Textarea
                  id="medicalInfo"
                  value={data.emergencyPlan.importantMedicalInfo}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    emergencyPlan: { ...prev.emergencyPlan, importantMedicalInfo: e.target.value }
                  }))}
                  placeholder="HRT status, surgeries, chronic conditions, anything emergency responders should know..."
                  className="mt-1.5"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Environmental Safety */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Environmental Safety</CardTitle>
              <CardDescription>Making your space safer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="removedHarm"
                    checked={data.environmentalSafety.hasRemovedMeansOfHarm}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      environmentalSafety: { ...prev.environmentalSafety, hasRemovedMeansOfHarm: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="removedHarm">I have removed or secured means of self-harm</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="supportivePeople"
                    checked={data.environmentalSafety.hasSupportivePeople}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      environmentalSafety: { ...prev.environmentalSafety, hasSupportivePeople: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="supportivePeople">I have supportive people who check on me</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="professionalSupport"
                    checked={data.environmentalSafety.hasProfessionalSupport}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      environmentalSafety: { ...prev.environmentalSafety, hasProfessionalSupport: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="professionalSupport">I have professional support (therapist, counselor)</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="safetyNotes">Additional safety notes</Label>
                <Textarea
                  id="safetyNotes"
                  value={data.environmentalSafety.notes}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    environmentalSafety: { ...prev.environmentalSafety, notes: e.target.value }
                  }))}
                  placeholder="Other steps you're taking to stay safe..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Affirmation */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Heart className="h-5 w-5 text-pink-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-pink-900">
              <p className="font-semibold mb-1">You matter</p>
              <p>Creating this safety plan is an act of self-care and self-love. You deserve to be safe, to be supported, and to live authentically. Difficult feelings are temporary, but you are irreplaceable.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Safety Plan'}
        </Button>
      </div>
    </div>
  );
}
