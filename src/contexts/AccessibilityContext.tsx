import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ContrastMode = 'normal' | 'high';

interface AccessibilitySettings {
  colorBlindMode: ColorBlindMode;
  fontSize: FontSize;
  contrastMode: ContrastMode;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: AccessibilitySettings = {
  colorBlindMode: 'none',
  fontSize: 'medium',
  contrastMode: 'normal',
  dyslexiaFont: false,
  reducedMotion: false
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Apply color-blind mode
    root.setAttribute('data-colorblind-mode', settings.colorBlindMode);

    // Apply font size
    const fontSizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '22px'
    };
    root.style.fontSize = fontSizes[settings.fontSize];

    // Apply contrast mode
    root.setAttribute('data-contrast-mode', settings.contrastMode);

    // Apply dyslexia font
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font');
    } else {
      root.classList.remove('dyslexia-font');
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Save to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
