// Simplified version of the main plugin - Memory Optimized
console.log('DeVibe System Plugin Loading...');

// Memory monitoring utilities
function logMemoryUsage(context: string) {
  console.log(`[Memory] ${context} - Processing checkpoint`);
}

// OPTIMIZED memory limits with smart component prioritization
const MAX_COMPONENTS = 100; // Increased to capture more component diversity
const MAX_INSTANCES_PER_COMPONENT = 150; // Increased for comprehensive usage analysis
const MEMORY_SAFE_MODE = true; // Enable smart processing with prioritization
const PRIORITY_COMPONENTS_LIMIT = 50; // Increased - focus on more important components
const ULTRA_SAFE_LIMIT = 30; // Increased fallback - prioritize diverse UI components over icons

// Helper function to convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number) {
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Import markdown generator
import { generateUnifiedMarkdown } from './generators/unified-markdown';

// Global type declaration for memory management
declare const global: any;

// Enhanced Variable Alias Resolver - Comprehensive solution for resolving Figma variable aliases
interface CustomVariable {
  id: string;
  name: string;
  description?: string;
  type: string;
  scopes: string[];
  modes: Record<string, VariableValue>;
}

interface VariableValue {
  type?: 'VARIABLE_ALIAS';
  id?: string;
  hex?: string;
  rgb?: { r: number; g: number; b: number };
  value?: any;
}

class EnhancedVariableAliasResolver {
  private variableMap: Map<string, CustomVariable> = new Map();
  private primitiveValues: Map<string, any> = new Map();
  private resolvedCache: Map<string, any> = new Map();
  private debugMode: boolean = true;

  constructor(debugMode: boolean = true) {
    this.debugMode = debugMode;
  }

  /**
   * Main resolution method - processes all variables and resolves aliases
   */
  public resolveVariables(data: any): any {
    this.log('Starting enhanced variable resolution process...');
    
    // SPECIAL DEBUG: Look for the specific alias mentioned by user
    const dataString = JSON.stringify(data);
    if (dataString.includes('VariableID:111:2338')) {
      this.log('🎯 FOUND TARGET ALIAS: VariableID:111:2338 is present in data');
    }
    
    // Step 1: Build comprehensive maps
    this.buildVariableMaps(data);
    
    // Step 2: Identify and store primitive values
    this.identifyPrimitives();
    
    // SPECIAL DEBUG: Check if we found the target variable
    if (this.variableMap.has('VariableID:111:2338') || this.variableMap.has('111:2338') || this.variableMap.has('2338')) {
      this.log('🎯 TARGET VARIABLE FOUND in variable map');
    } else {
      this.log('❌ TARGET VARIABLE NOT FOUND in variable map');
    }
    
    // Step 3: Resolve all aliases
    const resolved = this.resolveAllAliases(data);
    
    // SPECIAL DEBUG: Check if alias still exists after resolution
    const resolvedString = JSON.stringify(resolved);
    if (resolvedString.includes('VariableID:111:2338')) {
      this.log('❌ TARGET ALIAS STILL EXISTS after resolution - resolution failed');
    } else {
      this.log('✅ TARGET ALIAS RESOLVED successfully');
    }
    
    this.log(`Resolution complete. Resolved ${this.resolvedCache.size} aliases.`);
    return resolved;
  }

  /**
   * Build variable maps from Figma data
   * Handles multiple possible data structures
   */
  private buildVariableMaps(data: any): void {
    this.log('Building comprehensive variable maps...');
    this.log(`Input data keys: ${Object.keys(data || {}).join(', ')}`);
    
    // Clear existing maps
    this.variableMap.clear();
    this.primitiveValues.clear();
    this.resolvedCache.clear();

    // Strategy 1: Check for variables at root level
    if (data.variables) {
      this.log('Strategy 1: Processing variables at root level');
      this.log(`Variables structure: ${Object.keys(data.variables).join(', ')}`);
      this.processVariableCollection(data.variables);
    }

    // Strategy 2: Check for variables in collections
    if (data.variableCollections) {
      this.log('Strategy 2: Processing variable collections');
      for (const collection of data.variableCollections) {
        if (collection.variables) {
          this.processVariableCollection(collection.variables);
        }
      }
    }

    // Strategy 3: Deep search for variables in nested structures
    this.log('Strategy 3: Deep searching for variables');
    this.deepSearchForVariables(data);

    this.log(`Found ${this.variableMap.size} variables in total`);
    
    // Log some variable IDs for debugging
    const sampleIds = Array.from(this.variableMap.keys()).slice(0, 5);
    this.log(`Sample variable IDs: ${sampleIds.join(', ')}`);
  }

  /**
   * Process a collection of variables
   */
  private processVariableCollection(variables: any): void {
    if (Array.isArray(variables)) {
      variables.forEach(variable => this.addVariable(variable));
    } else if (typeof variables === 'object') {
      Object.entries(variables).forEach(([key, variable]: [string, any]) => {
        // Handle both nested and flat structures
        if (this.isVariable(variable)) {
          this.addVariable(Object.assign({}, variable, { id: variable.id || key }));
        } else if (variable && typeof variable === 'object') {
          // Check for nested variable structures
          Object.entries(variable).forEach(([subKey, subVar]: [string, any]) => {
            if (this.isVariable(subVar)) {
              this.addVariable(Object.assign({}, subVar, { id: subVar.id || subKey }));
            }
          });
        }
      });
    }
  }

  /**
   * Check if an object is a variable
   */
  private isVariable(obj: any): boolean {
    return obj && (
      obj.modes || 
      obj.valuesByMode || 
      obj.type === 'COLOR' || 
      obj.resolvedType === 'COLOR' ||
      (obj.id && typeof obj.id === 'string' && obj.id.includes('Variable'))
    );
  }

  /**
   * Add a variable to the map with multiple ID formats
   */
  private addVariable(variable: any): void {
    if (!variable) return;

    const id = variable.id || '';
    
    // Store with multiple possible ID formats
    const idFormats = [
      id,                                    // Original ID
      id.replace('VariableID:', ''),        // Without prefix
      `VariableID:${id}`,                   // With prefix (if not already)
      id.split(':').pop() || id             // Last part only
    ];

    idFormats.forEach(formatId => {
      if (formatId) {
        this.variableMap.set(formatId, variable);
      }
    });

    this.log(`Added variable: ${variable.name || id} with ${idFormats.length} ID formats`);
  }

  /**
   * Deep search for variables in nested data structures
   */
  private deepSearchForVariables(obj: any, depth: number = 0): void {
    if (depth > 10 || !obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      if (this.isVariable(value)) {
        this.addVariable(Object.assign({}, value as any, { id: (value as any).id || key }));
      } else if (key === 'colors' || key === 'spacing' || key === 'typography') {
        // Process design token categories
        this.processTokenCategory(value);
      } else if (typeof value === 'object') {
        this.deepSearchForVariables(value, depth + 1);
      }
    }
  }

  /**
   * Process design token categories
   */
  private processTokenCategory(category: any): void {
    if (!category || typeof category !== 'object') return;

    Object.entries(category).forEach(([groupName, group]: [string, any]) => {
      if (typeof group === 'object') {
        Object.entries(group).forEach(([tokenName, token]: [string, any]) => {
          if (this.isVariable(token)) {
            this.addVariable({
              token,
              id: token.id || `${groupName}:${tokenName}`,
              name: `${groupName}/${tokenName}`
            });
          }
        });
      }
    });
  }

  /**
   * Identify primitive values (non-alias variables)
   */
  private identifyPrimitives(): void {
    this.log('Identifying primitive values...');
    
    for (const [id, variable] of this.variableMap.entries()) {
      const modes = variable.modes || {};
      
      for (const [modeId, value] of Object.entries(modes)) {
        if (this.isPrimitiveValue(value)) {
          const key = `${id}:${modeId}`;
          this.primitiveValues.set(key, this.extractPrimitiveValue(value));
          this.log(`Found primitive: ${variable.name || id} = ${JSON.stringify(value)}`);
        }
      }
    }
    
    this.log(`Identified ${this.primitiveValues.size} primitive values`);
  }

  /**
   * Check if a value is primitive (not an alias)
   */
  private isPrimitiveValue(value: any): boolean {
    if (!value) return false;
    
    return (
      value.hex !== undefined ||
      value.rgb !== undefined ||
      value.r !== undefined ||
      (typeof value === 'string' && value.startsWith('#')) ||
      typeof value === 'number' ||
      (value.type !== 'VARIABLE_ALIAS' && value.value !== undefined)
    );
  }

  /**
   * Extract the actual value from a primitive
   */
  private extractPrimitiveValue(value: any): any {
    if (value.hex) return value.hex;
    if (value.rgb) return this.rgbToHex(value.rgb);
    if (value.r !== undefined) return this.rgbToHex(value);
    if (typeof value === 'string' && value.startsWith('#')) return value;
    if (value.value !== undefined) return value.value;
    return value;
  }

  /**
   * Convert RGB to hex
   */
  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  /**
   * Resolve all aliases in the data structure
   */
  private resolveAllAliases(data: any): any {
    return this.traverseAndResolve(data);
  }

  /**
   * Traverse and resolve aliases in any data structure
   */
  private traverseAndResolve(obj: any, path: string = ''): any {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map((item, index) => 
        this.traverseAndResolve(item, `${path}[${index}]`)
      );
    }

    const resolved: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Debug: Log what we're processing if it looks like a color variable
      if (currentPath.includes('Content') && currentPath.includes('Primary')) {
        this.log(`🔍 DEBUGGING: Processing Content.Primary path: ${currentPath}`);
        this.log(`🔍 DEBUGGING: Value: ${JSON.stringify(value, null, 2).slice(0, 200)}...`);
      }
      
      if (this.isAlias(value)) {
        // Resolve alias
        this.log(`🔍 DEBUGGING: Resolving alias at ${currentPath}`);
        resolved[key] = this.resolveAlias(value, currentPath);
      } else if (key === 'modes' && typeof value === 'object') {
        // Special handling for modes
        this.log(`🔍 DEBUGGING: Processing modes at ${currentPath}`);
        resolved[key] = this.resolveModes(value, currentPath);
      } else if (typeof value === 'object') {
        // Recursive resolution
        resolved[key] = this.traverseAndResolve(value, currentPath);
      } else {
        // Keep primitive values
        resolved[key] = value;
      }
    }
    
    return resolved;
  }

  /**
   * Check if a value is an alias
   */
  private isAlias(value: any): boolean {
    const isAliasResult = value && (
      value.type === 'VARIABLE_ALIAS' ||
      (value.id && typeof value.id === 'string' && !value.hex && !value.rgb)
    );
    
    if (isAliasResult) {
      this.log(`🔍 DEBUGGING: Detected alias: ${JSON.stringify(value)}`);
    }
    
    return isAliasResult;
  }

  /**
   * Resolve modes object
   */
  private resolveModes(modes: any, path: string): any {
    const resolved: any = {};
    
    for (const [modeId, value] of Object.entries(modes)) {
      if (this.isAlias(value)) {
        resolved[this.getModeName(modeId)] = this.resolveAlias(value, `${path}.${modeId}`);
      } else if (this.isPrimitiveValue(value)) {
        resolved[this.getModeName(modeId)] = this.extractPrimitiveValue(value);
      } else {
        resolved[this.getModeName(modeId)] = value;
      }
    }
    
    return resolved;
  }

  /**
   * Get readable mode name
   */
  private getModeName(modeId: string): string {
    // Map mode IDs to readable names
    const modeMap: Record<string, string> = {
      '40000015:1': 'light',
      '40000015:2': 'dark',
      '111:3': 'default',
      '594:0': 'default',
      '89:0': 'default',
      '20:0': 'light',
      '20:1': 'dark',
      '3919:21': 'light',
      '3919:22': 'dark', 
      '4245:0': 'brand',
      '3919:19': 'default',
      '202:2': 'light',
      '202:4': 'dark'
    };
    
    return modeMap[modeId] || modeId;
  }

  /**
   * Resolve a single alias to its actual value
   */
  private resolveAlias(alias: any, path: string): any {
    const aliasId = alias.id || alias;
    
    // Check cache
    const cacheKey = `${aliasId}:${path}`;
    if (this.resolvedCache.has(cacheKey)) {
      return this.resolvedCache.get(cacheKey);
    }

    this.log(`🔍 DEBUGGING: Resolving alias: ${aliasId} at ${path}`);
    this.log(`🔍 DEBUGGING: Alias object: ${JSON.stringify(alias)}`);

    // Try different ID formats
    const idFormats = [
      aliasId,
      aliasId.replace('VariableID:', ''),
      aliasId.split(':').pop() || aliasId
    ];

    this.log(`🔍 DEBUGGING: Trying ID formats: ${idFormats.join(', ')}`);

    for (const id of idFormats) {
      const variable = this.variableMap.get(id);
      
      if (variable) {
        this.log(`🔍 DEBUGGING: Found variable for ID ${id}: ${JSON.stringify(variable, null, 2).slice(0, 300)}...`);
        const resolved = this.resolveVariableValue(variable);
        this.resolvedCache.set(cacheKey, resolved);
        this.log(`✅ Resolved ${aliasId} to ${JSON.stringify(resolved)}`);
        return resolved;
      } else {
        this.log(`🔍 DEBUGGING: No variable found for ID format: ${id}`);
      }
    }

    // If not found, check primitives directly
    this.log(`🔍 DEBUGGING: Checking primitives map...`);
    for (const [key, value] of this.primitiveValues.entries()) {
      if (key.includes(aliasId) || key.includes(aliasId.replace('VariableID:', ''))) {
        this.log(`✅ Found in primitives: ${key} = ${value}`);
        this.resolvedCache.set(cacheKey, value);
        return value;
      }
    }

    // DEBUG: Show what variables we DO have
    this.log(`🔍 DEBUGGING: Available variable IDs (first 10): ${Array.from(this.variableMap.keys()).slice(0, 10).join(', ')}`);
    this.log(`🔍 DEBUGGING: Available primitive keys (first 5): ${Array.from(this.primitiveValues.keys()).slice(0, 5).join(', ')}`);

    this.log(`❌ WARNING: Could not resolve alias ${aliasId}`, 'warn');
    return alias; // Return original if can't resolve
  }

  /**
   * Resolve a variable to its actual values
   */
  private resolveVariableValue(variable: CustomVariable): any {
    const modes = variable.modes || {};
    const resolved: any = {};
    
    for (const [modeId, value] of Object.entries(modes)) {
      const modeName = this.getModeName(modeId);
      
      if (this.isAlias(value)) {
        // Recursive resolution
        resolved[modeName] = this.resolveAlias(value, `${variable.name}.${modeId}`);
      } else if (this.isPrimitiveValue(value)) {
        resolved[modeName] = this.extractPrimitiveValue(value);
      } else {
        resolved[modeName] = value;
      }
    }
    
    // If only one mode, return the value directly
    const modeKeys = Object.keys(resolved);
    if (modeKeys.length === 1 && modeKeys[0] === 'default') {
      return resolved.default;
    }
    
    return resolved;
  }

  /**
   * Logging utility
   */
  private log(message: string, level: 'log' | 'warn' | 'error' = 'log'): void {
    if (this.debugMode) {
      console[level](`[EnhancedVariableResolver] ${message}`);
    }
  }

  /**
   * Validate resolved data
   */
  validateResolvedData(data: any): boolean {
    // Ensure no aliases remain in output
    const stringify = JSON.stringify(data);
    const hasAliases = stringify.includes('VARIABLE_ALIAS');
    
    if (hasAliases) {
      console.error('❌ Aliases still present in resolved data');
      return false;
    }
    
    console.log('✅ All aliases successfully resolved');
    return true;
  }
}

// Helper function to convert RGB color to hex
function colorToHex(color: RGB) {
  return '#' + Math.round(color.r * 255).toString(16).padStart(2, '0') +
               Math.round(color.g * 255).toString(16).padStart(2, '0') +
               Math.round(color.b * 255).toString(16).padStart(2, '0');
}

// Helper function to create nested object from variable name
function createNestedObject(obj: any, path: string, value: any) {
  var parts = path.split(/[-_.\/]/); // Split on common separators
  var current = obj;
  
  for (var i = 0; i < parts.length - 1; i++) {
    var part = parts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }
  
  var finalKey = parts[parts.length - 1];
  current[finalKey] = value;
}

// Helper function to calculate component complexity
function calculateComponentComplexity(componentAnalysis: any[]): number {
  if (componentAnalysis.length === 0) return 0;
  
  var totalComplexity = 0;
  for (var i = 0; i < componentAnalysis.length; i++) {
    var component = componentAnalysis[i];
    var complexity = 1; // Base complexity
    
    // Add complexity for variants
    if (component.variants && component.variants.length > 0) {
      complexity += component.variants.length * 0.5;
    }
    
    // Add complexity for properties
    if (component.properties && component.properties.length > 0) {
      complexity += component.properties.length * 0.3;
    }
    
    totalComplexity += complexity;
  }
  
  return Math.round(totalComplexity / componentAnalysis.length * 10) / 10;
}

// Main Component Analysis Engine - Memory Optimized
async function analyzeComponents() {
  console.log('Starting main component analysis...');
  
  // Memory optimization: Process pages one at a time instead of loading all
  const totalPages = figma.root.children.length;
  console.log('Processing', totalPages, 'pages for memory efficiency...');
  
  var allComponents: (ComponentNode | ComponentSetNode)[] = [];
  const BATCH_SIZE = MAX_COMPONENTS; // Use global memory limit
  
  // Process each page individually to reduce memory usage
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const page = figma.root.children[pageIndex];
    if (page.type !== 'PAGE') continue;
    
    console.log('Scanning page:', page.name, '(' + (pageIndex + 1) + '/' + totalPages + ')');
    
    // Load page before accessing its contents
    await page.loadAsync();
    
    // Find components on this specific page only
    const pageComponents = page.findAll(function(node) { 
      return node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'; 
    }) as (ComponentNode | ComponentSetNode)[];
    
    allComponents = allComponents.concat(pageComponents);
    
    // Memory cleanup and monitoring every few pages
    if (pageIndex % 5 === 0) {
      logMemoryUsage(`Page ${pageIndex + 1}/${totalPages} - ${allComponents.length} components found`);
    }
    
    // Early exit if we've found enough components to prevent memory issues
    if (allComponents.length >= MAX_COMPONENTS) {
      console.warn('Reached component limit for memory safety. Stopping page scan.');
      break;
    }
    
    // Memory-aware bailout - if we find too many components on early pages, continue but log
    if (MEMORY_SAFE_MODE && pageIndex < 5 && allComponents.length > PRIORITY_COMPONENTS_LIMIT) {
      console.log('SMART DETECTION: Many components found early (' + allComponents.length + '). Will use prioritization later.');
      // Don't break - let it continue collecting for better prioritization
    }
  }
  
  // Filter out individual components that belong to component sets
  var componentSetIds = new Set();
  var componentSets = allComponents.filter(function(node) {
    if (node.type === 'COMPONENT_SET') {
      componentSetIds.add(node.id);
      return true;
    }
    return false;
  });
  
  // Get standalone components (not part of any component set)
  var standaloneComponents = allComponents.filter(function(node) {
    if (node.type === 'COMPONENT') {
      var component = node as ComponentNode;
      // Check if this component's parent is a component set
      return !component.parent || component.parent.type !== 'COMPONENT_SET';
    }
    return false;
  });
  
  // Combine component sets and standalone components
  var mainComponents = componentSets.concat(standaloneComponents);
  
  console.log('Found', mainComponents.length, 'main components');
  
  // Smart component prioritization for comprehensive UI coverage
  if (mainComponents.length > BATCH_SIZE) {
    console.warn('Large document detected (' + mainComponents.length + ' components). Using smart prioritization to select', BATCH_SIZE, 'most important components.');
    mainComponents = prioritizeComponentsForExtraction(mainComponents, BATCH_SIZE);
  }
  
  // Prioritized processing for memory safety
  if (MEMORY_SAFE_MODE && mainComponents.length > PRIORITY_COMPONENTS_LIMIT) {
    console.warn('PRIORITY MODE: Using smart selection to focus on', PRIORITY_COMPONENTS_LIMIT, 'priority UI components.');
    mainComponents = prioritizeComponentsForExtraction(mainComponents, PRIORITY_COMPONENTS_LIMIT);
  }
  
  // Ultimate fallback ensures we get diverse component types, not just icons
  if (MEMORY_SAFE_MODE && totalPages > 20 && mainComponents.length > ULTRA_SAFE_LIMIT) {
    console.warn('ULTRA SAFE MODE: Very large document with', totalPages, 'pages detected. Selecting', ULTRA_SAFE_LIMIT, 'diverse UI components.');
    mainComponents = prioritizeComponentsForExtraction(mainComponents, ULTRA_SAFE_LIMIT);
  } else if (MEMORY_SAFE_MODE && mainComponents.length > PRIORITY_COMPONENTS_LIMIT) {
    console.log('SMART PRIORITIZATION: Processing', PRIORITY_COMPONENTS_LIMIT, 'most important components from', mainComponents.length, 'total.');
    mainComponents = prioritizeComponentsForExtraction(mainComponents, PRIORITY_COMPONENTS_LIMIT);
  }
  
  var componentAnalysis: any[] = [];
  var totalInstances = 0;
  var componentUsage = new Map();
  var stylePatterns = {
    colors: new Map(),
    typography: new Map(),
    spacing: new Map(),
    effects: new Map()
  };
  var layoutPatterns = new Map();
  var variantUsage = new Map();
  
  // Cache all instances once for efficiency
  console.log('Building instance index for faster lookup...');
  var instanceCache = new Map<string, InstanceNode[]>();
  
  // Process instances page by page to reduce memory usage
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const page = figma.root.children[pageIndex];
    if (page.type !== 'PAGE') continue;
    
    // Load page before accessing its contents
    await page.loadAsync();
    
    const pageInstances = page.findAll(function(node) { 
      return node.type === 'INSTANCE';
    }) as InstanceNode[];
    
    // Build component-to-instances mapping
    for (const instance of pageInstances) {
      try {
        const mainComp = await instance.getMainComponentAsync();
        if (mainComp) {
          if (!instanceCache.has(mainComp.id)) {
            instanceCache.set(mainComp.id, []);
          }
          const existingInstances = instanceCache.get(mainComp.id)!;
          // Strict memory limits for instances
          const instanceLimit = MEMORY_SAFE_MODE ? 20 : MAX_INSTANCES_PER_COMPONENT;
          if (existingInstances.length < instanceLimit) {
            existingInstances.push(instance);
          }
        }
      } catch (e) {
        // Skip instances that can't be resolved
      }
    }
    
    // Frequent memory checkpoints and early exit if needed
    if (pageIndex % 2 === 0) {
      logMemoryUsage(`Instance indexing - Page ${pageIndex + 1}/${totalPages} - ${instanceCache.size} components cached`);
      
      // Memory-aware exit if too many instances cached
      if (MEMORY_SAFE_MODE && instanceCache.size > PRIORITY_COMPONENTS_LIMIT) {
        console.warn('SMART MEMORY: Many components cached. Stopping instance processing for prioritization.');
        break;
      }
      
      // Also check total cached instances - increased limit for better analysis
      const totalCachedInstances = Array.from(instanceCache.values()).reduce((sum, arr) => sum + arr.length, 0);
      if (MEMORY_SAFE_MODE && totalCachedInstances > 200) {
        console.warn('Memory protection: Many instances cached (' + totalCachedInstances + '). Stopping instance processing.');
        break;
      }
    }
  }
  
  // Analyze each main component using cached instances
  for (var i = 0; i < mainComponents.length; i++) {
    var component = mainComponents[i];
    try {
      console.log('Analyzing component:', component.name, '(' + (i + 1) + '/' + mainComponents.length + ')');
      
      var componentInfo: any = {
        id: component.id,
        name: component.name,
        type: component.type,
        description: component.description || '',
        variants: [],
        properties: []
      };
    
    // For component sets, analyze variants
    if (component.type === 'COMPONENT_SET') {
      var componentSet = component as ComponentSetNode;
      componentInfo.variants = componentSet.children
        .filter(function(child) { return child.type === 'COMPONENT'; })
        .map(function(variant: any) {
          return {
            name: variant.name,
            properties: variant.variantProperties || {}
          };
        });
    }
    
    // Use cached instances instead of scanning entire document
    var instances: InstanceNode[] = instanceCache.get(component.id) || [];
    
    var usagePages = new Set();
    instances.forEach(function(instance) {
      var page = instance.parent;
      while (page && page.type !== 'PAGE') {
        page = page.parent;
      }
      if (page) {
        usagePages.add(page.name);
      }
    });
    
    componentUsage.set(component.id, {
      name: component.name,
      count: instances.length,
      pages: Array.from(usagePages)
    });
    
    totalInstances += instances.length;
    
    // Extract style patterns from the main component itself
    extractStylePatterns(component, stylePatterns);
    
    // Analyze layout patterns from the component (skip for now since analyzeLayoutPatterns expects PageNode)
    // analyzeLayoutPatterns(component, layoutPatterns);
    
    componentAnalysis.push(componentInfo);
    
    // Memory checkpoint and garbage collection every few components
    if ((i + 1) % 3 === 0) {
      logMemoryUsage(`Processed ${i + 1}/${mainComponents.length} components`);
      
      // Force garbage collection attempt in memory safe mode
      if (MEMORY_SAFE_MODE && typeof global !== 'undefined' && global.gc) {
        try {
          global.gc();
        } catch (e) {
          // GC not available, continue
        }
      }
      
      // Smart exit if we're approaching our priority limit - increased threshold
      if (MEMORY_SAFE_MODE && (i + 1) >= PRIORITY_COMPONENTS_LIMIT * 0.95) {
        console.warn('Approaching priority component limit (' + (i + 1) + '/' + PRIORITY_COMPONENTS_LIMIT + '). Stopping component analysis.');
        break;
      }
    }
    
    } catch (error) {
      console.error('Error analyzing component', component?.name || 'unknown', ':', error);
      // Continue with next component
    }
  }
  
  // Process and analyze all collected data with error handling
  console.log('Processing component usage...');
  console.log('componentUsage size:', componentUsage.size);
  var componentUsageArray = processComponentUsage(componentUsage);
  
  console.log('Processing style patterns...');
  console.log('stylePatterns keys:', Object.keys(stylePatterns));
  var styleAnalysis = processStylePatterns(stylePatterns);
  
  console.log('Processing layout patterns...');
  console.log('layoutPatterns size:', layoutPatterns.size);
  var layoutAnalysis = processLayoutPatterns(layoutPatterns);
  
  console.log('Processing variant usage...');
  console.log('variantUsage size:', variantUsage.size);
  var variantAnalysis = processVariantUsage(variantUsage);
  
  console.log('Generating recommendations...');
  var recommendations = generateUniversalRecommendations(styleAnalysis, componentUsageArray, variantAnalysis);
  
  return {
    components: componentAnalysis,
    summary: {
      totalComponents: mainComponents.length,
      totalInstances: totalInstances,
      uniqueComponents: componentUsage.size,
      avgInstancesPerComponent: Math.round(totalInstances / mainComponents.length),
      complexityScore: calculateComponentComplexity(componentAnalysis)
    },
    componentUsage: componentUsageArray,
    stylePatterns: styleAnalysis,
    layoutPatterns: layoutAnalysis,
    variantUsage: variantAnalysis,
    recommendations: recommendations,
    insights: generateUniversalInsights(componentAnalysis, componentUsageArray, styleAnalysis)
  };
}

// Analyze individual component instance
async function analyzeInstanceAsync(instance: InstanceNode) {
  var mainComponent = await instance.getMainComponentAsync();
  var analysis: any = {
    id: instance.id,
    name: instance.name,
    type: instance.type,
    masterComponent: mainComponent ? {
      id: mainComponent.id,
      name: mainComponent.name,
      set: mainComponent.parent?.type === 'COMPONENT_SET' ? mainComponent.parent.name : null
    } : null,
    position: { x: Math.round(instance.x), y: Math.round(instance.y) },
    size: { width: Math.round(instance.width), height: Math.round(instance.height) },
    visible: instance.visible,
    locked: instance.locked,
    rotation: instance.rotation || 0
  };
  
  // Extract variant properties if available
  if (instance.variantProperties && Object.keys(instance.variantProperties).length > 0) {
    analysis.variants = instance.variantProperties;
  }
  
  // Extract style information
  analysis.styles = extractUniversalStyles(instance);
  
  // Extract layout information if it's a frame
  if ('layoutMode' in instance) {
    analysis.layout = extractLayoutProperties(instance as any);
  }
  
  return analysis;
}

// Extract comprehensive style information
function extractUniversalStyles(node: SceneNode) {
  var styles: any = {};
  
  // Extract fills
  if ('fills' in node && node.fills !== figma.mixed && Array.isArray(node.fills)) {
    styles.fills = node.fills.map(function(fill) {
      if (fill.type === 'SOLID') {
        return {
          type: 'SOLID',
          color: colorToHex(fill.color),
          opacity: fill.opacity || 1,
          visible: fill.visible !== false
        };
      } else if (fill.type.includes('GRADIENT')) {
        return {
          type: fill.type,
          opacity: fill.opacity || 1,
          visible: fill.visible !== false,
          gradientStops: fill.gradientStops?.map(function(stop) {
            return {
              position: stop.position,
              color: colorToHex(stop.color)
            };
          })
        };
      }
      return { type: fill.type, opacity: fill.opacity || 1 };
    });
  }
  
  // Extract strokes
  if ('strokes' in node && Array.isArray(node.strokes)) {
    styles.strokes = node.strokes.map(function(stroke) {
      if (stroke.type === 'SOLID') {
        return {
          type: 'SOLID',
          color: colorToHex(stroke.color),
          opacity: stroke.opacity || 1
        };
      }
      return { type: stroke.type, opacity: stroke.opacity || 1 };
    });
    
    if ('strokeWeight' in node) {
      styles.strokeWeight = node.strokeWeight;
    }
  }
  
  // Extract effects
  if ('effects' in node && Array.isArray(node.effects)) {
    styles.effects = node.effects.map(function(effect) {
      var effectData: any = { type: effect.type, visible: effect.visible !== false };
      
      if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
        var shadow = effect as DropShadowEffect;
        effectData.color = colorToHex(shadow.color);
        effectData.offset = shadow.offset;
        effectData.radius = shadow.radius;
        effectData.spread = shadow.spread || 0;
      } else if (effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR') {
        var blur = effect as BlurEffect;
        effectData.radius = blur.radius;
      }
      
      return effectData;
    });
  }
  
  // Extract typography for text nodes
  if (node.type === 'TEXT') {
    var textNode = node as TextNode;
    styles.typography = {
      fontFamily: textNode.fontName !== figma.mixed ? textNode.fontName.family : 'Mixed',
      fontWeight: textNode.fontName !== figma.mixed ? textNode.fontName.style : 'Mixed',
      fontSize: textNode.fontSize !== figma.mixed ? textNode.fontSize : null,
      lineHeight: textNode.lineHeight,
      letterSpacing: textNode.letterSpacing,
      textCase: textNode.textCase !== figma.mixed ? textNode.textCase : 'Mixed',
      textDecoration: textNode.textDecoration !== figma.mixed ? textNode.textDecoration : 'Mixed'
    };
  }
  
  // Extract basic properties
  if ('opacity' in node) styles.opacity = node.opacity;
  if ('blendMode' in node) styles.blendMode = node.blendMode;
  if ('cornerRadius' in node) styles.cornerRadius = node.cornerRadius;
  
  return styles;
}

// Extract layout properties
function extractLayoutProperties(frameNode: FrameNode) {
  return {
    layoutMode: frameNode.layoutMode,
    primaryAxisSizingMode: frameNode.primaryAxisSizingMode,
    counterAxisSizingMode: frameNode.counterAxisSizingMode,
    primaryAxisAlignItems: frameNode.primaryAxisAlignItems,
    counterAxisAlignItems: frameNode.counterAxisAlignItems,
    paddingLeft: frameNode.paddingLeft || 0,
    paddingRight: frameNode.paddingRight || 0,
    paddingTop: frameNode.paddingTop || 0,
    paddingBottom: frameNode.paddingBottom || 0,
    itemSpacing: frameNode.itemSpacing || 0,
    counterAxisSpacing: frameNode.counterAxisSpacing || 0,
    strokesIncludedInLayout: frameNode.strokesIncludedInLayout
  };
}

// Track component usage with metadata
async function trackComponentUsageAsync(instance: InstanceNode, mainComponent: ComponentNode, pageName: string, componentUsage: Map<any, any>, variantUsage: Map<any, any>) {
  var masterName = mainComponent.name;
  var existing = componentUsage.get(masterName);
  
  if (existing) {
    existing.count++;
    existing.totalArea += instance.width * instance.height;
    if (!existing.pages.includes(pageName)) {
      existing.pages.push(pageName);
    }
    if (instance.variantProperties) {
      existing.variants.push(instance.variantProperties);
    }
  } else {
    componentUsage.set(masterName, {
      name: masterName,
      id: mainComponent.id,
      count: 1,
      pages: [pageName],
      totalArea: instance.width * instance.height,
      variants: instance.variantProperties ? [instance.variantProperties] : [],
      componentSet: mainComponent.parent?.type === 'COMPONENT_SET' ? mainComponent.parent.name : null
    });
  }
  
  // Track variant usage separately
  if (instance.variantProperties) {
    for (var prop in instance.variantProperties) {
      var value = instance.variantProperties[prop];
      var key = masterName + '::' + prop + '::' + value;
      var variantCount = variantUsage.get(key) || 0;
      variantUsage.set(key, variantCount + 1);
    }
  }
}

// Extract and track style patterns
function extractStylePatterns(node: SceneNode, stylePatterns: any) {
  // Track color usage
  if ('fills' in node && node.fills !== figma.mixed && Array.isArray(node.fills)) {
    node.fills.forEach(function(fill) {
      if (fill.type === 'SOLID') {
        var colorKey = colorToHex(fill.color);
        var existing = stylePatterns.colors.get(colorKey) || { count: 0, contexts: [], opacity: [] };
        existing.count++;
        existing.contexts.push(node.type);
        existing.opacity.push(fill.opacity || 1);
        stylePatterns.colors.set(colorKey, existing);
      }
    });
  }
  
  // Track typography patterns
  if (node.type === 'TEXT') {
    var textNode = node as TextNode;
    if (textNode.fontName !== figma.mixed && textNode.fontSize !== figma.mixed) {
      var typoKey = textNode.fontName.family + '::' + textNode.fontName.style + '::' + textNode.fontSize;
      var existing = stylePatterns.typography.get(typoKey) || { count: 0, sizes: [], families: [] };
      existing.count++;
      existing.sizes.push(textNode.fontSize);
      existing.families.push(textNode.fontName.family);
      stylePatterns.typography.set(typoKey, existing);
    }
  }
  
  // Track spacing patterns from layout
  if ('layoutMode' in node) {
    var frameNode = node as FrameNode;
    [frameNode.paddingLeft, frameNode.paddingRight, frameNode.paddingTop, frameNode.paddingBottom, frameNode.itemSpacing].forEach(function(value) {
      if (value && value > 0) {
        var existing = stylePatterns.spacing.get(value) || { count: 0, contexts: [] };
        existing.count++;
        existing.contexts.push('layout');
        stylePatterns.spacing.set(value, existing);
      }
    });
  }
  
  // Track effect patterns
  if ('effects' in node && Array.isArray(node.effects)) {
    node.effects.forEach(function(effect) {
      if (effect.visible !== false) {
        var existing = stylePatterns.effects.get(effect.type) || { count: 0, variations: [] };
        existing.count++;
        existing.variations.push(effect);
        stylePatterns.effects.set(effect.type, existing);
      }
    });
  }
}

// Analyze layout patterns
async function analyzeLayoutPatterns(page: PageNode, layoutPatterns: Map<any, any>) {
  // Ensure page is loaded before accessing contents
  await page.loadAsync();
  var frames = page.findAll(function(node) { return 'layoutMode' in node && node.layoutMode !== 'NONE'; });
  
  frames.forEach(function(frame) {
    var frameNode = frame as FrameNode;
    var pattern = frameNode.layoutMode + '::' + frameNode.primaryAxisAlignItems + '::' + frameNode.counterAxisAlignItems;
    var existing = layoutPatterns.get(pattern) || { count: 0, examples: [] };
    existing.count++;
    existing.examples.push({
      id: frameNode.id,
      name: frameNode.name,
      itemSpacing: frameNode.itemSpacing,
      padding: [frameNode.paddingLeft, frameNode.paddingRight, frameNode.paddingTop, frameNode.paddingBottom]
    });
    layoutPatterns.set(pattern, existing);
  });
}

// Calculate page complexity
function calculatePageComplexity(instances: InstanceNode[], allElements: BaseNode[]) {
  var complexity = instances.length * 2; // Base component complexity
  complexity += allElements.length; // Add element complexity
  complexity += Math.floor(instances.length / 10); // Bonus for high component density
  return complexity;
}

// Calculate overall complexity
function calculateOverallComplexity(pageAnalysis: any[]) {
  return pageAnalysis.reduce(function(sum, page) { return sum + page.complexity; }, 0);
}

// Process component usage data
function processComponentUsage(componentUsage: Map<any, any>) {
  return Array.from(componentUsage.values())
    .sort(function(a, b) { return b.count - a.count; })
    .map(function(comp) {
      return {
        name: comp.name,
        count: comp.count,
        pages: comp.pages || [],
        avgInstancesPerPage: comp.pages ? Math.round(comp.count / comp.pages.length) : 0,
        pagesUsed: comp.pages ? comp.pages.length : 0
      };
    });
}

// Process style patterns
function processStylePatterns(stylePatterns: any) {
  return {
    colors: Array.from(stylePatterns.colors.entries()).map(function(entry: any) {
      return {
        color: entry[0],
        usage: entry[1].count,
        contexts: Array.from(new Set(entry[1].contexts)),
        avgOpacity: entry[1].opacity.reduce(function(a: number, b: number) { return a + b; }, 0) / entry[1].opacity.length
      };
    }).sort(function(a: any, b: any) { return b.usage - a.usage; }),
    
    typography: Array.from(stylePatterns.typography.entries()).map(function(entry: any) {
      var parts = entry[0].split('::');
      return {
        fontFamily: parts[0],
        fontWeight: parts[1],
        fontSize: parseInt(parts[2]),
        usage: entry[1].count
      };
    }).sort(function(a: any, b: any) { return b.usage - a.usage; }),
    
    spacing: Array.from(stylePatterns.spacing.entries()).map(function(entry: any) {
      return {
        value: entry[0],
        usage: entry[1].count,
        contexts: Array.from(new Set(entry[1].contexts))
      };
    }).sort(function(a: any, b: any) { return b.usage - a.usage; }),
    
    effects: Array.from(stylePatterns.effects.entries()).map(function(entry: any) {
      return {
        type: entry[0],
        usage: entry[1].count,
        variations: entry[1].variations.length
      };
    }).sort(function(a, b) { return b.usage - a.usage; })
  };
}

// Process layout patterns
function processLayoutPatterns(layoutPatterns: Map<any, any>) {
  return Array.from(layoutPatterns.entries()).map(function(entry: any) {
    var parts = entry[0].split('::');
    return {
      layoutMode: parts[0],
      primaryAlign: parts[1],
      counterAlign: parts[2],
      usage: entry[1].count,
      examples: entry[1].examples.slice(0, 3) // First 3 examples
    };
  }).sort(function(a: any, b: any) { return b.usage - a.usage; });
}

// Process variant usage
function processVariantUsage(variantUsage: Map<any, any>) {
  var variantsByComponent = new Map();
  
  Array.from(variantUsage.entries()).forEach(function(entry) {
    var parts = entry[0].split('::');
    var componentName = parts[0];
    var property = parts[1];
    var value = parts[2];
    var count = entry[1];
    
    if (!variantsByComponent.has(componentName)) {
      variantsByComponent.set(componentName, {});
    }
    
    var component = variantsByComponent.get(componentName);
    if (!component[property]) {
      component[property] = {};
    }
    
    component[property][value] = count;
  });
  
  return Array.from(variantsByComponent.entries()).map(function(entry) {
    return {
      component: entry[0],
      properties: entry[1]
    };
  });
}

// Generate universal recommendations
function generateUniversalRecommendations(styleAnalysis: any, componentUsage: any[], variantAnalysis: any[]) {
  var recommendations: any[] = [];
  
  // Color token recommendations
  styleAnalysis.colors.forEach(function(pattern: any) {
    if (pattern.usage >= 3) {
      recommendations.push({
        type: 'color-token',
        priority: pattern.usage >= 10 ? 'high' : 'medium',
        value: pattern.color,
        usage: pattern.usage,
        suggestion: 'Create color token for ' + pattern.color + ' (used ' + pattern.usage + ' times across ' + pattern.contexts.join(', ') + ')',
        confidence: Math.min(0.95, 0.4 + (pattern.usage * 0.05))
      });
    }
  });
  
  // Spacing token recommendations
  styleAnalysis.spacing.forEach(function(pattern: any) {
    if (pattern.usage >= 2) {
      recommendations.push({
        type: 'spacing-token',
        priority: pattern.usage >= 5 ? 'high' : 'medium',
        value: pattern.value,
        usage: pattern.usage,
        suggestion: 'Create spacing token for ' + pattern.value + 'px (used ' + pattern.usage + ' times)',
        confidence: Math.min(0.9, 0.3 + (pattern.usage * 0.1))
      });
    }
  });
  
  // Component consolidation recommendations
  var similarComponents = findSimilarComponents(componentUsage);
  similarComponents.forEach(function(group: any) {
    if (group.components.length > 1) {
      recommendations.push({
        type: 'component-consolidation',
        priority: 'medium',
        components: group.components,
        suggestion: 'Consider consolidating similar components: ' + group.components.join(', '),
        confidence: 0.7
      });
    }
  });
  
  return recommendations.sort(function(a, b) {
    var priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });
}

// Find similar components (simple heuristic)
function findSimilarComponents(componentUsage: any[]) {
  var groups: any[] = [];
  var processed = new Set();
  
  componentUsage.forEach(function(comp) {
    if (processed.has(comp.name)) return;
    
    var similar = componentUsage.filter(function(other) {
      return other.name !== comp.name && 
             !processed.has(other.name) &&
             (other.name.includes(comp.name.split('/')[0]) || comp.name.includes(other.name.split('/')[0]));
    });
    
    if (similar.length > 0) {
      groups.push({
        components: [comp.name].concat(similar.map(function(s) { return s.name; }))
      });
      
      processed.add(comp.name);
      similar.forEach(function(s) { processed.add(s.name); });
    }
  });
  
  return groups;
}

// Smart component prioritization based on UI importance
function prioritizeComponentsForExtraction(components: (ComponentNode | ComponentSetNode)[], limit: number): (ComponentNode | ComponentSetNode)[] {
  // Component type priority (UI components over decorative elements)
  const componentTypePriority = {
    button: 100, input: 95, form: 90, card: 85, modal: 80,
    navigation: 75, table: 70, layout: 65, feedback: 60,
    media: 30, // Lower priority for avatars, images
    icon: 10   // Lowest priority for pure icons
  };
  
  // Score components based on name patterns and usage indicators
  const scoredComponents = components.map(component => {
    let score = 0;
    const name = component.name.toLowerCase();
    
    // Check against component type patterns
    Object.entries(componentTypePriority).forEach(([type, priority]) => {
      const patterns = getPatternsByType(type);
      if (patterns.some(pattern => pattern.test(name))) {
        score = Math.max(score, priority);
      }
    });
    
    // If no specific UI type detected, check for generic UI indicators
    if (score === 0) {
      // Look for common UI patterns that might not match strict categories
      if (/element|component|widget|control/i.test(name)) {
        score = 40; // Medium priority for generic UI elements
      } else if (/template|layout|container/i.test(name)) {
        score = 50; // Higher priority for layout elements
      }
    }
    
    // Boost score for component sets (more variants = more important)
    if (component.type === 'COMPONENT_SET') {
      score += 25; // Increased boost for component sets
    }
    
    // Boost score for frequently named patterns
    if (/primary|secondary|main|default/.test(name)) {
      score += 15;
    }
    
    // Extra boost for non-icon components in icon-heavy documents
    if (score > 20 && !/icon|ico$/i.test(name)) {
      score += 10; // Boost non-icon components
    }
    
    // Penalty for overly specific or numbered variants
    if (/\d+$|\/variant|\/state/.test(name)) {
      score -= 5;
    }
    
    return { component, score, name };
  });
  
  // Enhanced selection with diversity enforcement
  const sortedByScore = scoredComponents.sort((a, b) => b.score - a.score);
  
  // First, select top scoring non-icon components to ensure UI diversity
  const nonIconComponents = sortedByScore.filter(item => item.score > 20);
  const iconComponents = sortedByScore.filter(item => item.score <= 20);
  
  let prioritized: (ComponentNode | ComponentSetNode)[] = [];
  
  // Take up to 80% from high-value UI components
  const uiLimit = Math.max(1, Math.floor(limit * 0.8));
  const uiComponents = nonIconComponents.slice(0, uiLimit);
  prioritized = [...uiComponents.map(item => item.component)];
  
  // Fill remainder with best icons if space available
  const remainingSlots = limit - prioritized.length;
  if (remainingSlots > 0) {
    const selectedIcons = iconComponents.slice(0, remainingSlots);
    prioritized = [...prioritized, ...selectedIcons.map(item => item.component)];
  }
    
  console.log('🎯 Component Prioritization Results:');
  prioritized.slice(0, 5).forEach((comp, i) => {
    const score = scoredComponents.find(sc => sc.component === comp)?.score;
    console.log(`  ${i+1}. ${comp.name} (score: ${score})`);
  });
  
  return prioritized;
}

// Get regex patterns by component type
function getPatternsByType(type: string): RegExp[] {
  const patterns: Record<string, RegExp[]> = {
    button: [/btn|button/i, /cta|call.to.action/i, /primary|secondary/i, /submit|confirm/i],
    input: [/input|field/i, /text.*field/i, /search/i, /textarea/i, /select|dropdown/i, /checkbox|radio/i],
    form: [/form/i, /login|register/i, /fieldset/i, /auth/i],
    card: [/card/i, /tile/i, /panel/i, /product.*card/i, /item.*card/i],
    modal: [/modal|dialog/i, /popup|overlay/i, /drawer/i, /alert.*dialog/i],
    navigation: [/nav|navigation/i, /menu/i, /breadcrumb/i, /tab/i, /sidebar/i],
    table: [/table|data.*table/i, /grid.*view/i, /list.*view/i, /row|column/i],
    layout: [/container|wrapper/i, /grid|layout/i, /section|header|footer/i, /main.*content/i],
    feedback: [/loading|spinner/i, /progress/i, /skeleton/i, /error.*state/i, /success.*message/i, /toast/i],
    media: [/image|img/i, /avatar|profile.*pic/i, /logo/i, /badge|chip|tag/i],
    // Enhanced icon patterns - separate functional icons from decorative ones
    icon: [/^icon/i, /ico$/i, /^lucide/i, /^feather/i, /^heroicon/i]
  };
  return patterns[type] || [];
}

// Generate universal insights
function generateUniversalInsights(pageAnalysis: any[], componentUsage: any[], styleAnalysis: any) {
  var insights: any[] = [];
  
  // Component insights
  if (componentUsage.length > 0) {
    var mostUsed = componentUsage[0];
    insights.push({
      category: 'Component Usage',
      insight: 'Most used component: ' + mostUsed.name + ' (' + mostUsed.count + ' instances across ' + mostUsed.pages.length + ' pages)',
      actionable: false,
      data: mostUsed
    });
    
    var componentsWithVariants = componentUsage.filter(function(c) { return c.variantDiversity > 1; });
    if (componentsWithVariants.length > 0) {
      insights.push({
        category: 'Component Variants',
        insight: componentsWithVariants.length + ' components use variants effectively',
        actionable: true,
        data: { count: componentsWithVariants.length, examples: componentsWithVariants.slice(0, 3) }
      });
    }
  }
  
  // Design system maturity insights
  var avgComponentsPerPage = pageAnalysis.reduce(function(sum, page) { return sum + page.componentCount; }, 0) / pageAnalysis.length;
  if (avgComponentsPerPage > 10) {
    insights.push({
      category: 'Design System Maturity',
      insight: 'High component usage (' + Math.round(avgComponentsPerPage) + ' components per page on average) indicates mature design system',
      actionable: false,
      data: { avgComponentsPerPage: Math.round(avgComponentsPerPage) }
    });
  }
  
  // Style consistency insights
  var tokenizableColors = styleAnalysis.colors.filter(function(c: any) { return c.usage >= 3; }).length;
  var tokenizableSpacing = styleAnalysis.spacing.filter(function(s: any) { return s.usage >= 2; }).length;
  
  insights.push({
    category: 'Token Opportunities',
    insight: tokenizableColors + ' colors and ' + tokenizableSpacing + ' spacing values could become design tokens',
    actionable: true,
    data: { colors: tokenizableColors, spacing: tokenizableSpacing }
  });
  
  return insights;
}

// Clean data for serialization
function cleanDataForSerialization(data: any): any {
  return JSON.parse(JSON.stringify(data, function(key, value) {
    // Remove any functions, symbols, or non-serializable objects
    if (typeof value === 'function' || typeof value === 'symbol') {
      return undefined;
    }
    // Handle Maps
    if (value instanceof Map) {
      var obj: any = {};
      value.forEach(function(val, key) {
        obj[key] = val;
      });
      return obj;
    }
    // Handle Sets
    if (value instanceof Set) {
      return Array.from(value);
    }
    return value;
  }));
}

figma.showUI(__html__, {
  width: 900,
  height: 800,
  themeColors: true
});

// Send a test message to UI on load
setTimeout(function() {
  figma.ui.postMessage({
    type: 'plugin-ready',
    message: 'Plugin loaded successfully!'
  });
}, 100);

figma.ui.onmessage = function(msg) {
  console.log('Plugin received message:', msg);
  console.log('Message type:', msg.type);
  
  if (msg.type === 'extract-basic') {
    console.log('Starting semantic variable extraction...');
    
    // Get all variable collections first to understand structure
    figma.variables.getLocalVariableCollectionsAsync().then(function(collections) {
      console.log('Found', collections.length, 'variable collections');
      
      var allVariablePromises: any[] = [];
      
      // Extract all variables from all collections
      for (var i = 0; i < collections.length; i++) {
        var collection = collections[i];
        console.log('Collection:', collection.name, 'with', collection.variableIds.length, 'variables');
        
        // Get all variables in this collection
        for (var j = 0; j < collection.variableIds.length; j++) {
          allVariablePromises.push(figma.variables.getVariableByIdAsync(collection.variableIds[j]));
        }
      }
      
      // Also get ALL legacy styles
      return Promise.all([
        Promise.all(allVariablePromises),
        figma.getLocalPaintStylesAsync(),
        figma.getLocalTextStylesAsync(),
        figma.getLocalEffectStylesAsync(),
        figma.getLocalGridStylesAsync()
      ]);
    }).then(function(results) {
      var allVariables = results[0];
      var paintStyles = results[1];
      var textStyles = results[2];
      var effectStyles = results[3];
      var gridStyles = results[4];
      
      console.log('Found', allVariables.length, 'total variables');
      console.log('Found', paintStyles.length, 'paint styles');
      console.log('Found', textStyles.length, 'text styles');
      console.log('Found', effectStyles.length, 'effect styles');
      console.log('Found', gridStyles.length, 'grid styles');
      
      // Log design system type based on what we found
      if (allVariables.length > 0 && paintStyles.length === 0) {
        console.log('🎯 Modern variable-based design system detected');
      } else if (paintStyles.length > 0 && allVariables.length === 0) {
        console.log('🎨 Legacy styles-based design system detected');
      } else if (allVariables.length > 0 && paintStyles.length > 0) {
        console.log('🔀 Hybrid design system (variables + styles) detected');
      } else {
        console.log('⚠️ Minimal design tokens detected');
      }
      
      // Organize variables semantically by type and name
      var semanticStructure: any = {
        metadata: {
          extractedAt: new Date().toISOString(),
          figmaFile: figma.root.name,
          totalVariables: allVariables.length,
          totalPaintStyles: paintStyles.length,
          totalTextStyles: textStyles.length,
          totalEffectStyles: effectStyles.length,
          totalGridStyles: gridStyles.length,
          extractedBy: 'DeVibe System Plugin'
        },
        variables: {},
        styles: {
          paint: {},
          text: {},
          effect: {},
          grid: {}
        }
      };
      
      // Group variables by type - filter out null values
      var variablesByType: any = {};
      
      for (var i = 0; i < allVariables.length; i++) {
        var variable = allVariables[i] as Variable;
        if (!variable) continue;
        
        var type = (variable as any).resolvedType;
        if (!variablesByType[type]) {
          variablesByType[type] = {};
        }
        
        // Create semantic value object
        var semanticValue: any = {
          id: variable.id,
          description: variable.description || '',
          scopes: variable.scopes,
          modes: {}
        };
        
        // Process all modes for this variable
        for (var modeId in (variable as any).valuesByMode) {
          var value = (variable as any).valuesByMode[modeId];
          
          if (type === 'COLOR' && value && typeof value === 'object' && 'r' in value) {
            var color = value as RGB;
            semanticValue.modes[modeId] = {
              hex: '#' + Math.round(color.r * 255).toString(16).padStart(2, '0') +
                    Math.round(color.g * 255).toString(16).padStart(2, '0') +
                    Math.round(color.b * 255).toString(16).padStart(2, '0'),
              rgb: {
                r: Math.round(color.r * 255),
                g: Math.round(color.g * 255),
                b: Math.round(color.b * 255)
              },
              hsl: rgbToHsl(color.r, color.g, color.b)
            };
          } else {
            semanticValue.modes[modeId] = value;
          }
        }
        
        // Create nested structure based on variable name
        createNestedObject(variablesByType[type], variable.name, semanticValue);
      }
      
      semanticStructure.variables = variablesByType;
      
      // Debug: Log the structure of extracted variables for alias resolution
      console.log('🔍 Debug: Variables extracted for alias resolution:');
      Object.entries(variablesByType).forEach(([type, vars]: [string, any]) => {
        console.log(`  ${type}: ${Object.keys(vars).length} variables`);
        if (type === 'COLOR') {
          // Log first few color variables to understand structure
          const colorKeys = Object.keys(vars).slice(0, 3);
          colorKeys.forEach(key => {
            console.log(`    ${key}:`, JSON.stringify(vars[key], null, 2).slice(0, 200) + '...');
          });
        }
      });
      
      // Process paint styles semantically
      for (var j = 0; j < paintStyles.length; j++) {
        var paintStyle = paintStyles[j] as PaintStyle;
        var paints: any[] = [];
        
        // Extract all paints (not just the first one)
        for (var p = 0; p < paintStyle.paints.length; p++) {
          var paint = paintStyle.paints[p];
          var paintData: any = {
            type: paint.type,
            visible: paint.visible !== false,
            opacity: paint.opacity || 1,
            blendMode: paint.blendMode || 'NORMAL'
          };
          
          if (paint.type === 'SOLID') {
            paintData.color = {
              hex: '#' + Math.round(paint.color.r * 255).toString(16).padStart(2, '0') +
                    Math.round(paint.color.g * 255).toString(16).padStart(2, '0') +
                    Math.round(paint.color.b * 255).toString(16).padStart(2, '0'),
              rgb: {
                r: Math.round(paint.color.r * 255),
                g: Math.round(paint.color.g * 255),
                b: Math.round(paint.color.b * 255)
              },
              hsl: rgbToHsl(paint.color.r, paint.color.g, paint.color.b)
            };
          } else if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL' || paint.type === 'GRADIENT_ANGULAR' || paint.type === 'GRADIENT_DIAMOND') {
            paintData.gradientStops = paint.gradientStops?.map(function(stop) {
              return {
                position: stop.position,
                color: {
                  hex: '#' + Math.round(stop.color.r * 255).toString(16).padStart(2, '0') +
                        Math.round(stop.color.g * 255).toString(16).padStart(2, '0') +
                        Math.round(stop.color.b * 255).toString(16).padStart(2, '0'),
                  rgb: {
                    r: Math.round(stop.color.r * 255),
                    g: Math.round(stop.color.g * 255),
                    b: Math.round(stop.color.b * 255)
                  }
                }
              };
            });
            paintData.gradientTransform = paint.gradientTransform;
          } else if (paint.type === 'IMAGE') {
            paintData.imageHash = paint.imageHash || null;
            paintData.scaleMode = paint.scaleMode || 'FILL';
            paintData.imageTransform = paint.imageTransform;
          }
          
          paints.push(paintData);
        }
        
        var paintStyleValue = {
          id: paintStyle.id,
          description: paintStyle.description || '',
          type: 'PAINT_STYLE',
          paints: paints
        };
        
        createNestedObject(semanticStructure.styles.paint, paintStyle.name, paintStyleValue);
      }
      
      // Process text styles semantically
      for (var k = 0; k < textStyles.length; k++) {
        var textStyle = textStyles[k] as TextStyle;
        var textValue = {
          id: textStyle.id,
          description: textStyle.description || '',
          type: 'TEXT_STYLE',
          fontFamily: textStyle.fontName ? textStyle.fontName.family : 'Unknown',
          fontWeight: textStyle.fontName ? textStyle.fontName.style : 'Unknown',
          fontSize: textStyle.fontSize,
          lineHeight: textStyle.lineHeight,
          letterSpacing: textStyle.letterSpacing,
          paragraphSpacing: textStyle.paragraphSpacing,
          paragraphIndent: textStyle.paragraphIndent,
          textCase: textStyle.textCase || 'ORIGINAL',
          textDecoration: textStyle.textDecoration || 'NONE',
          hangingPunctuation: textStyle.hangingPunctuation || false,
          hangingList: textStyle.hangingList || false
        };
        
        createNestedObject(semanticStructure.styles.text, textStyle.name, textValue);
      }
      
      // Process effect styles semantically
      for (var l = 0; l < effectStyles.length; l++) {
        var effectStyle = effectStyles[l] as EffectStyle;
        var effects: any[] = [];
        
        for (var e = 0; e < effectStyle.effects.length; e++) {
          var effect = effectStyle.effects[e];
          var effectData: any = {
            type: effect.type,
            visible: effect.visible !== false
          };
          
          // Handle different effect types
          if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
            var shadowEffect = effect as DropShadowEffect;
            effectData.radius = shadowEffect.radius || 0;
            effectData.spread = shadowEffect.spread || 0;
            effectData.offset = shadowEffect.offset || { x: 0, y: 0 };
            effectData.blendMode = shadowEffect.blendMode || 'NORMAL';
            effectData.color = {
              hex: '#' + Math.round(shadowEffect.color.r * 255).toString(16).padStart(2, '0') +
                    Math.round(shadowEffect.color.g * 255).toString(16).padStart(2, '0') +
                    Math.round(shadowEffect.color.b * 255).toString(16).padStart(2, '0'),
              rgb: {
                r: Math.round(shadowEffect.color.r * 255),
                g: Math.round(shadowEffect.color.g * 255),
                b: Math.round(shadowEffect.color.b * 255),
                a: shadowEffect.color.a || 1
              }
            };
          } else if (effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR') {
            var blurEffect = effect as BlurEffect;
            effectData.radius = blurEffect.radius || 0;
          } else if (effect.type === 'NOISE') {
            // Noise effects have different properties based on type
            effectData.noiseType = 'NOISE';
          }
          
          effects.push(effectData);
        }
        
        var effectStyleValue = {
          id: effectStyle.id,
          description: effectStyle.description || '',
          type: 'EFFECT_STYLE',
          effects: effects
        };
        
        createNestedObject(semanticStructure.styles.effect, effectStyle.name, effectStyleValue);
      }
      
      // Process grid styles semantically
      for (var m = 0; m < gridStyles.length; m++) {
        var gridStyle = gridStyles[m] as GridStyle;
        var grids: any[] = [];
        
        for (var g = 0; g < gridStyle.layoutGrids.length; g++) {
          var grid = gridStyle.layoutGrids[g];
          var gridData: any = {
            pattern: grid.pattern,
            visible: grid.visible !== false
          };
          
          if (grid.pattern === 'COLUMNS' || grid.pattern === 'ROWS') {
            gridData.alignment = grid.alignment || 'MIN';
            gridData.gutterSize = grid.gutterSize || 0;
            gridData.offset = grid.offset || 0;
            gridData.count = grid.count || 1;
            gridData.sectionSize = grid.sectionSize || 0;
          } else if (grid.pattern === 'GRID') {
            gridData.sectionSize = grid.sectionSize || 0;
          }
          
          if (grid.color) {
            gridData.color = {
              hex: '#' + Math.round(grid.color.r * 255).toString(16).padStart(2, '0') +
                    Math.round(grid.color.g * 255).toString(16).padStart(2, '0') +
                    Math.round(grid.color.b * 255).toString(16).padStart(2, '0'),
              rgb: {
                r: Math.round(grid.color.r * 255),
                g: Math.round(grid.color.g * 255),
                b: Math.round(grid.color.b * 255),
                a: grid.color.a || 1
              }
            };
          }
          
          grids.push(gridData);
        }
        
        var gridStyleValue = {
          id: gridStyle.id,
          description: gridStyle.description || '',
          type: 'GRID_STYLE',
          layoutGrids: grids
        };
        
        createNestedObject(semanticStructure.styles.grid, gridStyle.name, gridStyleValue);
      }
      
      // Now add component analysis
      return analyzeComponents().then(function(componentAnalysis) {
        // Combine design tokens with component analysis
        var completeData = Object.assign({}, semanticStructure, {
          componentAnalysis: componentAnalysis
        });
        
        // CRITICAL: Resolve all variable aliases using enhanced resolver
        console.log('🔗 Starting enhanced variable alias resolution...');
        console.log('📍 CHECKPOINT 1: Reached resolver initialization');
        console.log('Original data sample:', JSON.stringify(completeData.variables?.COLOR || {}, null, 2).slice(0, 500) + '...');
        console.log('📍 CHECKPOINT 2: About to create EnhancedVariableAliasResolver');
        
        try {
          var enhancedResolver = new EnhancedVariableAliasResolver(true); // Enable debug mode
          console.log('📍 CHECKPOINT 3: EnhancedVariableAliasResolver created successfully');
          console.log('📍 CHECKPOINT 4: About to call resolveVariables()');
          var resolvedData = enhancedResolver.resolveVariables(completeData);
          console.log('📍 CHECKPOINT 5: resolveVariables() returned successfully');
          
          // Log sample of resolved data
          console.log('Resolved data sample:', JSON.stringify(resolvedData.variables?.COLOR || {}, null, 2).slice(0, 500) + '...');
          
          // Validate that aliases were resolved
          var isValid = enhancedResolver.validateResolvedData(resolvedData);
          if (!isValid) {
            console.warn('⚠️ Some aliases may not have been resolved properly');
          } else {
            console.log('🎉 Enhanced variable alias resolution completed successfully!');
          }
          
        } catch (aliasError) {
          console.error('❌ Error in enhanced alias resolution:', aliasError);
          console.error('Stack trace:', (aliasError as any).stack);
          // Fallback to original data if alias resolution fails
          var resolvedData = completeData;
          console.warn('⚠️ Falling back to original data without alias resolution');
        }
        
        // Generate unified markdown using resolved data
        console.log('Generating unified markdown with resolved values...');
        try {
          var markdownContent = generateUnifiedMarkdown({
            figmaFileName: figma.root.name,
            extractedData: resolvedData,  // Use resolved data instead of raw data
            includeUsageStats: true,
            includeImplementations: true
          });
          console.log('Markdown generated successfully, length:', markdownContent.length);
        } catch (error) {
          console.error('Error generating markdown:', error);
          var markdownContent = '# Error generating markdown\n\nAn error occurred while generating the markdown documentation.';
        }
        
        // Clean resolved data for serialization
        var cleanData = cleanDataForSerialization(resolvedData);
        
        // Send the complete structure to UI
        console.log('Sending resolved data to UI...');
        console.log('Markdown content length:', markdownContent ? markdownContent.length : 'undefined');
        var messageData = {
          type: 'extraction-complete',
          data: cleanData,  // Send resolved data
          markdown: markdownContent || '# Fallback Markdown\n\nMarkdown generation failed.',
          fileName: figma.root.name + '-design-system.md'
        };
        console.log('Sending message with keys:', Object.keys(messageData));
        figma.ui.postMessage(messageData);
      });
    }).then(function() {
      console.log('Complete extraction finished');
    }).catch(function(error) {
      console.error('Error in complete extraction:', error);
      figma.ui.postMessage({
        type: 'error',
        message: 'Failed to extract complete design system: ' + error.message
      });
    });
  }
  
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};