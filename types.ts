// Core Design System Types
export interface DesignToken {
  name: string;
  value: string | number;
  type: 'color' | 'typography' | 'spacing' | 'shadow' | 'border' | 'opacity';
  description?: string;
  semanticName?: string;
  category?: string;
  usage?: string[];
}

export interface ColorToken extends DesignToken {
  type: 'color';
  value: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  semanticRole?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'success' | 'warning' | 'error' | 'info';
  contrastRatio?: number;
}

export interface TypographyToken extends DesignToken {
  type: 'typography';
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: string;
  semanticLevel?: 'heading-xl' | 'heading-lg' | 'heading-md' | 'heading-sm' | 'body-lg' | 'body-md' | 'body-sm' | 'caption';
}

export interface SpacingToken extends DesignToken {
  type: 'spacing';
  value: number;
  semanticName: string;
  usage: string[];
}

// Component Analysis Types
export interface ComponentVariant {
  name: string;
  properties: Record<string, any>;
  description?: string;
  usage?: string;
}

export interface AnalyzedComponent {
  name: string;
  type: 'button' | 'input' | 'card' | 'modal' | 'navigation' | 'layout' | 'table' | 'form' | 'media' | 'feedback' | 'other';
  variants: ComponentVariant[];
  props: ComponentProp[];
  usage: string[];
  examples: string[];
  semanticDescription: string;
  accessibility: AccessibilityInfo;
}

export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum';
  required: boolean;
  default?: any;
  description: string;
  enumValues?: string[];
}

export interface AccessibilityInfo {
  ariaLabels: string[];
  keyboardNavigation: boolean;
  colorContrast: 'AA' | 'AAA' | 'fail';
  focusManagement: boolean;
}

export interface ComponentUsageAnalysis {
  instanceCount: number;
  usageContexts: string[];
  pagesUsed: string[];
  examples: ComponentUsageExample[];
}

export interface ComponentUsageExample {
  name: string;
  page: string;
  context: string;
}

// AI Tool Output Types
export interface AIOptimizedOutput {
  format: 'css-utilities' | 'tailwind-config' | 'react-components' | 'design-tokens' | 'context-cards';
  content: string;
  metadata: OutputMetadata;
}

export interface OutputMetadata {
  generatedAt: string;
  aiToolCompatibility: string[];
  usageInstructions: string;
  copyPasteReady: boolean;
  dependencies: string[];
}

// Configuration Types
export interface ExtractionConfig {
  includeColors: boolean;
  includeTypography: boolean;
  includeSpacing: boolean;
  includeComponents: boolean;
  namingConvention: 'kebab-case' | 'camelCase' | 'PascalCase' | 'snake_case';
  outputFormats: string[];
  aiToolTargets: ('bolt' | 'v0' | 'loveable' | 'figma-make' | 'cursor' | 'all')[];
  semanticNaming: boolean;
  includeUsageExamples: boolean;
  generateDocumentation: boolean;
}

// Design System Context for AI Tools
export interface DesignSystemContext {
  name: string;
  version: string;
  description: string;
  principles: string[];
  colorPhilosophy: string;
  typographyApproach: string;
  spacingSystem: string;
  componentPatterns: string[];
  accessibility: {
    level: 'AA' | 'AAA';
    guidelines: string[];
  };
  responsiveStrategy: string;
  commonUsagePatterns: UsagePattern[];
}

export interface UsagePattern {
  pattern: string;
  description: string;
  code: string;
  usage: string;
}

// Variable Resolution Types
export interface FigmaVariable {
  id: string;
  name: string;
  description?: string;
  type: string;
  scopes: string[];
  modes: Record<string, VariableValue>;
  valuesByMode?: Record<string, VariableValue>;
}

export interface VariableValue {
  type?: 'VARIABLE_ALIAS';
  id?: string;
  hex?: string;
  rgb?: { r: number; g: number; b: number };
  value?: any;
  r?: number;
  g?: number;
  b?: number;
}

export interface ResolvedVariable {
  id: string;
  name: string;
  modes: Record<string, any>;
}

export interface VariableResolutionResult {
  resolved: any;
  primitiveCount: number;
  aliasCount: number;
  resolutionStats: {
    totalVariables: number;
    resolvedAliases: number;
    unresolvedAliases: number;
    primitiveValues: number;
  };
}

// Utility Types
export interface SemanticMapping {
  originalName: string;
  semanticName: string;
  confidence: number;
  reasoning: string;
}

export interface NamingStrategy {
  prefix?: string;
  suffix?: string;
  convention: 'kebab-case' | 'camelCase' | 'PascalCase' | 'snake_case';
  semantic: boolean;
}

// Plugin State Types
export interface PluginState {
  currentStep: 'analyze' | 'configure' | 'generate' | 'export';
  extractedTokens: DesignToken[];
  analyzedComponents: AnalyzedComponent[];
  config: ExtractionConfig;
  outputs: AIOptimizedOutput[];
  isProcessing: boolean;
  error?: string;
}

// Message Types for Plugin Communication
export type PluginMessage = 
  | { type: 'extract-tokens'; config: ExtractionConfig }
  | { type: 'generate-outputs'; formats: string[] }
  | { type: 'export-output'; format: string; content: string }
  | { type: 'update-config'; config: Partial<ExtractionConfig> }
  | { type: 'analyze-complete'; tokens: DesignToken[]; components: AnalyzedComponent[] }
  | { type: 'generation-complete'; outputs: AIOptimizedOutput[] }
  | { type: 'error'; message: string };