import { SpacingToken } from '../types';

export class SpacingExtractor {
  private semanticSpacingMap: Record<string, string> = {
    // Component spacing
    'xs': 'space-xs',
    'sm': 'space-sm', 
    'md': 'space-md',
    'lg': 'space-lg',
    'xl': 'space-xl',
    'xxl': 'space-xxl',
    
    // Semantic spacing
    'tight': 'space-tight',
    'normal': 'space-normal',
    'loose': 'space-loose',
    
    // Layout spacing
    'section': 'space-section',
    'component': 'space-component',
    'element': 'space-element',
    'inline': 'space-inline',
    
    // Padding/margin specific
    'padding': 'space-padding',
    'margin': 'space-margin',
    'gap': 'space-gap'
  };

  async extractSpacing(): Promise<SpacingToken[]> {
    const spacingTokens: SpacingToken[] = [];
    
    // Analyze common spacing patterns from the document
    const spacingValues = await this.analyzeSpacingPatterns();
    
    // Create semantic spacing tokens
    for (const [value, usage] of spacingValues) {
      const semanticName = this.generateSemanticSpacingName(value, usage);
      
      const token: SpacingToken = {
        name: `spacing-${value}`,
        value: value,
        type: 'spacing',
        semanticName,
        description: this.generateSpacingDescription(value, usage),
        usage: this.generateSpacingUsage(semanticName, value)
      };
      
      spacingTokens.push(token);
    }

    return this.sortSpacingByValue(spacingTokens);
  }

  private async analyzeSpacingPatterns(): Promise<Map<number, string[]>> {
    const spacingMap = new Map<number, string[]>();
    
    // Analyze all frames and components for spacing patterns
    const pages = figma.root.children;
    
    for (const page of pages) {
      await this.analyzePageSpacing(page, spacingMap);
    }

    // Filter out very uncommon spacing values (less than 2 occurrences)
    const filteredSpacing = new Map<number, string[]>();
    for (const [value, usage] of spacingMap) {
      if (usage.length >= 2 || this.isCommonSpacingValue(value)) {
        filteredSpacing.set(value, usage);
      }
    }

    return filteredSpacing;
  }

  private async analyzePageSpacing(page: PageNode, spacingMap: Map<number, string[]>): Promise<void> {
    const nodes = page.findAll();
    
    for (const node of nodes) {
      this.analyzeNodeSpacing(node, spacingMap);
    }
  }

  private analyzeNodeSpacing(node: SceneNode, spacingMap: Map<number, string[]>): void {
    // Analyze padding (Auto Layout)
    if ('paddingLeft' in node && node.paddingLeft !== undefined) {
      this.recordSpacing(node.paddingLeft, 'padding', spacingMap);
      this.recordSpacing(node.paddingRight || 0, 'padding', spacingMap);
      this.recordSpacing(node.paddingTop || 0, 'padding', spacingMap);
      this.recordSpacing(node.paddingBottom || 0, 'padding', spacingMap);
    }

    // Analyze item spacing (Auto Layout)
    if ('itemSpacing' in node && node.itemSpacing !== undefined) {
      this.recordSpacing(node.itemSpacing, 'gap', spacingMap);
    }

    // Analyze gaps between elements
    if ('children' in node && node.children.length > 1) {
      this.analyzeChildrenGaps(node.children, spacingMap);
    }

    // Analyze margins (distance from parent edges)
    if (node.parent && 'children' in node.parent) {
      this.analyzeMargins(node, spacingMap);
    }
  }

  private analyzeChildrenGaps(children: readonly SceneNode[], spacingMap: Map<number, string[]>): void {
    for (let i = 0; i < children.length - 1; i++) {
      const current = children[i];
      const next = children[i + 1];
      
      // Calculate horizontal gap
      const horizontalGap = Math.abs(next.x - (current.x + current.width));
      if (horizontalGap > 0 && horizontalGap < 200) { // Reasonable gap range
        this.recordSpacing(horizontalGap, 'gap-horizontal', spacingMap);
      }
      
      // Calculate vertical gap
      const verticalGap = Math.abs(next.y - (current.y + current.height));
      if (verticalGap > 0 && verticalGap < 200) { // Reasonable gap range
        this.recordSpacing(verticalGap, 'gap-vertical', spacingMap);
      }
    }
  }

  private analyzeMargins(node: SceneNode, spacingMap: Map<number, string[]>): void {
    const parent = node.parent as SceneNode;
    
    if ('x' in parent && 'y' in parent) {
      // Calculate margin from parent edges
      const marginLeft = node.x - parent.x;
      const marginTop = node.y - parent.y;
      const marginRight = (parent.x + parent.width) - (node.x + node.width);
      const marginBottom = (parent.y + parent.height) - (node.y + node.height);
      
      if (marginLeft > 0 && marginLeft < 200) this.recordSpacing(marginLeft, 'margin', spacingMap);
      if (marginTop > 0 && marginTop < 200) this.recordSpacing(marginTop, 'margin', spacingMap);
      if (marginRight > 0 && marginRight < 200) this.recordSpacing(marginRight, 'margin', spacingMap);
      if (marginBottom > 0 && marginBottom < 200) this.recordSpacing(marginBottom, 'margin', spacingMap);
    }
  }

  private recordSpacing(value: number, context: string, spacingMap: Map<number, string[]>): void {
    // Round to nearest common spacing increment
    const roundedValue = this.roundToCommonSpacing(value);
    
    if (roundedValue > 0) {
      const existing = spacingMap.get(roundedValue) || [];
      if (!existing.includes(context)) {
        existing.push(context);
      }
      spacingMap.set(roundedValue, existing);
    }
  }

  private roundToCommonSpacing(value: number): number {
    // Common spacing increments (4px, 8px base systems)
    const increments = [4, 8];
    
    for (const increment of increments) {
      const rounded = Math.round(value / increment) * increment;
      if (Math.abs(value - rounded) <= 2) { // Within 2px tolerance
        return rounded;
      }
    }
    
    return Math.round(value);
  }

  private isCommonSpacingValue(value: number): boolean {
    // Common spacing values that should always be included
    const commonValues = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128];
    return commonValues.includes(value);
  }

  private generateSemanticSpacingName(value: number, usage: string[]): string {
    // Create semantic names based on usage patterns
    const hasGap = usage.some(u => u.includes('gap'));
    const hasPadding = usage.some(u => u.includes('padding'));
    const hasMargin = usage.some(u => u.includes('margin'));
    
    // Determine size category
    let sizeCategory = '';
    if (value <= 4) sizeCategory = 'xs';
    else if (value <= 8) sizeCategory = 'sm';
    else if (value <= 16) sizeCategory = 'md';
    else if (value <= 24) sizeCategory = 'lg';
    else if (value <= 32) sizeCategory = 'xl';
    else if (value <= 48) sizeCategory = 'xxl';
    else sizeCategory = 'xxxl';
    
    // Create context-aware name
    if (hasGap && !hasPadding && !hasMargin) {
      return `space-gap-${sizeCategory}`;
    } else if (hasPadding && !hasGap && !hasMargin) {
      return `space-padding-${sizeCategory}`;
    } else if (hasMargin && !hasGap && !hasPadding) {
      return `space-margin-${sizeCategory}`;
    } else {
      return `space-${sizeCategory}`;
    }
  }

  private generateSpacingDescription(value: number, usage: string[]): string {
    const contexts = usage.join(', ');
    const remValue = (value / 16).toFixed(2);
    
    return `${value}px (${remValue}rem) spacing used for ${contexts}`;
  }

  private generateSpacingUsage(semanticName: string, value: number): string[] {
    const baseUsage = [
      `Use ${semanticName} for consistent ${value}px spacing`,
      `Apply as padding, margin, or gap where ${value}px spacing is needed`
    ];

    // Add specific usage based on size
    if (value <= 8) {
      baseUsage.push('Ideal for tight spacing between related elements');
    } else if (value <= 16) {
      baseUsage.push('Good for standard component spacing');
    } else if (value <= 32) {
      baseUsage.push('Suitable for section spacing and larger components');
    } else {
      baseUsage.push('Use for major layout spacing and section breaks');
    }

    return baseUsage;
  }

  private sortSpacingByValue(tokens: SpacingToken[]): SpacingToken[] {
    return tokens.sort((a, b) => (a.value as number) - (b.value as number));
  }

  async extractSpacingFromSelection(): Promise<SpacingToken[]> {
    const selection = figma.currentPage.selection;
    const spacingMap = new Map<number, string[]>();
    
    for (const node of selection) {
      this.analyzeNodeSpacing(node, spacingMap);
    }

    const spacingTokens: SpacingToken[] = [];
    
    for (const [value, usage] of spacingMap) {
      const semanticName = this.generateSemanticSpacingName(value, usage);
      
      spacingTokens.push({
        name: `spacing-${value}`,
        value: value,
        type: 'spacing',
        semanticName,
        description: this.generateSpacingDescription(value, usage),
        usage: this.generateSpacingUsage(semanticName, value)
      });
    }

    return this.sortSpacingByValue(spacingTokens);
  }

  // Utility method to suggest spacing scale based on extracted values
  generateSpacingScale(tokens: SpacingToken[]): { scale: number[], recommendations: string[] } {
    const values = tokens.map(t => t.value as number).sort((a, b) => a - b);
    const recommendations: string[] = [];
    
    // Detect base unit
    const baseUnit = this.detectBaseUnit(values);
    recommendations.push(`Detected base spacing unit: ${baseUnit}px`);
    
    // Suggest consistent scale
    const suggestedScale = this.generateConsistentScale(baseUnit);
    recommendations.push(`Recommended spacing scale: ${suggestedScale.join(', ')}px`);
    
    // Identify gaps in current scale
    const missingValues = suggestedScale.filter(v => !values.includes(v));
    if (missingValues.length > 0) {
      recommendations.push(`Consider adding these spacing values: ${missingValues.join(', ')}px`);
    }
    
    return {
      scale: suggestedScale,
      recommendations
    };
  }

  private detectBaseUnit(values: number[]): number {
    // Check for common base units (4px, 8px)
    const potentialBases = [4, 8];
    
    for (const base of potentialBases) {
      const conformingValues = values.filter(v => v % base === 0);
      if (conformingValues.length / values.length >= 0.7) { // 70% conformance
        return base;
      }
    }
    
    return 8; // Default to 8px base
  }

  private generateConsistentScale(baseUnit: number): number[] {
    // Generate a consistent spacing scale based on the base unit
    const multipliers = [0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 20, 24];
    return multipliers.map(m => m * baseUnit).filter(v => v >= 0);
  }
}