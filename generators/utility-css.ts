import { ColorToken, TypographyToken, SpacingToken, ExtractionConfig } from '../types';
import { generateSemanticName, pxToRem } from '../utils/naming';

export class UtilityCSSGenerator {
  private config: ExtractionConfig;
  
  constructor(config: ExtractionConfig) {
    this.config = config;
  }

  generateUtilityCSS(
    colors: ColorToken[], 
    typography: TypographyToken[], 
    spacing: SpacingToken[]
  ): string {
    const cssBlocks: string[] = [];
    
    // Add CSS header with documentation
    cssBlocks.push(this.generateCSSHeader());
    
    // Generate CSS custom properties
    cssBlocks.push(this.generateCSSVariables(colors, typography, spacing));
    
    // Generate utility classes
    if (this.config.includeColors) {
      cssBlocks.push(this.generateColorUtilities(colors));
    }
    
    if (this.config.includeTypography) {
      cssBlocks.push(this.generateTypographyUtilities(typography));
    }
    
    if (this.config.includeSpacing) {
      cssBlocks.push(this.generateSpacingUtilities(spacing));
    }
    
    // Add responsive utilities
    cssBlocks.push(this.generateResponsiveUtilities(colors, typography, spacing));
    
    // Add state utilities (hover, focus, etc.)
    cssBlocks.push(this.generateStateUtilities(colors));
    
    return cssBlocks.join('\n\n');
  }

  private generateCSSHeader(): string {
    return `/**
 * AI-Optimized Design System Utilities
 * Generated from Figma Design System
 * 
 * This CSS provides utility classes optimized for AI prototyping tools.
 * Classes use semantic naming and are self-documenting for AI comprehension.
 * 
 * Usage Instructions:
 * - Include this CSS in your project's stylesheet
 * - Use utility classes directly in HTML or component templates
 * - All classes follow consistent naming conventions
 * - Responsive variants available with sm:, md:, lg:, xl: prefixes
 * - State variants available with hover:, focus:, active: prefixes
 * 
 * Compatible with: Bolt, v0, Loveable, Cursor, and other AI tools
 */`;
  }

  private generateCSSVariables(
    colors: ColorToken[], 
    typography: TypographyToken[], 
    spacing: SpacingToken[]
  ): string {
    const variables: string[] = [];
    
    variables.push(':root {');
    variables.push('  /* Design System Colors */');
    
    // Color variables
    for (const color of colors) {
      const name = this.formatVariableName(color.semanticName || color.name);
      variables.push(`  --color-${name}: ${color.hex};`);
      variables.push(`  --color-${name}-rgb: ${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b};`);
    }
    
    variables.push('');
    variables.push('  /* Typography Variables */');
    
    // Typography variables
    for (const typo of typography) {
      const name = this.formatVariableName(typo.semanticName || typo.name);
      variables.push(`  --font-${name}-family: "${typo.fontFamily}";`);
      variables.push(`  --font-${name}-size: ${typo.fontSize}px;`);
      variables.push(`  --font-${name}-weight: ${typo.fontWeight};`);
      variables.push(`  --font-${name}-line-height: ${typo.lineHeight}px;`);
      if (typo.letterSpacing) {
        variables.push(`  --font-${name}-letter-spacing: ${typo.letterSpacing}px;`);
      }
    }
    
    variables.push('');
    variables.push('  /* Spacing Variables */');
    
    // Spacing variables
    for (const space of spacing) {
      const name = this.formatVariableName(space.semanticName);
      variables.push(`  --space-${name}: ${space.value}px;`);
      variables.push(`  --space-${name}-rem: ${pxToRem(space.value as number)}rem;`);
    }
    
    variables.push('}');
    
    return variables.join('\n');
  }

  private generateColorUtilities(colors: ColorToken[]): string {
    const utilities: string[] = [];
    
    utilities.push('/* Color Utilities - AI-Friendly and Semantic */');
    utilities.push('/* Usage: Apply semantic color classes for consistent theming */');
    utilities.push('');
    
    for (const color of colors) {
      const name = this.formatClassName(color.semanticName || color.name);
      const cssVar = `var(--color-${this.formatVariableName(color.semanticName || color.name)})`;
      
      // Background utilities
      utilities.push(`/* Background: ${color.description} */`);
      utilities.push(`.bg-${name} { background-color: ${cssVar}; }`);
      
      // Text utilities
      utilities.push(`/* Text: Use for ${color.semanticRole} text elements */`);
      utilities.push(`.text-${name} { color: ${cssVar}; }`);
      
      // Border utilities
      utilities.push(`/* Border: Use for ${color.semanticRole} borders and outlines */`);
      utilities.push(`.border-${name} { border-color: ${cssVar}; }`);
      
      // Fill utilities (for icons and SVGs)
      utilities.push(`/* Fill: Use for ${color.semanticRole} icons and graphics */`);
      utilities.push(`.fill-${name} { fill: ${cssVar}; }`);
      
      // Stroke utilities (for icons and SVGs)
      utilities.push(`.stroke-${name} { stroke: ${cssVar}; }`);
      
      utilities.push('');
    }
    
    return utilities.join('\n');
  }

  private generateTypographyUtilities(typography: TypographyToken[]): string {
    const utilities: string[] = [];
    
    utilities.push('/* Typography Utilities - Semantic and Hierarchical */');
    utilities.push('/* Usage: Apply typography classes for consistent text styling */');
    utilities.push('');
    
    for (const typo of typography) {
      const name = this.formatClassName(typo.semanticName || typo.name);
      
      utilities.push(`/* ${typo.semanticLevel}: ${typo.description} */`);
      utilities.push(`/* Usage: ${typo.usage ? typo.usage.join(', ') : 'General typography'} */`);
      
      const properties: string[] = [];
      properties.push(`font-family: var(--font-${this.formatVariableName(typo.semanticName || typo.name)}-family)`);
      properties.push(`font-size: var(--font-${this.formatVariableName(typo.semanticName || typo.name)}-size)`);
      properties.push(`font-weight: var(--font-${this.formatVariableName(typo.semanticName || typo.name)}-weight)`);
      properties.push(`line-height: var(--font-${this.formatVariableName(typo.semanticName || typo.name)}-line-height)`);
      
      if (typo.letterSpacing) {
        properties.push(`letter-spacing: var(--font-${this.formatVariableName(typo.semanticName || typo.name)}-letter-spacing)`);
      }
      
      if (typo.textTransform) {
        properties.push(`text-transform: ${typo.textTransform}`);
      }
      
      utilities.push(`.text-${name} {`);
      utilities.push(`  ${properties.join(';\n  ')};`);
      utilities.push('}');
      utilities.push('');
    }
    
    // Additional typography utilities
    utilities.push('/* Font Weight Utilities */');
    utilities.push('.font-thin { font-weight: 100; }');
    utilities.push('.font-light { font-weight: 300; }');
    utilities.push('.font-normal { font-weight: 400; }');
    utilities.push('.font-medium { font-weight: 500; }');
    utilities.push('.font-semibold { font-weight: 600; }');
    utilities.push('.font-bold { font-weight: 700; }');
    utilities.push('.font-extrabold { font-weight: 800; }');
    utilities.push('.font-black { font-weight: 900; }');
    utilities.push('');
    
    utilities.push('/* Text Alignment Utilities */');
    utilities.push('.text-left { text-align: left; }');
    utilities.push('.text-center { text-align: center; }');
    utilities.push('.text-right { text-align: right; }');
    utilities.push('.text-justify { text-align: justify; }');
    utilities.push('');
    
    return utilities.join('\n');
  }

  private generateSpacingUtilities(spacing: SpacingToken[]): string {
    const utilities: string[] = [];
    
    utilities.push('/* Spacing Utilities - Consistent and Scalable */');
    utilities.push('/* Usage: Apply spacing classes for consistent layout rhythm */');
    utilities.push('');
    
    for (const space of spacing) {
      const name = this.formatClassName(space.semanticName);
      const cssVar = `var(--space-${this.formatVariableName(space.semanticName)})`;
      
      utilities.push(`/* ${space.semanticName}: ${space.description} */`);
      utilities.push(`/* Usage: ${space.usage.join(', ')} */`);
      
      // Padding utilities
      utilities.push(`.p-${name} { padding: ${cssVar}; }`);
      utilities.push(`.px-${name} { padding-left: ${cssVar}; padding-right: ${cssVar}; }`);
      utilities.push(`.py-${name} { padding-top: ${cssVar}; padding-bottom: ${cssVar}; }`);
      utilities.push(`.pt-${name} { padding-top: ${cssVar}; }`);
      utilities.push(`.pr-${name} { padding-right: ${cssVar}; }`);
      utilities.push(`.pb-${name} { padding-bottom: ${cssVar}; }`);
      utilities.push(`.pl-${name} { padding-left: ${cssVar}; }`);
      
      // Margin utilities
      utilities.push(`.m-${name} { margin: ${cssVar}; }`);
      utilities.push(`.mx-${name} { margin-left: ${cssVar}; margin-right: ${cssVar}; }`);
      utilities.push(`.my-${name} { margin-top: ${cssVar}; margin-bottom: ${cssVar}; }`);
      utilities.push(`.mt-${name} { margin-top: ${cssVar}; }`);
      utilities.push(`.mr-${name} { margin-right: ${cssVar}; }`);
      utilities.push(`.mb-${name} { margin-bottom: ${cssVar}; }`);
      utilities.push(`.ml-${name} { margin-left: ${cssVar}; }`);
      
      // Gap utilities (for flexbox and grid)
      utilities.push(`.gap-${name} { gap: ${cssVar}; }`);
      utilities.push(`.gap-x-${name} { column-gap: ${cssVar}; }`);
      utilities.push(`.gap-y-${name} { row-gap: ${cssVar}; }`);
      
      utilities.push('');
    }
    
    return utilities.join('\n');
  }

  private generateResponsiveUtilities(
    colors: ColorToken[], 
    typography: TypographyToken[], 
    spacing: SpacingToken[]
  ): string {
    const utilities: string[] = [];
    const breakpoints = {
      'sm': '640px',
      'md': '768px', 
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px'
    };
    
    utilities.push('/* Responsive Utilities - Mobile-First Design */');
    utilities.push('/* Usage: Apply responsive prefixes for adaptive layouts */');
    utilities.push('');
    
    for (const [prefix, minWidth] of Object.entries(breakpoints)) {
      utilities.push(`@media (min-width: ${minWidth}) {`);
      
      // Responsive color utilities
      if (this.config.includeColors) {
        for (const color of colors.slice(0, 5)) { // Limit for readability
          const name = this.formatClassName(color.semanticName || color.name);
          utilities.push(`  .${prefix}\\:bg-${name} { background-color: var(--color-${this.formatVariableName(color.semanticName || color.name)}); }`);
          utilities.push(`  .${prefix}\\:text-${name} { color: var(--color-${this.formatVariableName(color.semanticName || color.name)}); }`);
        }
      }
      
      // Responsive typography utilities
      if (this.config.includeTypography) {
        for (const typo of typography.slice(0, 5)) { // Limit for readability
          const name = this.formatClassName(typo.semanticName || typo.name);
          utilities.push(`  .${prefix}\\:text-${name} { font-size: var(--font-${this.formatVariableName(typo.semanticName || typo.name)}-size); }`);
        }
      }
      
      // Responsive spacing utilities
      if (this.config.includeSpacing) {
        for (const space of spacing.slice(0, 5)) { // Limit for readability
          const name = this.formatClassName(space.semanticName);
          utilities.push(`  .${prefix}\\:p-${name} { padding: var(--space-${this.formatVariableName(space.semanticName)}); }`);
          utilities.push(`  .${prefix}\\:m-${name} { margin: var(--space-${this.formatVariableName(space.semanticName)}); }`);
        }
      }
      
      utilities.push('}');
      utilities.push('');
    }
    
    return utilities.join('\n');
  }

  private generateStateUtilities(colors: ColorToken[]): string {
    const utilities: string[] = [];
    
    utilities.push('/* Interactive State Utilities - Hover, Focus, Active */');
    utilities.push('/* Usage: Apply state prefixes for interactive elements */');
    utilities.push('');
    
    const states = ['hover', 'focus', 'active', 'disabled'];
    
    for (const state of states) {
      utilities.push(`/* ${state.charAt(0).toUpperCase() + state.slice(1)} State Utilities */`);
      
      for (const color of colors.slice(0, 8)) { // Limit primary colors
        const name = this.formatClassName(color.semanticName || color.name);
        const cssVar = `var(--color-${this.formatVariableName(color.semanticName || color.name)})`;
        
        if (state === 'disabled') {
          utilities.push(`.disabled\\:bg-${name}:disabled { background-color: ${cssVar}; opacity: 0.5; }`);
          utilities.push(`.disabled\\:text-${name}:disabled { color: ${cssVar}; opacity: 0.7; }`);
        } else {
          utilities.push(`.${state}\\:bg-${name}:${state} { background-color: ${cssVar}; }`);
          utilities.push(`.${state}\\:text-${name}:${state} { color: ${cssVar}; }`);
          utilities.push(`.${state}\\:border-${name}:${state} { border-color: ${cssVar}; }`);
        }
      }
      
      utilities.push('');
    }
    
    // Focus utilities for accessibility
    utilities.push('/* Accessibility Focus Utilities */');
    utilities.push('.focus\\:outline-none:focus { outline: none; }');
    utilities.push('.focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5); }');
    utilities.push('.focus\\:ring-primary:focus { box-shadow: 0 0 0 2px var(--color-brand-primary); }');
    utilities.push('');
    
    return utilities.join('\n');
  }

  private formatClassName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatVariableName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Method to generate component-specific utilities
  generateComponentUtilities(componentName: string, variants: any[]): string {
    const utilities: string[] = [];
    const className = this.formatClassName(componentName);
    
    utilities.push(`/* ${componentName} Component Utilities */`);
    utilities.push(`/* Usage: Base styles and variants for ${componentName} component */`);
    utilities.push('');
    
    // Base component class
    utilities.push(`.${className} {`);
    utilities.push('  /* Base component styles */');
    utilities.push('  display: inline-flex;');
    utilities.push('  align-items: center;');
    utilities.push('  justify-content: center;');
    utilities.push('  border: none;');
    utilities.push('  border-radius: var(--space-sm);');
    utilities.push('  cursor: pointer;');
    utilities.push('  transition: all 0.2s ease;');
    utilities.push('}');
    utilities.push('');
    
    // Variant utilities
    for (const variant of variants) {
      const variantName = this.formatClassName(variant.name);
      if (variantName !== 'default') {
        utilities.push(`.${className}-${variantName} {`);
        utilities.push(`  /* ${variant.description} */`);
        
        // Add variant-specific styles based on properties
        Object.entries(variant.properties).forEach(([key, value]) => {
          switch (key) {
            case 'size':
              if (value === 'small') {
                utilities.push('  padding: var(--space-xs) var(--space-sm);');
                utilities.push('  font-size: var(--font-body-sm-size);');
              } else if (value === 'large') {
                utilities.push('  padding: var(--space-md) var(--space-lg);');
                utilities.push('  font-size: var(--font-body-lg-size);');
              }
              break;
            case 'variant':
              if (value === 'primary') {
                utilities.push('  background-color: var(--color-brand-primary);');
                utilities.push('  color: var(--color-neutral-0);');
              } else if (value === 'secondary') {
                utilities.push('  background-color: var(--color-brand-secondary);');
                utilities.push('  color: var(--color-neutral-0);');
              }
              break;
          }
        });
        
        utilities.push('}');
        utilities.push('');
      }
    }
    
    return utilities.join('\n');
  }
}