import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Shield, Save, Plus, X, AlertTriangle, FileText, Megaphone } from "lucide-react";
import { projectId } from "../utils/supabase/info";

interface MedicalAdvocacyProps {
  accessToken: string;
}

interface DiscriminationReport {
  id: string;
  date: string;
  location: string;
  provider: string;
  incidentType: string;
  description: string;
  actionTaken: string;
  status: 'reported' | 'under-review' | 'resolved';
}

interface AdvocacyScript {
  id: string;
  situation: string;
  script: string;
  helpful: boolean;
}

interface MedicalAdvocacyData {
  discriminationReports: DiscriminationReport[];
  advocacyScripts: AdvocacyScript[];
  patientRights: string[];
  supportResources: string;
  notes: string;
}

const defaultPatientRights = [
  "Right to informed consent before any procedure",
  "Right to refuse treatment at any time",
  "Right to be addressed by chosen name and pronouns",
  "Right to have a support person present",
  "Right to confidential medical records",
  "Right to file a complaint about discrimination",
  "Right to second opinions",
  "Right to access your own medical records"
];

export function MedicalAdvocacy({ accessToken }: MedicalAdvocacyProps) {
  const [data, setData] = useState<MedicalAdvocacyData>({
    discriminationReports: [],
    advocacyScripts: [],
    patientRights: defaultPatientRights,
    supportResources: '',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/medical-advocacy`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (result.data) setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching medical advocacy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/medical-advocacy`,
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
      console.error('Error saving medical advocacy:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addReport = () => {
    setData(prev => ({
      ...prev,
      discriminationReports: [...prev.discriminationReports, {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        location: '',
        provider: '',
        incidentType: '',
        description: '',
        actionTaken: '',
        status: 'reported'
      }]
    }));
  };

  const removeReport = (id: string) => {
    setData(prev => ({
      ...prev,
      discriminationReports: prev.discriminationReports.filter(r => r.id !== id)
    }));
  };

  const addScript = () => {
    setData(prev => ({
      ...prev,
      advocacyScripts: [...prev.advocacyScripts, {
        id: Date.now().toString(),
        situation: '',
        script: '',
        helpful: false
      }]
    }));
  };

  const removeScript = (id: string) => {
    setData(prev => ({
      ...prev,
      advocacyScripts: prev.advocacyScripts.filter(s => s.id !== id)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="h-8 w-8 text-red-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading advocacy tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle>Medical Advocacy & Rights</CardTitle>
              <CardDescription>
                Report discrimination, access advocacy tools, and know your rights
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Megaphone className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-900">
              <p className="font-semibold mb-1">You have rights</p>
              <p>Discrimination in healthcare is illegal. You deserve respectful, affirming care. If you experience discrimination, document it and report it.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Incident Reports</TabsTrigger>
          <TabsTrigger value="scripts">Advocacy Scripts</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Discrimination Incident Reports</CardTitle>
                  <CardDescription>Document discrimination or mistreatment</CardDescription>
                </div>
                <Button onClick={addReport} size="sm" variant="destructive">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Incident
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.discriminationReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No incidents reported</p>
                </div>
              ) : (
                data.discriminationReports.map(report => (
                  <Card key={report.id} className="border-2 border-red-200">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Date</Label>
                              <Input
                                type="date"
                                value={report.date}
                                onChange={(e) => setData(prev => ({
                                  ...prev,
                                  discriminationReports: prev.discriminationReports.map(r =>
                                    r.id === report.id ? { ...r, date: e.target.value } : r
                                  )
                                }))}
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label>Location/Facility</Label>
                              <Input
                                value={report.location}
                                onChange={(e) => setData(prev => ({
                                  ...prev,
                                  discriminationReports: prev.discriminationReports.map(r =>
                                    r.id === report.id ? { ...r, location: e.target.value } : r
                                  )
                                }))}
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label>Provider/Staff Name</Label>
                              <Input
                                value={report.provider}
                                onChange={(e) => setData(prev => ({
                                  ...prev,
                                  discriminationReports: prev.discriminationReports.map(r =>
                                    r.id === report.id ? { ...r, provider: e.target.value } : r
                                  )
                                }))}
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label>Type of Incident</Label>
                              <Input
                                value={report.incidentType}
                                onChange={(e) => setData(prev => ({
                                  ...prev,
                                  discriminationReports: prev.discriminationReports.map(r =>
                                    r.id === report.id ? { ...r, incidentType: e.target.value } : r
                                  )
                                }))}
                                placeholder="Misgendering, refusal of care, etc"
                                className="mt-1.5"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Description of Incident</Label>
                            <Textarea
                              value={report.description}
                              onChange={(e) => setData(prev => ({
                                ...prev,
                                discriminationReports: prev.discriminationReports.map(r =>
                                  r.id === report.id ? { ...r, description: e.target.value } : r
                                )
                              }))}
                              placeholder="What happened? Include specific quotes if possible..."
                              rows={4}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label>Action Taken</Label>
                            <Textarea
                              value={report.actionTaken}
                              onChange={(e) => setData(prev => ({
                                ...prev,
                                discriminationReports: prev.discriminationReports.map(r =>
                                  r.id === report.id ? { ...r, actionTaken: e.target.value } : r
                                )
                              }))}
                              placeholder="Did you report it? To whom? What was the response?"
                              rows={2}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeReport(report.id)}>
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

        <TabsContent value="scripts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Self-Advocacy Scripts</CardTitle>
                  <CardDescription>Prepared responses for common situations</CardDescription>
                </div>
                <Button onClick={addScript} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Script
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.advocacyScripts.map(script => (
                <Card key={script.id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label>Situation</Label>
                          <Input
                            value={script.situation}
                            onChange={(e) => setData(prev => ({
                              ...prev,
                              advocacyScripts: prev.advocacyScripts.map(s =>
                                s.id === script.id ? { ...s, situation: e.target.value } : s
                              )
                            }))}
                            placeholder="e.g., When provider misgenders me"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Script/Response</Label>
                          <Textarea
                            value={script.script}
                            onChange={(e) => setData(prev => ({
                              ...prev,
                              advocacyScripts: prev.advocacyScripts.map(s =>
                                s.id === script.id ? { ...s, script: e.target.value } : s
                              )
                            }))}
                            placeholder="What you can say..."
                            rows={3}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeScript(script.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Example Scripts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-blue-900">
                  <div>
                    <p className="font-semibold">When misgendered:</p>
                    <p className="italic">"I use [pronouns]. Please update my chart and let your staff know."</p>
                  </div>
                  <div>
                    <p className="font-semibold">When deadnamed:</p>
                    <p className="italic">"I go by [chosen name]. That's the only name I want used, including in my medical records."</p>
                  </div>
                  <div>
                    <p className="font-semibold">Requesting accommodations:</p>
                    <p className="italic">"I need [accommodation] to feel safe during this exam. Can we arrange that?"</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Patient Rights</CardTitle>
              <CardDescription>Know your rights in healthcare settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.patientRights.map((right, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-green-50">
                    <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{right}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Support Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.supportResources}
                onChange={(e) => setData(prev => ({ ...prev, supportResources: e.target.value }))}
                placeholder="List legal aid organizations, LGBTQ+ advocacy groups, patient advocate contacts..."
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
