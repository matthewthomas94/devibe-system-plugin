import { DesignToken, NamingStrategy, SemanticMapping } from '../types';

export class AIFriendlyNamingFormatter {
  private aiToolPatterns = {
    bolt: {
      colorPrefix: 'color-',
      spacingPrefix: 'space-',
      textPrefix: 'text-',
      convention: 'kebab-case' as const,
      semanticPriority: true
    },
    v0: {
      colorPrefix: '',
      spacingPrefix: '',
      textPrefix: 'text-',
      convention: 'kebab-case' as const,
      semanticPriority: true
    },
    loveable: {
      colorPrefix: 'clr-',
      spacingPrefix: 'spacing-',
      textPrefix: 'typography-',
      convention: 'kebab-case' as const,
      semanticPriority: true
    },
    cursor: {
      colorPrefix: '',
      spacingPrefix: '',
      textPrefix: '',
      convention: 'camelCase' as const,
      semanticPriority: false
    },
    figmaMake: {
      colorPrefix: 'color-',
      spacingPrefix: 'space-',
      textPrefix: 'type-',
      convention: 'kebab-case' as const,
      semanticPriority: true
    }
  };

  formatForAITool(
    tokens: DesignToken[], 
    aiTool: keyof typeof this.aiToolPatterns
  ): { tokens: DesignToken[], namingGuide: string } {
    const pattern = this.aiToolPatterns[aiTool];
    const formattedTokens = tokens.map(token => this.formatToken(token, pattern));
    const namingGuide = this.generateNamingGuide(aiTool, pattern);
    
    return { tokens: formattedTokens, namingGuide };
  }

  private formatToken(
    token: DesignToken, 
    pattern: typeof this.aiToolPatterns[keyof typeof this.aiToolPatterns]
  ): DesignToken {
    const prefix = this.getPrefix(token.type, pattern);
    let baseName = pattern.semanticPriority && token.semanticName ? token.semanticName : token.name;
    
    // Clean and format the base name
    baseName = this.cleanName(baseName);
    baseName = this.applyNamingConvention(baseName, pattern.convention);
    
    // Apply prefix
    const formattedName = prefix + baseName;
    
    return Object.assign({}, token, {
      name: formattedName,
      semanticName: formattedName
    });
  }

  private getPrefix(
    type: DesignToken['type'], 
    pattern: typeof this.aiToolPatterns[keyof typeof this.aiToolPatterns]
  ): string {
    switch (type) {
      case 'color':
        return pattern.colorPrefix;
      case 'spacing':
        return pattern.spacingPrefix;
      case 'typography':
        return pattern.textPrefix;
      default:
        return '';
    }
  }

  private cleanName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s\-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[-_]+/g, '-')
      .replace(/^[-_]|[-_]$/g, '');
  }

  private applyNamingConvention(
    name: string, 
    convention: 'kebab-case' | 'camelCase' | 'PascalCase' | 'snake_case'
  ): string {
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

  generateSemanticMappings(tokens: DesignToken[]): SemanticMapping[] {
    return tokens.map(token => this.analyzeTokenSemantics(token));
  }

  private analyzeTokenSemantics(token: DesignToken): SemanticMapping {
    const originalName = token.name.toLowerCase();
    let semanticName = originalName;
    let confidence = 0.5;
    let reasoning = 'Basic name analysis';

    // Semantic analysis patterns for different token types
    const semanticPatterns = this.getSemanticPatterns(token.type);
    
    for (const { pattern, semantic, confidenceScore, description } of semanticPatterns) {
      if (pattern.test(originalName)) {
        semanticName = semantic;
        confidence = confidenceScore;
        reasoning = description;
        break;
      }
    }

    // Enhance semantic meaning based on context
    if (token.type === 'color' && 'semanticRole' in token) {
      const role = (token as any).semanticRole;
      if (role && role !== 'neutral') {
        semanticName = `${role}-${this.extractIntensity(originalName)}`;
        confidence = Math.max(confidence, 0.8);
        reasoning = `Detected semantic role: ${role}`;
      }
    }

    return {
      originalName: token.name,
      semanticName,
      confidence,
      reasoning
    };
  }

  private getSemanticPatterns(type: DesignToken['type']) {
    const patterns = {
      color: [
        { pattern: /(primary|main|brand)/, semantic: 'primary', confidenceScore: 0.9, description: 'Primary brand color detected' },
        { pattern: /(secondary|accent)/, semantic: 'secondary', confidenceScore: 0.9, description: 'Secondary brand color detected' },
        { pattern: /(success|positive|good|green)/, semantic: 'success', confidenceScore: 0.9, description: 'Success state color detected' },
        { pattern: /(error|danger|negative|bad|red)/, semantic: 'error', confidenceScore: 0.9, description: 'Error state color detected' },
        { pattern: /(warning|caution|alert|yellow|orange)/, semantic: 'warning', confidenceScore: 0.9, description: 'Warning state color detected' },
        { pattern: /(info|information|neutral|blue|cyan)/, semantic: 'info', confidenceScore: 0.8, description: 'Info state color detected' },
        { pattern: /(gray|grey|neutral|slate|zinc)/, semantic: 'neutral', confidenceScore: 0.8, description: 'Neutral color detected' },
        { pattern: /(text|foreground)/, semantic: 'text', confidenceScore: 0.7, description: 'Text color detected' },
        { pattern: /(background|bg|surface)/, semantic: 'background', confidenceScore: 0.7, description: 'Background color detected' },
        { pattern: /(border|outline|stroke)/, semantic: 'border', confidenceScore: 0.7, description: 'Border color detected' }
      ],
      typography: [
        { pattern: /(display|hero|banner)/, semantic: 'display', confidenceScore: 0.9, description: 'Display typography detected' },
        { pattern: /(h1|heading-xl|title-xl)/, semantic: 'heading-xl', confidenceScore: 0.9, description: 'Extra large heading detected' },
        { pattern: /(h2|heading-lg|title-lg)/, semantic: 'heading-lg', confidenceScore: 0.9, description: 'Large heading detected' },
        { pattern: /(h3|heading-md|title-md)/, semantic: 'heading-md', confidenceScore: 0.9, description: 'Medium heading detected' },
        { pattern: /(h4|h5|h6|heading-sm|title-sm)/, semantic: 'heading-sm', confidenceScore: 0.9, description: 'Small heading detected' },
        { pattern: /(body|text|paragraph)/, semantic: 'body', confidenceScore: 0.8, description: 'Body text detected' },
        { pattern: /(caption|small|fine|micro)/, semantic: 'caption', confidenceScore: 0.8, description: 'Caption text detected' },
        { pattern: /(button|btn|cta)/, semantic: 'button', confidenceScore: 0.8, description: 'Button text detected' },
        { pattern: /(label|form)/, semantic: 'label', confidenceScore: 0.7, description: 'Label text detected' }
      ],
      spacing: [
        { pattern: /(xs|extra-small|tiny)/, semantic: 'xs', confidenceScore: 0.9, description: 'Extra small spacing detected' },
        { pattern: /(sm|small)/, semantic: 'sm', confidenceScore: 0.9, description: 'Small spacing detected' },
        { pattern: /(md|medium|base)/, semantic: 'md', confidenceScore: 0.9, description: 'Medium spacing detected' },
        { pattern: /(lg|large)/, semantic: 'lg', confidenceScore: 0.9, description: 'Large spacing detected' },
        { pattern: /(xl|extra-large|huge)/, semantic: 'xl', confidenceScore: 0.9, description: 'Extra large spacing detected' },
        { pattern: /(padding|pad)/, semantic: 'padding', confidenceScore: 0.8, description: 'Padding spacing detected' },
        { pattern: /(margin|gap)/, semantic: 'margin', confidenceScore: 0.8, description: 'Margin spacing detected' },
        { pattern: /(section|block)/, semantic: 'section', confidenceScore: 0.7, description: 'Section spacing detected' },
        { pattern: /(component|element)/, semantic: 'component', confidenceScore: 0.7, description: 'Component spacing detected' }
      ],
      shadow: [],
      border: [],
      opacity: []
    };

    return patterns[type as keyof typeof patterns] || [];
  }

  private extractIntensity(name: string): string {
    const intensityMatch = name.match(/(\d+)|(light|dark|bright|deep|pale|vivid)/);
    if (intensityMatch) {
      return intensityMatch[0];
    }
    
    // Default intensity based on common patterns
    if (name.includes('light') || name.includes('pale')) return 'light';
    if (name.includes('dark') || name.includes('deep')) return 'dark';
    if (name.includes('bright') || name.includes('vivid')) return 'bright';
    
    return 'base';
  }

  private generateNamingGuide(
    aiTool: keyof typeof this.aiToolPatterns, 
    pattern: typeof this.aiToolPatterns[keyof typeof this.aiToolPatterns]
  ): string {
    const guide: string[] = [];
    
    guide.push(`# Naming Guide for ${aiTool.charAt(0).toUpperCase() + aiTool.slice(1)}`);
    guide.push('');
    guide.push('This guide explains the naming conventions used in your design system tokens,');
    guide.push(`optimized for ${aiTool} and similar AI prototyping tools.`);
    guide.push('');
    
    guide.push('## Naming Convention');
    guide.push(`**Format:** ${pattern.convention}`);
    guide.push(`**Semantic Priority:** ${pattern.semanticPriority ? 'Enabled' : 'Disabled'}`);
    guide.push('');
    
    guide.push('## Prefixes');
    guide.push(`- **Colors:** \`${pattern.colorPrefix}\``);
    guide.push(`- **Spacing:** \`${pattern.spacingPrefix}\``);
    guide.push(`- **Typography:** \`${pattern.textPrefix}\``);
    guide.push('');
    
    guide.push('## Examples');
    guide.push('');
    guide.push('### Color Tokens');
    guide.push(`- Primary brand color: \`${pattern.colorPrefix}brand-primary\``);
    guide.push(`- Success state: \`${pattern.colorPrefix}semantic-success\``);
    guide.push(`- Neutral text: \`${pattern.colorPrefix}text-primary\``);
    guide.push('');
    
    guide.push('### Typography Tokens');
    guide.push(`- Large heading: \`${pattern.textPrefix}heading-lg\``);
    guide.push(`- Body text: \`${pattern.textPrefix}body-md\``);
    guide.push(`- Button text: \`${pattern.textPrefix}button\``);
    guide.push('');
    
    guide.push('### Spacing Tokens');
    guide.push(`- Small spacing: \`${pattern.spacingPrefix}sm\``);
    guide.push(`- Component padding: \`${pattern.spacingPrefix}component-padding\``);
    guide.push(`- Section margin: \`${pattern.spacingPrefix}section-margin\``);
    guide.push('');
    
    guide.push('## Usage in AI Tools');
    guide.push('');
    guide.push('When working with AI prototyping tools, use these semantic names to ensure');
    guide.push('consistent application of your design system. The AI will understand the');
    guide.push('intent behind each token and apply them appropriately.');
    guide.push('');
    
    guide.push('### Recommended Prompts:');
    guide.push(`- "Use \`${pattern.colorPrefix}brand-primary\` for all primary action buttons"`);
    guide.push(`- "Apply \`${pattern.textPrefix}heading-lg\` for section titles"`);
    guide.push(`- "Use \`${pattern.spacingPrefix}md\` for standard component spacing"`);
    guide.push('');
    
    guide.push('### CSS Class Examples:');
    guide.push(`- Background: \`.bg-${pattern.colorPrefix.replace('-', '')}brand-primary\``);
    guide.push(`- Text: \`.text-${pattern.textPrefix.replace('-', '')}heading-lg\``);
    guide.push(`- Padding: \`.p-${pattern.spacingPrefix.replace('-', '')}md\``);
    
    return guide.join('\n');
  }

  generateConsistencyReport(tokens: DesignToken[]): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    let issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check naming consistency
    const namingPatterns = this.analyzeNamingPatterns(tokens);
    if (namingPatterns.consistency < 0.8) {
      issues.push(`Naming consistency is ${Math.round(namingPatterns.consistency * 100)}% (below 80% threshold)`);
      recommendations.push('Standardize naming conventions across all tokens');
    }
    
    // Check semantic coverage
    const semanticCoverage = this.calculateSemanticCoverage(tokens);
    if (semanticCoverage < 0.7) {
      issues.push(`Only ${Math.round(semanticCoverage * 100)}% of tokens have semantic names`);
      recommendations.push('Add semantic names to improve AI tool comprehension');
    }
    
    // Check for common anti-patterns
    const antiPatterns = this.detectAntiPatterns(tokens);
    issues = issues.concat(antiPatterns);
    
    // Generate overall score
    const score = this.calculateOverallScore(namingPatterns.consistency, semanticCoverage, antiPatterns.length);
    
    if (score >= 0.9) {
      recommendations.push('Excellent naming! Your tokens are well-optimized for AI tools.');
    } else if (score >= 0.7) {
      recommendations.push('Good naming with room for improvement. Focus on consistency and semantic clarity.');
    } else {
      recommendations.push('Significant improvements needed. Consider refactoring token names for better AI compatibility.');
    }
    
    return { score, issues, recommendations };
  }

  private analyzeNamingPatterns(tokens: DesignToken[]): { consistency: number } {
    const conventions = {
      kebabCase: tokens.filter(t => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.name)).length,
      camelCase: tokens.filter(t => /^[a-z][a-zA-Z0-9]*$/.test(t.name)).length,
      snakeCase: tokens.filter(t => /^[a-z0-9]+(_[a-z0-9]+)*$/.test(t.name)).length,
      other: 0
    };
    
    conventions.other = tokens.length - conventions.kebabCase - conventions.camelCase - conventions.snakeCase;
    
    const conventionValues = Object.values(conventions);
    const maxConvention = Math.max.apply(Math, conventionValues);
    return { consistency: maxConvention / tokens.length };
  }

  private calculateSemanticCoverage(tokens: DesignToken[]): number {
    const tokensWithSemanticNames = tokens.filter(t => t.semanticName && t.semanticName !== t.name);
    return tokensWithSemanticNames.length / tokens.length;
  }

  private detectAntiPatterns(tokens: DesignToken[]): string[] {
    const antiPatterns: string[] = [];
    
    // Check for generic names
    const genericNames = tokens.filter(t => 
      /^(color|text|spacing|font)[\d]*$/i.test(t.name) ||
      /^(item|element|component)[\d]*$/i.test(t.name)
    );
    
    if (genericNames.length > 0) {
      antiPatterns.push(`${genericNames.length} tokens use generic names (e.g., "color1", "text2")`);
    }
    
    // Check for inconsistent numbering
    const numberedTokens = tokens.filter(t => /\d+$/.test(t.name));
    if (numberedTokens.length > tokens.length * 0.5) {
      antiPatterns.push('Over 50% of tokens use numeric suffixes, consider semantic naming');
    }
    
    // Check for mixed conventions
    const hasKebab = tokens.some(t => t.name.includes('-'));
    const hasUnderscore = tokens.some(t => t.name.includes('_'));
    const hasCamelCase = tokens.some(t => /[a-z][A-Z]/.test(t.name));
    
    const conventionCount = [hasKebab, hasUnderscore, hasCamelCase].filter(Boolean).length;
    if (conventionCount > 1) {
      antiPatterns.push('Mixed naming conventions detected (kebab-case, snake_case, camelCase)');
    }
    
    return antiPatterns;
  }

  private calculateOverallScore(consistency: number, semanticCoverage: number, antiPatternCount: number): number {
    const baseScore = (consistency + semanticCoverage) / 2;
    const penalty = Math.min(antiPatternCount * 0.1, 0.3); // Max 30% penalty
    return Math.max(0, baseScore - penalty);
  }
}