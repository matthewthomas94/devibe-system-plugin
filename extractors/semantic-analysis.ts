import { DesignToken, ColorToken, TypographyToken, SpacingToken, SemanticMapping } from '../types';

export class SemanticAnalyzer {
  
  analyzeDesignSystemSemantics(
    colors: ColorToken[],
    typography: TypographyToken[],
    spacing: SpacingToken[]
  ): {
    colorSemantics: SemanticMapping[];
    typographySemantics: SemanticMapping[];
    spacingSemantics: SemanticMapping[];
    overallScore: number;
    recommendations: string[];
  } {
    
    const colorSemantics = colors.map(color => this.analyzeColorSemantics(color));
    const typographySemantics = typography.map(typo => this.analyzeTypographySemantics(typo));
    const spacingSemantics = spacing.map(space => this.analyzeSpacingSemantics(space));
    
    const overallScore = this.calculateOverallSemanticScore(colorSemantics, typographySemantics, spacingSemantics);
    const recommendations = this.generateSemanticRecommendations(colorSemantics, typographySemantics, spacingSemantics);
    
    return {
      colorSemantics,
      typographySemantics,
      spacingSemantics,
      overallScore,
      recommendations
    };
  }

  private analyzeColorSemantics(color: ColorToken): SemanticMapping {
    const originalName = color.name.toLowerCase();
    let semanticName = originalName;
    let confidence = 0.5;
    let reasoning = 'Basic color name analysis';

    // Advanced semantic analysis patterns
    const semanticPatterns = [
      // Brand colors
      { pattern: /(primary|main|brand|signature)/, semantic: 'brand-primary', confidence: 0.95, context: 'Brand identity' },
      { pattern: /(secondary|accent|highlight)/, semantic: 'brand-secondary', confidence: 0.9, context: 'Supporting brand color' },
      
      // Functional colors
      { pattern: /(success|positive|good|valid|approved|green)/, semantic: 'semantic-success', confidence: 0.95, context: 'Success states' },
      { pattern: /(error|danger|negative|invalid|rejected|red)/, semantic: 'semantic-error', confidence: 0.95, context: 'Error states' },
      { pattern: /(warning|caution|alert|attention|amber|yellow|orange)/, semantic: 'semantic-warning', confidence: 0.95, context: 'Warning states' },
      { pattern: /(info|information|neutral|notice|blue|cyan)/, semantic: 'semantic-info', confidence: 0.9, context: 'Informational states' },
      
      // UI element colors  
      { pattern: /(text|foreground|content)/, semantic: 'text-primary', confidence: 0.85, context: 'Text content' },
      { pattern: /(muted|secondary-text|subtle)/, semantic: 'text-muted', confidence: 0.85, context: 'Secondary text' },
      { pattern: /(background|bg|surface|canvas)/, semantic: 'bg-primary', confidence: 0.85, context: 'Background surfaces' },
      { pattern: /(border|outline|stroke|divider)/, semantic: 'border-primary', confidence: 0.8, context: 'Borders and dividers' },
      
      // Neutral colors
      { pattern: /(gray|grey|neutral|slate|zinc|stone)/, semantic: 'neutral', confidence: 0.8, context: 'Neutral color scale' },
      { pattern: /(white|light|bright)/, semantic: 'neutral-50', confidence: 0.75, context: 'Light neutral' },
      { pattern: /(black|dark|deep)/, semantic: 'neutral-900', confidence: 0.75, context: 'Dark neutral' },
    ];

    // Check against semantic patterns
    for (const { pattern, semantic, confidence: patternConfidence, context } of semanticPatterns) {
      if (pattern.test(originalName)) {
        semanticName = this.enhanceColorSemantic(semantic, originalName, color);
        confidence = patternConfidence;
        reasoning = `Identified as ${context} based on name pattern`;
        break;
      }
    }

    // Enhance with color properties
    if (color.semanticRole && confidence < 0.9) {
      semanticName = `${color.semanticRole}-${this.extractColorIntensity(originalName, color)}`;
      confidence = Math.max(confidence, 0.85);
      reasoning += ` with semantic role: ${color.semanticRole}`;
    }

    // Analyze HSL values for additional context
    const hslContext = this.analyzeColorHSL(color.hsl);
    if (hslContext.confidence > confidence) {
      semanticName = hslContext.semanticName;
      confidence = hslContext.confidence;
      reasoning = hslContext.reasoning;
    }

    return {
      originalName: color.name,
      semanticName,
      confidence,
      reasoning
    };
  }

  private analyzeTypographySemantics(typography: TypographyToken): SemanticMapping {
    const originalName = typography.name.toLowerCase();
    let semanticName = originalName;
    let confidence = 0.5;
    let reasoning = 'Basic typography analysis';

    // Typography semantic patterns
    const semanticPatterns = [
      // Display typography
      { pattern: /(display|hero|banner|masthead|jumbotron)/, semantic: 'display', confidence: 0.95, context: 'Large display text' },
      
      // Heading hierarchy
      { pattern: /(h1|heading-1|title-1|primary-heading)/, semantic: 'heading-xl', confidence: 0.95, context: 'Primary heading' },
      { pattern: /(h2|heading-2|title-2|secondary-heading)/, semantic: 'heading-lg', confidence: 0.95, context: 'Secondary heading' },
      { pattern: /(h3|heading-3|title-3|tertiary-heading)/, semantic: 'heading-md', confidence: 0.95, context: 'Tertiary heading' },
      { pattern: /(h4|h5|h6|heading-4|heading-5|heading-6|minor-heading)/, semantic: 'heading-sm', confidence: 0.9, context: 'Minor heading' },
      
      // Body text
      { pattern: /(body|text|paragraph|content|copy)/, semantic: 'body-md', confidence: 0.85, context: 'Standard body text' },
      { pattern: /(large-body|lead|intro|summary)/, semantic: 'body-lg', confidence: 0.9, context: 'Large body text' },
      { pattern: /(small-body|detail|fine|secondary)/, semantic: 'body-sm', confidence: 0.85, context: 'Small body text' },
      
      // Specialized text
      { pattern: /(caption|annotation|footnote|meta)/, semantic: 'caption', confidence: 0.9, context: 'Caption text' },
      { pattern: /(button|btn|cta|action)/, semantic: 'button', confidence: 0.9, context: 'Button text' },
      { pattern: /(label|form|field)/, semantic: 'label', confidence: 0.85, context: 'Form label' },
      { pattern: /(code|monospace|mono)/, semantic: 'code', confidence: 0.95, context: 'Code text' },
      { pattern: /(quote|blockquote|testimonial)/, semantic: 'quote', confidence: 0.9, context: 'Quote text' },
    ];

    // Check against semantic patterns
    for (const { pattern, semantic, confidence: patternConfidence, context } of semanticPatterns) {
      if (pattern.test(originalName)) {
        semanticName = semantic;
        confidence = patternConfidence;
        reasoning = `Identified as ${context} based on name pattern`;
        break;
      }
    }

    // Enhance with font size analysis
    const sizeContext = this.analyzeTypographySize(typography.fontSize);
    if (sizeContext.confidence > confidence * 0.8) {
      semanticName = sizeContext.semanticName;
      confidence = Math.max(confidence, sizeContext.confidence);
      reasoning += ` and font size analysis (${typography.fontSize}px)`;
    }

    // Enhance with semantic level if available
    if (typography.semanticLevel && confidence < 0.9) {
      semanticName = typography.semanticLevel;
      confidence = Math.max(confidence, 0.85);
      reasoning += ` with predefined semantic level`;
    }

    return {
      originalName: typography.name,
      semanticName,
      confidence,
      reasoning
    };
  }

  private analyzeSpacingSemantics(spacing: SpacingToken): SemanticMapping {
    const originalName = spacing.name.toLowerCase();
    let semanticName = originalName;
    let confidence = 0.5;
    let reasoning = 'Basic spacing analysis';

    // Spacing semantic patterns
    const semanticPatterns = [
      // Size-based semantics
      { pattern: /(xs|extra-small|tiny|micro)/, semantic: 'space-xs', confidence: 0.9, context: 'Extra small spacing' },
      { pattern: /(sm|small|tight|compact)/, semantic: 'space-sm', confidence: 0.9, context: 'Small spacing' },
      { pattern: /(md|medium|base|normal|default)/, semantic: 'space-md', confidence: 0.9, context: 'Medium spacing' },
      { pattern: /(lg|large|loose|comfortable)/, semantic: 'space-lg', confidence: 0.9, context: 'Large spacing' },
      { pattern: /(xl|extra-large|huge|spacious)/, semantic: 'space-xl', confidence: 0.9, context: 'Extra large spacing' },
      { pattern: /(xxl|2xl|jumbo|massive)/, semantic: 'space-xxl', confidence: 0.9, context: 'Double extra large spacing' },
      
      // Context-based semantics
      { pattern: /(padding|pad|inner)/, semantic: 'space-padding', confidence: 0.85, context: 'Component padding' },
      { pattern: /(margin|gap|outer|between)/, semantic: 'space-margin', confidence: 0.85, context: 'Element margins' },
      { pattern: /(section|block|major)/, semantic: 'space-section', confidence: 0.8, context: 'Section spacing' },
      { pattern: /(component|module|widget)/, semantic: 'space-component', confidence: 0.8, context: 'Component spacing' },
      { pattern: /(element|item|inline)/, semantic: 'space-element', confidence: 0.75, context: 'Element spacing' },
      { pattern: /(gutter|column|grid)/, semantic: 'space-gutter', confidence: 0.8, context: 'Grid gutters' },
    ];

    // Check against semantic patterns
    for (const { pattern, semantic, confidence: patternConfidence, context } of semanticPatterns) {
      if (pattern.test(originalName)) {
        semanticName = semantic;
        confidence = patternConfidence;
        reasoning = `Identified as ${context} based on name pattern`;
        break;
      }
    }

    // Enhance with value-based analysis
    const valueContext = this.analyzeSpacingValue(spacing.value as number);
    if (valueContext.confidence > confidence * 0.8) {
      semanticName = valueContext.semanticName;
      confidence = Math.max(confidence, valueContext.confidence);
      reasoning += ` and spacing value analysis (${spacing.value}px)`;
    }

    // Use existing semantic name if available and confidence is low
    if (spacing.semanticName && confidence < 0.8) {
      semanticName = spacing.semanticName;
      confidence = Math.max(confidence, 0.75);
      reasoning += ` with predefined semantic name`;
    }

    return {
      originalName: spacing.name,
      semanticName,
      confidence,
      reasoning
    };
  }

  private enhanceColorSemantic(baseSemantic: string, originalName: string, color: ColorToken): string {
    // Extract intensity/weight from name or HSL values
    const intensity = this.extractColorIntensity(originalName, color);
    
    // If we have a number, append it
    if (intensity && intensity !== 'base') {
      return `${baseSemantic}-${intensity}`;
    }
    
    return baseSemantic;
  }

  private extractColorIntensity(name: string, color: ColorToken): string {
    // Check for explicit numbers
    const numberMatch = name.match(/(\d+)/);
    if (numberMatch) {
      return numberMatch[1];
    }
    
    // Check for intensity keywords
    const intensityMap: Record<string, string> = {
      'light': '200',
      'pale': '100',
      'bright': '400',
      'vivid': '600',
      'dark': '800',
      'deep': '900'
    };
    
    for (const [keyword, value] of Object.entries(intensityMap)) {
      if (name.includes(keyword)) {
        return value;
      }
    }
    
    // Analyze lightness to determine intensity
    const lightness = color.hsl.l;
    if (lightness > 90) return '50';
    if (lightness > 80) return '100';
    if (lightness > 70) return '200';
    if (lightness > 60) return '300';
    if (lightness > 50) return '400';
    if (lightness > 40) return '500';
    if (lightness > 30) return '600';
    if (lightness > 20) return '700';
    if (lightness > 10) return '800';
    return '900';
  }

  private analyzeColorHSL(hsl: { h: number; s: number; l: number }): { semanticName: string; confidence: number; reasoning: string } {
    const { h, s, l } = hsl;
    
    // Determine base color from hue
    let baseColor = 'neutral';
    if (s < 10) {
      baseColor = 'neutral';
    } else if (h >= 0 && h < 15) baseColor = 'red';
    else if (h >= 15 && h < 45) baseColor = 'orange';
    else if (h >= 45 && h < 75) baseColor = 'yellow';
    else if (h >= 75 && h < 150) baseColor = 'green';
    else if (h >= 150 && h < 210) baseColor = 'teal';
    else if (h >= 210 && h < 270) baseColor = 'blue';
    else if (h >= 270 && h < 330) baseColor = 'purple';
    else if (h >= 330 && h < 360) baseColor = 'pink';
    
    // Determine intensity from lightness
    const intensity = this.lightnessToIntensity(l);
    
    return {
      semanticName: `${baseColor}-${intensity}`,
      confidence: s > 20 ? 0.7 : 0.5, // Higher confidence for saturated colors
      reasoning: `HSL analysis: hue ${h}°, saturation ${s}%, lightness ${l}%`
    };
  }

  private lightnessToIntensity(lightness: number): string {
    if (lightness > 95) return '50';
    if (lightness > 85) return '100';
    if (lightness > 75) return '200';
    if (lightness > 65) return '300';
    if (lightness > 55) return '400';
    if (lightness > 45) return '500';
    if (lightness > 35) return '600';
    if (lightness > 25) return '700';
    if (lightness > 15) return '800';
    if (lightness > 5) return '900';
    return '950';
  }

  private analyzeTypographySize(fontSize: number): { semanticName: string; confidence: number; reasoning: string } {
    let semanticName = 'body-md';
    let confidence = 0.6;
    
    if (fontSize >= 48) {
      semanticName = 'display';
      confidence = 0.8;
    } else if (fontSize >= 32) {
      semanticName = 'heading-xl';
      confidence = 0.8;
    } else if (fontSize >= 24) {
      semanticName = 'heading-lg';
      confidence = 0.8;
    } else if (fontSize >= 20) {
      semanticName = 'heading-md';
      confidence = 0.8;
    } else if (fontSize >= 18) {
      semanticName = 'heading-sm';
      confidence = 0.75;
    } else if (fontSize >= 16) {
      semanticName = 'body-lg';
      confidence = 0.7;
    } else if (fontSize >= 14) {
      semanticName = 'body-md';
      confidence = 0.7;
    } else if (fontSize >= 12) {
      semanticName = 'body-sm';
      confidence = 0.7;
    } else {
      semanticName = 'caption';
      confidence = 0.75;
    }
    
    return {
      semanticName,
      confidence,
      reasoning: `Font size analysis: ${fontSize}px maps to ${semanticName}`
    };
  }

  private analyzeSpacingValue(value: number): { semanticName: string; confidence: number; reasoning: string } {
    let semanticName = 'space-md';
    let confidence = 0.6;
    
    if (value <= 2) {
      semanticName = 'space-px';
      confidence = 0.8;
    } else if (value <= 4) {
      semanticName = 'space-xs';
      confidence = 0.8;
    } else if (value <= 8) {
      semanticName = 'space-sm';
      confidence = 0.8;
    } else if (value <= 16) {
      semanticName = 'space-md';
      confidence = 0.8;
    } else if (value <= 24) {
      semanticName = 'space-lg';
      confidence = 0.8;
    } else if (value <= 32) {
      semanticName = 'space-xl';
      confidence = 0.8;
    } else if (value <= 48) {
      semanticName = 'space-xxl';
      confidence = 0.75;
    } else if (value <= 64) {
      semanticName = 'space-3xl';
      confidence = 0.7;
    } else {
      semanticName = 'space-4xl';
      confidence = 0.65;
    }
    
    return {
      semanticName,
      confidence,
      reasoning: `Spacing value analysis: ${value}px maps to ${semanticName}`
    };
  }

  private calculateOverallSemanticScore(
    colorSemantics: SemanticMapping[],
    typographySemantics: SemanticMapping[],
    spacingSemantics: SemanticMapping[]
  ): number {
    const allSemantics = colorSemantics.concat(typographySemantics).concat(spacingSemantics);
    
    if (allSemantics.length === 0) return 0;
    
    const totalConfidence = allSemantics.reduce((sum, semantic) => sum + semantic.confidence, 0);
    return totalConfidence / allSemantics.length;
  }

  private generateSemanticRecommendations(
    colorSemantics: SemanticMapping[],
    typographySemantics: SemanticMapping[],
    spacingSemantics: SemanticMapping[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Analyze color semantic quality
    const lowConfidenceColors = colorSemantics.filter(c => c.confidence < 0.7);
    if (lowConfidenceColors.length > 0) {
      recommendations.push(`${lowConfidenceColors.length} color tokens have unclear semantic meaning. Consider renaming for better AI tool comprehension.`);
    }
    
    // Analyze typography semantic quality
    const lowConfidenceTypography = typographySemantics.filter(t => t.confidence < 0.7);
    if (lowConfidenceTypography.length > 0) {
      recommendations.push(`${lowConfidenceTypography.length} typography tokens need clearer semantic names for optimal AI understanding.`);
    }
    
    // Analyze spacing semantic quality
    const lowConfidenceSpacing = spacingSemantics.filter(s => s.confidence < 0.7);
    if (lowConfidenceSpacing.length > 0) {
      recommendations.push(`${lowConfidenceSpacing.length} spacing tokens could benefit from more descriptive semantic names.`);
    }
    
    // Check for inconsistent naming patterns
    const colorNames = colorSemantics.map(c => c.semanticName);
    const typographyNames = typographySemantics.map(t => t.semanticName);
    const spacingNames = spacingSemantics.map(s => s.semanticName);
    
    if (!this.hasConsistentNaming(colorNames)) {
      recommendations.push('Color tokens use inconsistent naming patterns. Standardize for better AI tool integration.');
    }
    
    if (!this.hasConsistentNaming(typographyNames)) {
      recommendations.push('Typography tokens use inconsistent naming patterns. Consider systematic hierarchy naming.');
    }
    
    if (!this.hasConsistentNaming(spacingNames)) {
      recommendations.push('Spacing tokens use inconsistent naming patterns. Adopt a consistent spacing scale nomenclature.');
    }
    
    // Overall recommendations
    const overallScore = this.calculateOverallSemanticScore(colorSemantics, typographySemantics, spacingSemantics);
    
    if (overallScore >= 0.9) {
      recommendations.push('Excellent semantic naming! Your design system is well-optimized for AI tools.');
    } else if (overallScore >= 0.7) {
      recommendations.push('Good semantic foundation with room for improvement. Focus on low-confidence tokens.');
    } else {
      recommendations.push('Significant semantic improvements needed. Consider a comprehensive token naming review.');
    }
    
    return recommendations;
  }

  private hasConsistentNaming(names: string[]): boolean {
    if (names.length < 2) return true;
    
    // Check for consistent prefixes
    const prefixes = names.map(name => name.split('-')[0]);
    const uniquePrefixes = new Set(prefixes);
    
    // If more than 50% of names share common prefixes, consider it consistent
    return uniquePrefixes.size <= Math.ceil(names.length * 0.5);
  }

  // Method to suggest improved semantic names
  suggestImprovedNames(tokens: DesignToken[]): { token: DesignToken; suggestions: string[] }[] {
    return tokens.map(token => ({
      token,
      suggestions: this.generateNameSuggestions(token)
    }));
  }

  private generateNameSuggestions(token: DesignToken): string[] {
    const suggestions: string[] = [];
    
    switch (token.type) {
      case 'color':
        const colorToken = token as ColorToken;
        if (colorToken.semanticRole) {
          suggestions.push(`${colorToken.semanticRole}-primary`);
          suggestions.push(`color-${colorToken.semanticRole}`);
          suggestions.push(`${colorToken.semanticRole}-${this.extractColorIntensity(token.name, colorToken)}`);
        }
        break;
        
      case 'typography':
        const typoToken = token as TypographyToken;
        if (typoToken.fontSize >= 24) {
          suggestions.push('heading-xl', 'text-display', 'typography-hero');
        } else if (typoToken.fontSize >= 16) {
          suggestions.push('heading-md', 'text-heading', 'typography-title');
        } else {
          suggestions.push('body-md', 'text-body', 'typography-content');
        }
        break;
        
      case 'spacing':
        const spaceToken = token as SpacingToken;
        const value = spaceToken.value as number;
        if (value <= 8) {
          suggestions.push('space-sm', 'spacing-tight', 'gap-small');
        } else if (value <= 24) {
          suggestions.push('space-md', 'spacing-normal', 'gap-medium');
        } else {
          suggestions.push('space-lg', 'spacing-loose', 'gap-large');
        }
        break;
    }
    
    return suggestions;
  }
}