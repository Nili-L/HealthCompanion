import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Heart, Save, Plus, X, Shield, AlertCircle, Calendar } from "lucide-react";
import { projectId } from "../utils/supabase/info";

interface SexualHealthProps {
  accessToken: string;
}

interface STITest {
  id: string;
  date: string;
  testType: string;
  result: 'negative' | 'positive' | 'pending';
  treatmentCompleted: boolean;
  notes: string;
}

interface PrEPTracking {
  onPrEP: boolean;
  startDate: string;
  medication: string;
  dosage: string;
  provider: string;
  lastLabWork: string;
  nextLabWork: string;
  sideEffects: string;
  adherence: string;
}

interface ConsentPractice {
  id: string;
  practice: string;
  important: boolean;
}

interface SexualHealthData {
  stiTesting: STITest[];
  prep: PrEPTracking;
  pep: {
    everUsed: boolean;
    lastUse: string;
    notes: string;
  };
  sexualFunction: {
    hrtImpact: string;
    concerns: string;
    resources: string;
  };
  consent: ConsentPractice[];
  saferSexPractices: string[];
  notes: string;
}

export function SexualHealth({ accessToken }: SexualHealthProps) {
  const [data, setData] = useState<SexualHealthData>({
    stiTesting: [],
    prep: {
      onPrEP: false,
      startDate: '',
      medication: 'Truvada',
      dosage: '',
      provider: '',
      lastLabWork: '',
      nextLabWork: '',
      sideEffects: '',
      adherence: ''
    },
    pep: {
      everUsed: false,
      lastUse: '',
      notes: ''
    },
    sexualFunction: {
      hrtImpact: '',
      concerns: '',
      resources: ''
    },
    consent: [],
    saferSexPractices: [],
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('testing');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/sexual-health`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.data) setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching sexual health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/sexual-health`,
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
      console.error('Error saving sexual health:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSTITest = () => {
    setData(prev => ({
      ...prev,
      stiTesting: [...prev.stiTesting, {
        id: Date.now().toString(),
        date: '',
        testType: '',
        result: 'pending',
        treatmentCompleted: false,
        notes: ''
      }]
    }));
  };

  const removeSTITest = (id: string) => {
    setData(prev => ({
      ...prev,
      stiTesting: prev.stiTesting.filter(t => t.id !== id)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="h-8 w-8 text-blue-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading sexual health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Sexual Health</CardTitle>
              <CardDescription>
                STI testing, PrEP/PEP, sexual function, and safer sex practices
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Heart className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Your health, your choices</p>
              <p>Sexual health is an important part of overall wellness. This information is private and confidential.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="testing">STI Testing</TabsTrigger>
          <TabsTrigger value="prep">PrEP/PEP</TabsTrigger>
          <TabsTrigger value="function">Function</TabsTrigger>
          <TabsTrigger value="practices">Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">STI Testing History</CardTitle>
                  <CardDescription>Track tests and results</CardDescription>
                </div>
                <Button onClick={addSTITest} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.stiTesting.map(test => (
                <Card key={test.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={test.date}
                            onChange={(e) => setData(prev => ({
                              ...prev,
                              stiTesting: prev.stiTesting.map(t =>
                                t.id === test.id ? { ...t, date: e.target.value } : t
                              )
                            }))}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Test Type</Label>
                          <Input
                            value={test.testType}
                            onChange={(e) => setData(prev => ({
                              ...prev,
                              stiTesting: prev.stiTesting.map(t =>
                                t.id === test.id ? { ...t, testType: e.target.value } : t
                              )
                            }))}
                            placeholder="e.g., Full panel, HIV, etc"
                            className="mt-1.5"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Notes</Label>
                          <Textarea
                            value={test.notes}
                            onChange={(e) => setData(prev => ({
                              ...prev,
                              stiTesting: prev.stiTesting.map(t =>
                                t.id === test.id ? { ...t, notes: e.target.value } : t
                              )
                            }))}
                            rows={2}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeSTITest(test.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prep" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PrEP (Pre-Exposure Prophylaxis)</CardTitle>
              <CardDescription>HIV prevention medication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="onPrEP"
                  checked={data.prep.onPrEP}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    prep: { ...prev.prep, onPrEP: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="onPrEP">Currently taking PrEP</Label>
              </div>

              {data.prep.onPrEP && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={data.prep.startDate}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        prep: { ...prev.prep, startDate: e.target.value }
                      }))}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Provider</Label>
                    <Input
                      value={data.prep.provider}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        prep: { ...prev.prep, provider: e.target.value }
                      }))}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Side Effects</Label>
                    <Textarea
                      value={data.prep.sideEffects}
                      onChange={(e) => setData(prev => ({
                        ...prev,
                        prep: { ...prev.prep, sideEffects: e.target.value }
                      }))}
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
              <CardTitle className="text-lg">PEP (Post-Exposure Prophylaxis)</CardTitle>
              <CardDescription>Emergency HIV prevention (within 72 hours of exposure)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pepUsed"
                  checked={data.pep.everUsed}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    pep: { ...prev.pep, everUsed: e.target.checked }
                  }))}
                  className="rounded"
                />
                <Label htmlFor="pepUsed">Have used PEP in the past</Label>
              </div>
              {data.pep.everUsed && (
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={data.pep.notes}
                    onChange={(e) => setData(prev => ({
                      ...prev,
                      pep: { ...prev.pep, notes: e.target.value }
                    }))}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="function" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sexual Function & HRT</CardTitle>
              <CardDescription>Track changes and concerns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>HRT Impact on Sexual Function</Label>
                <Textarea
                  value={data.sexualFunction.hrtImpact}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    sexualFunction: { ...prev.sexualFunction, hrtImpact: e.target.value }
                  }))}
                  placeholder="Changes in libido, function, pleasure..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Concerns or Questions</Label>
                <Textarea
                  value={data.sexualFunction.concerns}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    sexualFunction: { ...prev.sexualFunction, concerns: e.target.value }
                  }))}
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.notes}
                onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                rows={6}
                placeholder="General notes about sexual health, safer sex practices, consent practices..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Resources</p>
              <p>PrEP is 99% effective at preventing HIV. Talk to your provider about whether it's right for you. Many insurance plans cover it.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
