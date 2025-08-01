import { AnalyzedComponent, ComponentVariant, ComponentProp, AccessibilityInfo } from '../types';

export class ComponentExtractor {
  private componentTypePatterns: Record<string, RegExp[]> = {
    'button': [
      /btn|button/i,
      /cta|call.to.action/i,
      /link.*button|button.*link/i
    ],
    'input': [
      /input|field/i,
      /text.*field|field.*text/i,
      /search.*box|search.*field/i,
      /textarea/i
    ],
    'card': [
      /card/i,
      /tile/i,
      /panel/i
    ],
    'modal': [
      /modal|dialog/i,
      /popup|overlay/i,
      /drawer/i
    ],
    'navigation': [
      /nav|navigation/i,
      /menu/i,
      /breadcrumb/i,
      /tab/i
    ],
    'layout': [
      /container|wrapper/i,
      /grid|layout/i,
      /section|header|footer/i,
      /sidebar/i
    ]
  };

  async extractComponents(): Promise<AnalyzedComponent[]> {
    const components: AnalyzedComponent[] = [];
    const componentSets = figma.root.findAll(node => node.type === 'COMPONENT_SET');
    const singleComponents = figma.root.findAll(node => node.type === 'COMPONENT');

    // Process component sets (components with variants)
    for (const componentSet of componentSets as ComponentSetNode[]) {
      const analyzedComponent = await this.analyzeComponentSet(componentSet);
      components.push(analyzedComponent);
    }

    // Process single components
    for (const component of singleComponents as ComponentNode[]) {
      // Skip if it's part of a component set
      if (component.parent && component.parent.type !== 'COMPONENT_SET') {
        const analyzedComponent = await this.analyzeSingleComponent(component);
        components.push(analyzedComponent);
      }
    }

    return this.sortComponentsByImportance(components);
  }

  private async analyzeComponentSet(componentSet: ComponentSetNode): Promise<AnalyzedComponent> {
    const variants = await this.extractVariants(componentSet);
    const props = this.analyzeComponentProps(componentSet);
    const componentType = this.determineComponentType(componentSet.name);
    const semanticDescription = this.generateSemanticDescription(componentSet, componentType);
    const accessibility = await this.analyzeAccessibility(componentSet.children[0] as ComponentNode);
    const usage = this.generateUsageExamples(componentType, componentSet.name);

    return {
      name: componentSet.name,
      type: componentType,
      variants,
      props,
      usage,
      examples: this.generateCodeExamples(componentSet.name, componentType, variants, props),
      semanticDescription,
      accessibility
    };
  }

  private async analyzeSingleComponent(component: ComponentNode): Promise<AnalyzedComponent> {
    const componentType = this.determineComponentType(component.name);
    const semanticDescription = this.generateSemanticDescription(component, componentType);
    const accessibility = await this.analyzeAccessibility(component);
    const usage = this.generateUsageExamples(componentType, component.name);
    
    // For single components, create a default variant
    const variants: ComponentVariant[] = [{
      name: 'default',
      properties: {},
      description: 'Default variant of the component',
      usage: 'Standard implementation of the component'
    }];
    
    const props = this.inferPropsFromComponent(component);

    return {
      name: component.name,
      type: componentType,
      variants,
      props,
      usage,
      examples: this.generateCodeExamples(component.name, componentType, variants, props),
      semanticDescription,
      accessibility
    };
  }

  private async extractVariants(componentSet: ComponentSetNode): Promise<ComponentVariant[]> {
    const variants: ComponentVariant[] = [];
    
    for (const child of componentSet.children) {
      if (child.type === 'COMPONENT') {
        const component = child as ComponentNode;
        const variantProps = this.parseVariantProperties(component.name);
        
        variants.push({
          name: this.generateVariantName(variantProps),
          properties: variantProps,
          description: this.generateVariantDescription(variantProps),
          usage: this.generateVariantUsage(variantProps)
        });
      }
    }

    return variants;
  }

  private parseVariantProperties(componentName: string): Record<string, any> {
    // Parse Figma variant naming (e.g., "Button/Size=Large, State=Default")
    const properties: Record<string, any> = {};
    
    // Extract variant properties from component name
    const variantPart = componentName.split('/')[1];
    if (variantPart) {
      const pairs = variantPart.split(',').map(pair => pair.trim());
      
      for (const pair of pairs) {
        const [key, value] = pair.split('=').map(part => part.trim());
        if (key && value) {
          properties[key.toLowerCase()] = value.toLowerCase();
        }
      }
    }

    return properties;
  }

  private generateVariantName(properties: Record<string, any>): string {
    const values = Object.values(properties).filter(v => v !== 'default');
    return values.length > 0 ? values.join('-') : 'default';
  }

  private generateVariantDescription(properties: Record<string, any>): string {
    const descriptions: string[] = [];
    
    for (const [key, value] of Object.entries(properties)) {
      if (value !== 'default') {
        descriptions.push(`${key}: ${value}`);
      }
    }
    
    return descriptions.length > 0 
      ? `Variant with ${descriptions.join(', ')}`
      : 'Default variant';
  }

  private generateVariantUsage(properties: Record<string, any>): string {
    const usageContexts: Record<string, Record<string, string>> = {
      'size': {
        'small': 'Use in compact spaces or secondary actions',
        'medium': 'Standard size for most use cases',
        'large': 'Use for primary actions or emphasis'
      },
      'state': {
        'default': 'Normal interactive state',
        'hover': 'State when user hovers over element',
        'active': 'State when element is being pressed',
        'disabled': 'State when element is not interactive'
      },
      'variant': {
        'primary': 'Use for main actions and key interactions',
        'secondary': 'Use for supporting actions',
        'outline': 'Use for subtle actions or alternatives'
      }
    };

    const contexts: string[] = [];
    
    for (const [key, value] of Object.entries(properties)) {
      if (usageContexts[key] && usageContexts[key][value]) {
        contexts.push(usageContexts[key][value]);
      }
    }

    return contexts.length > 0 
      ? contexts.join('. ')
      : 'Standard usage variant';
  }

  private analyzeComponentProps(componentSet: ComponentSetNode): ComponentProp[] {
    let props: ComponentProp[] = [];
    const variantPropertyKeys = new Set<string>();

    // Collect all variant property keys
    for (const child of componentSet.children) {
      if (child.type === 'COMPONENT') {
        const component = child as ComponentNode;
        const variantProps = this.parseVariantProperties(component.name);
        Object.keys(variantProps).forEach(key => variantPropertyKeys.add(key));
      }
    }

    // Create props from variant properties
    for (const propKey of variantPropertyKeys) {
      const values = new Set<string>();
      
      // Collect all possible values for this property
      for (const child of componentSet.children) {
        if (child.type === 'COMPONENT') {
          const component = child as ComponentNode;
          const variantProps = this.parseVariantProperties(component.name);
          if (variantProps[propKey]) {
            values.add(variantProps[propKey]);
          }
        }
      }

      props.push({
        name: propKey,
        type: 'enum',
        required: false,
        enumValues: Array.from(values),
        description: this.generatePropDescription(propKey, Array.from(values)),
        default: values.has('default') ? 'default' : Array.from(values)[0]
      });
    }

    // Add common component props
    props = props.concat(this.getCommonProps());

    return props;
  }

  private inferPropsFromComponent(component: ComponentNode): ComponentProp[] {
    let props: ComponentProp[] = [];
    
    // Analyze component structure to infer possible props
    const textNodes = component.findAll(node => node.type === 'TEXT');
    if (textNodes.length > 0) {
      props.push({
        name: 'children',
        type: 'string',
        required: false,
        description: 'Text content or child elements',
        default: 'Component text'
      });
    }

    // Add common props
    props = props.concat(this.getCommonProps());

    return props;
  }

  private getCommonProps(): ComponentProp[] {
    return [
      {
        name: 'className',
        type: 'string',
        required: false,
        description: 'Additional CSS classes to apply',
        default: undefined
      },
      {
        name: 'disabled',
        type: 'boolean',
        required: false,
        description: 'Whether the component is disabled',
        default: false
      },
      {
        name: 'onClick',
        type: 'string',
        required: false,
        description: 'Click event handler',
        default: undefined
      }
    ];
  }

  private generatePropDescription(propKey: string, values: string[]): string {
    const descriptions: Record<string, string> = {
      'size': `Component size variant. Options: ${values.join(', ')}`,
      'variant': `Visual style variant. Options: ${values.join(', ')}`,
      'state': `Interactive state. Options: ${values.join(', ')}`,
      'type': `Component type or style. Options: ${values.join(', ')}`
    };

    return descriptions[propKey] || `${propKey} property with options: ${values.join(', ')}`;
  }

  private determineComponentType(name: string): AnalyzedComponent['type'] {
    const lowerName = name.toLowerCase();
    
    for (const [type, patterns] of Object.entries(this.componentTypePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerName)) {
          return type as AnalyzedComponent['type'];
        }
      }
    }

    return 'other';
  }

  private generateSemanticDescription(component: ComponentNode | ComponentSetNode, type: AnalyzedComponent['type']): string {
    const typeDescriptions: Record<string, string> = {
      'button': 'Interactive button component for user actions and navigation',
      'input': 'Form input component for collecting user data',
      'card': 'Container component for grouping related content',
      'modal': 'Overlay component for focused interactions and information',
      'navigation': 'Navigation component for site or app navigation',
      'layout': 'Layout component for structuring page content',
      'other': 'Custom component for specific interface needs'
    };

    const baseDescription = typeDescriptions[type];
    const componentName = component.name.toLowerCase();
    
    // Add specific context based on component name
    let contextualInfo = '';
    if (componentName.includes('primary')) {
      contextualInfo = ' Used for primary actions and key interactions.';
    } else if (componentName.includes('secondary')) {
      contextualInfo = ' Used for secondary actions and supporting interactions.';
    } else if (componentName.includes('small') || componentName.includes('compact')) {
      contextualInfo = ' Optimized for compact spaces and dense layouts.';
    } else if (componentName.includes('large') || componentName.includes('hero')) {
      contextualInfo = ' Designed for prominent placement and high visibility.';
    }

    return baseDescription + contextualInfo;
  }

  private generateUsageExamples(type: AnalyzedComponent['type'], name: string): string[] {
    const usageMap: Record<string, string[]> = {
      'button': [
        'Primary call-to-action buttons',
        'Form submission buttons',
        'Navigation and link buttons',
        'Confirmation and action dialogs'
      ],
      'input': [
        'Form fields for user data collection',
        'Search functionality',
        'Filtering and sorting controls',
        'User profile and settings forms'
      ],
      'card': [
        'Product or item displays',
        'Content previews and summaries',
        'Dashboard widgets and metrics',
        'User profiles and information panels'
      ],
      'modal': [
        'Confirmation dialogs',
        'Form overlays and data entry',
        'Image or content viewers',
        'Settings and configuration panels'
      ],
      'navigation': [
        'Main site navigation',
        'Breadcrumb trails',
        'Tab navigation within pages',
        'Mobile menu systems'
      ],
      'layout': [
        'Page structure and content organization',
        'Section dividers and containers',
        'Grid systems and responsive layouts',
        'Header, footer, and sidebar components'
      ]
    };

    return usageMap[type] || [
      `Custom usage for ${name} component`,
      'Interface-specific implementations',
      'Brand-specific design patterns'
    ];
  }

  private generateCodeExamples(name: string, type: AnalyzedComponent['type'], variants: ComponentVariant[], props: ComponentProp[]): string[] {
    const componentName = this.toPascalCase(name);
    const examples: string[] = [];

    // Basic usage example
    examples.push(`<${componentName}>Default ${type}</${componentName}>`);

    // Examples with variants
    for (const variant of variants.slice(0, 3)) { // Limit to 3 examples
      if (variant.name !== 'default') {
        const propsString = Object.entries(variant.properties)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');
        
        if (propsString) {
          examples.push(`<${componentName} ${propsString}>${type} with ${variant.name}</${componentName}>`);
        }
      }
    }

    // Example with common props
    const hasChildren = props.some(p => p.name === 'children');
    const hasOnClick = props.some(p => p.name === 'onClick');
    
    if (hasOnClick) {
      const content = hasChildren ? `Click me` : '';
      examples.push(`<${componentName} onClick={handleClick}${hasChildren ? `>${content}</${componentName}>` : ' />'}`);
    }

    // Disabled state example
    if (props.some(p => p.name === 'disabled')) {
      examples.push(`<${componentName} disabled>Disabled ${type}</${componentName}>`);
    }

    return examples;
  }

  private async analyzeAccessibility(component: ComponentNode): Promise<AccessibilityInfo> {
    const accessibility: AccessibilityInfo = {
      ariaLabels: [],
      keyboardNavigation: false,
      colorContrast: 'fail',
      focusManagement: false
    };

    // Check for text content and color contrast
    const textNodes = component.findAll(node => node.type === 'TEXT') as TextNode[];
    if (textNodes.length > 0) {
      // Simplified contrast check - in real implementation, would check actual colors
      accessibility.colorContrast = 'AA'; // Placeholder
    }

    // Check for interactive elements
    const interactiveElements = component.findAll(node => 
      node.type === 'FRAME' || node.type === 'RECTANGLE' || node.type === 'TEXT'
    );
    
    if (interactiveElements.length > 0) {
      accessibility.keyboardNavigation = true;
      accessibility.focusManagement = true;
    }

    // Generate ARIA label suggestions based on component type and content
    if (textNodes.length > 0) {
      const textContent = textNodes[0].characters;
      accessibility.ariaLabels.push(`aria-label="${textContent}"`);
    }

    return accessibility;
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private sortComponentsByImportance(components: AnalyzedComponent[]): AnalyzedComponent[] {
    const typeOrder: Record<string, number> = {
      'button': 1,
      'input': 2,
      'card': 3,
      'navigation': 4,
      'modal': 5,
      'layout': 6,
      'other': 7
    };

    return components.sort((a, b) => {
      const aOrder = typeOrder[a.type] || 999;
      const bOrder = typeOrder[b.type] || 999;
      
      if (aOrder === bOrder) {
        // Sort by number of variants (more variants = more important)
        return b.variants.length - a.variants.length;
      }
      
      return aOrder - bOrder;
    });
  }

  async extractComponentsFromSelection(): Promise<AnalyzedComponent[]> {
    const selection = figma.currentPage.selection;
    const components: AnalyzedComponent[] = [];

    for (const node of selection) {
      if (node.type === 'COMPONENT_SET') {
        const analyzed = await this.analyzeComponentSet(node as ComponentSetNode);
        components.push(analyzed);
      } else if (node.type === 'COMPONENT') {
        const analyzed = await this.analyzeSingleComponent(node as ComponentNode);
        components.push(analyzed);
      } else if (node.type === 'INSTANCE') {
        // Analyze component instance to understand usage
        const instance = node as InstanceNode;
        const mainComponent = instance.mainComponent;
        
        if (mainComponent) {
          const analyzed = await this.analyzeSingleComponent(mainComponent);
          components.push(analyzed);
        }
      }
    }

    return this.sortComponentsByImportance(components);
  }
}