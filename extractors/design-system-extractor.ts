import { ColorToken, DesignToken, VariableResolutionResult, AnalyzedComponent } from '../types';
import { EnhancedVariableAliasResolver } from '../utils/variable-resolver';
import { ColorExtractor } from './colors';
import { TypographyExtractor } from './typography';
import { SpacingExtractor } from './spacing';
import { ComponentExtractor } from './components';

export interface DesignSystemExtractionResult {
  colors: {
    primitives: Record<string, Record<string, any>>;
    semantic: Record<string, Record<string, any>>;
    tokens: ColorToken[];
  };
  typography: DesignToken[];
  spacing: DesignToken[];
  components: AnalyzedComponent[];
  resolutionStats: any;
  markdown: string;
  summary: {
    totalTokens: number;
    resolvedAliases: number;
    unresolvedAliases: number;
    extractionTime: number;
    componentCount: number;
  };
}

export class DesignSystemExtractor {
  private variableResolver: EnhancedVariableAliasResolver;
  private colorExtractor: ColorExtractor;
  private typographyExtractor: TypographyExtractor;
  private spacingExtractor: SpacingExtractor;
  private componentExtractor: ComponentExtractor;

  constructor() {
    this.variableResolver = new EnhancedVariableAliasResolver(true);
    this.colorExtractor = new ColorExtractor();
    this.typographyExtractor = new TypographyExtractor();
    this.spacingExtractor = new SpacingExtractor();
    this.componentExtractor = new ComponentExtractor();
  }

  async extractDesignSystem(figmaFileData: any): Promise<DesignSystemExtractionResult> {
    const startTime = Date.now();
    console.log('Starting enhanced design system extraction with variable resolution...');

    const resolutionResult = this.variableResolver.resolveVariables(figmaFileData);
    
    console.log(`Variable resolution complete:
      - Total variables: ${resolutionResult.resolutionStats.totalVariables}
      - Resolved aliases: ${resolutionResult.resolutionStats.resolvedAliases}
      - Primitive values: ${resolutionResult.resolutionStats.primitiveValues}
    `);

    const colorExtractionResult = await this.colorExtractor.extractColorsWithVariableResolution(figmaFileData);
    const typographyTokens = await this.typographyExtractor.extractTypography();
    const spacingTokens = await this.spacingExtractor.extractSpacing();
    
    // Enhanced component extraction
    console.log('Starting enhanced component extraction...');
    const componentTokens = await this.componentExtractor.extractComponents();
    console.log(`Component extraction complete: Found ${componentTokens.length} components`);

    const organizedColors = this.organizeColors(colorExtractionResult.tokens, resolutionResult.resolved);
    
    const result: DesignSystemExtractionResult = {
      colors: {
        ...organizedColors,
        tokens: colorExtractionResult.tokens
      },
      typography: typographyTokens,
      spacing: spacingTokens,
      components: componentTokens,
      resolutionStats: resolutionResult.resolutionStats,
      markdown: this.generateEnhancedMarkdown({
        colors: organizedColors,
        colorTokens: colorExtractionResult.tokens,
        typography: typographyTokens,
        spacing: spacingTokens,
        components: componentTokens,
        resolutionStats: resolutionResult.resolutionStats
      }),
      summary: {
        totalTokens: colorExtractionResult.tokens.length + typographyTokens.length + spacingTokens.length,
        resolvedAliases: resolutionResult.resolutionStats.resolvedAliases,
        unresolvedAliases: resolutionResult.resolutionStats.unresolvedAliases,
        extractionTime: Date.now() - startTime,
        componentCount: componentTokens.length
      }
    };

    console.log(`Design system extraction complete in ${result.summary.extractionTime}ms`);
    return result;
  }

  private organizeColors(colorTokens: ColorToken[], resolvedData: any): { primitives: Record<string, Record<string, any>>; semantic: Record<string, Record<string, any>> } {
    const primitives: Record<string, Record<string, any>> = {};
    const semantic: Record<string, Record<string, any>> = {};

    if (resolvedData.colors) {
      for (const [category, colorGroup] of Object.entries(resolvedData.colors)) {
        if (typeof colorGroup === 'object' && colorGroup !== null) {
          const isPrimitive = this.isPrimitiveCategory(category);
          const target = isPrimitive ? primitives : semantic;
          
          target[category] = {};
          
          for (const [colorName, colorValue] of Object.entries(colorGroup)) {
            target[category][colorName] = colorValue;
          }
        }
      }
    }

    for (const token of colorTokens) {
      const category = this.getCategoryFromSemanticName(token.semanticName);
      const isPrimitive = this.isPrimitiveCategory(category);
      const target = isPrimitive ? primitives : semantic;
      
      if (!target[category]) {
        target[category] = {};
      }
      
      const colorName = token.name.split('/').pop() || token.name;
      target[category][colorName] = {
        hex: token.hex,
        rgb: token.rgb,
        hsl: token.hsl,
        semanticRole: token.semanticRole
      };
    }

    return { primitives, semantic };
  }

  private isPrimitiveCategory(category: string): boolean {
    const primitiveCategories = [
      'brand', 'brandmobi', 'neutral', 'danger', 
      'alert', 'warning', 'success', 'error',
      'primary', 'secondary', 'accent'
    ];
    return primitiveCategories.includes(category.toLowerCase());
  }

  private getCategoryFromSemanticName(semanticName: string): string {
    const parts = semanticName.split('-');
    return parts[0] || 'neutral';
  }

  private generateEnhancedMarkdown(data: {
    colors: { primitives: Record<string, Record<string, any>>; semantic: Record<string, Record<string, any>> };
    colorTokens: ColorToken[];
    typography: DesignToken[];
    spacing: DesignToken[];
    components: AnalyzedComponent[];
    resolutionStats: any;
  }): string {
    let markdown = `# Design System - Enhanced Extraction with Variable Resolution\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n`;
    markdown += `**Extraction Method:** Enhanced Variable Alias Resolution\n\n`;

    markdown += `## Extraction Statistics\n\n`;
    markdown += `- **Total Variables:** ${data.resolutionStats.totalVariables}\n`;
    markdown += `- **Resolved Aliases:** ${data.resolutionStats.resolvedAliases}\n`;
    markdown += `- **Primitive Values:** ${data.resolutionStats.primitiveValues}\n`;
    markdown += `- **Unresolved Aliases:** ${data.resolutionStats.unresolvedAliases}\n\n`;

    markdown += this.generateColorMarkdown(data.colors, data.colorTokens);
    markdown += this.generateTypographyMarkdown(data.typography);
    markdown += this.generateSpacingMarkdown(data.spacing);
    markdown += this.generateComponentMarkdown(data.components);
    
    markdown += `## AI Tool Integration\n\n`;
    markdown += `This design system has been optimized for AI development tools:\n\n`;
    markdown += `### Copy-Paste Ready CSS Variables\n\n`;
    markdown += this.generateCSSVariables(data.colors);
    
    markdown += `### Tailwind Config Integration\n\n`;
    markdown += `\`\`\`javascript\n`;
    markdown += this.generateTailwindConfig(data.colors);
    markdown += `\`\`\`\n\n`;

    return markdown;
  }

  private generateColorMarkdown(colors: { primitives: Record<string, Record<string, any>>; semantic: Record<string, Record<string, any>> }, colorTokens: ColorToken[]): string {
    let md = `## Colors\n\n`;
    md += `> 🎨 All color values have been resolved from Figma variables to actual hex values.\n\n`;

    if (Object.keys(colors.primitives).length > 0) {
      md += `### Primitive Colors\n\n`;
      md += `These are the foundation colors with resolved values:\n\n`;

      for (const [category, values] of Object.entries(colors.primitives)) {
        md += `#### ${this.formatCategoryName(category)}\n\n`;
        
        for (const [name, value] of Object.entries(values)) {
          if (typeof value === 'object') {
            if (value.light && value.dark) {
              md += `- **${name}**: Light: \`${value.light}\` | Dark: \`${value.dark}\`\n`;
            } else if (value.hex) {
              md += `- **${name}**: \`${value.hex}\`\n`;
            } else if (typeof value === 'string') {
              md += `- **${name}**: \`${value}\`\n`;
            }
          }
        }
        md += `\n`;
      }
    }

    if (Object.keys(colors.semantic).length > 0) {
      md += `### Semantic Colors\n\n`;
      md += `These colors reference primitives and adapt to themes:\n\n`;

      for (const [category, values] of Object.entries(colors.semantic)) {
        md += `#### ${this.formatCategoryName(category)}\n\n`;
        
        for (const [name, value] of Object.entries(values)) {
          if (typeof value === 'object') {
            if (value.light && value.dark) {
              md += `- **${name}**: Light: \`${value.light}\` | Dark: \`${value.dark}\`\n`;
            } else if (value.hex) {
              md += `- **${name}**: \`${value.hex}\`\n`;
            }
          }
        }
        md += `\n`;
      }
    }

    return md;
  }

  private generateTypographyMarkdown(typography: DesignToken[]): string {
    if (typography.length === 0) return '';
    
    let md = `## Typography\n\n`;
    md += `Typography tokens extracted from your design system:\n\n`;
    
    for (const token of typography) {
      md += `### ${token.semanticName || token.name}\n\n`;
      md += `- **Font Family**: ${(token as any).fontFamily}\n`;
      md += `- **Font Size**: ${(token as any).fontSize}px\n`;
      md += `- **Font Weight**: ${(token as any).fontWeight}\n`;
      md += `- **Line Height**: ${(token as any).lineHeight}\n`;
      if (token.description) {
        md += `- **Usage**: ${token.description}\n`;
      }
      md += `\n`;
    }
    
    return md;
  }

  private generateSpacingMarkdown(spacing: DesignToken[]): string {
    if (spacing.length === 0) return '';
    
    let md = `## Spacing\n\n`;
    md += `Spacing tokens for consistent layouts:\n\n`;
    
    for (const token of spacing) {
      md += `- **${token.semanticName || token.name}**: ${token.value}px\n`;
    }
    md += `\n`;
    
    return md;
  }

  private generateComponentMarkdown(components: AnalyzedComponent[]): string {
    if (components.length === 0) return '';
    
    let md = `## Components\n\n`;
    md += `> 🧩 Complete component library extracted with enhanced discovery methods.\n\n`;
    
    // Group components by type
    const componentsByType = components.reduce((acc, comp) => {
      if (!acc[comp.type]) {
        acc[comp.type] = [];
      }
      acc[comp.type].push(comp);
      return acc;
    }, {} as Record<string, AnalyzedComponent[]>);
    
    // Generate overview
    md += `### Component Overview\n\n`;
    md += `Found **${components.length} components** across **${Object.keys(componentsByType).length} categories**:\n\n`;
    
    Object.entries(componentsByType).forEach(([type, comps]) => {
      const totalVariants = comps.reduce((sum, c) => sum + c.variants.length, 0);
      md += `- **${this.formatCategoryName(type)}**: ${comps.length} components, ${totalVariants} variants\n`;
    });
    md += `\n`;
    
    // Generate detailed sections for each type
    Object.entries(componentsByType).forEach(([type, comps]) => {
      md += `### ${this.formatCategoryName(type)} Components\n\n`;
      
      comps.forEach(component => {
        md += `#### ${component.name}\n\n`;
        md += `${component.semanticDescription}\n\n`;
        
        // Variants
        if (component.variants.length > 1) {
          md += `**Variants** (${component.variants.length}):\n`;
          component.variants.forEach(variant => {
            md += `- **${variant.name}**: ${variant.description}\n`;
          });
          md += `\n`;
        }
        
        // Usage examples
        if (component.usage.length > 0) {
          md += `**Usage Examples:**\n`;
          component.usage.slice(0, 3).forEach(usage => {
            md += `- ${usage}\n`;
          });
          md += `\n`;
        }
        
        // Code examples
        if (component.examples.length > 0) {
          md += `**Code Examples:**\n\n`;
          md += `\`\`\`jsx\n`;
          component.examples.slice(0, 2).forEach(example => {
            md += `${example}\n`;
          });
          md += `\`\`\`\n\n`;
        }
        
        // Props
        if (component.props.length > 0) {
          md += `**Props:**\n\n`;
          md += `| Prop | Type | Default | Description |\n`;
          md += `|------|------|---------|-------------|\n`;
          component.props.slice(0, 5).forEach(prop => {
            const defaultValue = prop.default !== undefined ? `\`${prop.default}\`` : '-';
            md += `| \`${prop.name}\` | ${prop.type} | ${defaultValue} | ${prop.description} |\n`;
          });
          md += `\n`;
        }
        
        md += `---\n\n`;
      });
    });
    
    return md;
  }

  private generateCSSVariables(colors: { primitives: Record<string, Record<string, any>>; semantic: Record<string, Record<string, any>> }): string {
    let css = `\`\`\`css\n:root {\n`;
    
    for (const [category, values] of Object.entries(colors.primitives)) {
      css += `  /* ${this.formatCategoryName(category)} */\n`;
      for (const [name, value] of Object.entries(values)) {
        const varName = `--${category.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}`;
        if (typeof value === 'object' && value.hex) {
          css += `  ${varName}: ${value.hex};\n`;
        } else if (typeof value === 'string') {
          css += `  ${varName}: ${value};\n`;
        }
      }
      css += `\n`;
    }
    
    for (const [category, values] of Object.entries(colors.semantic)) {
      css += `  /* ${this.formatCategoryName(category)} */\n`;
      for (const [name, value] of Object.entries(values)) {
        const varName = `--${category.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}`;
        if (typeof value === 'object' && value.hex) {
          css += `  ${varName}: ${value.hex};\n`;
        } else if (typeof value === 'string') {
          css += `  ${varName}: ${value};\n`;
        }
      }
      css += `\n`;
    }
    
    css += `}\n\`\`\`\n\n`;
    return css;
  }

  private generateTailwindConfig(colors: { primitives: Record<string, Record<string, any>>; semantic: Record<string, Record<string, any>> }): string {
    let config = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n`;
    
    for (const [category, values] of Object.entries(colors.primitives)) {
      config += `        ${category}: {\n`;
      for (const [name, value] of Object.entries(values)) {
        if (typeof value === 'object' && value.hex) {
          config += `          '${name}': '${value.hex}',\n`;
        } else if (typeof value === 'string') {
          config += `          '${name}': '${value}',\n`;
        }
      }
      config += `        },\n`;
    }
    
    config += `      },\n    },\n  },\n}`;
    return config;
  }

  private formatCategoryName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}