import { TypographyToken } from '../types';
import { generateSemanticName } from '../utils/naming';

export class TypographyExtractor {
  private semanticTypeMap: Record<string, string> = {
    // Headings
    'h1': 'heading-xl',
    'h2': 'heading-lg', 
    'h3': 'heading-md',
    'h4': 'heading-sm',
    'h5': 'heading-xs',
    'h6': 'heading-xs',
    'heading': 'heading-md',
    'title': 'heading-lg',
    'display': 'heading-xl',
    'hero': 'heading-xl',
    
    // Body text
    'body': 'body-md',
    'text': 'body-md',
    'paragraph': 'body-md',
    'large': 'body-lg',
    'small': 'body-sm',
    'xs': 'body-xs',
    'sm': 'body-sm',
    'md': 'body-md',
    'lg': 'body-lg',
    'xl': 'body-xl',
    
    // Special text
    'caption': 'caption',
    'label': 'label',
    'button': 'button',
    'link': 'link',
    'code': 'code',
    'quote': 'quote',
    'blockquote': 'quote'
  };

  async extractTypography(): Promise<TypographyToken[]> {
    const textStyles = figma.getLocalTextStyles();
    const typographyTokens: TypographyToken[] = [];

    for (const style of textStyles) {
      const token = this.createTypographyToken(style);
      typographyTokens.push(token);
    }

    return this.sortTypographyByHierarchy(typographyTokens);
  }

  private createTypographyToken(style: TextStyle): TypographyToken {
    const semanticName = this.generateSemanticTypographyName(style.name);
    const semanticLevel = this.determineSemanticLevel(style.name, style.fontSize);
    
    return {
      name: style.name,
      value: this.generateTypographyValue(style),
      type: 'typography',
      fontFamily: style.fontName.family,
      fontSize: style.fontSize,
      fontWeight: this.mapFontWeight(style.fontName.style),
      lineHeight: this.calculateLineHeight(style),
      letterSpacing: style.letterSpacing ? style.letterSpacing.value : 0,
      textTransform: this.getTextTransform(style),
      semanticName,
      semanticLevel,
      description: style.description || this.generateTypographyDescription(semanticLevel, style),
      usage: this.generateTypographyUsage(semanticLevel, semanticName)
    };
  }

  private generateTypographyValue(style: TextStyle): string {
    const fontWeight = this.mapFontWeight(style.fontName.style);
    const lineHeight = this.calculateLineHeight(style);
    const letterSpacing = style.letterSpacing ? style.letterSpacing.value : 0;
    
    return `${style.fontSize}px/${lineHeight} "${style.fontName.family}", ${fontWeight}, ${letterSpacing}px`;
  }

  private generateSemanticTypographyName(originalName: string): string {
    const cleanName = originalName.toLowerCase()
      .replace(/[^a-z0-9\s\-_]/g, '')
      .replace(/\s+/g, '-');

    // Check for direct semantic matches
    for (const [key, semantic] of Object.entries(this.semanticTypeMap)) {
      if (cleanName.includes(key)) {
        return semantic;
      }
    }

    // Try to infer from size patterns
    if (cleanName.match(/(\d+)/)) {
      const size = parseInt(cleanName.match(/(\d+)/)![1]);
      if (size >= 32) return 'heading-xl';
      if (size >= 24) return 'heading-lg';
      if (size >= 20) return 'heading-md';
      if (size >= 16) return 'body-md';
      if (size >= 14) return 'body-sm';
      return 'caption';
    }

    // Default fallback
    return cleanName.replace(/[-_]/g, '-');
  }

  private determineSemanticLevel(name: string, fontSize: number): TypographyToken['semanticLevel'] {
    const lowerName = name.toLowerCase();
    
    // Check explicit semantic indicators
    if (lowerName.includes('display') || lowerName.includes('hero')) return 'heading-xl';
    if (lowerName.includes('h1') || lowerName.includes('title')) return 'heading-xl';
    if (lowerName.includes('h2')) return 'heading-lg';
    if (lowerName.includes('h3')) return 'heading-md';
    if (lowerName.includes('h4') || lowerName.includes('h5') || lowerName.includes('h6')) return 'heading-sm';
    if (lowerName.includes('caption') || lowerName.includes('small')) return 'caption';
    if (lowerName.includes('large')) return 'body-lg';
    
    // Infer from font size
    if (fontSize >= 32) return 'heading-xl';
    if (fontSize >= 24) return 'heading-lg';
    if (fontSize >= 20) return 'heading-md';
    if (fontSize >= 18) return 'heading-sm';
    if (fontSize >= 16) return 'body-lg';
    if (fontSize >= 14) return 'body-md';
    if (fontSize >= 12) return 'body-sm';
    
    return 'caption';
  }

  private mapFontWeight(fontStyle: string): number {
    const weightMap: Record<string, number> = {
      'Thin': 100,
      'Extra Light': 200,
      'ExtraLight': 200,
      'Light': 300,
      'Regular': 400,
      'Normal': 400,
      'Medium': 500,
      'Semi Bold': 600,
      'SemiBold': 600,
      'Bold': 700,
      'Extra Bold': 800,
      'ExtraBold': 800,
      'Black': 900,
      'Heavy': 900
    };

    return weightMap[fontStyle] || 400;
  }

  private calculateLineHeight(style: TextStyle): number {
    if (style.lineHeight && style.lineHeight.unit === 'PIXELS') {
      return style.lineHeight.value;
    } else if (style.lineHeight && style.lineHeight.unit === 'PERCENT') {
      return (style.fontSize * style.lineHeight.value) / 100;
    } else {
      // Default line height calculation
      return Math.round(style.fontSize * 1.4);
    }
  }

  private getTextTransform(style: TextStyle): string | undefined {
    if (style.textCase === 'UPPER') return 'uppercase';
    if (style.textCase === 'LOWER') return 'lowercase';
    if (style.textCase === 'TITLE') return 'capitalize';
    return undefined;
  }

  private generateTypographyDescription(level: TypographyToken['semanticLevel'], style: TextStyle): string {
    const descriptions: Record<string, string> = {
      'heading-xl': 'Extra large heading for hero sections and major page titles',
      'heading-lg': 'Large heading for section titles and important headings',
      'heading-md': 'Medium heading for subsections and component titles',
      'heading-sm': 'Small heading for minor sections and card titles',
      'body-lg': 'Large body text for introductory paragraphs and emphasis',
      'body-md': 'Standard body text for general content and descriptions',
      'body-sm': 'Small body text for secondary information and details',
      'caption': 'Caption text for image captions, footnotes, and micro-copy'
    };

    return descriptions[level!] || `Typography style for ${style.fontName.family} at ${style.fontSize}px`;
  }

  private generateTypographyUsage(level: TypographyToken['semanticLevel'], semanticName: string): string[] {
    const usageMap: Record<string, string[]> = {
      'heading-xl': [
        'Hero section headlines',
        'Main page titles',
        'Landing page headers',
        '<h1> elements for primary headings'
      ],
      'heading-lg': [
        'Section headings',
        'Page subtitles',
        'Major component titles',
        '<h2> elements for secondary headings'
      ],
      'heading-md': [
        'Subsection headings',
        'Card titles',
        'Modal headers',
        '<h3> elements for tertiary headings'
      ],
      'heading-sm': [
        'Minor section headings',
        'Form section labels',
        'Sidebar headings',
        '<h4-h6> elements for smaller headings'
      ],
      'body-lg': [
        'Lead paragraphs',
        'Introduction text',
        'Featured content',
        'Large body text for emphasis'
      ],
      'body-md': [
        'Main body text',
        'Paragraph content',
        'General descriptions',
        'Standard readable text'
      ],
      'body-sm': [
        'Secondary information',
        'Helper text',
        'Form descriptions',
        'Compact content areas'
      ],
      'caption': [
        'Image captions',
        'Footnotes',
        'Micro-copy',
        'Legal text and disclaimers'
      ]
    };

    return usageMap[level!] || [`Use for ${semanticName} text elements`];
  }

  private sortTypographyByHierarchy(typography: TypographyToken[]): TypographyToken[] {
    const hierarchy: Record<string, number> = {
      'heading-xl': 1,
      'heading-lg': 2,
      'heading-md': 3,
      'heading-sm': 4,
      'body-lg': 5,
      'body-md': 6,
      'body-sm': 7,
      'caption': 8
    };

    return typography.sort((a, b) => {
      const aOrder = hierarchy[a.semanticLevel!] || 999;
      const bOrder = hierarchy[b.semanticLevel!] || 999;
      
      if (aOrder === bOrder) {
        // If same hierarchy level, sort by font size descending
        return b.fontSize - a.fontSize;
      }
      
      return aOrder - bOrder;
    });
  }

  async extractTypographyFromSelection(): Promise<TypographyToken[]> {
    const selection = figma.currentPage.selection;
    const typographyTokens: TypographyToken[] = [];
    const seenStyles = new Set<string>();

    for (const node of selection) {
      await this.extractTypographyFromNode(node, typographyTokens, seenStyles);
    }

    return typographyTokens;
  }

  private async extractTypographyFromNode(node: SceneNode, tokens: TypographyToken[], seenStyles: Set<string>): Promise<void> {
    if (node.type === 'TEXT') {
      const textNode = node as TextNode;
      
      // Handle mixed text styles
      if (typeof textNode.fontName === 'object' && !Array.isArray(textNode.fontName)) {
        // Single font style
        const styleKey = `${textNode.fontName.family}-${textNode.fontName.style}-${String(textNode.fontSize)}`;
        
        if (!seenStyles.has(styleKey)) {
          seenStyles.add(styleKey);
          
          const token: TypographyToken = {
            name: `${textNode.name}-text`,
            value: this.generateTypographyValueFromNode(textNode),
            type: 'typography',
            fontFamily: textNode.fontName.family,
            fontSize: textNode.fontSize as number,
            fontWeight: this.mapFontWeight(textNode.fontName.style),
            lineHeight: this.calculateLineHeightFromNode(textNode),
            letterSpacing: (textNode.letterSpacing as LetterSpacing) ? (textNode.letterSpacing as LetterSpacing).value : 0,
            semanticName: this.generateSemanticTypographyName(textNode.name),
            description: `Typography extracted from ${textNode.name}`,
            usage: ['Extracted from design elements']
          };
          
          token.semanticLevel = this.determineSemanticLevel(token.name, token.fontSize);
          tokens.push(token);
        }
      }
    }

    // Recursively process children
    if ('children' in node) {
      for (const child of node.children) {
        await this.extractTypographyFromNode(child, tokens, seenStyles);
      }
    }
  }

  private generateTypographyValueFromNode(textNode: TextNode): string {
    const fontName = textNode.fontName as FontName;
    const fontSize = textNode.fontSize as number;
    const fontWeight = this.mapFontWeight(fontName.style);
    const lineHeight = this.calculateLineHeightFromNode(textNode);
    const letterSpacing = (textNode.letterSpacing as LetterSpacing) ? (textNode.letterSpacing as LetterSpacing).value : 0;
    
    return `${fontSize}px/${lineHeight} "${fontName.family}", ${fontWeight}, ${letterSpacing}px`;
  }

  private calculateLineHeightFromNode(textNode: TextNode): number {
    const lineHeight = textNode.lineHeight as LineHeight;
    const fontSize = textNode.fontSize as number;
    
    if (lineHeight && lineHeight.unit === 'PIXELS') {
      return lineHeight.value;
    } else if (lineHeight && lineHeight.unit === 'PERCENT') {
      return (fontSize * lineHeight.value) / 100;
    } else {
      return Math.round(fontSize * 1.4);
    }
  }
}