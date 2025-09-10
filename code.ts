// Main plugin code for DeVibe System - AI-Optimized Design System Extractor
import { PluginMessage, PluginState, ExtractionConfig, AIOptimizedOutput } from './types';

// Import extractors
import { ComponentExtractor } from './extractors/components';
import { DesignSystemExtractor } from './extractors/design-system-extractor';

// Import generators
import { UtilityCSSGenerator } from './generators/utility-css';
import { TailwindConfigGenerator } from './generators/tailwind-config';
import { ComponentLibraryGenerator } from './generators/component-library';
import { AIContextGenerator } from './generators/ai-context';

// Import formatters
import { AIFriendlyNamingFormatter } from './formatters/ai-friendly-naming';

// Plugin state
let currentState: PluginState = {
  currentStep: 'analyze',
  extractedTokens: [],
  analyzedComponents: [],
  config: {
    includeColors: true,
    includeTypography: true,
    includeSpacing: true,
    includeComponents: true,
    namingConvention: 'kebab-case',
    outputFormats: ['css-utilities', 'tailwind-config', 'react-components', 'context-cards'],
    aiToolTargets: ['all'],
    semanticNaming: true,
    includeUsageExamples: true,
    generateDocumentation: true
  },
  outputs: [],
  isProcessing: false
};

// Initialize plugin
figma.showUI(__html__, { 
  width: 800, 
  height: 600,
  themeColors: true 
});

// Handle plugin messages
figma.ui.onmessage = async (msg: PluginMessage | { type: 'ui-ready' }) => {
  try {
    switch (msg.type) {
      case 'ui-ready':
        // Send initial state to UI
        figma.ui.postMessage({
          type: 'plugin-ready',
          state: currentState
        });
        break;
        
      case 'extract-tokens':
        await handleTokenExtraction((msg as any).config);
        break;
      
      case 'generate-outputs':
        await handleOutputGeneration((msg as any).formats);
        break;
      
      case 'export-output':
        await handleOutputExport((msg as any).format, (msg as any).content);
        break;
      
      case 'update-config':
        handleConfigUpdate((msg as any).config);
        break;
      
      default:
        console.warn('Unknown message type:', (msg as any).type);
    }
  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }
};

async function handleTokenExtraction(config: ExtractionConfig) {
  currentState.isProcessing = true;
  currentState.config = Object.assign({}, currentState.config, config);
  
  try {
    figma.ui.postMessage({ type: 'status', message: 'Starting enhanced design system extraction with variable resolution...' });
    
    // Get Figma file data for variable resolution
    const figmaData = await getFigmaFileData();
    
    // Use enhanced design system extractor
    const designSystemExtractor = new DesignSystemExtractor();
    const extractionResult = await designSystemExtractor.extractDesignSystem(figmaData);
    
    // Update UI with extraction progress and stats
    figma.ui.postMessage({ 
      type: 'status', 
      message: `Variable resolution complete! Resolved ${extractionResult.resolutionStats.resolvedAliases} aliases from ${extractionResult.resolutionStats.totalVariables} variables.` 
    });
    
    // Combine all extracted tokens
    let extractedTokens: any[] = [];
    extractedTokens = extractedTokens.concat(extractionResult.colors.tokens);
    extractedTokens = extractedTokens.concat(extractionResult.typography);
    extractedTokens = extractedTokens.concat(extractionResult.spacing);
    
    // Extract components if requested
    let analyzedComponents: any[] = [];
    if (config.includeComponents) {
      figma.ui.postMessage({ type: 'status', message: 'Analyzing components...' });
      const componentExtractor = new ComponentExtractor();
      const components = await componentExtractor.extractComponents();
      analyzedComponents = analyzedComponents.concat(components);
    }
    
    // Apply AI-friendly naming if enabled
    if (config.semanticNaming) {
      figma.ui.postMessage({ type: 'status', message: 'Optimizing names for AI tools...' });
      const namingFormatter = new AIFriendlyNamingFormatter();
      
      // Format tokens for each target AI tool
      for (const aiTool of config.aiToolTargets) {
        if (aiTool !== 'all') {
          const { tokens } = namingFormatter.formatForAITool(extractedTokens, aiTool as any);
          // Store formatted tokens for this AI tool
          currentState.extractedTokens = tokens;
        }
      }
    }
    
    // Store enhanced extraction results
    currentState.extractedTokens = extractedTokens;
    currentState.analyzedComponents = analyzedComponents;
    (currentState as any).designSystemResult = extractionResult; // Store full result for later use
    currentState.currentStep = 'configure';
    currentState.isProcessing = false;
    
    // Send results to UI with enhanced information
    figma.ui.postMessage({
      type: 'analyze-complete',
      tokens: extractedTokens,
      components: analyzedComponents,
      resolutionStats: extractionResult.resolutionStats,
      extractionSummary: extractionResult.summary
    });
    
    figma.ui.postMessage({ 
      type: 'status', 
      message: `Enhanced extraction complete! Found ${extractedTokens.length} tokens, ${analyzedComponents.length} components. Resolved ${extractionResult.resolutionStats.resolvedAliases} variable aliases in ${extractionResult.summary.extractionTime}ms.` 
    });
    
    // Also provide the enhanced markdown documentation
    figma.ui.postMessage({
      type: 'enhanced-markdown-ready',
      markdown: extractionResult.markdown
    });
    
  } catch (error) {
    currentState.isProcessing = false;
    throw error;
  }
}

async function getFigmaFileData(): Promise<any> {
  // This function collects comprehensive Figma file data including variables
  const data: any = {
    pages: [],
    styles: {
      paint: figma.getLocalPaintStyles(),
      text: figma.getLocalTextStyles(),
      effect: figma.getLocalEffectStyles(),
      grid: figma.getLocalGridStyles()
    },
    components: figma.root.findAll(node => node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'),
    variables: {},
    variableCollections: []
  };
  
  // Collect variable data if available
  try {
    // Get all variable collections
    const collections = figma.variables.getLocalVariableCollections();
    data.variableCollections = collections;
    
    // Get all variables from collections
    for (const collection of collections) {
      const variables = collection.variableIds.map(id => figma.variables.getVariableById(id));
      data.variables[collection.id] = variables.filter(v => v !== null);
    }
    
    // Also try to get variables directly
    const allVariables = figma.variables.getLocalVariables();
    if (allVariables.length > 0) {
      data.allVariables = allVariables;
    }
  } catch (error) {
    console.warn('Could not access Figma variables API:', error);
    // Fallback to style-based extraction
  }
  
  // Collect page data
  for (const page of figma.root.children) {
    data.pages.push({
      id: page.id,
      name: page.name,
      children: page.children.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type
      }))
    });
  }
  
  return data;
}

async function handleOutputGeneration(formats: string[]) {
  currentState.isProcessing = true;
  currentState.currentStep = 'generate';
  
  try {
    figma.ui.postMessage({ type: 'status', message: 'Generating AI-optimized outputs...' });
    
    const outputs: AIOptimizedOutput[] = [];
    
    // Separate tokens by type
    const colors = currentState.extractedTokens.filter(t => t.type === 'color');
    const typography = currentState.extractedTokens.filter(t => t.type === 'typography');
    const spacing = currentState.extractedTokens.filter(t => t.type === 'spacing');
    const components = currentState.analyzedComponents;
    
    // Initialize generators
    const utilityCSSGenerator = new UtilityCSSGenerator(currentState.config);
    const tailwindConfigGenerator = new TailwindConfigGenerator(currentState.config);
    const componentLibraryGenerator = new ComponentLibraryGenerator(currentState.config);
    const aiContextGenerator = new AIContextGenerator(currentState.config);
    
    // Generate outputs based on requested formats
    if (formats.includes('css-utilities')) {
      figma.ui.postMessage({ type: 'status', message: 'Generating utility CSS...' });
      const cssContent = utilityCSSGenerator.generateUtilityCSS(colors as any, typography as any, spacing as any);
      
      outputs.push({
        format: 'css-utilities',
        content: cssContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiToolCompatibility: currentState.config.aiToolTargets,
          usageInstructions: 'Include this CSS file in your project for utility-first styling',
          copyPasteReady: true,
          dependencies: []
        }
      });
    }
    
    if (formats.includes('tailwind-config')) {
      figma.ui.postMessage({ type: 'status', message: 'Generating Tailwind config...' });
      const tailwindConfig = tailwindConfigGenerator.generateTailwindConfig(colors as any, typography as any, spacing as any);
      
      outputs.push({
        format: 'tailwind-config',
        content: tailwindConfig,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiToolCompatibility: currentState.config.aiToolTargets,
          usageInstructions: 'Replace your tailwind.config.js with this configuration',
          copyPasteReady: true,
          dependencies: ['tailwindcss', '@tailwindcss/forms', '@tailwindcss/typography']
        }
      });
    }
    
    if (formats.includes('react-components')) {
      figma.ui.postMessage({ type: 'status', message: 'Generating React components...' });
      const componentLibrary = componentLibraryGenerator.generateComponentLibrary(components);
      
      outputs.push({
        format: 'react-components',
        content: componentLibrary,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiToolCompatibility: currentState.config.aiToolTargets,
          usageInstructions: 'Copy components to your src/components directory',
          copyPasteReady: true,
          dependencies: ['react', 'clsx']
        }
      });
    }
    
    if (formats.includes('context-cards')) {
      figma.ui.postMessage({ type: 'status', message: 'Generating AI context...' });
      const aiContext = aiContextGenerator.generateAIPromptContext(colors as any, typography as any, spacing as any, components);
      
      outputs.push({
        format: 'context-cards',
        content: aiContext,
        metadata: {
          generatedAt: new Date().toISOString(),
          aiToolCompatibility: currentState.config.aiToolTargets,
          usageInstructions: 'Provide this context to AI tools when generating interfaces',
          copyPasteReady: true,
          dependencies: []
        }
      });
    }
    
    currentState.outputs = outputs;
    currentState.currentStep = 'export';
    currentState.isProcessing = false;
    
    figma.ui.postMessage({
      type: 'generation-complete',
      outputs: outputs
    });
    
    figma.ui.postMessage({ 
      type: 'status', 
      message: `Generated ${outputs.length} output formats ready for AI tools!` 
    });
    
  } catch (error) {
    currentState.isProcessing = false;
    throw error;
  }
}

async function handleOutputExport(format: string, content: string) {
  try {
    // For now, we'll copy to clipboard
    // In a real plugin, you might save to file or provide download
    figma.ui.postMessage({
      type: 'copy-to-clipboard',
      content: content,
      format: format
    });
    
    figma.notify(`${format} copied to clipboard!`);
    
  } catch (error) {
    figma.notify(`Error exporting ${format}: ${error}`, { error: true });
  }
}

function handleConfigUpdate(configUpdate: Partial<ExtractionConfig>) {
  currentState.config = Object.assign({}, currentState.config, configUpdate);
  
  figma.ui.postMessage({
    type: 'config-updated',
    config: currentState.config
  });
}

// Handle plugin close
figma.on('close', () => {
  // Cleanup if needed
});

// Utility functions for the plugin
export function getCurrentSelection(): readonly SceneNode[] {
  return figma.currentPage.selection;
}

export function getAllPages(): readonly PageNode[] {
  return figma.root.children;
}

export function findNodesByType<T extends SceneNode>(type: T['type']): T[] {
  return figma.root.findAll(node => node.type === type) as T[];
}

// Helper to safely access Figma API
export function safelyAccessNode<T>(
  callback: () => T,
  fallback: T,
  errorMessage?: string
): T {
  try {
    return callback();
  } catch (error) {
    if (errorMessage) {
      console.warn(errorMessage, error);
    }
    return fallback;
  }
}

// Export plugin metadata for debugging
export const PLUGIN_METADATA = {
  name: 'DeVibe System - AI-Optimized Design System Extractor',
  version: '1.0.0',
  description: 'Extract design system tokens optimized for AI prototyping tools',
  supportedAITools: ['bolt', 'v0', 'loveable', 'cursor', 'figma-make'],
  outputFormats: ['css-utilities', 'tailwind-config', 'react-components', 'context-cards'],
  features: [
    'Semantic token naming',
    'AI-friendly documentation',
    'Component analysis',
    'Accessibility compliance',
    'Responsive design support',
    'Usage examples generation'
  ]
};