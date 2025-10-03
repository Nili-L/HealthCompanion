import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import {
  User,
  Save,
  Shield,
  Eye,
  EyeOff,
  Plus,
  X,
  AlertCircle,
  Heart
} from "lucide-react";
import { projectId } from "../utils/supabase/info";

interface GenderIdentityProps {
  accessToken: string;
}

interface GenderIdentityData {
  chosenName: string;
  legalName: string;
  pronouns: string[];
  customPronouns: string;
  genderIdentity: string;
  customGenderIdentity: string;
  genderExpression: string;
  showLegalName: 'never' | 'legal-only' | 'both';
  visibilityPreferences: {
    showPronouns: boolean;
    showGenderIdentity: boolean;
    shareWithProviders: boolean;
    shareWithStaff: boolean;
  };
  nameChangeHistory: Array<{
    id: string;
    previousName: string;
    newName: string;
    date: string;
    legallyChanged: boolean;
  }>;
}

export function GenderIdentity({ accessToken }: GenderIdentityProps) {
  const [data, setData] = useState<GenderIdentityData>({
    chosenName: '',
    legalName: '',
    pronouns: [],
    customPronouns: '',
    genderIdentity: '',
    customGenderIdentity: '',
    genderExpression: '',
    showLegalName: 'never',
    visibilityPreferences: {
      showPronouns: true,
      showGenderIdentity: false,
      shareWithProviders: true,
      shareWithStaff: false,
    },
    nameChangeHistory: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [customPronounInput, setCustomPronounInput] = useState('');
  const [showLegalNameField, setShowLegalNameField] = useState(false);

  const commonPronouns = [
    'she/her',
    'he/him',
    'they/them',
    'she/they',
    'he/they',
    'any pronouns',
    'ask me'
  ];

  const genderIdentities = [
    'Woman',
    'Man',
    'Non-binary',
    'Transgender woman',
    'Transgender man',
    'Genderqueer',
    'Genderfluid',
    'Agender',
    'Two-Spirit',
    'Questioning',
    'Prefer not to say',
    'Custom'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/gender-identity`,
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
      console.error('Error fetching gender identity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-50d6a062/gender-identity`,
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
        // Success feedback could be added here
      }
    } catch (error) {
      console.error('Error saving gender identity:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePronoun = (pronoun: string) => {
    setData(prev => ({
      ...prev,
      pronouns: prev.pronouns.includes(pronoun)
        ? prev.pronouns.filter(p => p !== pronoun)
        : [...prev.pronouns, pronoun]
    }));
  };

  const addCustomPronoun = () => {
    if (customPronounInput.trim() && !data.pronouns.includes(customPronounInput.trim())) {
      setData(prev => ({
        ...prev,
        pronouns: [...prev.pronouns, customPronounInput.trim()]
      }));
      setCustomPronounInput('');
    }
  };

  const removePronoun = (pronoun: string) => {
    setData(prev => ({
      ...prev,
      pronouns: prev.pronouns.filter(p => p !== pronoun)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Heart className="h-8 w-8 text-blue-600 mx-auto" />
          </div>
          <p className="text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Gender Identity & Expression</CardTitle>
              <CardDescription>
                Your identity is valid. This information helps us provide affirming, personalized care.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Your privacy and safety matter</p>
              <p>You control who sees this information. Your chosen name and pronouns will be used throughout the system unless you specify otherwise.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Names */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Names</CardTitle>
          <CardDescription>How you want to be addressed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="chosenName">Chosen Name *</Label>
            <Input
              id="chosenName"
              value={data.chosenName}
              onChange={(e) => setData(prev => ({ ...prev, chosenName: e.target.value }))}
              placeholder="The name you use"
              className="mt-1.5"
            />
            <p className="text-xs text-gray-500 mt-1">This is the name we'll use everywhere in your care</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="legalName">Legal Name (if different)</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLegalNameField(!showLegalNameField)}
              >
                {showLegalNameField ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {showLegalNameField && (
              <>
                <Input
                  id="legalName"
                  type="password"
                  value={data.legalName}
                  onChange={(e) => setData(prev => ({ ...prev, legalName: e.target.value }))}
                  placeholder="Required only for insurance/legal purposes"
                  className="mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">Protected field - only shown when legally required</p>
              </>
            )}
          </div>

          <div>
            <Label htmlFor="showLegalName">When to show legal name</Label>
            <Select
              value={data.showLegalName}
              onValueChange={(value: any) => setData(prev => ({ ...prev, showLegalName: value }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never show (chosen name only)</SelectItem>
                <SelectItem value="legal-only">Only on legal documents</SelectItem>
                <SelectItem value="both">Show both names when needed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pronouns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pronouns</CardTitle>
          <CardDescription>Select all that apply to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {commonPronouns.map(pronoun => (
              <Badge
                key={pronoun}
                variant={data.pronouns.includes(pronoun) ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5"
                onClick={() => togglePronoun(pronoun)}
              >
                {pronoun}
                {data.pronouns.includes(pronoun) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>

          <Separator />

          <div>
            <Label>Custom pronouns</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                value={customPronounInput}
                onChange={(e) => setCustomPronounInput(e.target.value)}
                placeholder="e.g., ze/zir, fae/faer"
                onKeyPress={(e) => e.key === 'Enter' && addCustomPronoun()}
              />
              <Button onClick={addCustomPronoun} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {data.pronouns.filter(p => !commonPronouns.includes(p)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.pronouns.filter(p => !commonPronouns.includes(p)).map(pronoun => (
                <Badge
                  key={pronoun}
                  variant="default"
                  className="cursor-pointer px-3 py-1.5"
                >
                  {pronoun}
                  <X
                    className="h-3 w-3 ml-1"
                    onClick={() => removePronoun(pronoun)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gender Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gender Identity</CardTitle>
          <CardDescription>How you identify</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="genderIdentity">Gender Identity</Label>
            <Select
              value={data.genderIdentity}
              onValueChange={(value) => setData(prev => ({ ...prev, genderIdentity: value }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select your gender identity" />
              </SelectTrigger>
              <SelectContent>
                {genderIdentities.map(identity => (
                  <SelectItem key={identity} value={identity}>
                    {identity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.genderIdentity === 'Custom' && (
            <div>
              <Label htmlFor="customGenderIdentity">Describe your gender identity</Label>
              <Input
                id="customGenderIdentity"
                value={data.customGenderIdentity}
                onChange={(e) => setData(prev => ({ ...prev, customGenderIdentity: e.target.value }))}
                placeholder="Your gender identity"
                className="mt-1.5"
              />
            </div>
          )}

          <div>
            <Label htmlFor="genderExpression">Gender Expression (optional)</Label>
            <Input
              id="genderExpression"
              value={data.genderExpression}
              onChange={(e) => setData(prev => ({ ...prev, genderExpression: e.target.value }))}
              placeholder="e.g., Feminine, Masculine, Androgynous, Fluid"
              className="mt-1.5"
            />
            <p className="text-xs text-gray-500 mt-1">How you present your gender to the world</p>
          </div>
        </CardContent>
      </Card>

      {/* Visibility Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Privacy & Visibility</CardTitle>
          <CardDescription>Control who sees your gender information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show pronouns on my profile</Label>
                <p className="text-xs text-gray-500">Visible to providers and staff</p>
              </div>
              <Checkbox
                checked={data.visibilityPreferences.showPronouns}
                onCheckedChange={(checked) =>
                  setData(prev => ({
                    ...prev,
                    visibilityPreferences: {
                      ...prev.visibilityPreferences,
                      showPronouns: checked as boolean
                    }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show gender identity</Label>
                <p className="text-xs text-gray-500">Share with healthcare providers</p>
              </div>
              <Checkbox
                checked={data.visibilityPreferences.showGenderIdentity}
                onCheckedChange={(checked) =>
                  setData(prev => ({
                    ...prev,
                    visibilityPreferences: {
                      ...prev.visibilityPreferences,
                      showGenderIdentity: checked as boolean
                    }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Share with all providers</Label>
                <p className="text-xs text-gray-500">Including specialists and emergency care</p>
              </div>
              <Checkbox
                checked={data.visibilityPreferences.shareWithProviders}
                onCheckedChange={(checked) =>
                  setData(prev => ({
                    ...prev,
                    visibilityPreferences: {
                      ...prev.visibilityPreferences,
                      shareWithProviders: checked as boolean
                    }
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Share with administrative staff</Label>
                <p className="text-xs text-gray-500">Reception, scheduling, billing</p>
              </div>
              <Checkbox
                checked={data.visibilityPreferences.shareWithStaff}
                onCheckedChange={(checked) =>
                  setData(prev => ({
                    ...prev,
                    visibilityPreferences: {
                      ...prev.visibilityPreferences,
                      shareWithStaff: checked as boolean
                    }
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Name Change History */}
      {data.nameChangeHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Name Change History</CardTitle>
            <CardDescription>Record of your name changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.nameChangeHistory.map(change => (
                <div key={change.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{change.newName}</p>
                    <p className="text-sm text-gray-500">
                      Changed on {new Date(change.date).toLocaleDateString()}
                      {change.legallyChanged && (
                        <Badge variant="secondary" className="ml-2 text-xs">Legal</Badge>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Important</p>
              <p>This information is protected and confidential. If you experience any misgendering or discrimination, please report it through our Support Tickets module.</p>
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
