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

figma.showUI(__html__, {
  width: 800,
  height: 600,
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
      
      // Send the semantic structure to UI
      figma.ui.postMessage({
        type: 'extraction-complete',
        data: semanticStructure
      });
    }).catch(function(error) {
      console.error('Error extracting design tokens:', error);
      figma.ui.postMessage({
        type: 'error',
        message: 'Failed to extract design tokens: ' + error.message
      });
    });
  }
  
  if (msg.type === 'close') {
    figma.closePlugin();
  }
};