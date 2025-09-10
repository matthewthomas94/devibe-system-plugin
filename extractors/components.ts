import { AnalyzedComponent, ComponentVariant, ComponentProp, AccessibilityInfo, ComponentUsageAnalysis } from '../types';

export class ComponentExtractor {
  private componentTypePatterns: Record<string, RegExp[]> = {
    'button': [
      /btn|button/i,
      /cta|call.to.action/i,
      /link.*button|button.*link/i,
      /action.*button|button.*action/i,
      /submit|confirm|cancel/i,
      /toggle.*button|switch.*button/i,
      /fab|floating.*action/i
    ],
    'input': [
      /input|field/i,
      /text.*field|field.*text/i,
      /search.*box|search.*field|search.*input/i,
      /textarea|text.*area/i,
      /form.*field|form.*input/i,
      /select|dropdown|combobox/i,
      /checkbox|radio|switch/i,
      /slider|range/i,
      /date.*picker|time.*picker/i,
      /upload|file.*input/i
    ],
    'card': [
      /card/i,
      /tile/i,
      /panel/i,
      /widget/i,
      /item.*card|product.*card/i,
      /post.*card|article.*card/i,
      /user.*card|profile.*card/i
    ],
    'modal': [
      /modal|dialog/i,
      /popup|overlay/i,
      /drawer/i,
      /sheet.*modal|bottom.*sheet/i,
      /alert.*dialog|confirm.*dialog/i,
      /toast|notification/i,
      /tooltip|popover/i,
      /lightbox/i
    ],
    'navigation': [
      /nav|navigation/i,
      /menu/i,
      /breadcrumb/i,
      /tab/i,
      /sidebar|side.*nav/i,
      /top.*nav|header.*nav/i,
      /pagination/i,
      /stepper/i,
      /progress.*nav/i
    ],
    'layout': [
      /container|wrapper/i,
      /grid|layout/i,
      /section|header|footer/i,
      /sidebar/i,
      /main.*content|content.*area/i,
      /hero.*section/i,
      /banner/i,
      /divider|separator/i,
      /spacer/i
    ],
    'table': [
      /table|data.*table/i,
      /grid.*view|list.*view/i,
      /row|column/i,
      /cell|header.*cell/i
    ],
    'form': [
      /form/i,
      /fieldset/i,
      /form.*group/i,
      /validation/i
    ],
    'media': [
      /image|img/i,
      /avatar|profile.*pic/i,
      /video|media/i,
      /icon/i,
      /logo/i,
      /badge|chip|tag/i
    ],
    'feedback': [
      /loading|spinner/i,
      /progress.*bar|progress.*indicator/i,
      /skeleton|placeholder/i,
      /error.*state|empty.*state/i,
      /success.*message|error.*message/i
    ]
  };

  async extractComponents(): Promise<AnalyzedComponent[]> {
    console.log('🔍 Starting comprehensive component extraction...');
    const components: AnalyzedComponent[] = [];
    const processedComponents = new Set<string>();

    // Strategy 1: Find all component sets and components globally
    console.log('Finding all component sets...');
    const componentSets = figma.root.findAll(node => node.type === 'COMPONENT_SET') as ComponentSetNode[];
    console.log(`Found ${componentSets.length} component sets`);

    console.log('Finding all single components...');
    const singleComponents = figma.root.findAll(node => node.type === 'COMPONENT') as ComponentNode[];
    console.log(`Found ${singleComponents.length} single components`);

    // Strategy 2: Also find components through instances (reverse lookup)
    console.log('Finding components through instances...');
    const instances = figma.root.findAll(node => node.type === 'INSTANCE') as InstanceNode[];
    console.log(`Found ${instances.length} component instances`);

    const componentsFromInstances = new Set<ComponentNode | ComponentSetNode>();
    for (const instance of instances) {
      if (instance.mainComponent) {
        if (instance.mainComponent.parent && instance.mainComponent.parent.type === 'COMPONENT_SET') {
          componentsFromInstances.add(instance.mainComponent.parent as ComponentSetNode);
        } else {
          componentsFromInstances.add(instance.mainComponent);
        }
      }
    }
    console.log(`Found ${componentsFromInstances.size} additional components through instances`);

    // Strategy 3: Deep search in all pages for missed components
    console.log('Performing deep search across all pages...');
    for (const page of figma.root.children) {
      await this.deepSearchForComponents(page, componentsFromInstances);
    }

    // Process component sets
    for (const componentSet of componentSets) {
      if (!processedComponents.has(componentSet.id)) {
        try {
          console.log(`Analyzing component set: ${componentSet.name}`);
          const analyzedComponent = await this.analyzeComponentSet(componentSet);
          components.push(analyzedComponent);
          processedComponents.add(componentSet.id);
        } catch (error) {
          console.warn(`Error analyzing component set ${componentSet.name}:`, error);
        }
      }
    }

    // Process single components (skip if part of component set)
    for (const component of singleComponents) {
      if (!processedComponents.has(component.id) && 
          (!component.parent || component.parent.type !== 'COMPONENT_SET')) {
        try {
          console.log(`Analyzing single component: ${component.name}`);
          const analyzedComponent = await this.analyzeSingleComponent(component);
          components.push(analyzedComponent);
          processedComponents.add(component.id);
        } catch (error) {
          console.warn(`Error analyzing component ${component.name}:`, error);
        }
      }
    }

    // Process components found through instances
    for (const componentFromInstance of componentsFromInstances) {
      if (!processedComponents.has(componentFromInstance.id)) {
        try {
          if (componentFromInstance.type === 'COMPONENT_SET') {
            console.log(`Analyzing component set from instance: ${componentFromInstance.name}`);
            const analyzedComponent = await this.analyzeComponentSet(componentFromInstance);
            components.push(analyzedComponent);
          } else if (componentFromInstance.type === 'COMPONENT') {
            console.log(`Analyzing component from instance: ${componentFromInstance.name}`);
            const analyzedComponent = await this.analyzeSingleComponent(componentFromInstance);
            components.push(analyzedComponent);
          }
          processedComponents.add(componentFromInstance.id);
        } catch (error) {
          console.warn(`Error analyzing component from instance ${componentFromInstance.name}:`, error);
        }
      }
    }

    console.log(`🎉 Component extraction complete! Found ${components.length} total components`);
    this.logComponentSummary(components);

    return this.sortComponentsByImportance(components);
  }

  private async deepSearchForComponents(node: BaseNode, foundComponents: Set<ComponentNode | ComponentSetNode>): Promise<void> {
    // Search for components in nested structures
    if ('children' in node) {
      for (const child of node.children) {
        if (child.type === 'COMPONENT_SET') {
          foundComponents.add(child as ComponentSetNode);
        } else if (child.type === 'COMPONENT') {
          foundComponents.add(child as ComponentNode);
        } else if (child.type === 'INSTANCE') {
          const instance = child as InstanceNode;
          if (instance.mainComponent) {
            if (instance.mainComponent.parent && instance.mainComponent.parent.type === 'COMPONENT_SET') {
              foundComponents.add(instance.mainComponent.parent as ComponentSetNode);
            } else {
              foundComponents.add(instance.mainComponent);
            }
          }
        }
        
        // Recurse into child nodes
        await this.deepSearchForComponents(child, foundComponents);
      }
    }
  }

  private logComponentSummary(components: AnalyzedComponent[]): void {
    const summary = components.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Component Summary by Type:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} components`);
    });

    console.log('\n📝 Found Components:');
    components.forEach(comp => {
      console.log(`  - ${comp.name} (${comp.type}) with ${comp.variants.length} variants`);
    });
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
    
    // Analyze component usage through instances
    const usageAnalysis = await this.analyzeComponentUsage(component);
    const usage = this.generateUsageExamples(componentType, component.name, usageAnalysis);
    
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

  private async analyzeComponentUsage(component: ComponentNode): Promise<ComponentUsageAnalysis> {
    const instances = figma.root.findAll(node => 
      node.type === 'INSTANCE' && (node as InstanceNode).mainComponent?.id === component.id
    ) as InstanceNode[];

    const usageContexts = new Set<string>();
    const usageFrequency = instances.length;
    const pageUsage = new Set<string>();

    for (const instance of instances) {
      // Analyze where the component is used
      let currentNode: BaseNode | null = instance.parent;
      while (currentNode) {
        if (currentNode.type === 'PAGE') {
          pageUsage.add(currentNode.name);
          break;
        }
        
        // Detect usage context from parent names
        if (currentNode.name) {
          const parentName = currentNode.name.toLowerCase();
          if (parentName.includes('form')) usageContexts.add('forms');
          if (parentName.includes('nav') || parentName.includes('menu')) usageContexts.add('navigation');
          if (parentName.includes('modal') || parentName.includes('dialog')) usageContexts.add('modals');
          if (parentName.includes('card') || parentName.includes('list')) usageContexts.add('content-display');
          if (parentName.includes('header') || parentName.includes('footer')) usageContexts.add('layout');
        }
        
        currentNode = currentNode.parent;
      }
    }

    return {
      instanceCount: usageFrequency,
      usageContexts: Array.from(usageContexts),
      pagesUsed: Array.from(pageUsage),
      examples: instances.slice(0, 5).map(instance => ({
        name: instance.name,
        page: this.findParentPage(instance)?.name || 'Unknown',
        context: this.determineInstanceContext(instance)
      }))
    };
  }

  private findParentPage(node: BaseNode): PageNode | null {
    let current: BaseNode | null = node;
    while (current && current.type !== 'PAGE') {
      current = current.parent;
    }
    return current as PageNode | null;
  }

  private determineInstanceContext(instance: InstanceNode): string {
    const parent = instance.parent;
    if (!parent) return 'root';
    
    const parentName = parent.name.toLowerCase();
    if (parentName.includes('form')) return 'form';
    if (parentName.includes('nav') || parentName.includes('menu')) return 'navigation';
    if (parentName.includes('modal')) return 'modal';
    if (parentName.includes('card')) return 'card';
    if (parentName.includes('list')) return 'list';
    
    return parent.type.toLowerCase();
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

  private generateUsageExamples(type: AnalyzedComponent['type'], name: string, usageAnalysis?: ComponentUsageAnalysis): string[] {
    const defaultUsageMap: Record<string, string[]> = {
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
      ],
      'table': [
        'Data display and analysis',
        'Product listings and comparisons',
        'Dashboard metrics and reports',
        'User management interfaces'
      ],
      'form': [
        'User registration and login',
        'Settings and preferences',
        'Content creation and editing',
        'Survey and feedback collection'
      ],
      'media': [
        'User profile pictures and avatars',
        'Product images and galleries',
        'Brand logos and icons',
        'Content thumbnails and previews'
      ],
      'feedback': [
        'Loading states during data fetch',
        'Form validation and error messages',
        'Success confirmations',
        'Progress indicators for multi-step processes'
      ]
    };

    let examples = defaultUsageMap[type] || [
      `Custom usage for ${name} component`,
      'Interface-specific implementations',
      'Brand-specific design patterns'
    ];

    // Enhance with actual usage analysis if available
    if (usageAnalysis) {
      const contextBasedExamples: string[] = [];
      
      // Add usage frequency information
      if (usageAnalysis.instanceCount > 0) {
        contextBasedExamples.push(`Used ${usageAnalysis.instanceCount} times across the design system`);
      }
      
      // Add context-specific examples
      if (usageAnalysis.usageContexts.length > 0) {
        contextBasedExamples.push(`Found in: ${usageAnalysis.usageContexts.join(', ')} contexts`);
      }
      
      // Add page-specific usage
      if (usageAnalysis.pagesUsed.length > 0) {
        contextBasedExamples.push(`Used on pages: ${usageAnalysis.pagesUsed.slice(0, 3).join(', ')}${usageAnalysis.pagesUsed.length > 3 ? ' and more' : ''}`);
      }
      
      // Add specific usage examples
      if (usageAnalysis.examples.length > 0) {
        const specificExamples = usageAnalysis.examples.slice(0, 2).map(example => 
          `${example.name} in ${example.context} on ${example.page} page`
        );
        contextBasedExamples.push(...specificExamples.map(ex => `Example: ${ex}`));
      }
      
      // Combine default and context-based examples
      examples = [...contextBasedExamples, ...examples.slice(0, 2)];
    }

    return examples.slice(0, 6); // Limit to 6 examples max
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
      'form': 3,
      'card': 4,
      'table': 5,
      'navigation': 6,
      'modal': 7,
      'media': 8,
      'feedback': 9,
      'layout': 10,
      'other': 11
    };

    return components.sort((a, b) => {
      const aOrder = typeOrder[a.type] || 999;
      const bOrder = typeOrder[b.type] || 999;
      
      if (aOrder === bOrder) {
        // Sort by number of variants (more variants = more important)
        if (a.variants.length !== b.variants.length) {
          return b.variants.length - a.variants.length;
        }
        
        // Then sort by usage frequency if available
        const aUsage = a.usage.find(u => u.includes('Used ') && u.includes('times'));
        const bUsage = b.usage.find(u => u.includes('Used ') && u.includes('times'));
        
        if (aUsage && bUsage) {
          const aCount = parseInt(aUsage.match(/\d+/)?.[0] || '0');
          const bCount = parseInt(bUsage.match(/\d+/)?.[0] || '0');
          return bCount - aCount;
        }
        
        // Finally sort alphabetically
        return a.name.localeCompare(b.name);
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