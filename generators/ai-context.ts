import { 
  ColorToken, 
  TypographyToken, 
  SpacingToken, 
  AnalyzedComponent, 
  DesignSystemContext,
  UsagePattern,
  ExtractionConfig
} from '../types';

export class AIContextGenerator {
  private config: ExtractionConfig;
  
  constructor(config: ExtractionConfig) {
    this.config = config;
  }

  generateAIContext(
    colors: ColorToken[],
    typography: TypographyToken[],
    spacing: SpacingToken[],
    components: AnalyzedComponent[]
  ): DesignSystemContext {
    return {
      name: 'Design System',
      version: '1.0.0',
      description: this.generateSystemDescription(colors, typography, spacing, components),
      principles: this.generateDesignPrinciples(),
      colorPhilosophy: this.generateColorPhilosophy(colors),
      typographyApproach: this.generateTypographyApproach(typography),
      spacingSystem: this.generateSpacingSystemDescription(spacing),
      componentPatterns: this.generateComponentPatterns(components),
      accessibility: {
        level: 'AA',
        guidelines: this.generateAccessibilityGuidelines()
      },
      responsiveStrategy: this.generateResponsiveStrategy(),
      commonUsagePatterns: this.generateUsagePatterns(colors, typography, spacing, components)
    };
  }

  generateAIPromptContext(
    colors: ColorToken[],
    typography: TypographyToken[],
    spacing: SpacingToken[],
    components: AnalyzedComponent[]
  ): string {
    const contextParts: string[] = [];
    
    contextParts.push('# Design System Context for AI Tools');
    contextParts.push('');
    contextParts.push('You are working with a comprehensive design system extracted from Figma. This context provides all the information you need to create consistent, accessible, and brand-aligned interfaces.');
    contextParts.push('');
    
    // Color System Context
    contextParts.push('## Color System');
    contextParts.push(this.generateColorContext(colors));
    contextParts.push('');
    
    // Typography Context
    contextParts.push('## Typography System');
    contextParts.push(this.generateTypographyContext(typography));
    contextParts.push('');
    
    // Spacing Context
    contextParts.push('## Spacing System');
    contextParts.push(this.generateSpacingContext(spacing));
    contextParts.push('');
    
    // Component Context
    contextParts.push('## Component Library');
    contextParts.push(this.generateComponentContext(components));
    contextParts.push('');
    
    // Usage Guidelines
    contextParts.push('## Usage Guidelines for AI Tools');
    contextParts.push(this.generateAIUsageGuidelines());
    contextParts.push('');
    
    // Code Examples
    contextParts.push('## Ready-to-Use Code Examples');
    contextParts.push(this.generateCodeExamples(colors, typography, spacing, components));
    
    return contextParts.join('\n');
  }

  private generateSystemDescription(
    colors: ColorToken[],
    typography: TypographyToken[],
    spacing: SpacingToken[],
    components: AnalyzedComponent[]
  ): string {
    const stats = {
      colors: colors.length,
      typography: typography.length,
      spacing: spacing.length,
      components: components.length
    };
    
    return `A comprehensive design system featuring ${stats.colors} semantic colors, ${stats.typography} typography styles, ${stats.spacing} spacing tokens, and ${stats.components} reusable components. This system prioritizes accessibility, consistency, and developer experience while being optimized for AI-powered development tools.`;
  }

  private generateDesignPrinciples(): string[] {
    return [
      'Consistency: Maintain visual and functional consistency across all interfaces',
      'Accessibility: Ensure WCAG AA compliance and inclusive design practices',
      'Scalability: Design for growth and adaptation across different contexts',
      'Semantic clarity: Use meaningful names and structure for better comprehension',
      'Developer experience: Provide clear documentation and easy-to-use APIs',
      'AI-friendly: Structure content for optimal AI tool understanding and generation'
    ];
  }

  private generateColorPhilosophy(colors: ColorToken[]): string {
    const primaryColors = colors.filter(c => c.semanticRole === 'primary');
    const semanticColors = colors.filter(c => ['success', 'warning', 'error', 'info'].includes(c.semanticRole || ''));
    const neutrals = colors.filter(c => c.semanticRole === 'neutral');
    
    return `The color system is built on semantic meaning and accessibility. Primary colors (${primaryColors.length}) establish brand identity and hierarchy. Semantic colors (${semanticColors.length}) provide clear communication for states and feedback. Neutral colors (${neutrals.length}) ensure readability and create visual structure. All colors meet WCAG contrast requirements and work harmoniously together.`;
  }

  private generateTypographyApproach(typography: TypographyToken[]): string {
    const headings = typography.filter(t => t.semanticLevel && t.semanticLevel.includes('heading'));
    const body = typography.filter(t => t.semanticLevel && t.semanticLevel.includes('body'));
    const fontFamilySet = new Set(typography.map(t => t.fontFamily));
    const fontFamilies = Array.from(fontFamilySet);
    
    return `Typography system with ${headings.length} heading levels and ${body.length} body text styles using ${fontFamilies.length} font families. Emphasizes clear hierarchy, optimal readability, and responsive scaling. Line heights and spacing are carefully calibrated for excellent reading experience across all devices.`;
  }

  private generateSpacingSystemDescription(spacing: SpacingToken[]): string {
    const spacingValues = spacing.map(s => s.value as number).sort((a, b) => a - b);
    const minSpacing = spacingValues[0];
    const maxSpacing = spacingValues[spacingValues.length - 1];
    
    return `Consistent spacing system with ${spacing.length} tokens ranging from ${minSpacing}px to ${maxSpacing}px. Based on mathematical progression for visual harmony and predictable layouts. Supports responsive design and maintains rhythm across all components.`;
  }

  private generateComponentPatterns(components: AnalyzedComponent[]): string[] {
    const patterns: string[] = [];
    
    const componentsByType = components.reduce((acc, comp) => {
      if (!acc[comp.type]) acc[comp.type] = [];
      acc[comp.type].push(comp);
      return acc;
    }, {} as Record<string, AnalyzedComponent[]>);
    
    for (const [type, comps] of Object.entries(componentsByType)) {
      patterns.push(`${type.charAt(0).toUpperCase() + type.slice(1)} components (${comps.length}): ${comps.map(c => c.name).join(', ')}`);
    }
    
    return patterns;
  }

  private generateAccessibilityGuidelines(): string[] {
    return [
      'All text maintains minimum 4.5:1 contrast ratio (AA standard)',
      'Interactive elements have minimum 44px touch targets',
      'Components support keyboard navigation and focus management',
      'ARIA labels and semantic HTML structure throughout',
      'Color is never the only means of conveying information',
      'Components work with screen readers and assistive technologies'
    ];
  }

  private generateResponsiveStrategy(): string {
    return 'Mobile-first responsive design with breakpoints at 640px (sm), 768px (md), 1024px (lg), 1280px (xl), and 1536px (2xl). Components adapt fluidly between breakpoints with appropriate scaling of typography, spacing, and layout patterns.';
  }

  private generateUsagePatterns(
    colors: ColorToken[],
    typography: TypographyToken[],
    spacing: SpacingToken[],
    components: AnalyzedComponent[]
  ): UsagePattern[] {
    const patterns: UsagePattern[] = [];
    
    // Color usage patterns
    const primaryColor = colors.find(c => c.semanticRole === 'primary');
    if (primaryColor) {
      patterns.push({
        pattern: 'Primary Action Button',
        description: 'Use primary color for main call-to-action buttons',
        code: `<button className="bg-${primaryColor.semanticName} text-white px-6 py-3 rounded-lg hover:bg-${primaryColor.semanticName}-dark">
  Get Started
</button>`,
        usage: 'Main CTAs, submit buttons, primary navigation links'
      });
    }
    
    // Typography patterns
    const headingXL = typography.find(t => t.semanticLevel === 'heading-xl');
    if (headingXL) {
      patterns.push({
        pattern: 'Hero Section Heading',
        description: 'Large heading for hero sections and main page titles',
        code: `<h1 className="text-${headingXL.semanticName} font-bold text-center mb-6">
  Welcome to Our Platform
</h1>`,
        usage: 'Hero sections, landing page titles, major headings'
      });
    }
    
    // Component patterns
    const cardComponent = components.find(c => c.type === 'card');
    if (cardComponent) {
      patterns.push({
        pattern: 'Content Card Layout',
        description: 'Standard card pattern for content display',
        code: `<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  <h3 className="text-heading-md font-semibold mb-4">Card Title</h3>
  <p className="text-body-md text-gray-600 mb-4">Card description content...</p>
  <button className="text-primary-600 hover:text-primary-700">Learn More</button>
</div>`,
        usage: 'Product cards, blog post previews, feature highlights'
      });
    }
    
    // Layout patterns
    patterns.push({
      pattern: 'Responsive Grid Layout',
      description: 'Standard grid pattern with responsive columns',
      code: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="bg-white rounded-lg p-6 shadow-sm">
      {/* Item content */}
    </div>
  ))}
</div>`,
      usage: 'Product grids, feature lists, gallery layouts'
    });
    
    return patterns;
  }

  private generateColorContext(colors: ColorToken[]): string {
    const contextParts: string[] = [];
    
    contextParts.push('### Available Colors:');
    
    const colorsByRole = colors.reduce((acc, color) => {
      const role = color.semanticRole || 'other';
      if (!acc[role]) acc[role] = [];
      acc[role].push(color);
      return acc;
    }, {} as Record<string, ColorToken[]>);
    
    for (const [role, roleColors] of Object.entries(colorsByRole)) {
      contextParts.push(`\n**${role.charAt(0).toUpperCase() + role.slice(1)} Colors:**`);
      for (const color of roleColors) {
        contextParts.push(`- \`${color.semanticName || color.name}\` (${color.hex}): ${color.description}`);
        if (color.usage && color.usage.length > 0) {
          contextParts.push(`  - Usage: ${color.usage.join(', ')}`);
        }
      }
    }
    
    contextParts.push('\n### Color Usage Guidelines:');
    contextParts.push('- Use semantic color names in CSS classes (e.g., `bg-brand-primary`, `text-semantic-success`)');
    contextParts.push('- Primary colors for main actions and brand elements');
    contextParts.push('- Secondary colors for supporting actions');
    contextParts.push('- Semantic colors (success, warning, error, info) for status and feedback');
    contextParts.push('- Neutral colors for text, backgrounds, and borders');
    
    return contextParts.join('\n');
  }

  private generateTypographyContext(typography: TypographyToken[]): string {
    const contextParts: string[] = [];
    
    contextParts.push('### Typography Hierarchy:');
    
    const sortedTypography = typography.sort((a, b) => {
      const order = ['heading-xl', 'heading-lg', 'heading-md', 'heading-sm', 'body-lg', 'body-md', 'body-sm', 'caption'];
      const aIndex = order.indexOf(a.semanticLevel || '');
      const bIndex = order.indexOf(b.semanticLevel || '');
      return aIndex - bIndex;
    });
    
    for (const typo of sortedTypography) {
      contextParts.push(`- **${typo.semanticLevel || typo.name}**: ${typo.fontSize}px, ${typo.fontWeight} weight`);
      contextParts.push(`  - Font: ${typo.fontFamily}`);
      contextParts.push(`  - Usage: ${typo.description}`);
      if (typo.usage && typo.usage.length > 0) {
        contextParts.push(`  - Examples: ${typo.usage.slice(0, 2).join(', ')}`);
      }
    }
    
    contextParts.push('\n### Typography Guidelines:');
    contextParts.push('- Use semantic classes for consistent typography (e.g., `text-heading-xl`, `text-body-md`)');
    contextParts.push('- Maintain hierarchy with appropriate heading levels');
    contextParts.push('- Ensure sufficient contrast between text and background colors');
    contextParts.push('- Use line-height and letter-spacing from the design system');
    
    return contextParts.join('\n');
  }

  private generateSpacingContext(spacing: SpacingToken[]): string {
    const contextParts: string[] = [];
    
    contextParts.push('### Spacing Scale:');
    
    const sortedSpacing = spacing.sort((a, b) => (a.value as number) - (b.value as number));
    
    for (const space of sortedSpacing) {
      contextParts.push(`- **${space.semanticName}**: ${space.value}px`);
      contextParts.push(`  - Usage: ${space.description}`);
    }
    
    contextParts.push('\n### Spacing Guidelines:');
    contextParts.push('- Use semantic spacing classes (e.g., `p-space-md`, `m-space-lg`, `gap-space-sm`)');
    contextParts.push('- Apply consistent spacing for visual rhythm');
    contextParts.push('- Use smaller spacing for related elements, larger for sections');
    contextParts.push('- Consider responsive spacing adjustments');
    
    return contextParts.join('\n');
  }

  private generateComponentContext(components: AnalyzedComponent[]): string {
    const contextParts: string[] = [];
    
    contextParts.push('### Available Components:');
    
    for (const component of components) {
      contextParts.push(`\n**${component.name}** (${component.type}):`);
      contextParts.push(`- Description: ${component.semanticDescription}`);
      contextParts.push(`- Variants: ${component.variants.map(v => v.name).join(', ')}`);
      contextParts.push(`- Usage: ${component.usage.slice(0, 2).join(', ')}`);
      contextParts.push(`- Examples:`);
      for (const example of component.examples.slice(0, 2)) {
        contextParts.push(`  - \`${example}\``);
      }
    }
    
    return contextParts.join('\n');
  }

  private generateAIUsageGuidelines(): string {
    return `### For AI Prototyping Tools:

**When generating interfaces:**
1. Always use semantic class names from this design system
2. Follow the established color, typography, and spacing patterns
3. Reference component examples for consistent implementation
4. Maintain accessibility standards (ARIA labels, proper contrast, keyboard navigation)
5. Use responsive design principles with mobile-first approach

**Preferred Patterns:**
- Use utility classes for styling (e.g., \`bg-brand-primary text-white p-space-md\`)
- Combine design system tokens for consistent appearance
- Follow component composition patterns shown in examples
- Apply semantic color roles appropriately (primary for actions, success for confirmations, etc.)

**Code Generation Best Practices:**
- Include accessibility attributes in generated components
- Use semantic HTML elements (\`<button>\`, \`<nav>\`, \`<main>\`, etc.)
- Apply responsive classes for different screen sizes
- Follow the component patterns and naming conventions
- Include hover and focus states for interactive elements

**Example Prompt Enhancement:**
"Using the design system provided, create a responsive landing page with proper semantic colors, typography hierarchy, and consistent spacing. Ensure all interactive elements follow the component patterns and accessibility guidelines."`;
  }

  private generateCodeExamples(
    colors: ColorToken[],
    typography: TypographyToken[],
    spacing: SpacingToken[],
    components: AnalyzedComponent[]
  ): string {
    const examples: string[] = [];
    
    examples.push('### Common UI Patterns');
    examples.push('');
    
    // Hero section example
    examples.push('**Hero Section:**');
    examples.push('```jsx');
    examples.push('<section className="bg-brand-primary text-white py-space-xxl px-space-lg text-center">');
    examples.push('  <h1 className="text-heading-xl font-bold mb-space-md">');
    examples.push('    Welcome to Our Platform');
    examples.push('  </h1>');
    examples.push('  <p className="text-body-lg mb-space-lg max-w-2xl mx-auto">');
    examples.push('    Build amazing products with our comprehensive design system.');
    examples.push('  </p>');
    examples.push('  <button className="bg-white text-brand-primary px-space-lg py-space-md rounded-lg font-semibold hover:bg-gray-50">');
    examples.push('    Get Started');
    examples.push('  </button>');
    examples.push('</section>');
    examples.push('```');
    examples.push('');
    
    // Card grid example
    examples.push('**Feature Cards Grid:**');
    examples.push('```jsx');
    examples.push('<div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg p-space-lg">');
    examples.push('  {features.map(feature => (');
    examples.push('    <div key={feature.id} className="bg-white rounded-lg shadow-md p-space-md border border-neutral-200">');
    examples.push('      <h3 className="text-heading-md font-semibold mb-space-sm text-text-primary">');
    examples.push('        {feature.title}');
    examples.push('      </h3>');
    examples.push('      <p className="text-body-md text-text-muted mb-space-md">');
    examples.push('        {feature.description}');
    examples.push('      </p>');
    examples.push('      <button className="text-brand-primary hover:text-brand-primary-dark font-medium">');
    examples.push('        Learn More →');
    examples.push('      </button>');
    examples.push('    </div>');
    examples.push('  ))}');
    examples.push('</div>');
    examples.push('```');
    examples.push('');
    
    // Form example
    examples.push('**Form Layout:**');
    examples.push('```jsx');
    examples.push('<form className="max-w-md mx-auto p-space-lg">');
    examples.push('  <div className="mb-space-md">');
    examples.push('    <label className="block text-body-md font-medium text-text-primary mb-space-xs">');
    examples.push('      Email Address');
    examples.push('    </label>');
    examples.push('    <input');
    examples.push('      type="email"');
    examples.push('      className="w-full px-space-sm py-space-xs border border-neutral-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"');
    examples.push('      placeholder="Enter your email"');
    examples.push('    />');
    examples.push('  </div>');
    examples.push('  <button');
    examples.push('    type="submit"');
    examples.push('    className="w-full bg-brand-primary text-white py-space-sm px-space-md rounded-md hover:bg-brand-primary-dark focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"');
    examples.push('  >');
    examples.push('    Subscribe');
    examples.push('  </button>');
    examples.push('</form>');
    examples.push('```');
    
    return examples.join('\n');
  }

  generateComponentGuide(components: AnalyzedComponent[]): string {
    const guide: string[] = [];
    
    guide.push('# Component Usage Guide for AI Tools');
    guide.push('');
    guide.push('This guide provides detailed information about each component for AI-powered development.');
    guide.push('');
    
    for (const component of components) {
      guide.push(`## ${component.name}`);
      guide.push('');
      guide.push(`**Type:** ${component.type}`);
      guide.push(`**Description:** ${component.semanticDescription}`);
      guide.push('');
      
      guide.push('**Props:**');
      for (const prop of component.props) {
        guide.push(`- \`${prop.name}\` (${prop.type}${prop.required ? ', required' : ', optional'}): ${prop.description}`);
        if (prop.enumValues) {
          guide.push(`  - Options: ${prop.enumValues.join(', ')}`);
        }
        if (prop.default !== undefined) {
          guide.push(`  - Default: ${JSON.stringify(prop.default)}`);
        }
      }
      guide.push('');
      
      guide.push('**Variants:**');
      for (const variant of component.variants) {
        guide.push(`- **${variant.name}**: ${variant.description}`);
        guide.push(`  - Usage: ${variant.usage}`);
        if (Object.keys(variant.properties).length > 0) {
          guide.push(`  - Properties: ${JSON.stringify(variant.properties)}`);
        }
      }
      guide.push('');
      
      guide.push('**Usage Examples:**');
      for (const example of component.examples) {
        guide.push(`\`\`\`jsx\n${example}\n\`\`\``);
      }
      guide.push('');
      
      guide.push('**Accessibility:**');
      guide.push(`- Keyboard Navigation: ${component.accessibility.keyboardNavigation ? 'Yes' : 'No'}`);
      guide.push(`- Color Contrast: ${component.accessibility.colorContrast}`);
      guide.push(`- ARIA Support: ${component.accessibility.ariaLabels.length > 0 ? 'Yes' : 'No'}`);
      guide.push('');
      
      guide.push('---');
      guide.push('');
    }
    
    return guide.join('\n');
  }
}