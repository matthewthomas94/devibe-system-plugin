import { NamingStrategy, SemanticMapping } from '../types';

export function generateSemanticName(originalName: string, strategy: NamingStrategy): string {
  let name = originalName;
  
  // Clean the name
  name = name.toLowerCase()
    .replace(/[^a-z0-9\s\-_]/g, '')
    .replace(/\s+/g, '-');
  
  // Apply semantic transformation if enabled
  if (strategy.semantic) {
    name = applySemanticTransformation(name);
  }
  
  // Apply naming convention
  name = applyNamingConvention(name, strategy.convention);
  
  // Add prefix/suffix if specified
  if (strategy.prefix) {
    name = `${strategy.prefix}-${name}`;
  }
  if (strategy.suffix) {
    name = `${name}-${strategy.suffix}`;
  }
  
  return name;
}

function applySemanticTransformation(name: string): string {
  const semanticMappings: Record<string, string> = {
    // Colors
    'blue': 'primary',
    'red': 'error',
    'green': 'success',
    'yellow': 'warning',
    'orange': 'warning',
    'gray': 'neutral',
    'grey': 'neutral',
    
    // Typography
    'title': 'heading',
    'subtitle': 'subheading',
    'body': 'text',
    'caption': 'small',
    
    // Sizes
    'extra-small': 'xs',
    'small': 'sm',
    'medium': 'md',
    'large': 'lg',
    'extra-large': 'xl',
    
    // Actions
    'click': 'interactive',
    'hover': 'interactive',
    'active': 'interactive',
    'disabled': 'inactive'
  };
  
  let transformedName = name;
  
  for (const [original, semantic] of Object.entries(semanticMappings)) {
    transformedName = transformedName.replace(new RegExp(original, 'g'), semantic);
  }
  
  return transformedName;
}

function applyNamingConvention(name: string, convention: NamingStrategy['convention']): string {
  switch (convention) {
    case 'kebab-case':
      return name.toLowerCase().replace(/[_\s]+/g, '-');
    
    case 'camelCase':
      return name.replace(/[-_\s]+(.)/g, (_, char) => char.toUpperCase());
    
    case 'PascalCase':
      return name.replace(/[-_\s]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^(.)/, char => char.toUpperCase());
    
    case 'snake_case':
      return name.toLowerCase().replace(/[-\s]+/g, '_');
    
    default:
      return name;
  }
}

// Color utility functions
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Typography utility functions
export function pxToRem(px: number, baseFontSize: number = 16): number {
  return px / baseFontSize;
}

export function remToPx(rem: number, baseFontSize: number = 16): number {
  return rem * baseFontSize;
}

export function generateTypescaleRatio(steps: number[], ratio: number = 1.25): number[] {
  return steps.map(step => Math.pow(ratio, step));
}

// Spacing utility functions
export function pxToSpacingUnit(px: number, baseUnit: number = 8): number {
  return px / baseUnit;
}

export function spacingUnitToPx(units: number, baseUnit: number = 8): number {
  return units * baseUnit;
}

// AI-friendly naming functions
export function generateAIFriendlyName(originalName: string, type: 'color' | 'typography' | 'spacing'): string {
  const cleanName = originalName.toLowerCase()
    .replace(/[^a-z0-9\s\-_]/g, '')
    .replace(/\s+/g, '-');
  
  // Add type-specific prefixes for clarity
  const prefixes: Record<string, string> = {
    'color': 'color',
    'typography': 'text',
    'spacing': 'space'
  };
  
  return `${prefixes[type]}-${cleanName}`;
}

export function generateDescriptiveName(name: string, properties: Record<string, any>): string {
  let descriptiveName = name;
  
  // Add size descriptors
  if (properties.size) {
    descriptiveName += `-${properties.size}`;
  }
  
  // Add state descriptors
  if (properties.state) {
    descriptiveName += `-${properties.state}`;
  }
  
  // Add variant descriptors
  if (properties.variant) {
    descriptiveName += `-${properties.variant}`;
  }
  
  return descriptiveName.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

// Semantic analysis helpers
export function analyzeSemanticIntent(name: string): SemanticMapping {
  const lowerName = name.toLowerCase();
  let semanticName = lowerName;
  let confidence = 0.5; // Base confidence
  let reasoning = 'Basic name transformation';
  
  // Check for semantic indicators
  const semanticPatterns = [
    { pattern: /(primary|main|brand)/, semantic: 'primary', confidence: 0.9 },
    { pattern: /(secondary|accent)/, semantic: 'secondary', confidence: 0.9 },
    { pattern: /(success|positive|good)/, semantic: 'success', confidence: 0.9 },
    { pattern: /(error|danger|negative|bad)/, semantic: 'error', confidence: 0.9 },
    { pattern: /(warning|caution|alert)/, semantic: 'warning', confidence: 0.9 },
    { pattern: /(info|information|neutral)/, semantic: 'info', confidence: 0.8 },
    { pattern: /(heading|title|header)/, semantic: 'heading', confidence: 0.8 },
    { pattern: /(body|text|paragraph)/, semantic: 'body', confidence: 0.8 },
    { pattern: /(small|caption|fine)/, semantic: 'caption', confidence: 0.8 }
  ];
  
  for (const { pattern, semantic, confidence: patternConfidence } of semanticPatterns) {
    if (pattern.test(lowerName)) {
      semanticName = semantic;
      confidence = patternConfidence;
      reasoning = `Matched semantic pattern: ${pattern.source}`;
      break;
    }
  }
  
  return {
    originalName: name,
    semanticName,
    confidence,
    reasoning
  };
}

export function validateNamingConsistency(names: string[]): { consistent: boolean; suggestions: string[] } {
  const suggestions: string[] = [];
  
  // Check for consistent naming convention
  const conventions = {
    kebabCase: names.filter(name => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)),
    camelCase: names.filter(name => /^[a-z][a-zA-Z0-9]*$/.test(name)),
    snakeCase: names.filter(name => /^[a-z0-9]+(_[a-z0-9]+)*$/.test(name))
  };
  
  const dominantConvention = Object.entries(conventions)
    .reduce((a, b) => a[1].length > b[1].length ? a : b);
  
  if (dominantConvention[1].length < names.length * 0.8) {
    suggestions.push(`Consider standardizing on ${dominantConvention[0]} naming convention`);
  }
  
  // Check for semantic consistency
  const semanticPrefixes = names.map(name => name.split('-')[0]);
  const uniquePrefixesSet = new Set(semanticPrefixes);
  const uniquePrefixes = Array.from(uniquePrefixesSet);
  
  if (uniquePrefixes.length > names.length * 0.3) {
    suggestions.push('Consider using consistent semantic prefixes for related tokens');
  }
  
  return {
    consistent: suggestions.length === 0,
    suggestions
  };
}