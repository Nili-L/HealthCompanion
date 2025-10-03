import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import {
  Shield,
  Save,
  Plus,
  X,
  AlertCircle,
  Heart,
  UserCheck,
  Bell,
  FileText
} from "lucide-react";
import { projectId } from "../utils/supabase/info";

interface ConsentBoundariesProps {
  accessToken: string;
}

interface Trigger {
  id: string;
  trigger: string;
  response: string;
  severity: 'low' | 'medium' | 'high';
}

interface Accommodation {
  id: string;
  type: string;
  description: string;
  required: boolean;
}

interface ConsentBoundariesData {
  communicationPreferences: {
    preferredTitle: string;
    customTitle: string;
    okayToDiscussHistory: boolean;
    preferredCommunicationMethod: string;
    canLeaveVoicemail: boolean;
    canTextResults: boolean;
  };
  physicalExamBoundaries: {
    supportPersonAllowed: boolean;
    preferredProviderGender: string;
    areasCausingDiscomfort: string[];
    customAreas: string;
    requiresExplanationBeforeTouch: boolean;
    needsBreaksDuringExam: boolean;
    hasSafeTouchZones: boolean;
    safeZones: string;
    unsafeZones: string;
  };
  triggersAndAccommodations: {
    triggers: Trigger[];
    accommodations: Accommodation[];
    useNonBinaryLanguage: boolean;
    avoidGenderedTerms: string[];
  };
  consentPreferences: {
    requiresWrittenConsent: boolean;
    needsTimeToDecide: boolean;
    wantsSecondOpinion: boolean;
    canWithdrawAnytime: boolean;
  };
  crisisProtocol: {
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelationship: string;
    notifyInCrisis: boolean;
    hasSafeWord: boolean;
    safeWord: string;
    deescalationStrategies: string[];
  };
  notes: string;
}

export function ConsentBoundaries({ accessToken }: ConsentBoundariesProps) {
  const [data, setData] = useState<ConsentBoundariesData>({
    communicationPreferences: {
      preferredTitle: '',
      customTitle: '',
      okayToDiscussHistory: true,
      preferredCommunicationMethod: 'email',
      canLeaveVoicemail: false,
      canTextResults: false
    },
    physicalExamBoundaries: {
      supportPersonAllowed: false,
      preferredProviderGender: 'no-preference',
      areasCausingDiscomfort: [],
      customAreas: '',
      requiresExplanationBeforeTouch: true,
      needsBreaksDuringExam: false,
      hasSafeTouchZones: false,
      safeZones: '',
      unsafeZones: ''
    },
    triggersAndAccommodations: {
      triggers: [],
      accommodations: [],
      useNonBinaryLanguage: true,
      avoidGenderedTerms: []
    },
    consentPreferences: {
      requiresWrittenConsent: false,
      needsTimeToDecide: true,
      wantsSecondOpinion: false,
      canWithdrawAnytime: true
    },
    crisisProtocol: {
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      notifyInCrisis: false,
      hasSafeWord: false,
      safeWord: '',
      deescalationStrategies: []
    },
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newTrigger, setNewTrigger] = useState({ trigger: '', response: '', severity: 'medium' as const });
  const [newAccommodation, setNewAccommodation] = useState({ type: '', description: '', required: false });

  const titles = ['Mr.', 'Ms.', 'Mrs.', 'Mx.', 'Dr.', 'No title', 'Custom'];
  const discomfortAreas = [
    'Chest/breast',
    'Genitals',
    'Abdomen',
    'Hips/pelvis',
    'Inner thighs',
    'Face/head',
    'Neck',
    'Back'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/consent-boundaries`,
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
      console.error('Error fetching consent boundaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/consent-boundaries`,
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
      console.error('Error saving consent boundaries:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addTrigger = () => {
    if (newTrigger.trigger.trim()) {
      setData(prev => ({
        ...prev,
        triggersAndAccommodations: {
          ...prev.triggersAndAccommodations,
          triggers: [
            ...prev.triggersAndAccommodations.triggers,
            { ...newTrigger, id: Date.now().toString() }
          ]
        }
      }));
      setNewTrigger({ trigger: '', response: '', severity: 'medium' });
    }
  };

  const removeTrigger = (id: string) => {
    setData(prev => ({
      ...prev,
      triggersAndAccommodations: {
        ...prev.triggersAndAccommodations,
        triggers: prev.triggersAndAccommodations.triggers.filter(t => t.id !== id)
      }
    }));
  };

  const addAccommodation = () => {
    if (newAccommodation.type.trim()) {
      setData(prev => ({
        ...prev,
        triggersAndAccommodations: {
          ...prev.triggersAndAccommodations,
          accommodations: [
            ...prev.triggersAndAccommodations.accommodations,
            { ...newAccommodation, id: Date.now().toString() }
          ]
        }
      }));
      setNewAccommodation({ type: '', description: '', required: false });
    }
  };

  const removeAccommodation = (id: string) => {
    setData(prev => ({
      ...prev,
      triggersAndAccommodations: {
        ...prev.triggersAndAccommodations,
        accommodations: prev.triggersAndAccommodations.accommodations.filter(a => a.id !== id)
      }
    }));
  };

  const toggleDiscomfortArea = (area: string) => {
    setData(prev => ({
      ...prev,
      physicalExamBoundaries: {
        ...prev.physicalExamBoundaries,
        areasCausingDiscomfort: prev.physicalExamBoundaries.areasCausingDiscomfort.includes(area)
          ? prev.physicalExamBoundaries.areasCausingDiscomfort.filter(a => a !== area)
          : [...prev.physicalExamBoundaries.areasCausingDiscomfort, area]
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Shield className="h-8 w-8 text-blue-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading your preferences...</p>
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
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Consent & Boundaries</CardTitle>
              <CardDescription>
                Trauma-informed care starts with respecting your boundaries. You have the right to feel safe and comfortable.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Trauma-Informed Notice */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Heart className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-900">
              <p className="font-semibold mb-1">Your care, your choices</p>
              <p>These preferences help providers give you trauma-informed, respectful care. You can update this anytime, and you can always say no or ask to stop during any procedure.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Communication Preferences</CardTitle>
          <CardDescription>How you want to be addressed and contacted</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Title</Label>
            <Select
              value={data.communicationPreferences.preferredTitle}
              onValueChange={(value) => setData(prev => ({
                ...prev,
                communicationPreferences: { ...prev.communicationPreferences, preferredTitle: value }
              }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a title" />
              </SelectTrigger>
              <SelectContent>
                {titles.map(title => (
                  <SelectItem key={title} value={title}>{title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.communicationPreferences.preferredTitle === 'Custom' && (
            <div>
              <Label htmlFor="customTitle">Custom Title</Label>
              <Input
                id="customTitle"
                value={data.communicationPreferences.customTitle}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  communicationPreferences: { ...prev.communicationPreferences, customTitle: e.target.value }
                }))}
                placeholder="Your preferred title"
                className="mt-1.5"
              />
            </div>
          )}

          <div>
            <Label>Preferred Communication Method</Label>
            <Select
              value={data.communicationPreferences.preferredCommunicationMethod}
              onValueChange={(value) => setData(prev => ({
                ...prev,
                communicationPreferences: { ...prev.communicationPreferences, preferredCommunicationMethod: value }
              }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone call</SelectItem>
                <SelectItem value="text">Text message</SelectItem>
                <SelectItem value="portal">Patient portal only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Okay to discuss medical history openly</Label>
              <Checkbox
                checked={data.communicationPreferences.okayToDiscussHistory}
                onCheckedChange={(checked) => setData(prev => ({
                  ...prev,
                  communicationPreferences: { ...prev.communicationPreferences, okayToDiscussHistory: checked as boolean }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Can leave voicemail messages</Label>
              <Checkbox
                checked={data.communicationPreferences.canLeaveVoicemail}
                onCheckedChange={(checked) => setData(prev => ({
                  ...prev,
                  communicationPreferences: { ...prev.communicationPreferences, canLeaveVoicemail: checked as boolean }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Can text test results</Label>
              <Checkbox
                checked={data.communicationPreferences.canTextResults}
                onCheckedChange={(checked) => setData(prev => ({
                  ...prev,
                  communicationPreferences: { ...prev.communicationPreferences, canTextResults: checked as boolean }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Exam Boundaries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Physical Exam Boundaries</CardTitle>
          <CardDescription>Your comfort and safety during medical examinations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred Provider Gender</Label>
            <Select
              value={data.physicalExamBoundaries.preferredProviderGender}
              onValueChange={(value) => setData(prev => ({
                ...prev,
                physicalExamBoundaries: { ...prev.physicalExamBoundaries, preferredProviderGender: value }
              }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-preference">No preference</SelectItem>
                <SelectItem value="female">Female provider</SelectItem>
                <SelectItem value="male">Male provider</SelectItem>
                <SelectItem value="non-binary">Non-binary provider</SelectItem>
                <SelectItem value="same-gender">Same gender as me</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Body areas that cause discomfort (select all that apply)</Label>
            <div className="flex flex-wrap gap-2">
              {discomfortAreas.map(area => (
                <Badge
                  key={area}
                  variant={data.physicalExamBoundaries.areasCausingDiscomfort.includes(area) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5"
                  onClick={() => toggleDiscomfortArea(area)}
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="customAreas">Additional areas or notes</Label>
            <Textarea
              id="customAreas"
              value={data.physicalExamBoundaries.customAreas}
              onChange={(e) => setData(prev => ({
                ...prev,
                physicalExamBoundaries: { ...prev.physicalExamBoundaries, customAreas: e.target.value }
              }))}
              placeholder="Any other areas or specific concerns..."
              className="mt-1.5"
              rows={2}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Support person allowed in exam room</Label>
                <p className="text-xs text-gray-500">Bring someone for comfort and support</p>
              </div>
              <Checkbox
                checked={data.physicalExamBoundaries.supportPersonAllowed}
                onCheckedChange={(checked) => setData(prev => ({
                  ...prev,
                  physicalExamBoundaries: { ...prev.physicalExamBoundaries, supportPersonAllowed: checked as boolean }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Requires explanation before touch</Label>
                <p className="text-xs text-gray-500">Provider must explain what they're doing first</p>
              </div>
              <Checkbox
                checked={data.physicalExamBoundaries.requiresExplanationBeforeTouch}
                onCheckedChange={(checked) => setData(prev => ({
                  ...prev,
                  physicalExamBoundaries: { ...prev.physicalExamBoundaries, requiresExplanationBeforeTouch: checked as boolean }
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Need breaks during examination</Label>
                <p className="text-xs text-gray-500">Can pause or stop at any time</p>
              </div>
              <Checkbox
                checked={data.physicalExamBoundaries.needsBreaksDuringExam}
                onCheckedChange={(checked) => setData(prev => ({
                  ...prev,
                  physicalExamBoundaries: { ...prev.physicalExamBoundaries, needsBreaksDuringExam: checked as boolean }
                }))}
              />
            </div>
          </div>

          {data.physicalExamBoundaries.requiresExplanationBeforeTouch && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="safeZones">Safe touch zones (optional)</Label>
                <Input
                  id="safeZones"
                  value={data.physicalExamBoundaries.safeZones}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    physicalExamBoundaries: { ...prev.physicalExamBoundaries, safeZones: e.target.value }
                  }))}
                  placeholder="e.g., Arms, hands, shoulders"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="unsafeZones">Avoid these areas unless absolutely necessary</Label>
                <Input
                  id="unsafeZones"
                  value={data.physicalExamBoundaries.unsafeZones}
                  onChange={(e) => setData(prev => ({
                    ...prev,
                    physicalExamBoundaries: { ...prev.physicalExamBoundaries, unsafeZones: e.target.value }
                  }))}
                  placeholder="List areas to avoid"
                  className="mt-1.5"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Triggers & Accommodations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Triggers & Accommodations</CardTitle>
          <CardDescription>Help us avoid triggering situations and provide needed support</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="mb-3 block">Known Triggers</Label>
            <div className="space-y-3">
              {data.triggersAndAccommodations.triggers.map(trigger => (
                <div key={trigger.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{trigger.trigger}</p>
                        <Badge variant={
                          trigger.severity === 'high' ? 'destructive' :
                          trigger.severity === 'medium' ? 'default' : 'secondary'
                        } className="text-xs">
                          {trigger.severity}
                        </Badge>
                      </div>
                      {trigger.response && (
                        <p className="text-sm text-gray-600">Response needed: {trigger.response}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTrigger(trigger.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 border rounded-lg space-y-3">
              <Input
                value={newTrigger.trigger}
                onChange={(e) => setNewTrigger(prev => ({ ...prev, trigger: e.target.value }))}
                placeholder="Trigger (e.g., loud noises, unexpected touch)"
              />
              <Input
                value={newTrigger.response}
                onChange={(e) => setNewTrigger(prev => ({ ...prev, response: e.target.value }))}
                placeholder="Helpful response (e.g., warn before making noise, ask before touching)"
              />
              <div className="flex gap-2">
                <Select
                  value={newTrigger.severity}
                  onValueChange={(value: any) => setNewTrigger(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low severity</SelectItem>
                    <SelectItem value="medium">Medium severity</SelectItem>
                    <SelectItem value="high">High severity</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addTrigger}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trigger
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="mb-3 block">Accommodations Needed</Label>
            <div className="space-y-3">
              {data.triggersAndAccommodations.accommodations.map(acc => (
                <div key={acc.id} className="border rounded-lg p-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{acc.type}</p>
                      {acc.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    </div>
                    {acc.description && (
                      <p className="text-sm text-gray-600">{acc.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAccommodation(acc.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 border rounded-lg space-y-3">
              <Input
                value={newAccommodation.type}
                onChange={(e) => setNewAccommodation(prev => ({ ...prev, type: e.target.value }))}
                placeholder="Accommodation type (e.g., longer appointments, quiet room)"
              />
              <Textarea
                value={newAccommodation.description}
                onChange={(e) => setNewAccommodation(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description and details..."
                rows={2}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={newAccommodation.required}
                    onCheckedChange={(checked) => setNewAccommodation(prev => ({ ...prev, required: checked as boolean }))}
                  />
                  <Label>This accommodation is required</Label>
                </div>
                <Button onClick={addAccommodation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Accommodation
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Crisis Protocol */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Crisis Protocol</CardTitle>
          <CardDescription>Emergency contacts and de-escalation preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={data.crisisProtocol.emergencyContactName}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  crisisProtocol: { ...prev.crisisProtocol, emergencyContactName: e.target.value }
                }))}
                placeholder="Name"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactPhone">Phone Number</Label>
              <Input
                id="emergencyContactPhone"
                value={data.crisisProtocol.emergencyContactPhone}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  crisisProtocol: { ...prev.crisisProtocol, emergencyContactPhone: e.target.value }
                }))}
                placeholder="Phone"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="emergencyContactRelationship">Relationship</Label>
            <Input
              id="emergencyContactRelationship"
              value={data.crisisProtocol.emergencyContactRelationship}
              onChange={(e) => setData(prev => ({
                ...prev,
                crisisProtocol: { ...prev.crisisProtocol, emergencyContactRelationship: e.target.value }
              }))}
              placeholder="e.g., Partner, Friend, Therapist"
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Notify this contact in case of crisis</Label>
            <Checkbox
              checked={data.crisisProtocol.notifyInCrisis}
              onCheckedChange={(checked) => setData(prev => ({
                ...prev,
                crisisProtocol: { ...prev.crisisProtocol, notifyInCrisis: checked as boolean }
              }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Use a safe word for immediate attention</Label>
              <p className="text-xs text-gray-500">A word you can say to pause everything</p>
            </div>
            <Checkbox
              checked={data.crisisProtocol.hasSafeWord}
              onCheckedChange={(checked) => setData(prev => ({
                ...prev,
                crisisProtocol: { ...prev.crisisProtocol, hasSafeWord: checked as boolean }
              }))}
            />
          </div>

          {data.crisisProtocol.hasSafeWord && (
            <div>
              <Label htmlFor="safeWord">Your Safe Word</Label>
              <Input
                id="safeWord"
                value={data.crisisProtocol.safeWord}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  crisisProtocol: { ...prev.crisisProtocol, safeWord: e.target.value }
                }))}
                placeholder="Choose a word"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">When you say this word, we'll stop immediately</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consent Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consent Preferences</CardTitle>
          <CardDescription>How you prefer to give consent for procedures</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Require written consent forms</Label>
              <p className="text-xs text-gray-500">Prefer written over verbal consent</p>
            </div>
            <Checkbox
              checked={data.consentPreferences.requiresWrittenConsent}
              onCheckedChange={(checked) => setData(prev => ({
                ...prev,
                consentPreferences: { ...prev.consentPreferences, requiresWrittenConsent: checked as boolean }
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Need time to decide about procedures</Label>
              <p className="text-xs text-gray-500">Don't pressure me for immediate decisions</p>
            </div>
            <Checkbox
              checked={data.consentPreferences.needsTimeToDecide}
              onCheckedChange={(checked) => setData(prev => ({
                ...prev,
                consentPreferences: { ...prev.consentPreferences, needsTimeToDecide: checked as boolean }
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Want option for second opinion</Label>
              <p className="text-xs text-gray-500">Before major procedures or treatments</p>
            </div>
            <Checkbox
              checked={data.consentPreferences.wantsSecondOpinion}
              onCheckedChange={(checked) => setData(prev => ({
                ...prev,
                consentPreferences: { ...prev.consentPreferences, wantsSecondOpinion: checked as boolean }
              }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Understand I can withdraw consent anytime</Label>
              <p className="text-xs text-gray-500">Even after initially agreeing</p>
            </div>
            <Checkbox
              checked={data.consentPreferences.canWithdrawAnytime}
              onCheckedChange={(checked) => setData(prev => ({
                ...prev,
                consentPreferences: { ...prev.consentPreferences, canWithdrawAnytime: checked as boolean }
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Notes</CardTitle>
          <CardDescription>Anything else providers should know</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.notes}
            onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any other boundaries, preferences, or information that would help us provide better care..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Your rights</p>
              <p>You have the right to informed consent, to refuse treatment, to have a support person present, and to be treated with dignity and respect. If any provider violates these boundaries, please report it immediately.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}
