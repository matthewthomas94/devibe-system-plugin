/**
 * Generate Enhanced Markdown with Complete Component Library
 * Demonstrates what a full design system extraction would produce
 */

const enhancedComponentData = require('./enhanced-test-data.js');
const { UnifiedMarkdownGenerator } = require('./generators/unified-markdown');

function generateEnhancedMarkdown() {
  console.log('🚀 Generating Enhanced Design System Markdown');
  console.log('==============================================\n');
  
  const generator = new UnifiedMarkdownGenerator({
    figmaFileName: "Utensils Design System",
    extractedData: enhancedComponentData,
    includeUsageStats: true,
    includeImplementations: true
  });
  
  const markdown = generator.generateComplete();
  
  console.log('📄 Generated Markdown Length:', markdown.length, 'characters');
  console.log('🧩 Components Included:', enhancedComponentData.componentAnalysis.componentUsage.length);
  
  // Write to file
  const fs = require('fs');
  fs.writeFileSync('DESIGN_SYSTEM_ENHANCED.md', markdown);
  
  console.log('✅ Enhanced markdown saved to: DESIGN_SYSTEM_ENHANCED.md');
  console.log('\n📊 Component Types Included:');
  
  const componentTypes = {};
  enhancedComponentData.componentAnalysis.componentUsage.forEach(comp => {
    componentTypes[comp.type] = (componentTypes[comp.type] || 0) + 1;
  });
  
  Object.entries(componentTypes).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count} components`);
  });
  
  return markdown;
}

// Run if called directly
if (require.main === module) {
  generateEnhancedMarkdown();
}

module.exports = { generateEnhancedMarkdown };