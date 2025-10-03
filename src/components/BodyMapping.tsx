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
  User,
  Save,
  Plus,
  X,
  Heart,
  AlertCircle,
  Edit,
  Info
} from "lucide-react";
import { projectId } from "../utils/supabase/info";

interface BodyMappingProps {
  accessToken: string;
}

interface BodyZone {
  id: string;
  name: string;
  customName?: string;
  dysphoria: 'none' | 'mild' | 'moderate' | 'severe';
  euphoria: 'none' | 'mild' | 'moderate' | 'severe';
  touchComfort: 'comfortable' | 'neutral' | 'uncomfortable' | 'avoid';
  sensationChanges: string;
  goals: string;
  notes: string;
}

interface TerminologyPreference {
  anatomyTerm: string;
  preferredTerm: string;
  context: string;
}

interface BodyMappingData {
  bodyZones: BodyZone[];
  terminologyPreferences: TerminologyPreference[];
  dysphoriaTriggers: string[];
  euphoriaExperiences: string[];
  sensationTracking: {
    hrtRelated: boolean;
    surgeryRelated: boolean;
    notes: string;
  };
  overallNotes: string;
}

const defaultBodyZones = [
  'Face/Head',
  'Neck',
  'Chest/Breast',
  'Shoulders',
  'Arms',
  'Hands',
  'Abdomen/Stomach',
  'Hips',
  'Genitals',
  'Buttocks',
  'Thighs',
  'Legs',
  'Feet',
  'Back',
  'Voice'
];

const commonTerminologySwaps = [
  { from: 'breasts', to: 'chest' },
  { from: 'vagina', to: 'front hole/genital area' },
  { from: 'penis', to: 'genital area' },
  { from: 'menstruation', to: 'cycle/period' },
  { from: 'pregnant', to: 'gestating/expecting' },
  { from: 'breastfeeding', to: 'chestfeeding/body feeding' }
];

export function BodyMapping({ accessToken }: BodyMappingProps) {
  const [data, setData] = useState<BodyMappingData>({
    bodyZones: defaultBodyZones.map(name => ({
      id: name.toLowerCase().replace(/\//g, '-'),
      name,
      dysphoria: 'none',
      euphoria: 'none',
      touchComfort: 'neutral',
      sensationChanges: '',
      goals: '',
      notes: ''
    })),
    terminologyPreferences: [],
    dysphoriaTriggers: [],
    euphoriaExperiences: [],
    sensationTracking: {
      hrtRelated: false,
      surgeryRelated: false,
      notes: ''
    },
    overallNotes: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('zones');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [newTrigger, setNewTrigger] = useState('');
  const [newEuphoria, setNewEuphoria] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/body-mapping`,
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
      console.error('Error fetching body mapping data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/body-mapping`,
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
      console.error('Error saving body mapping:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateZone = (zoneId: string, updates: Partial<BodyZone>) => {
    setData(prev => ({
      ...prev,
      bodyZones: prev.bodyZones.map(z => z.id === zoneId ? { ...z, ...updates } : z)
    }));
  };

  const addTerminology = () => {
    const newTerm: TerminologyPreference = {
      anatomyTerm: '',
      preferredTerm: '',
      context: ''
    };
    setData(prev => ({
      ...prev,
      terminologyPreferences: [...prev.terminologyPreferences, newTerm]
    }));
  };

  const updateTerminology = (index: number, updates: Partial<TerminologyPreference>) => {
    setData(prev => ({
      ...prev,
      terminologyPreferences: prev.terminologyPreferences.map((t, i) =>
        i === index ? { ...t, ...updates } : t
      )
    }));
  };

  const removeTerminology = (index: number) => {
    setData(prev => ({
      ...prev,
      terminologyPreferences: prev.terminologyPreferences.filter((_, i) => i !== index)
    }));
  };

  const addTrigger = () => {
    if (newTrigger.trim()) {
      setData(prev => ({
        ...prev,
        dysphoriaTriggers: [...prev.dysphoriaTriggers, newTrigger.trim()]
      }));
      setNewTrigger('');
    }
  };

  const removeTrigger = (index: number) => {
    setData(prev => ({
      ...prev,
      dysphoriaTriggers: prev.dysphoriaTriggers.filter((_, i) => i !== index)
    }));
  };

  const addEuphoria = () => {
    if (newEuphoria.trim()) {
      setData(prev => ({
        ...prev,
        euphoriaExperiences: [...prev.euphoriaExperiences, newEuphoria.trim()]
      }));
      setNewEuphoria('');
    }
  };

  const removeEuphoria = (index: number) => {
    setData(prev => ({
      ...prev,
      euphoriaExperiences: prev.euphoriaExperiences.filter((_, i) => i !== index)
    }));
  };

  const getColorForLevel = (level: string) => {
    switch (level) {
      case 'none': return 'bg-gray-100 text-gray-700';
      case 'mild': return 'bg-yellow-100 text-yellow-700';
      case 'moderate': return 'bg-orange-100 text-orange-700';
      case 'severe': return 'bg-red-100 text-red-700';
      case 'comfortable': return 'bg-green-100 text-green-700';
      case 'neutral': return 'bg-gray-100 text-gray-700';
      case 'uncomfortable': return 'bg-yellow-100 text-yellow-700';
      case 'avoid': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <User className="h-8 w-8 text-purple-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading body mapping...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Body Mapping</CardTitle>
              <CardDescription>
                Track dysphoria, euphoria, and sensation changes. Use your own language for your body.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Affirming Message */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Heart className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-900">
              <p className="font-semibold mb-1">Your body, your terms</p>
              <p>This is a private space to understand your relationship with your body. Use whatever language feels right to you.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="zones">Body Zones</TabsTrigger>
          <TabsTrigger value="terminology">Terminology</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
          <TabsTrigger value="sensations">Sensations</TabsTrigger>
        </TabsList>

        {/* Body Zones Tab */}
        <TabsContent value="zones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Body Zone Mapping</CardTitle>
              <CardDescription>Rate dysphoria, euphoria, and touch comfort for each area</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.bodyZones.map(zone => (
                  <Card
                    key={zone.id}
                    className={`cursor-pointer transition-all ${selectedZone === zone.id ? 'ring-2 ring-purple-500' : ''}`}
                    onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{zone.customName || zone.name}</h4>
                          {zone.customName && (
                            <Badge variant="secondary" className="text-xs">Custom</Badge>
                          )}
                        </div>

                        {selectedZone === zone.id ? (
                          <div className="space-y-3 pt-2">
                            <div>
                              <Label className="text-xs">Custom Name (optional)</Label>
                              <Input
                                value={zone.customName || ''}
                                onChange={(e) => updateZone(zone.id, { customName: e.target.value })}
                                placeholder={zone.name}
                                className="mt-1 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            <div>
                              <Label className="text-xs">Dysphoria Level</Label>
                              <Select
                                value={zone.dysphoria}
                                onValueChange={(value: any) => updateZone(zone.id, { dysphoria: value })}
                              >
                                <SelectTrigger className="mt-1 text-sm" onClick={(e) => e.stopPropagation()}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="mild">Mild</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="severe">Severe</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs">Euphoria Level</Label>
                              <Select
                                value={zone.euphoria}
                                onValueChange={(value: any) => updateZone(zone.id, { euphoria: value })}
                              >
                                <SelectTrigger className="mt-1 text-sm" onClick={(e) => e.stopPropagation()}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="mild">Mild</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="severe">Strong</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs">Touch Comfort</Label>
                              <Select
                                value={zone.touchComfort}
                                onValueChange={(value: any) => updateZone(zone.id, { touchComfort: value })}
                              >
                                <SelectTrigger className="mt-1 text-sm" onClick={(e) => e.stopPropagation()}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="comfortable">Comfortable</SelectItem>
                                  <SelectItem value="neutral">Neutral</SelectItem>
                                  <SelectItem value="uncomfortable">Uncomfortable</SelectItem>
                                  <SelectItem value="avoid">Avoid Touch</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs">Goals for this area</Label>
                              <Textarea
                                value={zone.goals}
                                onChange={(e) => updateZone(zone.id, { goals: e.target.value })}
                                placeholder="What would make you feel better about this area?"
                                className="mt-1 text-sm"
                                rows={2}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            <div>
                              <Label className="text-xs">Notes</Label>
                              <Textarea
                                value={zone.notes}
                                onChange={(e) => updateZone(zone.id, { notes: e.target.value })}
                                placeholder="Any additional notes..."
                                className="mt-1 text-sm"
                                rows={2}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Dysphoria:</span>
                              <Badge className={getColorForLevel(zone.dysphoria)} variant="secondary">
                                {zone.dysphoria}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Euphoria:</span>
                              <Badge className={getColorForLevel(zone.euphoria)} variant="secondary">
                                {zone.euphoria}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Touch:</span>
                              <Badge className={getColorForLevel(zone.touchComfort)} variant="secondary">
                                {zone.touchComfort}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terminology Tab */}
        <TabsContent value="terminology" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Custom Terminology</CardTitle>
                  <CardDescription>Define the words you prefer for your anatomy</CardDescription>
                </div>
                <Button onClick={addTerminology} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Term
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.terminologyPreferences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Edit className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No custom terminology added yet</p>
                  <p className="text-sm">Add words that feel right for your body</p>
                </div>
              ) : (
                data.terminologyPreferences.map((term, index) => (
                  <Card key={index} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-xs">Standard Term</Label>
                            <Input
                              value={term.anatomyTerm}
                              onChange={(e) => updateTerminology(index, { anatomyTerm: e.target.value })}
                              placeholder="e.g., breasts"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Your Preferred Term</Label>
                            <Input
                              value={term.preferredTerm}
                              onChange={(e) => updateTerminology(index, { preferredTerm: e.target.value })}
                              placeholder="e.g., chest"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Context/Notes</Label>
                            <Input
                              value={term.context}
                              onChange={(e) => updateTerminology(index, { context: e.target.value })}
                              placeholder="When to use this"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTerminology(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {/* Common Swaps Reference */}
              <Card className="bg-blue-50 border-blue-200 mt-6">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Common Terminology Preferences</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-900">
                    {commonTerminologySwaps.map((swap, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-medium">{swap.from}</span>
                        <span>→</span>
                        <span>{swap.to}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dysphoria Triggers</CardTitle>
              <CardDescription>Situations or experiences that increase dysphoria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {data.dysphoriaTriggers.map((trigger, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p className="flex-1 text-sm">{trigger}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrigger(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="Add a dysphoria trigger..."
                  onKeyPress={(e) => e.key === 'Enter' && addTrigger()}
                />
                <Button onClick={addTrigger}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Euphoria Experiences</CardTitle>
              <CardDescription>Things that bring you gender euphoria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {data.euphoriaExperiences.map((euphoria, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-green-50">
                    <Heart className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <p className="flex-1 text-sm">{euphoria}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEuphoria(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newEuphoria}
                  onChange={(e) => setNewEuphoria(e.target.value)}
                  placeholder="Add a euphoria experience..."
                  onKeyPress={(e) => e.key === 'Enter' && addEuphoria()}
                />
                <Button onClick={addEuphoria}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sensations Tab */}
        <TabsContent value="sensations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sensation Tracking</CardTitle>
              <CardDescription>Track changes in sensation, especially related to HRT or surgery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hrtRelated"
                    checked={data.sensationTracking.hrtRelated}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      sensationTracking: { ...prev.sensationTracking, hrtRelated: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="hrtRelated">Tracking HRT-related sensation changes</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="surgeryRelated"
                    checked={data.sensationTracking.surgeryRelated}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      sensationTracking: { ...prev.sensationTracking, surgeryRelated: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="surgeryRelated">Tracking post-surgery sensation changes</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="sensationNotes">Sensation Notes</Label>
                <Textarea
                  id="sensationNotes"
                  value={data.sensationTracking.notes}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    sensationTracking: { ...prev.sensationTracking, notes: e.target.value }
                  }))}
                  placeholder="Track changes in sensation, sensitivity, numbness, tingling, pain, pleasure, etc..."
                  className="mt-1.5"
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Notes</CardTitle>
              <CardDescription>General observations about your body and journey</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.overallNotes}
                onChange={(e) => setData(prev => ({ ...prev, overallNotes: e.target.value }))}
                placeholder="Any patterns, insights, or reflections..."
                rows={6}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Privacy Notice */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Private & Confidential</p>
              <p>This body mapping is completely private and only visible to you. Share specific information with providers only when you choose to.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Body Map'}
        </Button>
      </div>
    </div>
  );
}
