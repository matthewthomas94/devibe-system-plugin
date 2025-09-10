import { FigmaVariable, VariableValue, ResolvedVariable, VariableResolutionResult } from '../types';

export class EnhancedVariableAliasResolver {
  private variableMap: Map<string, FigmaVariable> = new Map();
  private primitiveValues: Map<string, any> = new Map();
  private resolvedCache: Map<string, any> = new Map();
  private debugMode: boolean = true;
  private resolutionStats = {
    totalVariables: 0,
    resolvedAliases: 0,
    unresolvedAliases: 0,
    primitiveValues: 0
  };

  constructor(debugMode: boolean = true) {
    this.debugMode = debugMode;
  }

  public resolveVariables(data: any): VariableResolutionResult {
    this.log('Starting variable resolution process...');
    this.resetStats();
    
    this.buildVariableMaps(data);
    this.identifyPrimitives();
    const resolved = this.resolveAllAliases(data);
    
    this.log(`Resolution complete. Resolved ${this.resolvedCache.size} aliases.`);
    
    return {
      resolved,
      primitiveCount: this.resolutionStats.primitiveValues,
      aliasCount: this.resolutionStats.resolvedAliases,
      resolutionStats: this.resolutionStats
    };
  }

  private resetStats(): void {
    this.variableMap.clear();
    this.primitiveValues.clear();
    this.resolvedCache.clear();
    this.resolutionStats = {
      totalVariables: 0,
      resolvedAliases: 0,
      unresolvedAliases: 0,
      primitiveValues: 0
    };
  }

  private buildVariableMaps(data: any): void {
    this.log('Building variable maps...');

    if (data.variables) {
      this.processVariableCollection(data.variables);
    }

    if (data.variableCollections) {
      for (const collection of data.variableCollections) {
        if (collection.variables) {
          this.processVariableCollection(collection.variables);
        }
      }
    }

    this.deepSearchForVariables(data);
    this.resolutionStats.totalVariables = this.variableMap.size;
    this.log(`Found ${this.variableMap.size} variables in total`);
  }

  private processVariableCollection(variables: any): void {
    if (Array.isArray(variables)) {
      variables.forEach(variable => this.addVariable(variable));
    } else if (typeof variables === 'object') {
      Object.entries(variables).forEach(([key, variable]: [string, any]) => {
        if (this.isVariable(variable)) {
          this.addVariable({ ...variable, id: variable.id || key });
        } else if (variable && typeof variable === 'object') {
          Object.entries(variable).forEach(([subKey, subVar]: [string, any]) => {
            if (this.isVariable(subVar)) {
              this.addVariable({ ...subVar, id: subVar.id || subKey });
            }
          });
        }
      });
    }
  }

  private isVariable(obj: any): boolean {
    return obj && (
      obj.modes || 
      obj.valuesByMode || 
      obj.type === 'COLOR' || 
      obj.resolvedType === 'COLOR' ||
      (obj.id && typeof obj.id === 'string' && obj.id.includes('Variable'))
    );
  }

  private addVariable(variable: any): void {
    if (!variable) return;

    const id = variable.id || '';
    
    const idFormats = [
      id,
      id.replace('VariableID:', ''),
      `VariableID:${id}`,
      id.split(':').pop() || id
    ];

    idFormats.forEach(formatId => {
      if (formatId) {
        this.variableMap.set(formatId, variable);
      }
    });

    this.log(`Added variable: ${variable.name || id} with ${idFormats.length} ID formats`);
  }

  private deepSearchForVariables(obj: any, depth: number = 0): void {
    if (depth > 10 || !obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      if (this.isVariable(value)) {
        this.addVariable({ ...value, id: value.id || key });
      } else if (key === 'colors' || key === 'spacing' || key === 'typography') {
        this.processTokenCategory(value);
      } else if (typeof value === 'object') {
        this.deepSearchForVariables(value, depth + 1);
      }
    }
  }

  private processTokenCategory(category: any): void {
    if (!category || typeof category !== 'object') return;

    Object.entries(category).forEach(([groupName, group]: [string, any]) => {
      if (typeof group === 'object') {
        Object.entries(group).forEach(([tokenName, token]: [string, any]) => {
          if (this.isVariable(token)) {
            this.addVariable({
              ...token,
              id: token.id || `${groupName}:${tokenName}`,
              name: `${groupName}/${tokenName}`
            });
          }
        });
      }
    });
  }

  private identifyPrimitives(): void {
    this.log('Identifying primitive values...');
    
    for (const [id, variable] of this.variableMap.entries()) {
      const modes = variable.modes || variable.valuesByMode || {};
      
      for (const [modeId, value] of Object.entries(modes)) {
        if (this.isPrimitiveValue(value)) {
          const key = `${id}:${modeId}`;
          this.primitiveValues.set(key, this.extractPrimitiveValue(value));
          this.resolutionStats.primitiveValues++;
          this.log(`Found primitive: ${variable.name || id} = ${JSON.stringify(value)}`);
        }
      }
    }
    
    this.log(`Identified ${this.primitiveValues.size} primitive values`);
  }

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

  private extractPrimitiveValue(value: any): any {
    if (value.hex) return value.hex;
    if (value.rgb) return this.rgbToHex(value.rgb);
    if (value.r !== undefined) return this.rgbToHex(value);
    if (typeof value === 'string' && value.startsWith('#')) return value;
    if (value.value !== undefined) return value.value;
    return value;
  }

  private rgbToHex(rgb: { r: number; g: number; b: number }): string {
    const toHex = (n: number) => {
      const hex = Math.round(n * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  private resolveAllAliases(data: any): any {
    return this.traverseAndResolve(data);
  }

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
      
      if (this.isAlias(value)) {
        resolved[key] = this.resolveAlias(value, currentPath);
      } else if (key === 'modes' && typeof value === 'object') {
        resolved[key] = this.resolveModes(value, currentPath);
      } else if (typeof value === 'object') {
        resolved[key] = this.traverseAndResolve(value, currentPath);
      } else {
        resolved[key] = value;
      }
    }
    
    return resolved;
  }

  private isAlias(value: any): boolean {
    return value && (
      value.type === 'VARIABLE_ALIAS' ||
      (value.id && typeof value.id === 'string' && !value.hex && !value.rgb)
    );
  }

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

  private getModeName(modeId: string): string {
    const modeMap: Record<string, string> = {
      '40000015:1': 'light',
      '40000015:2': 'dark',
      '111:3': 'default',
      '594:0': 'default',
      '89:0': 'default',
      '20:0': 'light',
      '20:1': 'dark'
    };
    
    return modeMap[modeId] || modeId;
  }

  private resolveAlias(alias: any, path: string): any {
    const aliasId = alias.id || alias;
    
    const cacheKey = `${aliasId}:${path}`;
    if (this.resolvedCache.has(cacheKey)) {
      return this.resolvedCache.get(cacheKey);
    }

    this.log(`Resolving alias: ${aliasId} at ${path}`);

    const idFormats = [
      aliasId,
      aliasId.replace('VariableID:', ''),
      aliasId.split(':').pop() || aliasId
    ];

    for (const id of idFormats) {
      const variable = this.variableMap.get(id);
      
      if (variable) {
        const resolved = this.resolveVariableValue(variable);
        this.resolvedCache.set(cacheKey, resolved);
        this.resolutionStats.resolvedAliases++;
        this.log(`Resolved ${aliasId} to ${JSON.stringify(resolved)}`);
        return resolved;
      }
    }

    for (const [key, value] of this.primitiveValues.entries()) {
      if (key.includes(aliasId) || key.includes(aliasId.replace('VariableID:', ''))) {
        this.resolvedCache.set(cacheKey, value);
        this.resolutionStats.resolvedAliases++;
        return value;
      }
    }

    this.log(`WARNING: Could not resolve alias ${aliasId}`, 'warn');
    this.resolutionStats.unresolvedAliases++;
    return alias;
  }

  private resolveVariableValue(variable: FigmaVariable): any {
    const modes = variable.modes || {};
    const resolved: any = {};
    
    for (const [modeId, value] of Object.entries(modes)) {
      const modeName = this.getModeName(modeId);
      
      if (this.isAlias(value)) {
        resolved[modeName] = this.resolveAlias(value, `${variable.name}.${modeId}`);
      } else if (this.isPrimitiveValue(value)) {
        resolved[modeName] = this.extractPrimitiveValue(value);
      } else {
        resolved[modeName] = value;
      }
    }
    
    const modeKeys = Object.keys(resolved);
    if (modeKeys.length === 1 && modeKeys[0] === 'default') {
      return resolved.default;
    }
    
    return resolved;
  }

  private log(message: string, level: 'log' | 'warn' | 'error' = 'log'): void {
    if (this.debugMode) {
      console[level](`[VariableResolver] ${message}`);
    }
  }
}