import { ColorToken, SemanticMapping } from '../types';
import { generateSemanticName, rgbToHex, rgbToHsl, calculateContrastRatio } from '../utils/naming';

export class ColorExtractor {
  private semanticColorMap: Record<string, string> = {
    // Primary brand colors
    'primary': 'brand-primary',
    'brand': 'brand-primary',
    'main': 'brand-primary',
    
    // Secondary colors
    'secondary': 'brand-secondary',
    'accent': 'brand-accent',
    
    // Semantic colors
    'success': 'semantic-success',
    'error': 'semantic-error',
    'warning': 'semantic-warning',
    'info': 'semantic-info',
    'danger': 'semantic-error',
    
    // Neutral colors
    'gray': 'neutral',
    'grey': 'neutral',
    'neutral': 'neutral',
    'black': 'neutral-900',
    'white': 'neutral-0',
    
    // Text colors
    'text': 'text-primary',
    'heading': 'text-heading',
    'body': 'text-body',
    'caption': 'text-caption',
    'muted': 'text-muted',
    
    // Background colors
    'background': 'bg-primary',
    'surface': 'bg-surface',
    'card': 'bg-card',
    
    // Border colors
    'border': 'border-primary',
    'divider': 'border-divider',
    'outline': 'border-outline'
  };

  async extractColors(): Promise<ColorToken[]> {
    const paintStyles = figma.getLocalPaintStyles();
    const colorTokens: ColorToken[] = [];

    for (const style of paintStyles) {
      if (style.paints.length > 0) {
        const paint = style.paints[0];
        
        if (paint.type === 'SOLID' && paint.color) {
          const rgb = {
            r: Math.round(paint.color.r * 255),
            g: Math.round(paint.color.g * 255),
            b: Math.round(paint.color.b * 255)
          };
          
          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
          const semanticName = this.generateSemanticColorName(style.name);
          const semanticRole = this.determineSemanticRole(style.name, hex);
          
          const colorToken: ColorToken = {
            name: style.name,
            value: hex,
            type: 'color',
            hex,
            rgb,
            hsl,
            semanticName,
            semanticRole,
            description: style.description || this.generateColorDescription(semanticRole, style.name),
            usage: this.generateUsageExamples(semanticRole, semanticName),
            contrastRatio: calculateContrastRatio(hex, '#FFFFFF')
          };
          
          colorTokens.push(colorToken);
        }
      }
    }

    return this.sortColorsBySemanticImportance(colorTokens);
  }

  private generateSemanticColorName(originalName: string): string {
    const cleanName = originalName.toLowerCase()
      .replace(/[^a-z0-9\s\-_]/g, '')
      .replace(/\s+/g, '-');

    // Check for direct semantic matches
    for (const [key, semantic] of Object.entries(this.semanticColorMap)) {
      if (cleanName.includes(key)) {
        // If it has a number (like primary-500), preserve it
        const numberMatch = cleanName.match(/(\d+)/);
        return numberMatch ? `${semantic}-${numberMatch[1]}` : semantic;
      }
    }

    // If no semantic match found, create a meaningful name
    return this.createMeaningfulColorName(cleanName);
  }

  private createMeaningfulColorName(name: string): string {
    // Extract color intensity/weight
    const weightMatch = name.match(/(\d+)$/);
    const weight = weightMatch ? weightMatch[1] : '';
    
    // Extract base color name
    const baseName = name.replace(/[-_]\d+$/, '').replace(/[-_]/g, '-');
    
    // Map common color names to semantic categories
    const colorCategories: Record<string, string> = {
      'blue': 'primary',
      'indigo': 'primary',
      'purple': 'accent',
      'pink': 'accent',
      'red': 'error',
      'orange': 'warning',
      'yellow': 'warning',
      'green': 'success',
      'teal': 'info',
      'cyan': 'info',
      'gray': 'neutral',
      'slate': 'neutral',
      'zinc': 'neutral',
      'stone': 'neutral'
    };

    const category = colorCategories[baseName] || baseName;
    return weight ? `${category}-${weight}` : category;
  }

  private determineSemanticRole(name: string, hex: string): ColorToken['semanticRole'] {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('primary') || lowerName.includes('brand')) return 'primary';
    if (lowerName.includes('secondary')) return 'secondary';
    if (lowerName.includes('accent')) return 'accent';
    if (lowerName.includes('success') || lowerName.includes('green')) return 'success';
    if (lowerName.includes('warning') || lowerName.includes('yellow') || lowerName.includes('orange')) return 'warning';
    if (lowerName.includes('error') || lowerName.includes('danger') || lowerName.includes('red')) return 'error';
    if (lowerName.includes('info') || lowerName.includes('blue') || lowerName.includes('cyan')) return 'info';
    if (lowerName.includes('gray') || lowerName.includes('neutral') || lowerName.includes('slate')) return 'neutral';
    
    return 'neutral';
  }

  private generateColorDescription(role: ColorToken['semanticRole'], originalName: string): string {
    const descriptions: Record<string, string> = {
      'primary': 'Primary brand color used for main actions and key interface elements',
      'secondary': 'Secondary brand color used for supporting actions and accents',
      'accent': 'Accent color used for highlights and special emphasis',
      'success': 'Success state color used for positive feedback and confirmations',
      'warning': 'Warning state color used for caution and important notices',
      'error': 'Error state color used for destructive actions and error messages',
      'info': 'Info state color used for informational messages and neutral highlights',
      'neutral': 'Neutral color used for text, borders, and background elements'
    };

    return descriptions[role!] || `Color extracted from ${originalName} style`;
  }

  private generateUsageExamples(role: ColorToken['semanticRole'], semanticName: string): string[] {
    const usageMap: Record<string, string[]> = {
      'primary': [
        `bg-${semanticName} for primary buttons and key CTAs`,
        `text-${semanticName} for primary text and links`,
        `border-${semanticName} for focused form inputs`
      ],
      'secondary': [
        `bg-${semanticName} for secondary buttons`,
        `text-${semanticName} for secondary text and labels`,
        `border-${semanticName} for secondary borders`
      ],
      'success': [
        `bg-${semanticName} for success messages and positive states`,
        `text-${semanticName} for success text and icons`,
        `border-${semanticName} for success form validation`
      ],
      'error': [
        `bg-${semanticName} for error messages and destructive actions`,
        `text-${semanticName} for error text and validation messages`,
        `border-${semanticName} for error form states`
      ],
      'warning': [
        `bg-${semanticName} for warning messages and caution states`,
        `text-${semanticName} for warning text and alerts`,
        `border-${semanticName} for warning form validation`
      ],
      'neutral': [
        `bg-${semanticName} for backgrounds and surfaces`,
        `text-${semanticName} for body text and secondary content`,
        `border-${semanticName} for dividers and subtle borders`
      ]
    };

    return usageMap[role!] || [`Use ${semanticName} for appropriate color applications`];
  }

  private sortColorsBySemanticImportance(colors: ColorToken[]): ColorToken[] {
    const priority: Record<string, number> = {
      'primary': 1,
      'secondary': 2,
      'accent': 3,
      'success': 4,
      'warning': 5,
      'error': 6,
      'info': 7,
      'neutral': 8
    };

    return colors.sort((a, b) => {
      const aPriority = priority[a.semanticRole!] || 999;
      const bPriority = priority[b.semanticRole!] || 999;
      return aPriority - bPriority;
    });
  }

  async extractColorsFromSelection(): Promise<ColorToken[]> {
    const selection = figma.currentPage.selection;
    const colorTokens: ColorToken[] = [];
    const seenColors = new Set<string>();

    for (const node of selection) {
      await this.extractColorsFromNode(node, colorTokens, seenColors);
    }

    return colorTokens;
  }

  private async extractColorsFromNode(node: SceneNode, colorTokens: ColorToken[], seenColors: Set<string>): Promise<void> {
    // Extract fill colors
    if ('fills' in node && node.fills) {
      for (const fill of node.fills as Paint[]) {
        if (fill.type === 'SOLID' && fill.color && !seenColors.has(JSON.stringify(fill.color))) {
          const rgb = {
            r: Math.round(fill.color.r * 255),
            g: Math.round(fill.color.g * 255),
            b: Math.round(fill.color.b * 255)
          };
          
          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          seenColors.add(JSON.stringify(fill.color));
          
          colorTokens.push({
            name: `extracted-${hex.substring(1)}`,
            value: hex,
            type: 'color',
            hex,
            rgb,
            hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
            semanticName: this.generateSemanticColorName(`color-${hex.substring(1)}`),
            description: `Color extracted from ${node.name}`,
            usage: ['Extracted from design elements']
          });
        }
      }
    }

    // Extract stroke colors
    if ('strokes' in node && node.strokes) {
      for (const stroke of node.strokes as Paint[]) {
        if (stroke.type === 'SOLID' && stroke.color && !seenColors.has(JSON.stringify(stroke.color))) {
          const rgb = {
            r: Math.round(stroke.color.r * 255),
            g: Math.round(stroke.color.g * 255),
            b: Math.round(stroke.color.b * 255)
          };
          
          const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
          seenColors.add(JSON.stringify(stroke.color));
          
          colorTokens.push({
            name: `stroke-${hex.substring(1)}`,
            value: hex,
            type: 'color',
            hex,
            rgb,
            hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
            semanticName: this.generateSemanticColorName(`border-${hex.substring(1)}`),
            description: `Stroke color extracted from ${node.name}`,
            usage: ['Extracted from design element strokes']
          });
        }
      }
    }

    // Recursively process children
    if ('children' in node) {
      for (const child of node.children) {
        await this.extractColorsFromNode(child, colorTokens, seenColors);
      }
    }
  }
}