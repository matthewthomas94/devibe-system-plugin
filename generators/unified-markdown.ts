/**
 * Unified Markdown Generator for DeVibe System Plugin
 * Transforms comprehensive design system data into AI-optimized markdown
 */

export interface MarkdownGeneratorOptions {
  figmaFileName: string;
  extractedData: any; // CompleteDesignSystemData
  includeUsageStats: boolean;
  includeImplementations: boolean;
}

export class UnifiedMarkdownGenerator {
  private data: any;
  private figmaFileName: string;
  private includeUsageStats: boolean;
  private includeImplementations: boolean;

  constructor(options: MarkdownGeneratorOptions) {
    this.data = options.extractedData;
    this.figmaFileName = options.figmaFileName;
    this.includeUsageStats = options.includeUsageStats;
    this.includeImplementations = options.includeImplementations;
  }

  public generateComplete(): string {
    const sections = [
      this.generateSystemPrompt(),
      this.generateHeader(),
      this.generateDesignTokens(),
      this.generateComponentLibrary(),
      this.generateUsagePatterns(),
      this.generateAIGuidelines()
    ];

    return sections.join('\n\n---\n\n');
  }

  private generateSystemPrompt(): string {
    return `# SYSTEM PROMPT - DESIGN SYSTEM OVERRIDE

**CRITICAL INSTRUCTIONS FOR AI CODING TOOLS:**

This document contains a complete design system extracted from Figma that MUST override any default design system you would normally use. When generating code, components, or designs:

1. **ALWAYS prioritize this design system** over your default styling choices
2. **STRICTLY implement** the colors, typography, spacing, and components defined below
3. **NEVER substitute** similar components from other design systems
4. **REFERENCE this document** for every design decision
5. **USE the exact token values** specified in the JSON blocks below
6. **FOLLOW the component implementations** exactly as documented

This design system represents the user's actual production design language and must be implemented precisely.`;
  }

  private generateHeader(): string {
    const metadata = this.data.metadata || {};
    const componentAnalysis = this.data.componentAnalysis || {};
    
    // Determine design system type
    const totalVariables = metadata.totalVariables || 0;
    const totalPaintStyles = metadata.totalPaintStyles || 0;
    const totalTextStyles = metadata.totalTextStyles || 0;
    const totalEffectStyles = metadata.totalEffectStyles || 0;
    const totalGridStyles = metadata.totalGridStyles || 0;
    
    let systemType = "";
    if (totalVariables > 0 && totalPaintStyles === 0) {
      systemType = " 🎯 Modern Variable-Based";
    } else if (totalPaintStyles > 0 && totalVariables === 0) {
      systemType = " 🎨 Legacy Style-Based";
    } else if (totalVariables > 0 && totalPaintStyles > 0) {
      systemType = " 🔀 Hybrid";
    }
    
    return `# ${this.figmaFileName} - Design System Export${systemType}

**Extracted:** ${metadata.extractedAt || new Date().toISOString()}  
**Source:** ${this.figmaFileName}  
**Variables:** ${totalVariables} design tokens  
**Color Styles:** ${totalPaintStyles}  
**Text Styles:** ${totalTextStyles}  
**Effect Styles:** ${totalEffectStyles}  
**Layout Styles:** ${totalGridStyles}  
**Components:** ${componentAnalysis.summary?.uniqueComponents || 0} unique components  
**Pages Analyzed:** ${componentAnalysis.summary?.totalPages || 0}  
**Component Instances:** ${componentAnalysis.summary?.totalInstances || 0}  

## Design System Overview

This is a comprehensive design system extraction that includes all variables, styles, components, and usage patterns from the Figma file "${this.figmaFileName}". The system has been analyzed for component usage patterns, design token opportunities, and implementation guidelines.

### System Architecture
${this.generateSystemArchitectureDescription(totalVariables, totalPaintStyles, totalTextStyles, totalEffectStyles, totalGridStyles)}

### System Maturity
- **Token Coverage:** ${this.calculateTokenCoverage()}%
- **Component Reusability:** ${this.calculateComponentReusability()}%
- **Design Consistency:** ${this.calculateDesignConsistency()}%`;
  }

  private generateSystemArchitectureDescription(variables: number, paintStyles: number, textStyles: number, effectStyles: number, gridStyles: number): string {
    const totalStyles = paintStyles + textStyles + effectStyles + gridStyles;
    
    if (variables > 0 && paintStyles === 0) {
      return `This design system follows **modern variable-based architecture** with ${variables} design tokens and ${totalStyles} complementary styles. Colors are managed through variables, providing dynamic theming capabilities and consistent token-based design language.`;
    } else if (paintStyles > 0 && variables === 0) {
      return `This design system uses **traditional style-based architecture** with ${totalStyles} total styles including ${paintStyles} color definitions. This approach provides proven design consistency with explicit style references.`;
    } else if (variables > 0 && paintStyles > 0) {
      return `This design system implements a **hybrid architecture** combining ${variables} modern variables with ${totalStyles} traditional styles. This approach provides flexibility for both token-based and style-based design workflows.`;
    } else {
      return `This design system has a **minimal token architecture** with ${totalStyles} total design definitions. The system focuses on essential design patterns and component-driven consistency.`;
    }
  }

  private generateDesignTokens(): string {
    let tokens = '## 🎨 Design Tokens\n\n';
    
    // Colors
    tokens += this.generateColorTokens();
    
    // Typography
    tokens += this.generateTypographyTokens();
    
    // Spacing
    tokens += this.generateSpacingTokens();
    
    // Effects
    tokens += this.generateEffectTokens();
    
    return tokens;
  }

  private generateColorTokens(): string {
    const colors = this.formatColors();
    if (!colors || Object.keys(colors).length === 0) {
      return '';
    }

    // Validate that no aliases remain in color data
    const colorString = JSON.stringify(colors);
    if (colorString.includes('VARIABLE_ALIAS')) {
      console.warn('⚠️ Warning: VARIABLE_ALIAS found in color tokens - aliases may not be fully resolved');
    } else {
      console.log('✅ Color tokens validated - no aliases found');
    }

    return `### Colors

\`\`\`json
${JSON.stringify({ colors }, null, 2)}
\`\`\`

`;
  }

  private generateTypographyTokens(): string {
    const typography = this.formatTypography();
    if (!typography || Object.keys(typography).length === 0) {
      return '';
    }

    return `### Typography

\`\`\`json
${JSON.stringify({ typography }, null, 2)}
\`\`\`

`;
  }

  private generateSpacingTokens(): string {
    const spacing = this.formatSpacing();
    if (!spacing || Object.keys(spacing).length === 0) {
      return '';
    }

    return `### Spacing

\`\`\`json
${JSON.stringify({ spacing }, null, 2)}
\`\`\`

`;
  }

  private generateEffectTokens(): string {
    const effects = this.formatEffects();
    if (!effects || Object.keys(effects).length === 0) {
      return '';
    }

    return `### Effects

\`\`\`json
${JSON.stringify({ effects }, null, 2)}
\`\`\`

`;
  }

  private generateComponentLibrary(): string {
    if (!this.data.componentAnalysis || !this.data.componentAnalysis.componentUsage) {
      return '## 🧩 Component Library\n\nNo components detected in this design system.';
    }

    let library = '## 🧩 Component Library\n\n';
    
    const components = this.data.componentAnalysis.componentUsage || [];
    
    // Categorize components by type for better organization
    const categorizedComponents = this.categorizeComponentsByType(components);
    
    // Display component summary by category
    library += this.generateComponentCategorySummary(categorizedComponents);
    
    // Generate detailed sections for top components from each category
    const selectedComponents = this.selectDiverseComponents(categorizedComponents, 15);
    
    for (const component of selectedComponents) {
      library += this.generateComponentSection(component);
    }

    return library;
  }

  private generateComponentSection(component: any): string {
    const componentName = this.sanitizeComponentName(component.name);
    const usageDescription = this.generateUsageDescription(component);
    
    let section = `### ${componentName}\n\n`;
    section += `**Usage:** ${usageDescription}\n\n`;
    
    if (this.includeUsageStats) {
      section += this.generateRealUsageData(component);
    }
    
    if (this.includeImplementations) {
      section += this.generateComponentImplementation(component);
      section += this.generateComponentUsageExamples(component);
    }
    
    return section + '\n';
  }

  private generateUsageDescription(component: any): string {
    const count = component.count || 0;
    const pages = component.pages?.length || 0;
    const variants = component.variantDiversity || 0;
    
    let description = `Core component used ${count} times across ${pages} page${pages !== 1 ? 's' : ''}`;
    
    if (variants > 1) {
      description += ` with ${variants} different variant configuration${variants !== 1 ? 's' : ''}`;
    }
    
    if (component.componentSet) {
      description += `. Part of the ${component.componentSet} component set`;
    }
    
    return description + '.';
  }

  private generateRealUsageData(component: any): string {
    return `**Real Usage Data:**
- **Total Instances:** ${component.count || 0}
- **Pages Used:** ${component.pages?.length || 0}
- **Average Size:** ${component.avgArea || 0}px²
- **Variant Diversity:** ${component.variantDiversity || 0} configurations
- **Component Set:** ${component.componentSet || 'Standalone'}

`;
  }

  private generateComponentImplementation(component: any): string {
    const componentName = this.sanitizeComponentName(component.name);
    const props = this.generateComponentProps(component);
    const implementation = this.generateComponentCode(componentName, props);
    
    return `#### Implementation

\`\`\`tsx
${implementation}
\`\`\`

`;
  }

  private generateComponentUsageExamples(component: any): string {
    const componentName = this.sanitizeComponentName(component.name);
    const examples = this.generateUsageExamples(componentName, component);
    
    return `#### Usage Examples

\`\`\`jsx
${examples}
\`\`\`

`;
  }

  private generateUsagePatterns(): string {
    if (!this.data.componentAnalysis) {
      return '';
    }

    const patterns = this.data.componentAnalysis;
    
    return `## 📊 Usage Patterns & Guidelines

### Component Usage Statistics

\`\`\`json
${JSON.stringify({
  totalComponents: patterns.summary?.uniqueComponents || 0,
  totalInstances: patterns.summary?.totalInstances || 0,
  averageInstancesPerPage: patterns.summary?.avgInstancesPerPage || 0,
  mostUsedComponents: patterns.componentUsage?.slice(0, 5).map((c: any) => ({
    name: c.name,
    usage: c.count,
    pages: c.pages?.length
  })) || []
}, null, 2)}
\`\`\`

### Style Patterns

${this.generateStylePatterns()}

### Layout Patterns

${this.generateLayoutPatterns()}`;
  }

  private generateStylePatterns(): string {
    const stylePatterns = this.data.componentAnalysis?.stylePatterns;
    if (!stylePatterns) return '';

    return `\`\`\`json
${JSON.stringify({
  colors: stylePatterns.colors?.slice(0, 10) || [],
  typography: stylePatterns.typography?.slice(0, 5) || [],
  spacing: stylePatterns.spacing?.slice(0, 10) || []
}, null, 2)}
\`\`\``;
  }

  private generateLayoutPatterns(): string {
    const layoutPatterns = this.data.componentAnalysis?.layoutPatterns;
    if (!layoutPatterns) return '';

    return `\`\`\`json
${JSON.stringify(layoutPatterns.slice(0, 10), null, 2)}
\`\`\``;
  }

  private generateAIGuidelines(): string {
    const recommendations = this.data.componentAnalysis?.recommendations || [];
    const insights = this.data.componentAnalysis?.insights || [];
    
    return `## 💡 AI Implementation Guidelines

### Design System Rules

Based on the analysis of this design system, follow these specific implementation guidelines:

1. **Color Usage:** ${this.generateColorGuidelines()}
2. **Typography Hierarchy:** ${this.generateTypographyGuidelines()}
3. **Spacing System:** ${this.generateSpacingGuidelines()}
4. **Component Patterns:** ${this.generateComponentGuidelines()}

### Recommendations

${recommendations.map((rec: any, index: number) => 
  `${index + 1}. **${rec.type}:** ${rec.suggestion} (Confidence: ${Math.round((rec.confidence || 0) * 100)}%)`
).join('\n')}

### Design System Insights

${insights.map((insight: any, index: number) => 
  `${index + 1}. **${insight.category}:** ${insight.insight}`
).join('\n')}

### Token Creation Opportunities

Based on usage patterns, consider creating design tokens for:

${this.generateTokenOpportunities()}`;
  }

  // Helper methods for data formatting

  private formatColors(): any {
    const variables = this.data.variables;
    if (!variables || !variables.COLOR) return {};

    const colors: any = {};
    
    for (const [colorName, colorData] of Object.entries(variables.COLOR)) {
      colors[colorName] = this.extractColorValue(colorData);
    }

    return colors;
  }

  private formatTypography(): any {
    const textStyles = this.data.styles?.text;
    if (!textStyles) return {};

    const typography: any = {};
    
    for (const [styleName, styleData] of Object.entries(textStyles)) {
      typography[styleName] = this.extractTypographyValue(styleData);
    }

    return typography;
  }

  private formatSpacing(): any {
    const variables = this.data.variables;
    const spacingTypes = ['FLOAT', 'STRING']; // Common spacing variable types
    const spacing: any = {};

    for (const type of spacingTypes) {
      if (variables[type]) {
        for (const [name, data] of Object.entries(variables[type])) {
          if (this.isSpacingVariable(name)) {
            spacing[name] = this.extractSpacingValue(data);
          }
        }
      }
    }

    return spacing;
  }

  private formatEffects(): any {
    const effectStyles = this.data.styles?.effect;
    if (!effectStyles) return {};

    const effects: any = {};
    
    for (const [effectName, effectData] of Object.entries(effectStyles)) {
      effects[effectName] = this.extractEffectValue(effectData);
    }

    return effects;
  }

  private extractColorValue(colorData: any): any {
    // Handle resolved values (direct hex strings or mode objects)
    if (typeof colorData === 'string' && colorData.startsWith('#')) {
      // Direct hex value from alias resolution
      return colorData;
    }
    
    if (typeof colorData === 'object' && colorData !== null) {
      // Check if this is a mode object (light/dark)
      if (colorData.light || colorData.dark || colorData.default) {
        return colorData; // Return the mode object as-is for AI tools
      }
      
      // Handle old format with mode IDs
      if (colorData.modes) {
        const firstMode = Object.keys(colorData.modes)[0];
        const modeValue = colorData.modes[firstMode];
        
        // If mode value is still an object with hex, extract the hex
        if (modeValue && typeof modeValue === 'object' && modeValue.hex) {
          return modeValue.hex;
        }
        
        return modeValue;
      }
      
      // If it has a hex property directly
      if (colorData.hex) {
        return colorData.hex;
      }
    }
    
    return colorData;
  }

  private extractTypographyValue(styleData: any): any {
    return {
      fontFamily: styleData.fontFamily,
      fontWeight: styleData.fontWeight,
      fontSize: styleData.fontSize,
      lineHeight: styleData.lineHeight,
      letterSpacing: styleData.letterSpacing
    };
  }

  private extractSpacingValue(data: any): any {
    if (data.modes) {
      const firstMode = Object.keys(data.modes)[0];
      return data.modes[firstMode];
    }
    return data;
  }

  private extractEffectValue(effectData: any): any {
    return {
      type: effectData.type,
      effects: effectData.effects
    };
  }

  private isSpacingVariable(name: string): boolean {
    const spacingKeywords = ['spacing', 'margin', 'padding', 'gap', 'size'];
    return spacingKeywords.some(keyword => 
      name.toLowerCase().includes(keyword)
    );
  }

  private sanitizeComponentName(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '').replace(/^[0-9]/, 'Component$&');
  }

  private generateComponentProps(component: any): string {
    // Generate TypeScript interface based on component variants
    const variants = component.variantDiversity || 0;
    
    let props = `interface ${this.sanitizeComponentName(component.name)}Props {\n`;
    props += `  children?: React.ReactNode;\n`;
    props += `  className?: string;\n`;
    
    if (variants > 1) {
      props += `  variant?: 'default' | 'primary' | 'secondary';\n`;
      props += `  size?: 'sm' | 'md' | 'lg';\n`;
    }
    
    props += `}`;
    
    return props;
  }

  private generateComponentCode(componentName: string, props: string): string {
    return `${props}

export function ${componentName}({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  ...props 
}: ${componentName}Props) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "${componentName.toLowerCase()}",
        // Variant styles
        variant === 'primary' && "${componentName.toLowerCase()}--primary",
        variant === 'secondary' && "${componentName.toLowerCase()}--secondary",
        // Size styles
        size === 'sm' && "${componentName.toLowerCase()}--sm",
        size === 'lg' && "${componentName.toLowerCase()}--lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}`;
  }

  private generateUsageExamples(componentName: string, component: any): string {
    const examples = [
      `// Basic usage\n<${componentName}>Content</${componentName}>`,
      `// With variant\n<${componentName} variant="primary">Primary content</${componentName}>`,
      `// With size\n<${componentName} size="lg">Large content</${componentName}>`,
      `// Combined\n<${componentName} variant="secondary" size="sm" className="custom-class">\n  Custom content\n</${componentName}>`
    ];

    return examples.join('\n\n');
  }

  private calculateTokenCoverage(): number {
    const totalVariables = this.data.metadata?.totalVariables || 0;
    const totalStyles = (this.data.metadata?.totalTextStyles || 0) + 
                       (this.data.metadata?.totalEffectStyles || 0);
    
    if (totalVariables + totalStyles === 0) return 0;
    return Math.round((totalVariables / (totalVariables + totalStyles)) * 100);
  }

  private calculateComponentReusability(): number {
    const componentAnalysis = this.data.componentAnalysis;
    if (!componentAnalysis) return 0;
    
    const totalInstances = componentAnalysis.summary?.totalInstances || 0;
    const uniqueComponents = componentAnalysis.summary?.uniqueComponents || 0;
    
    if (uniqueComponents === 0) return 0;
    return Math.round((totalInstances / uniqueComponents) * 10); // Scale for percentage
  }

  private calculateDesignConsistency(): number {
    const stylePatterns = this.data.componentAnalysis?.stylePatterns;
    if (!stylePatterns) return 0;
    
    const colorVariations = stylePatterns.colors?.length || 0;
    const typographyVariations = stylePatterns.typography?.length || 0;
    
    // Higher consistency = fewer variations
    const totalVariations = colorVariations + typographyVariations;
    return Math.max(0, 100 - Math.min(totalVariations, 100));
  }

  private generateColorGuidelines(): string {
    const colors = this.data.componentAnalysis?.stylePatterns?.colors;
    if (!colors || colors.length === 0) return 'Use the extracted color tokens consistently.';
    
    const primaryColors = colors.slice(0, 3);
    return `Primary colors are ${primaryColors.map((c: any) => c.color).join(', ')}. Use these for main UI elements.`;
  }

  private generateTypographyGuidelines(): string {
    const typography = this.data.componentAnalysis?.stylePatterns?.typography;
    if (!typography || typography.length === 0) return 'Follow the extracted typography scale.';
    
    return `Main font family: ${typography[0]?.fontFamily || 'System font'}. Use the provided size scale for hierarchy.`;
  }

  private generateSpacingGuidelines(): string {
    const spacing = this.data.componentAnalysis?.stylePatterns?.spacing;
    if (!spacing || spacing.length === 0) return 'Use consistent spacing values from the design system.';
    
    const commonSpacing = spacing.slice(0, 5).map((s: any) => `${s.value}px`).join(', ');
    return `Common spacing values: ${commonSpacing}. Use these for consistent layouts.`;
  }

  private generateComponentGuidelines(): string {
    const components = this.data.componentAnalysis?.componentUsage;
    if (!components || components.length === 0) return 'Build components following the detected patterns.';
    
    const topComponent = components[0];
    return `Most used component is ${topComponent.name}. Follow its patterns for consistency.`;
  }

  private categorizeComponentsByType(components: any[]): Record<string, any[]> {
    const categories: Record<string, any[]> = {
      'Interactive': [],
      'Form Controls': [],
      'Layout': [],
      'Content': [],
      'Feedback': [],
      'Navigation': [],
      'Media': [],
      'Other': []
    };
    
    const categoryPatterns = {
      'Interactive': [/btn|button/i, /cta|toggle/i, /switch/i],
      'Form Controls': [/input|field|form|textarea|select|checkbox|radio/i],
      'Layout': [/container|wrapper|grid|section|header|footer|layout/i],
      'Content': [/card|tile|panel|article|item/i],
      'Feedback': [/loading|spinner|progress|skeleton|toast|alert|error|success/i],
      'Navigation': [/nav|menu|breadcrumb|tab|stepper|pagination/i],
      'Media': [/image|img|avatar|icon|logo|video|media/i]
    };
    
    components.forEach(component => {
      let categorized = false;
      const name = component.name.toLowerCase();
      
      for (const [category, patterns] of Object.entries(categoryPatterns)) {
        if (patterns.some(pattern => pattern.test(name))) {
          categories[category].push(component);
          categorized = true;
          break;
        }
      }
      
      if (!categorized) {
        categories['Other'].push(component);
      }
    });
    
    return categories;
  }
  
  private generateComponentCategorySummary(categorizedComponents: Record<string, any[]>): string {
    let summary = '### Component Overview\n\n';
    
    const totalComponents = Object.values(categorizedComponents).reduce((sum, cat) => sum + cat.length, 0);
    summary += `**Total Components Found:** ${totalComponents}\n\n`;
    
    const categoryEmojis = {
      'Interactive': '🎯',
      'Form Controls': '📝', 
      'Layout': '📦',
      'Content': '📄',
      'Feedback': '💫',
      'Navigation': '🧭',
      'Media': '🖼️',
      'Other': '🔧'
    };
    
    Object.entries(categorizedComponents).forEach(([category, components]) => {
      if (components.length > 0) {
        const emoji = categoryEmojis[category as keyof typeof categoryEmojis] || '🔧';
        summary += `- **${emoji} ${category}:** ${components.length} components\n`;
      }
    });
    
    summary += '\n';
    return summary;
  }
  
  private selectDiverseComponents(categorizedComponents: Record<string, any[]>, limit: number): any[] {
    const selected: any[] = [];
    const categories = Object.keys(categorizedComponents).filter(cat => 
      categorizedComponents[cat].length > 0
    );
    
    // Distribute selection across categories to ensure diversity
    const perCategory = Math.max(1, Math.floor(limit / categories.length));
    
    categories.forEach(category => {
      const categoryComponents = categorizedComponents[category]
        .sort((a, b) => (b.count || 0) - (a.count || 0)) // Sort by usage
        .slice(0, perCategory);
      selected.push(...categoryComponents);
    });
    
    // Fill remaining slots with most used components overall
    if (selected.length < limit) {
      const remaining = limit - selected.length;
      const allComponents = Object.values(categorizedComponents)
        .flat()
        .filter(comp => !selected.includes(comp))
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, remaining);
      selected.push(...allComponents);
    }
    
    return selected.slice(0, limit);
  }

  private generateTokenOpportunities(): string {
    const recommendations = this.data.componentAnalysis?.recommendations || [];
    const tokenRecs = recommendations.filter((r: any) => 
      r.type.includes('token') || r.type.includes('color') || r.type.includes('spacing')
    );
    
    if (tokenRecs.length === 0) return '- Design system is well-tokenized';
    
    return tokenRecs.map((rec: any) => `- ${rec.suggestion}`).join('\n');
  }
}

// Export function for easy integration
export function generateUnifiedMarkdown(options: MarkdownGeneratorOptions): string {
  const generator = new UnifiedMarkdownGenerator(options);
  return generator.generateComplete();
}