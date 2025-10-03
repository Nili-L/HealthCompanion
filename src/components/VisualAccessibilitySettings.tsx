import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
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
  Eye,
  Type,
  Contrast,
  Palette,
  RotateCcw,
  Check,
  Zap,
  Sun,
  Moon,
  Monitor,
  Languages
} from "lucide-react";
import { useAccessibility, ColorBlindMode, FontSize, ContrastMode, ThemeMode, Language } from "../contexts/AccessibilityContext";
import { useTranslation } from "../i18n/translations";

interface VisualAccessibilitySettingsProps {
  onClose?: () => void;
}

export function VisualAccessibilitySettings({ onClose }: VisualAccessibilitySettingsProps) {
  const { settings, updateSettings, resetSettings } = useAccessibility();
  const t = useTranslation(settings.language);

  const colorBlindModes: { value: ColorBlindMode; label: string; description: string }[] = [
    { value: 'none', label: 'None', description: 'Standard colors' },
    { value: 'deuteranopia', label: 'Deuteranopia', description: 'Red-green (most common)' },
    { value: 'protanopia', label: 'Protanopia', description: 'Red-green' },
    { value: 'tritanopia', label: 'Tritanopia', description: 'Blue-yellow' },
    { value: 'achromatopsia', label: 'Achromatopsia', description: 'Complete color blindness' }
  ];

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'small', label: 'Small (14px)' },
    { value: 'medium', label: 'Medium (16px)' },
    { value: 'large', label: 'Large (18px)' },
    { value: 'extra-large', label: 'Extra Large (22px)' }
  ];

  const themeModes: { value: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" />, description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" />, description: 'Always use dark theme' },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" />, description: 'Follow system preference' }
  ];

  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Eye className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <CardTitle>{t('accessibilitySettings')}</CardTitle>
              <CardDescription>
                {t('customizeDisplay')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-lg">Theme Mode</CardTitle>
          </div>
          <CardDescription>Choose between light, dark, or system theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {themeModes.map(mode => (
              <div
                key={mode.value}
                className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${
                  settings.themeMode === mode.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateSettings({ themeMode: mode.value })}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`${settings.themeMode === mode.value ? 'text-indigo-600' : 'text-gray-600'}`}>
                    {mode.icon}
                  </div>
                  <div className="font-semibold">{mode.label}</div>
                  <div className="text-xs text-gray-600">{mode.description}</div>
                  {settings.themeMode === mode.value && (
                    <Check className="h-4 w-4 text-indigo-600 mt-1" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">{t('language')}</CardTitle>
          </div>
          <CardDescription>{t('languageDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${
                settings.language === 'en'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({ language: 'en' })}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="font-semibold">{t('english')}</div>
                <div className="text-xs text-gray-600">English</div>
                {settings.language === 'en' && (
                  <Check className="h-4 w-4 text-green-600 mt-1" />
                )}
              </div>
            </div>
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${
                settings.language === 'he'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({ language: 'he' })}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="font-semibold">{t('hebrew')}</div>
                <div className="text-xs text-gray-600">עברית</div>
                {settings.language === 'he' && (
                  <Check className="h-4 w-4 text-green-600 mt-1" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color-Blind Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Color-Blind Mode</CardTitle>
          </div>
          <CardDescription>Adjust colors for different types of color vision deficiency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {colorBlindModes.map(mode => (
            <div
              key={mode.value}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                settings.colorBlindMode === mode.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({ colorBlindMode: mode.value })}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{mode.label}</p>
                    {settings.colorBlindMode === mode.value && (
                      <Check className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{mode.description}</p>
                </div>
                {settings.colorBlindMode === mode.value && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Font Size</CardTitle>
          </div>
          <CardDescription>Choose a comfortable reading size</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fontSizes.map(size => (
              <div
                key={size.value}
                className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-all ${
                  settings.fontSize === size.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => updateSettings({ fontSize: size.value })}
              >
                <div className="font-semibold mb-1">{size.value.charAt(0).toUpperCase() + size.value.slice(1)}</div>
                <div className="text-xs text-gray-600">{size.label.match(/\((.+)\)/)?.[1]}</div>
                {settings.fontSize === size.value && (
                  <Check className="h-4 w-4 text-blue-600 mx-auto mt-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contrast Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Contrast className="h-5 w-5 text-gray-700" />
            <CardTitle className="text-lg">Contrast Mode</CardTitle>
          </div>
          <CardDescription>Increase contrast for better visibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                settings.contrastMode === 'normal'
                  ? 'border-gray-500 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({ contrastMode: 'normal' })}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Normal</p>
                  <p className="text-sm text-gray-600">Standard contrast</p>
                </div>
                {settings.contrastMode === 'normal' && (
                  <Check className="h-4 w-4 text-gray-700" />
                )}
              </div>
            </div>

            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                settings.contrastMode === 'high'
                  ? 'border-black bg-white'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateSettings({ contrastMode: 'high' })}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">High Contrast</p>
                  <p className="text-sm text-gray-600">Black & white</p>
                </div>
                {settings.contrastMode === 'high' && (
                  <Check className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toggle Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-semibold">Dyslexia-Friendly Font</p>
              <p className="text-sm text-gray-600">Use OpenDyslexic font with increased spacing for easier reading</p>
            </div>
            <Button
              variant={settings.dyslexiaFont ? "default" : "outline"}
              onClick={() => updateSettings({ dyslexiaFont: !settings.dyslexiaFont })}
            >
              {settings.dyslexiaFont ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <p className="font-semibold">Reduced Motion</p>
              </div>
              <p className="text-sm text-gray-600">Minimize animations for vestibular disorders</p>
            </div>
            <Button
              variant={settings.reducedMotion ? "default" : "outline"}
              onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
            >
              {settings.reducedMotion ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Preview</CardTitle>
          <CardDescription>Sample text with your current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-white rounded-lg border">
            <h3 className="text-xl font-bold mb-2">Sample Heading</h3>
            <p className="mb-4">
              This is sample paragraph text to show how your accessibility settings affect readability.
              The quick brown fox jumps over the lazy dog. 0123456789.
            </p>
            <div className="flex gap-2">
              <Badge>Primary Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={resetSettings}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        {onClose && (
          <Button onClick={onClose}>
            Done
          </Button>
        )}
      </div>
    </div>
  );
}
