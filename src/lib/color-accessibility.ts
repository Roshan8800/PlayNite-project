/**
 * Color accessibility utilities for WCAG AA compliance
 * Provides functions to calculate contrast ratios and suggest accessible color combinations
 */

export interface ColorContrast {
  ratio: number;
  aa: {
    normal: boolean;
    large: boolean;
  };
  aaa: {
    normal: boolean;
    large: boolean;
  };
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: HSLColor, color2: HSLColor): ColorContrast {
  const [r1, g1, b1] = hslToRgb(color1.h, color1.s, color1.l);
  const [r2, g2, b2] = hslToRgb(color2.h, color2.s, color2.l);

  const lum1 = getRelativeLuminance(r1, g1, b1);
  const lum2 = getRelativeLuminance(r2, g2, b2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  const ratio = (lighter + 0.05) / (darker + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    aa: {
      normal: ratio >= 4.5,
      large: ratio >= 3
    },
    aaa: {
      normal: ratio >= 7,
      large: ratio >= 4.5
    }
  };
}

/**
 * Parse HSL string like "283 71% 25%" to HSLColor object
 */
export function parseHSL(hslString: string): HSLColor {
  const match = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
  if (!match) throw new Error(`Invalid HSL format: ${hslString}`);
  return {
    h: parseInt(match[1]),
    s: parseInt(match[2]),
    l: parseInt(match[3])
  };
}

/**
 * Suggest accessible foreground color for a given background
 */
export function suggestAccessibleForeground(background: HSLColor, targetRatio: number = 4.5): HSLColor {
  // Try white first
  const whiteContrast = getContrastRatio(background, { h: 0, s: 0, l: 100 });
  if (whiteContrast.ratio >= targetRatio) {
    return { h: 0, s: 0, l: 100 };
  }

  // Try black
  const blackContrast = getContrastRatio(background, { h: 0, s: 0, l: 0 });
  if (blackContrast.ratio >= targetRatio) {
    return { h: 0, s: 0, l: 0 };
  }

  // If neither works, find the best contrast by adjusting lightness
  const bgLuminance = getRelativeLuminance(...hslToRgb(background.h, background.s, background.l));

  // Target luminance for desired contrast
  const targetLuminance = bgLuminance > 0.5
    ? (bgLuminance + 0.05) / (targetRatio + 0.05) - 0.05
    : 1 - ((1 - bgLuminance + 0.05) / (targetRatio + 0.05) - 0.05);

  // Convert back to lightness (approximate)
  const lightness = targetLuminance <= 0.5
    ? Math.sqrt(targetLuminance / 0.0722) * 12.92 * 100
    : (Math.pow(targetLuminance, 1/2.4) * 1.055 - 0.055) * 100;

  return {
    h: 0,
    s: 0,
    l: Math.max(0, Math.min(100, lightness))
  };
}

/**
 * Check if a color combination meets WCAG AA standards
 */
export function isAccessible(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean {
  try {
    const c1 = parseHSL(color1);
    const c2 = parseHSL(color2);
    const contrast = getContrastRatio(c1, c2);

    if (level === 'AAA') {
      return size === 'large' ? contrast.aaa.large : contrast.aaa.normal;
    } else {
      return size === 'large' ? contrast.aa.large : contrast.aa.normal;
    }
  } catch {
    return false;
  }
}

/**
 * Get accessibility score for a color palette
 */
export interface AccessibilityScore {
  total: number;
  passed: number;
  failed: number;
  issues: Array<{
    combination: string;
    ratio: number;
    required: number;
    passed: boolean;
  }>;
}

export function auditColorPalette(colors: Record<string, string>): AccessibilityScore {
  const combinations = [
    { name: 'primary on background', fg: colors.primary, bg: colors.background },
    { name: 'primary-foreground on primary', fg: colors['primary-foreground'], bg: colors.primary },
    { name: 'secondary on background', fg: colors.secondary, bg: colors.background },
    { name: 'secondary-foreground on secondary', fg: colors['secondary-foreground'], bg: colors.secondary },
    { name: 'muted-foreground on background', fg: colors['muted-foreground'], bg: colors.background },
    { name: 'foreground on background', fg: colors.foreground, bg: colors.background },
    { name: 'accent on background', fg: colors.accent, bg: colors.background },
    { name: 'accent-foreground on accent', fg: colors['accent-foreground'], bg: colors.accent },
    { name: 'destructive on background', fg: colors.destructive, bg: colors.background },
    { name: 'destructive-foreground on destructive', fg: colors['destructive-foreground'], bg: colors.destructive },
  ];

  const issues: AccessibilityScore['issues'] = [];
  let passed = 0;
  let failed = 0;

  combinations.forEach(({ name, fg, bg }) => {
    try {
      const fgColor = parseHSL(fg);
      const bgColor = parseHSL(bg);
      const contrast = getContrastRatio(fgColor, bgColor);
      const required = 4.5; // AA normal text
      const isPassed = contrast.ratio >= required;

      issues.push({
        combination: name,
        ratio: contrast.ratio,
        required,
        passed: isPassed
      });

      if (isPassed) passed++;
      else failed++;
    } catch (error) {
      issues.push({
        combination: name,
        ratio: 0,
        required: 4.5,
        passed: false
      });
      failed++;
    }
  });

  return {
    total: combinations.length,
    passed,
    failed,
    issues
  };
}