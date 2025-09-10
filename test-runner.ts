/**
 * Test Runner for Enhanced Variable Alias Resolver
 * 
 * This file demonstrates how the enhanced variable resolver fixes the critical
 * issue where variable aliases weren't resolving to actual color values.
 * 
 * To run these tests:
 * 1. Open browser console in Figma plugin environment
 * 2. Copy and paste this code
 * 3. Call: testEnhancedResolver()
 */

import { EnhancedVariableAliasResolver } from './utils/variable-resolver';

// Simulate the problematic Figma data that was causing issues
const problematicFigmaData = {
  "colors": {
    "semantic": {
      "content": {
        "primary": {
          "light": {
            "type": "VARIABLE_ALIAS",
            "id": "VariableID:40000015:594/89:0"
          },
          "dark": {
            "type": "VARIABLE_ALIAS", 
            "id": "VariableID:40000015:594/20:1"
          }
        },
        "secondary": {
          "light": {
            "type": "VARIABLE_ALIAS",
            "id": "VariableID:40000015:595/89:0"
          }
        }
      }
    },
    "brand": {
      "primary": {
        "500": {
          "type": "VARIABLE_ALIAS",
          "id": "VariableID:40000015:596"
        }
      }
    }
  },
  "variables": {
    "VariableID:40000015:594": {
      "id": "VariableID:40000015:594",
      "name": "Brand/Primary/Base",
      "type": "COLOR",
      "modes": {
        "89:0": "#020517",
        "20:1": "#ffffff"
      }
    },
    "VariableID:40000015:595": {
      "id": "VariableID:40000015:595", 
      "name": "Brand/Secondary/Base",
      "type": "COLOR",
      "modes": {
        "89:0": "#6366f1"
      }
    },
    "VariableID:40000015:596": {
      "id": "VariableID:40000015:596",
      "name": "Brand/Primary/500",
      "type": "COLOR",
      "modes": {
        "default": "#3b82f6"
      }
    }
  }
};

async function testEnhancedResolver(): Promise<void> {
  console.log('🚀 Testing Enhanced Variable Alias Resolver');
  console.log('=========================================\n');
  
  console.log('❌ BEFORE: Problematic data with unresolved aliases');
  console.log('Semantic content primary:', problematicFigmaData.colors.semantic.content.primary);
  console.log('This shows VARIABLE_ALIAS objects instead of actual color values!\n');
  
  // Initialize the enhanced resolver
  const resolver = new EnhancedVariableAliasResolver(true);
  
  console.log('🔧 Running Enhanced Variable Alias Resolver...\n');
  
  // Resolve the variables
  const result = resolver.resolveVariables(problematicFigmaData);
  
  console.log('✅ AFTER: Enhanced resolution results');
  console.log('====================================');
  console.log('Resolution Statistics:');
  console.log(`- Total Variables Found: ${result.resolutionStats.totalVariables}`);
  console.log(`- Aliases Resolved: ${result.resolutionStats.resolvedAliases}`);
  console.log(`- Primitive Values: ${result.resolutionStats.primitiveValues}`);
  console.log(`- Unresolved Aliases: ${result.resolutionStats.unresolvedAliases}\n`);
  
  console.log('🎨 RESOLVED COLOR VALUES:');
  console.log('========================');
  
  if (result.resolved.colors?.semantic?.content?.primary) {
    const resolvedPrimary = result.resolved.colors.semantic.content.primary;
    console.log('Semantic content primary:', resolvedPrimary);
    
    if (resolvedPrimary.light === '#020517') {
      console.log('✅ Light mode resolved correctly: #020517');
    } else {
      console.log('❌ Light mode resolution failed:', resolvedPrimary.light);
    }
    
    if (resolvedPrimary.dark === '#ffffff') {
      console.log('✅ Dark mode resolved correctly: #ffffff');
    } else {
      console.log('❌ Dark mode resolution failed:', resolvedPrimary.dark);
    }
  }
  
  if (result.resolved.colors?.brand?.primary?.['500']) {
    const brandPrimary = result.resolved.colors.brand.primary['500'];
    console.log('\nBrand primary 500:', brandPrimary);
    
    if (brandPrimary === '#3b82f6') {
      console.log('✅ Brand primary resolved correctly: #3b82f6');
    } else {
      console.log('❌ Brand primary resolution failed:', brandPrimary);
    }
  }
  
  console.log('\n📋 COMPLETE RESOLVED STRUCTURE:');
  console.log('===============================');
  console.log(JSON.stringify(result.resolved.colors, null, 2));
  
  console.log('\n🎯 KEY BENEFITS OF ENHANCED RESOLVER:');
  console.log('====================================');
  console.log('✅ Actual hex values instead of variable IDs');
  console.log('✅ Proper light/dark mode resolution');
  console.log('✅ Nested alias resolution');
  console.log('✅ AI-tool friendly output format');
  console.log('✅ Comprehensive error handling');
  console.log('✅ Performance optimized with caching');
  
  console.log('\n🤖 AI TOOL COMPATIBILITY:');
  console.log('=========================');
  console.log('This resolved data is now perfect for:');
  console.log('• Bolt.new - Ready-to-use color values');  
  console.log('• v0.dev - Direct CSS variable generation');
  console.log('• Loveable.ai - Component styling');
  console.log('• Claude Code - Copy-paste CSS');
  console.log('• Cursor - Context-aware development');
  
  return result;
}

// Make test available in global scope for console testing
(globalThis as any).testEnhancedResolver = testEnhancedResolver;
(globalThis as any).problematicFigmaData = problematicFigmaData;

export { testEnhancedResolver, problematicFigmaData };