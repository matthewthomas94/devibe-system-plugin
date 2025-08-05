// Simplified version of the main plugin
console.log('DeVibe System Plugin Loading...');

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

// Main Component Analysis Engine - Focused on Component Definitions Only
async function analyzeComponents() {
  console.log('Starting main component analysis...');
  
  // Load all pages first (required for findAll with dynamic-page access)
  await figma.loadAllPagesAsync();
  
  // Find all main components, prioritizing component sets over individual components
  var allComponents = figma.root.findAll(function(node) { 
    return node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'; 
  }) as (ComponentNode | ComponentSetNode)[];
  
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
  var mainComponents = [...componentSets, ...standaloneComponents];
  
  console.log('Found', mainComponents.length, 'main components');
  
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
  
  // Analyze each main component
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
    
    // Get all instances first, then filter asynchronously
    var allInstances = figma.root.findAll(function(node) { 
      return node.type === 'INSTANCE';
    }) as InstanceNode[];
    
    // Filter instances that belong to this component (async)
    var instances: InstanceNode[] = [];
    for (var k = 0; k < allInstances.length; k++) {
      var instance = allInstances[k];
      try {
        var mainComp = await instance.getMainComponentAsync();
        if (mainComp && mainComp.id === component.id) {
          instances.push(instance);
        }
      } catch (e) {
        // Skip instances that can't be resolved
      }
    }
    
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
function analyzeLayoutPatterns(page: PageNode, layoutPatterns: Map<any, any>) {
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
      
      var allVariablePromises: Promise<Variable | null>[] = [];
      
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
        
        var type = variable.resolvedType;
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
        for (var modeId in variable.valuesByMode) {
          var value = variable.valuesByMode[modeId];
          
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
        
        // Generate unified markdown
        console.log('Generating unified markdown...');
        try {
          var markdownContent = generateUnifiedMarkdown({
            figmaFileName: figma.root.name,
            extractedData: completeData,
            includeUsageStats: true,
            includeImplementations: true
          });
          console.log('Markdown generated successfully, length:', markdownContent.length);
        } catch (error) {
          console.error('Error generating markdown:', error);
          var markdownContent = '# Error generating markdown\n\nAn error occurred while generating the markdown documentation.';
        }
        
        // Clean data for serialization
        var cleanData = cleanDataForSerialization(completeData);
        
        // Send the complete structure to UI
        console.log('Sending data to UI...');
        console.log('Markdown content length:', markdownContent ? markdownContent.length : 'undefined');
        var messageData = {
          type: 'extraction-complete',
          data: cleanData,
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