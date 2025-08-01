import { ColorToken, TypographyToken, SpacingToken, ExtractionConfig } from '../types';
import { pxToRem } from '../utils/naming';

export class TailwindConfigGenerator {
  private config: ExtractionConfig;
  
  constructor(config: ExtractionConfig) {
    this.config = config;
  }

  generateTailwindConfig(
    colors: ColorToken[], 
    typography: TypographyToken[], 
    spacing: SpacingToken[]
  ): string {
    const configObject = {
      content: this.generateContentConfig(),
      theme: {
        extend: {
          colors: this.generateColorConfig(colors),
          fontFamily: this.generateFontFamilyConfig(typography),
          fontSize: this.generateFontSizeConfig(typography),
          fontWeight: this.generateFontWeightConfig(typography),
          lineHeight: this.generateLineHeightConfig(typography),
          letterSpacing: this.generateLetterSpacingConfig(typography),
          spacing: this.generateSpacingConfig(spacing),
          borderRadius: this.generateBorderRadiusConfig(),
          boxShadow: this.generateBoxShadowConfig(),
          animation: this.generateAnimationConfig(),
          screens: this.generateScreenConfig()
        }
      },
      plugins: this.generatePluginsConfig()
    };

    return this.formatConfigOutput(configObject);
  }

  private generateContentConfig(): string[] {
    return [
      './src/**/*.{js,ts,jsx,tsx,html}',
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
      './app/**/*.{js,ts,jsx,tsx}',
      './public/**/*.html'
    ];
  }

  private generateColorConfig(colors: ColorToken[]): Record<string, any> {
    const colorConfig: Record<string, any> = {};
    
    // Group colors by semantic role
    const colorGroups: Record<string, ColorToken[]> = {};
    
    for (const color of colors) {
      const role = color.semanticRole || 'neutral';
      if (!colorGroups[role]) {
        colorGroups[role] = [];
      }
      colorGroups[role].push(color);
    }

    // Generate color scales for each group
    for (const [role, roleColors] of Object.entries(colorGroups)) {
      if (roleColors.length === 1) {
        // Single color
        const color = roleColors[0];
        const name = this.formatColorName(color.semanticName || color.name);
        colorConfig[name] = {
          DEFAULT: color.hex,
          50: this.lightenColor(color.hex, 0.95),
          100: this.lightenColor(color.hex, 0.9),
          200: this.lightenColor(color.hex, 0.8),
          300: this.lightenColor(color.hex, 0.6),
          400: this.lightenColor(color.hex, 0.4),
          500: color.hex,
          600: this.darkenColor(color.hex, 0.1),
          700: this.darkenColor(color.hex, 0.2),
          800: this.darkenColor(color.hex, 0.3),
          900: this.darkenColor(color.hex, 0.4),
          950: this.darkenColor(color.hex, 0.5)
        };
      } else {
        // Multiple colors - create scale
        const sortedColors = roleColors.sort((a, b) => {
          // Sort by lightness (HSL)
          return a.hsl.l - b.hsl.l;
        });
        
        const scaleConfig: Record<string, string> = {};
        const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
        
        sortedColors.forEach((color, index) => {
          const step = steps[Math.floor((index / sortedColors.length) * steps.length)] || 500;
          scaleConfig[step] = color.hex;
        });
        
        // Fill in missing steps with interpolated colors
        this.fillColorScale(scaleConfig, sortedColors[0].hex, sortedColors[sortedColors.length - 1].hex);
        
        colorConfig[role] = scaleConfig;
      }
    }

    return colorConfig;
  }

  private generateFontFamilyConfig(typography: TypographyToken[]): Record<string, string[]> {
    const fontFamilies: Record<string, string[]> = {};
    const seenFamilies = new Set<string>();
    
    for (const typo of typography) {
      if (!seenFamilies.has(typo.fontFamily)) {
        seenFamilies.add(typo.fontFamily);
        const name = this.formatFontName(typo.fontFamily);
        fontFamilies[name] = [typo.fontFamily, 'sans-serif'];
      }
    }
    
    // Add semantic font family names
    const headingFonts = typography.filter(t => t.semanticLevel && t.semanticLevel.includes('heading'));
    const bodyFonts = typography.filter(t => t.semanticLevel && t.semanticLevel.includes('body'));
    
    if (headingFonts.length > 0) {
      fontFamilies['heading'] = [headingFonts[0].fontFamily, 'sans-serif'];
    }
    
    if (bodyFonts.length > 0) {
      fontFamilies['body'] = [bodyFonts[0].fontFamily, 'sans-serif'];
    }
    
    return fontFamilies;
  }

  private generateFontSizeConfig(typography: TypographyToken[]): Record<string, [string, { lineHeight?: string; letterSpacing?: string }]> {
    const fontSizes: Record<string, [string, { lineHeight?: string; letterSpacing?: string }]> = {};
    
    for (const typo of typography) {
      const name = this.formatTypographyName(typo.semanticName || typo.name);
      const config: { lineHeight?: string; letterSpacing?: string } = {};
      
      if (typo.lineHeight) {
        config.lineHeight = `${pxToRem(typo.lineHeight)}rem`;
      }
      
      if (typo.letterSpacing) {
        config.letterSpacing = `${typo.letterSpacing}px`;
      }
      
      fontSizes[name] = [`${pxToRem(typo.fontSize)}rem`, config];
    }
    
    return fontSizes;
  }

  private generateFontWeightConfig(typography: TypographyToken[]): Record<string, number> {
    const weights: Record<string, number> = {};
    const seenWeights = new Set<number>();
    
    for (const typo of typography) {
      if (!seenWeights.has(typo.fontWeight)) {
        seenWeights.add(typo.fontWeight);
        const name = this.getWeightName(typo.fontWeight);
        weights[name] = typo.fontWeight;
      }
    }
    
    return weights;
  }

  private generateLineHeightConfig(typography: TypographyToken[]): Record<string, string> {
    const lineHeights: Record<string, string> = {};
    const seenLineHeights = new Set<number>();
    
    for (const typo of typography) {
      if (typo.lineHeight && !seenLineHeights.has(typo.lineHeight)) {
        seenLineHeights.add(typo.lineHeight);
        const ratio = typo.lineHeight / typo.fontSize;
        const name = this.getLineHeightName(ratio);
        lineHeights[name] = ratio.toFixed(2);
      }
    }
    
    return lineHeights;
  }

  private generateLetterSpacingConfig(typography: TypographyToken[]): Record<string, string> {
    const letterSpacing: Record<string, string> = {};
    const seenSpacing = new Set<number>();
    
    for (const typo of typography) {
      if (typo.letterSpacing && !seenSpacing.has(typo.letterSpacing)) {
        seenSpacing.add(typo.letterSpacing);
        const name = this.getLetterSpacingName(typo.letterSpacing);
        letterSpacing[name] = `${typo.letterSpacing}px`;
      }
    }
    
    return letterSpacing;
  }

  private generateSpacingConfig(spacing: SpacingToken[]): Record<string, string> {
    const spacingConfig: Record<string, string> = {};
    
    for (const space of spacing) {
      const name = this.formatSpacingName(space.semanticName);
      spacingConfig[name] = `${pxToRem(space.value as number)}rem`;
    }
    
    // Add common spacing values if not present
    const commonSpacing = [
      { name: '0', value: 0 },
      { name: 'px', value: 1 },
      { name: '0.5', value: 2 },
      { name: '1', value: 4 },
      { name: '1.5', value: 6 },
      { name: '2', value: 8 },
      { name: '2.5', value: 10 },
      { name: '3', value: 12 },
      { name: '4', value: 16 },
      { name: '5', value: 20 },
      { name: '6', value: 24 },
      { name: '8', value: 32 },
      { name: '10', value: 40 },
      { name: '12', value: 48 },
      { name: '16', value: 64 },
      { name: '20', value: 80 },
      { name: '24', value: 96 },
      { name: '32', value: 128 },
      { name: '40', value: 160 },
      { name: '48', value: 192 },
      { name: '56', value: 224 },
      { name: '64', value: 256 }
    ];
    
    for (const common of commonSpacing) {
      if (!spacingConfig[common.name]) {
        spacingConfig[common.name] = `${pxToRem(common.value)}rem`;
      }
    }
    
    return spacingConfig;
  }

  private generateBorderRadiusConfig(): Record<string, string> {
    return {
      'none': '0px',
      'sm': '0.125rem',
      'DEFAULT': '0.25rem',
      'md': '0.375rem',
      'lg': '0.5rem',
      'xl': '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      'full': '9999px'
    };
  }

  private generateBoxShadowConfig(): Record<string, string> {
    return {
      'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      'none': 'none'
    };
  }

  private generateAnimationConfig(): Record<string, string> {
    return {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'fade-out': 'fadeOut 0.5s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'slide-down': 'slideDown 0.3s ease-out',
      'scale-up': 'scaleUp 0.2s ease-out',
      'scale-down': 'scaleDown 0.2s ease-out'
    };
  }

  private generateScreenConfig(): Record<string, string> {
    return {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px'
    };
  }

  private generatePluginsConfig(): string[] {
    return [
      '@tailwindcss/forms',
      '@tailwindcss/typography',
      '@tailwindcss/aspect-ratio'
    ];
  }

  private formatConfigOutput(configObject: any): string {
    const header = `/**
 * Tailwind CSS Configuration
 * Generated from Figma Design System
 * 
 * This configuration extends Tailwind CSS with your design system tokens.
 * Use this file in your tailwind.config.js to apply your design system.
 * 
 * Installation:
 * 1. Copy this configuration to your tailwind.config.js file
 * 2. Install recommended plugins: npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
 * 3. Use the extended classes in your components
 * 
 * Compatible with: Tailwind CSS v3.0+
 * AI Tool Compatibility: Optimized for Bolt, v0, Loveable, and other AI prototyping tools
 */

/** @type {import('tailwindcss').Config} */
module.exports = `;

    return header + JSON.stringify(configObject, null, 2);
  }

  // Helper methods for color manipulation
  private lightenColor(hex: string, amount: number): string {
    const color = this.hexToRgb(hex);
    if (!color) return hex;
    
    const { r, g, b } = color;
    const newR = Math.round(r + (255 - r) * amount);
    const newG = Math.round(g + (255 - g) * amount);
    const newB = Math.round(b + (255 - b) * amount);
    
    return this.rgbToHex(newR, newG, newB);
  }

  private darkenColor(hex: string, amount: number): string {
    const color = this.hexToRgb(hex);
    if (!color) return hex;
    
    const { r, g, b } = color;
    const newR = Math.round(r * (1 - amount));
    const newG = Math.round(g * (1 - amount));
    const newB = Math.round(b * (1 - amount));
    
    return this.rgbToHex(newR, newG, newB);
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private fillColorScale(scale: Record<string, string>, lightColor: string, darkColor: string): void {
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    
    for (const step of steps) {
      if (!scale[step]) {
        // Interpolate between nearest colors
        const lightness = this.getInterpolatedLightness(step, lightColor, darkColor);
        scale[step] = this.adjustColorLightness(lightColor, lightness);
      }
    }
  }

  private getInterpolatedLightness(step: number, lightColor: string, darkColor: string): number {
    const stepIndex = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].indexOf(step);
    const ratio = stepIndex / 10;
    return 1 - ratio; // Invert for lightness (50 = lightest, 950 = darkest)
  }

  private adjustColorLightness(hex: string, lightness: number): string {
    const color = this.hexToRgb(hex);
    if (!color) return hex;
    
    const { r, g, b } = color;
    const newR = Math.round(r * lightness);
    const newG = Math.round(g * lightness);
    const newB = Math.round(b * lightness);
    
    return this.rgbToHex(newR, newG, newB);
  }

  // Formatting helper methods
  private formatColorName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatFontName(fontFamily: string): string {
    return fontFamily.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  private formatTypographyName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatSpacingName(name: string): string {
    return name.toLowerCase()
      .replace(/^space-/, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private getWeightName(weight: number): string {
    const weightNames: Record<number, string> = {
      100: 'thin',
      200: 'extralight',
      300: 'light',
      400: 'normal',
      500: 'medium',
      600: 'semibold',
      700: 'bold',
      800: 'extrabold',
      900: 'black'
    };
    
    return weightNames[weight] || weight.toString();
  }

  private getLineHeightName(ratio: number): string {
    if (ratio <= 1.0) return 'none';
    if (ratio <= 1.25) return 'tight';
    if (ratio <= 1.375) return 'snug';
    if (ratio <= 1.5) return 'normal';
    if (ratio <= 1.625) return 'relaxed';
    return 'loose';
  }

  private getLetterSpacingName(spacing: number): string {
    if (spacing < 0) return 'tighter';
    if (spacing === 0) return 'normal';
    if (spacing <= 0.5) return 'tight';
    if (spacing <= 1) return 'wide';
    return 'wider';
  }
}