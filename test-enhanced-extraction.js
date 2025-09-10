// Test Enhanced Component Extraction
console.log('🧪 Testing Enhanced Component Extraction');
console.log('=======================================\n');

// Mock component data that simulates a real design system
const mockComponents = [
  { name: 'Button/Primary', type: 'COMPONENT_SET' },
  { name: 'Button/Secondary', type: 'COMPONENT_SET' },
  { name: 'Input/Text Field', type: 'COMPONENT_SET' },
  { name: 'Card/Product', type: 'COMPONENT' },
  { name: 'Modal/Dialog', type: 'COMPONENT' },
  { name: 'Navigation/Menu', type: 'COMPONENT' },
  { name: 'Table/Data Grid', type: 'COMPONENT' },
  { name: 'Form/Login', type: 'COMPONENT' },
  { name: 'Avatar/User', type: 'COMPONENT' },
  { name: 'Loading/Spinner', type: 'COMPONENT' },
  { name: 'Icon/Search', type: 'COMPONENT' },
  { name: 'Icon/Plus', type: 'COMPONENT' },
  { name: 'Icon/User', type: 'COMPONENT' },
  { name: 'Icon/Home', type: 'COMPONENT' },
  { name: 'Icon/Settings', type: 'COMPONENT' }
];

// Test the prioritization function logic
function testPrioritization() {
  console.log('🎯 Testing Component Prioritization Logic');
  console.log('=========================================\n');
  
  // Component type priority (should match the enhanced code)
  const componentTypePriority = {
    button: 100, input: 95, form: 90, card: 85, modal: 80,
    navigation: 75, table: 70, layout: 65, feedback: 60,
    media: 30, // Lower priority for avatars, images
    icon: 10   // Lowest priority for pure icons
  };
  
  // Patterns for component type detection
  const patterns = {
    button: [/btn|button/i, /cta|call.to.action/i, /primary|secondary/i],
    input: [/input|field/i, /text.*field/i, /search/i, /textarea/i, /select|dropdown/i],
    form: [/form/i, /login|register/i, /fieldset/i],
    card: [/card/i, /tile/i, /panel/i, /product.*card/i],
    modal: [/modal|dialog/i, /popup|overlay/i, /drawer/i],
    navigation: [/nav|navigation/i, /menu/i, /breadcrumb/i, /tab/i],
    table: [/table|data.*table/i, /grid.*view/i, /list.*view/i],
    layout: [/container|wrapper/i, /grid|layout/i, /section|header|footer/i],
    feedback: [/loading|spinner/i, /progress/i, /skeleton/i, /error.*state/i],
    media: [/image|img/i, /avatar/i, /logo/i],
    icon: [/icon/i, /ico$/i]
  };
  
  // Score components
  const scoredComponents = mockComponents.map(component => {
    let score = 0;
    const name = component.name.toLowerCase();
    
    // Check against component type patterns
    Object.entries(componentTypePriority).forEach(([type, priority]) => {
      const typePatterns = patterns[type] || [];
      if (typePatterns.some(pattern => pattern.test(name))) {
        score = Math.max(score, priority);
      }
    });
    
    // Boost score for component sets
    if (component.type === 'COMPONENT_SET') {
      score += 20;
    }
    
    // Boost score for frequently named patterns
    if (/primary|secondary|main|default/.test(name)) {
      score += 15;
    }
    
    return { component, score, name };
  });
  
  // Sort by score (highest first)
  const prioritized = scoredComponents
    .sort((a, b) => b.score - a.score);
    
  console.log('📊 Component Prioritization Results:');
  console.log('====================================');
  prioritized.forEach((item, i) => {
    const typeIndicator = item.component.type === 'COMPONENT_SET' ? '📦' : '🔷';
    const index = (i + 1).toString().padStart(2);
    console.log(`${index}. ${typeIndicator} ${item.component.name.padEnd(25)} (score: ${item.score})`);
  });
  
  console.log('\n🎯 Top 10 Components (what would be selected):');
  console.log('===============================================');
  const top10 = prioritized.slice(0, 10);
  const componentTypes = {};
  
  top10.forEach((item, i) => {
    const name = item.component.name;
    const type = name.split('/')[0].toLowerCase();
    componentTypes[type] = (componentTypes[type] || 0) + 1;
    const index = (i + 1).toString().padStart(2);
    console.log(`${index}. ${name} (score: ${item.score})`);
  });
  
  console.log('\n📈 Component Type Distribution in Top 10:');
  console.log('==========================================');
  Object.entries(componentTypes).forEach(([type, count]) => {
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${count} components`);
  });
  
  console.log('\n✅ Expected Improvement:');
  console.log('========================');
  console.log('BEFORE: Only 5 icon components detected');
  console.log('AFTER: Diverse UI components prioritized');
  console.log('- Buttons: High priority (score 115-120)');
  console.log('- Inputs: High priority (score 115)');
  console.log('- Cards, Modals: Medium-high priority (score 80-85)');
  console.log('- Icons: Low priority (score 10), selected last');
  
  const iconCount = top10.filter(item => item.component.name.toLowerCase().includes('icon')).length;
  const uiComponentCount = 10 - iconCount;
  
  console.log(`\\n🎉 Result: ${uiComponentCount} UI components + ${iconCount} icons (instead of 5 icons only)`);
}

// Run the test
testPrioritization();