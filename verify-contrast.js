#!/usr/bin/env node

/**
 * Color Contrast Verification Script
 * Checks WCAG AA compliance for color combinations in the application
 *
 * Usage:
 *   node verify-contrast.js [--theme light|dark] [--fix] [--verbose]
 *
 * Options:
 *   --theme light|dark  Check only specified theme (default: both)
 *   --fix               Automatically suggest fixes for failing combinations
 *   --verbose           Show detailed analysis for each combination
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const themeFilter = args.find(arg => arg.startsWith('--theme='))?.split('=')[1] || null;
const shouldFix = args.includes('--fix');
const verbose = args.includes('--verbose');

// Color definitions from globals.css (updated with improved contrast)
const colors = {
  // Light theme
  light: {
    background: 'hsl(0 0% 100%)', // #ffffff
    foreground: 'hsl(0 0% 0%)',   // #000000
    card: 'hsl(0 0% 100%)',       // #ffffff
    'card-foreground': 'hsl(0 0% 0%)', // #000000
    popover: 'hsl(0 0% 100%)',    // #ffffff
    'popover-foreground': 'hsl(0 0% 0%)', // #000000
    primary: 'hsl(283 71% 25%)',  // #6b21a8
    'primary-foreground': 'hsl(0 0% 100%)', // #ffffff
    secondary: 'hsl(0 0% 96%)',   // #f5f5f5
    'secondary-foreground': 'hsl(0 0% 0%)', // #000000
    muted: 'hsl(0 0% 96%)',       // #f5f5f5
    'muted-foreground': 'hsl(0 0% 45%)', // #737373
    accent: 'hsl(340 82% 45%)',   // #dc2626
    'accent-foreground': 'hsl(0 0% 100%)', // #ffffff
    destructive: 'hsl(0 84% 50%)', // #ef4444
    'destructive-foreground': 'hsl(0 0% 100%)', // #ffffff
    border: 'hsl(0 0% 90%)',      // #e5e5e5
    input: 'hsl(0 0% 90%)',       // #e5e5e5
    ring: 'hsl(340 82% 45%)',     // #dc2626
  },
  // Dark theme (improved contrast)
  dark: {
    background: 'hsl(0 0% 10%)',  // #1a1a1a
    foreground: 'hsl(0 0% 100%)', // #ffffff
    card: 'hsl(0 0% 15%)',        // #262626
    'card-foreground': 'hsl(0 0% 100%)', // #ffffff
    popover: 'hsl(0 0% 15%)',     // #262626
    'popover-foreground': 'hsl(0 0% 100%)', // #ffffff
    primary: 'hsl(283 71% 65%)',  // #a855f7
    'primary-foreground': 'hsl(0 0% 100%)', // #ffffff
    secondary: 'hsl(0 0% 30%)',   // #4d4d4d
    'secondary-foreground': 'hsl(0 0% 100%)', // #ffffff
    muted: 'hsl(0 0% 35%)',       // #595959
    'muted-foreground': 'hsl(0 0% 85%)', // #d9d9d9
    accent: 'hsl(340 82% 65%)',   // #f87171
    'accent-foreground': 'hsl(0 0% 100%)', // #ffffff
    destructive: 'hsl(0 84% 65%)', // #f87171
    'destructive-foreground': 'hsl(0 0% 100%)', // #ffffff
    border: 'hsl(0 0% 40%)',      // #666666
    input: 'hsl(0 0% 40%)',       // #666666
    ring: 'hsl(340 82% 65%)',     // #f87171
  }
};

/**
 * Convert HSL to RGB
 */
function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
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
 * Parse HSL string to components
 */
function parseHsl(hslString) {
  const match = hslString.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);
  if (!match) return null;
  return {
    h: parseInt(match[1]),
    s: parseInt(match[2]),
    l: parseInt(match[3])
  };
}

/**
 * Calculate relative luminance
 */
function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio
 */
function getContrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standards
 */
function meetsWCAGAA(ratio, isLargeText = false) {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Get RGB values from color name
 */
function getRgbFromColor(colorName, theme = 'light') {
  const hslString = colors[theme][colorName];
  if (!hslString) return null;

  const hsl = parseHsl(hslString);
  if (!hsl) return null;

  return hslToRgb(hsl.h, hsl.s, hsl.l);
}

/**
 * Analyze color combination
 */
function analyzeColorCombination(bgColor, fgColor, theme = 'light', isLargeText = false) {
  const bgRgb = getRgbFromColor(bgColor, theme);
  const fgRgb = getRgbFromColor(fgColor, theme);

  if (!bgRgb || !fgRgb) {
    return { error: `Invalid color combination: ${bgColor} on ${fgColor}` };
  }

  const bgLuminance = getRelativeLuminance(...bgRgb);
  const fgLuminance = getRelativeLuminance(...fgRgb);
  const ratio = getContrastRatio(bgLuminance, fgLuminance);
  const passes = meetsWCAGAA(ratio, isLargeText);

  return {
    background: bgColor,
    foreground: fgColor,
    theme,
    ratio: ratio.toFixed(2),
    passes,
    isLargeText,
    bgRgb,
    fgRgb
  };
}

/**
 * Generate fix suggestions for failing combinations
 */
function generateFixSuggestions(result) {
  const suggestions = [];

  if (!result.passes) {
    const requiredRatio = result.isLargeText ? 3 : 4.5;
    const currentRatio = parseFloat(result.ratio);

    // Suggest increasing foreground lightness
    suggestions.push(`Increase ${result.foreground} lightness by ${Math.ceil((requiredRatio - currentRatio) * 10)}%`);

    // Suggest decreasing background lightness
    suggestions.push(`Decrease ${result.background} lightness by ${Math.ceil((requiredRatio - currentRatio) * 5)}%`);

    // Suggest alternative color combinations
    if (result.theme === 'dark') {
      suggestions.push(`Consider using 'foreground' instead of 'muted-foreground' for better contrast`);
    } else {
      suggestions.push(`Consider using darker text colors for better contrast`);
    }
  }

  return suggestions;
}

/**
 * Main analysis function
 */
function analyzeColorSystem() {
  console.log('🔍 Analyzing Color Contrast for WCAG AA Compliance\n');

  const combinations = [
    // Primary combinations
    { bg: 'background', fg: 'foreground' },
    { bg: 'card', fg: 'card-foreground' },
    { bg: 'popover', fg: 'popover-foreground' },
    { bg: 'primary', fg: 'primary-foreground' },
    { bg: 'secondary', fg: 'secondary-foreground' },
    { bg: 'muted', fg: 'muted-foreground' },
    { bg: 'accent', fg: 'accent-foreground' },
    { bg: 'destructive', fg: 'destructive-foreground' },

    // Common UI combinations
    { bg: 'background', fg: 'muted-foreground' },
    { bg: 'card', fg: 'muted-foreground' },
    { bg: 'secondary', fg: 'foreground' },
    { bg: 'muted', fg: 'foreground' },
  ];

  const results = { light: [], dark: [] };
  let totalIssues = 0;

  const themesToCheck = themeFilter ? [themeFilter] : ['light', 'dark'];

  themesToCheck.forEach(theme => {
    console.log(`📊 ${theme.charAt(0).toUpperCase() + theme.slice(1)} Theme Results:`);
    console.log('─'.repeat(80));

    combinations.forEach(({ bg, fg }) => {
      const result = analyzeColorCombination(bg, fg, theme);
      if (result.error) {
        console.log(`❌ Error: ${result.error}`);
        return;
      }

      results[theme].push(result);

      const status = result.passes ? '✅ PASS' : '❌ FAIL';
      const largeText = result.isLargeText ? ' (Large Text)' : '';
      console.log(`${status} ${bg} → ${fg}: ${result.ratio}:1${largeText}`);

      if (verbose) {
        console.log(`   Background RGB: ${result.bgRgb.join(', ')}`);
        console.log(`   Foreground RGB: ${result.fgRgb.join(', ')}`);
      }

      if (!result.passes) {
        totalIssues++;
        if (shouldFix) {
          const suggestions = generateFixSuggestions(result);
          console.log(`   💡 Suggestions:`);
          suggestions.forEach(suggestion => console.log(`      • ${suggestion}`));
        } else {
          console.log(`   💡 Recommendation: Increase contrast ratio to ${result.isLargeText ? '3.0' : '4.5'}:1 or higher`);
        }
      }
    });

    console.log('');
  });

  console.log(`📈 Summary: ${totalIssues} contrast issues found`);

  if (totalIssues > 0) {
    console.log('\n🔧 Suggested Fixes:');
    console.log('1. Increase lightness difference between background and foreground colors');
    console.log('2. Adjust saturation for better contrast');
    console.log('3. Consider using darker backgrounds with lighter text');
    console.log('4. Test with actual color values in design tools');
    if (!shouldFix) {
      console.log('5. Run with --fix flag for specific suggestions');
    }
  } else {
    console.log('\n🎉 All color combinations meet WCAG AA standards!');
  }

  return { results, totalIssues };
}

// Export for use in other scripts
module.exports = {
  analyzeColorSystem,
  analyzeColorCombination,
  getRgbFromColor,
  meetsWCAGAA,
  generateFixSuggestions
};

// Run analysis if called directly
if (require.main === module) {
  analyzeColorSystem();
}