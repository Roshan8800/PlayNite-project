'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auditColorPalette, isAccessible, type AccessibilityScore } from '@/lib/color-accessibility';

interface AccessibilityContextType {
  colorAudit: {
    light: AccessibilityScore | null;
    dark: AccessibilityScore | null;
  };
  isColorAccessible: (fg: string, bg: string, level?: 'AA' | 'AAA', size?: 'normal' | 'large') => boolean;
  highContrastMode: boolean;
  setHighContrastMode: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [colorAudit, setColorAudit] = useState<{ light: AccessibilityScore | null; dark: AccessibilityScore | null }>({ light: null, dark: null });

  useEffect(() => {
    // Light theme colors
    const lightColors = {
      background: '0 0% 100%',
      foreground: '0 0% 0%',
      primary: '283 71% 35%',
      'primary-foreground': '0 0% 100%',
      secondary: '0 0% 96%',
      'secondary-foreground': '0 0% 0%',
      'muted-foreground': '0 0% 35%',
      accent: '340 82% 55%',
      'accent-foreground': '0 0% 100%',
      destructive: '0 84% 60%',
      'destructive-foreground': '0 0% 100%'
    };

    // Dark theme colors
    const darkColors = {
      background: '0 0% 10%',
      foreground: '0 0% 100%',
      primary: '283 71% 70%',
      'primary-foreground': '0 0% 0%',
      secondary: '0 0% 25%',
      'secondary-foreground': '0 0% 100%',
      'muted-foreground': '0 0% 75%',
      accent: '340 82% 70%',
      'accent-foreground': '0 0% 0%',
      destructive: '0 84% 70%',
      'destructive-foreground': '0 0% 0%'
    };

    setColorAudit({
      light: auditColorPalette(lightColors),
      dark: auditColorPalette(darkColors)
    });
  }, []);

  const isColorAccessible = (fg: string, bg: string, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal') => {
    return isAccessible(fg, bg, level, size);
  };

  // Apply high contrast mode styles
  useEffect(() => {
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrastMode]);

  return (
    <AccessibilityContext.Provider
      value={{
        colorAudit,
        isColorAccessible,
        highContrastMode,
        setHighContrastMode
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};