import { AnalyzedComponent, ComponentVariant, ComponentProp, ExtractionConfig } from '../types';

export class ComponentLibraryGenerator {
  private config: ExtractionConfig;
  
  constructor(config: ExtractionConfig) {
    this.config = config;
  }

  generateComponentLibrary(components: AnalyzedComponent[]): string {
    const libraryParts: string[] = [];
    
    // Add library header and imports
    libraryParts.push(this.generateLibraryHeader());
    libraryParts.push(this.generateImports());
    
    // Generate TypeScript interfaces
    libraryParts.push(this.generateTypeDefinitions(components));
    
    // Generate individual components
    for (const component of components) {
      libraryParts.push(this.generateComponent(component));
    }
    
    // Generate component index
    libraryParts.push(this.generateComponentIndex(components));
    
    // Add usage examples and documentation
    libraryParts.push(this.generateUsageDocumentation(components));
    
    return libraryParts.join('\n\n');
  }

  private generateLibraryHeader(): string {
    return `/**
 * AI-Optimized Component Library
 * Generated from Figma Design System
 * 
 * This component library provides ready-to-use React components
 * optimized for AI prototyping tools. Each component includes:
 * - Comprehensive TypeScript types
 * - Extensive JSDoc documentation
 * - Multiple usage examples
 * - Accessibility features
 * - Responsive design support
 * 
 * Compatible with: React 16.8+, TypeScript 4.0+
 * AI Tools: Bolt, v0, Loveable, Cursor, and other AI prototyping platforms
 * 
 * Usage Instructions:
 * 1. Copy components into your src/components directory
 * 2. Import and use components in your application
 * 3. Customize styling using provided CSS classes or styled-components
 * 4. Refer to examples and documentation for best practices
 */`;
  }

  private generateImports(): string {
    return `import React, { forwardRef, ReactNode, ButtonHTMLAttributes, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

// Type definitions for component props
interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}`;
  }

  private generateTypeDefinitions(components: AnalyzedComponent[]): string {
    const types: string[] = [];
    
    types.push('// Component Type Definitions');
    types.push('// These interfaces provide full TypeScript support for AI tools');
    types.push('');
    
    for (const component of components) {
      const componentName = this.toPascalCase(component.name);
      const propsInterface = `${componentName}Props`;
      
      types.push(`/**`);
      types.push(` * Props interface for ${componentName} component`);
      types.push(` * ${component.semanticDescription}`);
      types.push(` * 
       * @example
       * // Basic usage
       * <${componentName}>Default content</${componentName}>
       * 
       * // With props
       * <${componentName} size="large" variant="primary">
       *   Click me
       * </${componentName}>
       */`);
      
      types.push(`export interface ${propsInterface} extends BaseComponentProps {`);
      
      // Generate props from component analysis
      for (const prop of component.props) {
        const optional = prop.required ? '' : '?';
        const typeAnnotation = this.getTypeAnnotation(prop);
        
        types.push(`  /**`);
        types.push(`   * ${prop.description}`);
        if (prop.enumValues) {
          types.push(`   * @options ${prop.enumValues.join(', ')}`);
        }
        if (prop.default !== undefined) {
          types.push(`   * @default ${JSON.stringify(prop.default)}`);
        }
        types.push(`   */`);
        types.push(`  ${prop.name}${optional}: ${typeAnnotation};`);
        types.push('');
      }
      
      types.push('}');
      types.push('');
    }
    
    return types.join('\n');
  }

  private generateComponent(component: AnalyzedComponent): string {
    const componentName = this.toPascalCase(component.name);
    const propsInterface = `${componentName}Props`;
    const componentParts: string[] = [];
    
    // Component header with documentation
    componentParts.push(`/**`);
    componentParts.push(` * ${componentName} Component`);
    componentParts.push(` * `);
    componentParts.push(` * ${component.semanticDescription}`);
    componentParts.push(` * `);
    componentParts.push(` * @component`);
    componentParts.push(` * @example`);
    
    // Add usage examples from component analysis
    for (const example of component.examples.slice(0, 3)) {
      componentParts.push(` * ${example}`);
    }
    
    componentParts.push(` * `);
    componentParts.push(` * @accessibility`);
    componentParts.push(` * - Keyboard navigation: ${component.accessibility.keyboardNavigation ? 'Supported' : 'Not supported'}`);
    componentParts.push(` * - Screen reader: Compatible with ARIA labels`);
    componentParts.push(` * - Color contrast: ${component.accessibility.colorContrast} compliant`);
    componentParts.push(` * `);
    componentParts.push(` * @usage`);
    for (const usage of component.usage.slice(0, 3)) {
      componentParts.push(` * - ${usage}`);
    }
    componentParts.push(` */`);
    
    // Component implementation
    const baseElement = this.getBaseElement(component.type);
    const isForwardRef = ['button', 'input'].includes(component.type);
    
    if (isForwardRef) {
      componentParts.push(`export const ${componentName} = forwardRef<HTML${this.capitalizeFirst(baseElement)}Element, ${propsInterface}>(`);
      componentParts.push(`  ({ children, className, testId, restProps }, ref) => {`);
    } else {
      componentParts.push(`export const ${componentName}: React.FC<${propsInterface}> = (`);
      componentParts.push(`  { children, className, testId, restProps }`);
      componentParts.push(`) => {`);
    }
    
    // Component logic
    componentParts.push(`    // Generate CSS classes based on props and variants`);
    componentParts.push(`    const baseClasses = '${this.generateBaseClasses(component)}';`);
    componentParts.push(`    const variantClasses = ${this.generateVariantClasses(component)};`);
    componentParts.push(`    const combinedClasses = clsx(baseClasses, variantClasses, className);`);
    componentParts.push('');
    
    // Add accessibility attributes
    componentParts.push(`    // Accessibility attributes`);
    componentParts.push(`    const accessibilityProps = {`);
    componentParts.push(`      'data-testid': testId,`);
    if (component.accessibility.ariaLabels.length > 0) {
      componentParts.push(`      'aria-label': props['aria-label'] || '${component.name}',`);
    }
    if (component.type === 'button') {
      componentParts.push(`      role: 'button',`);
      componentParts.push(`      tabIndex: props.disabled ? -1 : 0,`);
    }
    componentParts.push(`    };`);
    componentParts.push('');
    
    // Return JSX
    const refProp = isForwardRef ? ' ref={ref}' : '';
    componentParts.push(`    return (`);
    componentParts.push(`      <${baseElement}`);
    componentParts.push(`        className={combinedClasses}`);
    componentParts.push(`        accessibilityProps`);
    componentParts.push(`        restProps${refProp}`);
    componentParts.push(`      >`);
    componentParts.push(`        {children}`);
    componentParts.push(`      </${baseElement}>`);
    componentParts.push(`    );`);
    
    if (isForwardRef) {
      componentParts.push(`  }`);
      componentParts.push(`);`);
      componentParts.push('');
      componentParts.push(`${componentName}.displayName = '${componentName}';`);
    } else {
      componentParts.push(`};`);
    }
    
    // Add variant helper functions
    if (component.variants.length > 1) {
      componentParts.push('');
      componentParts.push(`// ${componentName} variant helpers`);
      componentParts.push(`// These functions help AI tools understand component variations`);
      componentParts.push('');
      
      for (const variant of component.variants) {
        if (variant.name !== 'default') {
          const variantName = this.toPascalCase(variant.name);
          componentParts.push(`/**`);
          componentParts.push(` * ${componentName} ${variantName} variant`);
          componentParts.push(` * ${variant.description}`);
          componentParts.push(` * ${variant.usage}`);
          componentParts.push(` */`);
          
          const variantProps = Object.entries(variant.properties)
            .map(([key, value]) => `${key}="${value}"`)
            .join(' ');
          
          componentParts.push(`export const ${componentName}${variantName}: React.FC<Omit<${propsInterface}, ${Object.keys(variant.properties).map(k => `'${k}'`).join(' | ')}>> = (props) => (`);
          componentParts.push(`  <${componentName} ${variantProps} restProps />`);
          componentParts.push(`);`);
          componentParts.push('');
        }
      }
    }
    
    return componentParts.join('\n');
  }

  private generateComponentIndex(components: AnalyzedComponent[]): string {
    const indexParts: string[] = [];
    
    indexParts.push(`// Component Library Index`);
    indexParts.push(`// Export all components for easy importing`);
    indexParts.push('');
    
    // Export components
    indexParts.push(`// Main Components`);
    for (const component of components) {
      const componentName = this.toPascalCase(component.name);
      indexParts.push(`export { ${componentName} } from './${componentName}';`);
      indexParts.push(`export type { ${componentName}Props } from './${componentName}';`);
    }
    
    indexParts.push('');
    
    // Export variant components
    indexParts.push(`// Component Variants`);
    for (const component of components) {
      const componentName = this.toPascalCase(component.name);
      for (const variant of component.variants) {
        if (variant.name !== 'default') {
          const variantName = this.toPascalCase(variant.name);
          indexParts.push(`export { ${componentName}${variantName} } from './${componentName}';`);
        }
      }
    }
    
    indexParts.push('');
    
    // Component registry for AI tools
    indexParts.push(`// Component Registry for AI Tools`);
    indexParts.push(`// This registry helps AI understand available components and their purposes`);
    indexParts.push(`export const ComponentRegistry = {`);
    
    for (const component of components) {
      const componentName = this.toPascalCase(component.name);
      indexParts.push(`  ${componentName}: {`);
      indexParts.push(`    component: ${componentName},`);
      indexParts.push(`    type: '${component.type}',`);
      indexParts.push(`    description: '${component.semanticDescription}',`);
      indexParts.push(`    usage: [${component.usage.map(u => `'${u}'`).join(', ')}],`);
      indexParts.push(`    examples: [${component.examples.map(e => `'${e}'`).join(', ')}],`);
      indexParts.push(`    variants: [${component.variants.map(v => `'${v.name}'`).join(', ')}],`);
      indexParts.push(`    accessibility: ${JSON.stringify(component.accessibility)}`);
      indexParts.push(`  },`);
    }
    
    indexParts.push(`} as const;`);
    
    return indexParts.join('\n');
  }

  private generateUsageDocumentation(components: AnalyzedComponent[]): string {
    const docParts: string[] = [];
    
    docParts.push(`/**`);
    docParts.push(` * Component Library Usage Guide`);
    docParts.push(` * `);
    docParts.push(` * This guide provides comprehensive examples for AI prototyping tools.`);
    docParts.push(` * Copy and paste these examples directly into your AI tool prompts.`);
    docParts.push(` * `);
    docParts.push(` * QUICK START EXAMPLES:`);
    docParts.push(` * `);
    
    for (const component of components.slice(0, 5)) { // Limit to first 5 for readability
      const componentName = this.toPascalCase(component.name);
      docParts.push(` * ${component.type.toUpperCase()} COMPONENT (${componentName}):`);
      docParts.push(` * Purpose: ${component.semanticDescription}`);
      docParts.push(` * `);
      
      for (const example of component.examples.slice(0, 2)) {
        docParts.push(` * ${example}`);
      }
      
      docParts.push(` * `);
    }
    
    docParts.push(` * RESPONSIVE USAGE:`);
    docParts.push(` * All components support responsive props and CSS classes.`);
    docParts.push(` * Use breakpoint prefixes: sm:, md:, lg:, xl:`);
    docParts.push(` * `);
    docParts.push(` * Example: <Button className="w-full md:w-auto lg:px-8">Responsive Button</Button>`);
    docParts.push(` * `);
    docParts.push(` * ACCESSIBILITY NOTES:`);
    docParts.push(` * - All components include ARIA attributes`);
    docParts.push(` * - Keyboard navigation is supported where applicable`);
    docParts.push(` * - Color contrast meets WCAG guidelines`);
    docParts.push(` * - Screen reader compatible`);
    docParts.push(` * `);
    docParts.push(` * CUSTOMIZATION:`);
    docParts.push(` * - Use className prop for additional styling`);
    docParts.push(` * - Override component variants with props`);
    docParts.push(` * - Extend components using composition`);
    docParts.push(` * `);
    docParts.push(` * AI TOOL INTEGRATION:`);
    docParts.push(` * When using with AI tools, provide this context:`);
    docParts.push(` * "Use the component library with semantic, accessible components.`);
    docParts.push(` * Each component has variants and follows design system principles.`);
    docParts.push(` * Refer to ComponentRegistry for available options."`);
    docParts.push(` */`);
    
    return docParts.join('\n');
  }

  // Helper methods
  private toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getBaseElement(type: AnalyzedComponent['type']): string {
    const elementMap: Record<string, string> = {
      'button': 'button',
      'input': 'input',
      'card': 'div',
      'modal': 'div',
      'navigation': 'nav',
      'layout': 'div',
      'other': 'div'
    };
    
    return elementMap[type] || 'div';
  }

  private getTypeAnnotation(prop: ComponentProp): string {
    switch (prop.type) {
      case 'string':
        return prop.enumValues ? `'${prop.enumValues.join("' | '")}'` : 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'enum':
        return prop.enumValues ? `'${prop.enumValues.join("' | '")}'` : 'string';
      default:
        return 'string';
    }
  }

  private generateBaseClasses(component: AnalyzedComponent): string {
    const baseClasses: string[] = [];
    
    // Add base classes based on component type
    switch (component.type) {
      case 'button':
        baseClasses.push(
          'inline-flex', 'items-center', 'justify-center',
          'px-4', 'py-2', 'border', 'border-transparent',
          'text-sm', 'font-medium', 'rounded-md',
          'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2',
          'disabled:opacity-50', 'disabled:cursor-not-allowed',
          'transition-colors', 'duration-200'
        );
        break;
      case 'input':
        baseClasses.push(
          'block', 'w-full', 'px-3', 'py-2',
          'border', 'border-gray-300', 'rounded-md',
          'placeholder-gray-400',
          'focus:outline-none', 'focus:ring-2', 'focus:ring-primary-500', 'focus:border-primary-500',
          'disabled:bg-gray-50', 'disabled:cursor-not-allowed'
        );
        break;
      case 'card':
        baseClasses.push(
          'bg-white', 'rounded-lg', 'shadow-md',
          'border', 'border-gray-200',
          'p-6'
        );
        break;
      case 'modal':
        baseClasses.push(
          'fixed', 'inset-0', 'z-50',
          'flex', 'items-center', 'justify-center',
          'bg-black', 'bg-opacity-50'
        );
        break;
      default:
        baseClasses.push('block');
    }
    
    return baseClasses.join(' ');
  }

  private generateVariantClasses(component: AnalyzedComponent): string {
    const variantLogic: string[] = [];
    
    // Generate variant class logic
    const propVariants = component.props.filter(p => p.enumValues && p.enumValues.length > 1);
    
    if (propVariants.length === 0) {
      return `''`;
    }
    
    for (const prop of propVariants) {
      if (prop.name === 'size') {
        variantLogic.push(`props.${prop.name} === 'small' ? 'px-2 py-1 text-xs' :`);
        variantLogic.push(`props.${prop.name} === 'large' ? 'px-6 py-3 text-lg' :`);
        variantLogic.push(`'px-4 py-2 text-sm'`); // default
      } else if (prop.name === 'variant') {
        variantLogic.push(`props.${prop.name} === 'primary' ? 'bg-primary-600 text-white hover:bg-primary-700' :`);
        variantLogic.push(`props.${prop.name} === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' :`);
        variantLogic.push(`props.${prop.name} === 'outline' ? 'bg-transparent border-primary-600 text-primary-600 hover:bg-primary-50' :`);
        variantLogic.push(`'bg-gray-100 text-gray-900 hover:bg-gray-200'`); // default
      }
    }
    
    return variantLogic.length > 0 ? variantLogic.join('\n      ') : `''`;
  }

  // Method to generate Storybook stories
  generateStorybookStories(components: AnalyzedComponent[]): string {
    const stories: string[] = [];
    
    stories.push(`import type { Meta, StoryObj } from '@storybook/react';`);
    stories.push(`import { ${components.map(c => this.toPascalCase(c.name)).join(', ')} } from './components';`);
    stories.push('');
    
    for (const component of components) {
      const componentName = this.toPascalCase(component.name);
      
      stories.push(`// ${componentName} Stories`);
      stories.push(`const ${componentName}Meta: Meta<typeof ${componentName}> = {`);
      stories.push(`  title: 'Components/${componentName}',`);
      stories.push(`  component: ${componentName},`);
      stories.push(`  parameters: {`);
      stories.push(`    docs: {`);
      stories.push(`      description: {`);
      stories.push(`        component: '${component.semanticDescription}'`);
      stories.push(`      }`);
      stories.push(`    }`);
      stories.push(`  },`);
      stories.push(`  argTypes: {`);
      
      // Generate arg types from props
      for (const prop of component.props) {
        if (prop.enumValues) {
          stories.push(`    ${prop.name}: {`);
          stories.push(`      control: { type: 'select' },`);
          stories.push(`      options: [${prop.enumValues.map(v => `'${v}'`).join(', ')}],`);
          stories.push(`      description: '${prop.description}'`);
          stories.push(`    },`);
        }
      }
      
      stories.push(`  }`);
      stories.push(`};`);
      stories.push('');
      stories.push(`export default ${componentName}Meta;`);
      stories.push(`type ${componentName}Story = StoryObj<typeof ${componentName}Meta>;`);
      stories.push('');
      
      // Generate default story
      stories.push(`export const Default: ${componentName}Story = {`);
      stories.push(`  args: {`);
      stories.push(`    children: '${componentName} content'`);
      stories.push(`  }`);
      stories.push(`};`);
      stories.push('');
      
      // Generate variant stories
      for (const variant of component.variants.slice(0, 3)) {
        if (variant.name !== 'default') {
          const variantName = this.toPascalCase(variant.name);
          stories.push(`export const ${variantName}: ${componentName}Story = {`);
          stories.push(`  args: {`);
          stories.push(`    children: '${componentName} ${variant.name}',`);
          
          Object.entries(variant.properties).forEach(([key, value]) => {
            stories.push(`    ${key}: '${value}',`);
          });
          
          stories.push(`  }`);
          stories.push(`};`);
          stories.push('');
        }
      }
    }
    
    return stories.join('\n');
  }
}