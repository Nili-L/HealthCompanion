import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Accessibility, Save, Brain, Volume2, Eye, Info } from "lucide-react";
import { projectId } from "../utils/supabase/info";

interface AccessibilityAccommodationsProps {
  accessToken: string;
}

interface AccessibilityData {
  neurodiversity: {
    diagnosed: string[];
    selfIdentified: string[];
    executiveFunctionSupport: string;
    sensoryProfile: {
      soundSensitivity: string;
      lightSensitivity: string;
      touchSensitivity: string;
      smellSensitivity: string;
      otherSensitivities: string;
    };
    communicationPreferences: string;
    stimming: string;
    meltdownTriggers: string;
    accommodationsNeeded: string[];
  };
  mobility: {
    mobilityAids: string[];
    accessibilityNeeds: string;
    parkingNeeds: string;
  };
  communication: {
    aslInterpreter: boolean;
    captioning: boolean;
    assistiveTechnology: string;
    preferredFormat: string;
  };
  serviceAnimal: {
    has: boolean;
    type: string;
    name: string;
    tasks: string;
    documentation: string;
  };
  overallNotes: string;
}

export function AccessibilityAccommodations({ accessToken }: AccessibilityAccommodationsProps) {
  const [data, setData] = useState<AccessibilityData>({
    neurodiversity: {
      diagnosed: [],
      selfIdentified: [],
      executiveFunctionSupport: '',
      sensoryProfile: {
        soundSensitivity: '',
        lightSensitivity: '',
        touchSensitivity: '',
        smellSensitivity: '',
        otherSensitivities: ''
      },
      communicationPreferences: '',
      stimming: '',
      meltdownTriggers: '',
      accommodationsNeeded: []
    },
    mobility: {
      mobilityAids: [],
      accessibilityNeeds: '',
      parkingNeeds: ''
    },
    communication: {
      aslInterpreter: false,
      captioning: false,
      assistiveTechnology: '',
      preferredFormat: ''
    },
    serviceAnimal: {
      has: false,
      type: '',
      name: '',
      tasks: '',
      documentation: ''
    },
    overallNotes: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('neurodiversity');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/accessibility`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.data) setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching accessibility data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/accessibility`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );
    } catch (error) {
      console.error('Error saving accessibility:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Accessibility className="h-8 w-8 text-indigo-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading accessibility info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Accessibility className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle>Accessibility & Accommodations</CardTitle>
              <CardDescription>
                Neurodiversity, mobility, communication, and other accessibility needs
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-900">
              <p className="font-semibold mb-1">Access for all</p>
              <p>Everyone deserves accessible, accommodating healthcare. This helps providers understand and meet your needs.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="neurodiversity">Neurodiversity</TabsTrigger>
          <TabsTrigger value="mobility">Mobility</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="neurodiversity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Neurodiversity</CardTitle>
              <CardDescription>ADHD, autism, and other neurodivergent traits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Diagnosed Conditions</Label>
                <Input
                  value={data.neurodiversity.diagnosed.join(', ')}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    neurodiversity: {
                      ...prev.neurodiversity,
                      diagnosed: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  }))}
                  placeholder="e.g., ADHD, Autism, Dyslexia"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Executive Function Support Needed</Label>
                <Textarea
                  value={data.neurodiversity.executiveFunctionSupport}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    neurodiversity: { ...prev.neurodiversity, executiveFunctionSupport: e.target.value }
                  }))}
                  placeholder="Task initiation, time management, organization, decision-making..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Communication Preferences</Label>
                <Textarea
                  value={data.neurodiversity.communicationPreferences}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    neurodiversity: { ...prev.neurodiversity, communicationPreferences: e.target.value }
                  }))}
                  placeholder="Direct vs. indirect, written vs. verbal, processing time needed..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Stim Behaviors (safe self-regulation)</Label>
                <Textarea
                  value={data.neurodiversity.stimming}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    neurodiversity: { ...prev.neurodiversity, stimming: e.target.value }
                  }))}
                  placeholder="Rocking, hand-flapping, fidgeting, etc. - this is okay!"
                  rows={2}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Meltdown/Shutdown Triggers</Label>
                <Textarea
                  value={data.neurodiversity.meltdownTriggers}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    neurodiversity: { ...prev.neurodiversity, meltdownTriggers: e.target.value }
                  }))}
                  placeholder="What situations or stimuli can lead to overload..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sensory Profile</CardTitle>
              <CardDescription>Sensitivities and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Sound Sensitivity</Label>
                <Input
                  value={data.neurodiversity.sensoryProfile.soundSensitivity}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    neurodiversity: {
                      ...prev.neurodiversity,
                      sensoryProfile: { ...prev.neurodiversity.sensoryProfile, soundSensitivity: e.target.value }
                    }
                  }))}
                  placeholder="e.g., Need quiet room, bothered by beeping"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Light Sensitivity</Label>
                <Input
                  value={data.neurodiversity.sensoryProfile.lightSensitivity}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    neurodiversity: {
                      ...prev.neurodiversity,
                      sensoryProfile: { ...prev.neurodiversity.sensoryProfile, lightSensitivity: e.target.value }
                    }
                  }))}
                  placeholder="e.g., Fluorescent lights painful, need sunglasses"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Touch Sensitivity</Label>
                <Input
                  value={data.neurodiversity.sensoryProfile.touchSensitivity}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    neurodiversity: {
                      ...prev.neurodiversity,
                      sensoryProfile: { ...prev.neurodiversity.sensoryProfile, touchSensitivity: e.target.value }
                    }
                  }))}
                  placeholder="e.g., Prefer firm pressure, certain textures uncomfortable"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Other Sensitivities</Label>
                <Textarea
                  value={data.neurodiversity.sensoryProfile.otherSensitivities}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    neurodiversity: {
                      ...prev.neurodiversity,
                      sensoryProfile: { ...prev.neurodiversity.sensoryProfile, otherSensitivities: e.target.value }
                    }
                  }))}
                  placeholder="Smell, temperature, movement, etc..."
                  rows={2}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mobility & Physical Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mobility Aids Used</Label>
                <Input
                  value={data.mobility.mobilityAids.join(', ')}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    mobility: {
                      ...prev.mobility,
                      mobilityAids: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }
                  }))}
                  placeholder="e.g., Wheelchair, cane, walker, crutches"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Accessibility Needs</Label>
                <Textarea
                  value={data.mobility.accessibilityNeeds}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    mobility: { ...prev.mobility, accessibilityNeeds: e.target.value }
                  }))}
                  placeholder="Wheelchair access, ground floor only, wide doorways, accessible exam table..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Parking Needs</Label>
                <Input
                  value={data.mobility.parkingNeeds}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    mobility: { ...prev.mobility, parkingNeeds: e.target.value }
                  }))}
                  placeholder="e.g., Accessible parking, close to entrance"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Communication Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="aslInterpreter"
                    checked={data.communication.aslInterpreter}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      communication: { ...prev.communication, aslInterpreter: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="aslInterpreter">Need ASL interpreter</Label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="captioning"
                    checked={data.communication.captioning}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      communication: { ...prev.communication, captioning: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="captioning">Need captioning/CART</Label>
                </div>
              </div>

              <div>
                <Label>Assistive Technology Used</Label>
                <Input
                  value={data.communication.assistiveTechnology}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    communication: { ...prev.communication, assistiveTechnology: e.target.value }
                  }))}
                  placeholder="e.g., AAC device, text-to-speech, screen reader"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Preferred Information Format</Label>
                <Input
                  value={data.communication.preferredFormat}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    communication: { ...prev.communication, preferredFormat: e.target.value }
                  }))}
                  placeholder="e.g., Large print, digital, simple language"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Animal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasServiceAnimal"
                  checked={data.serviceAnimal.has}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    serviceAnimal: { ...prev.serviceAnimal, has: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="hasServiceAnimal">I have a service animal</Label>
              </div>

              {data.serviceAnimal.has && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Animal Type</Label>
                    <Input
                      value={data.serviceAnimal.type}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        serviceAnimal: { ...prev.serviceAnimal, type: e.target.value }
                      }))}
                      placeholder="e.g., Dog"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Animal's Name</Label>
                    <Input
                      value={data.serviceAnimal.name}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        serviceAnimal: { ...prev.serviceAnimal, name: e.target.value }
                      }))}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Tasks Performed</Label>
                    <Textarea
                      value={data.serviceAnimal.tasks}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        serviceAnimal: { ...prev.serviceAnimal, tasks: e.target.value }
                      }))}
                      placeholder="What tasks is the animal trained to perform?"
                      rows={2}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.overallNotes}
                onChange={(e) => setData(prev => ({ ...prev, overallNotes: e.target.value }))}
                placeholder="Any other accessibility needs or accommodations..."
                rows={6}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
