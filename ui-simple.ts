// Simplified UI
console.log('Simple UI loaded');

// Set up event listeners immediately and also on DOM ready
function setupEventListeners() {
  console.log('Setting up event listeners');
  var extractBtn = document.getElementById('extract-btn');
  var closeBtn = document.getElementById('close-btn');
  
  console.log('Extract button found:', !!extractBtn);
  console.log('Close button found:', !!closeBtn);
  
  if (extractBtn) {
    extractBtn.addEventListener('click', function() {
      console.log('Extract button clicked, sending message');
      (parent as any).postMessage({ pluginMessage: { type: 'extract-basic' } }, '*');
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      console.log('Close button clicked');
      (parent as any).postMessage({ pluginMessage: { type: 'close' } }, '*');
    });
  }
}

// Try both immediate setup and DOM ready
setupEventListeners();
document.addEventListener('DOMContentLoaded', setupEventListeners);

window.addEventListener('message', function(event) {
  console.log('UI received message:', event.data);
  var msg = event.data.pluginMessage;
  
  if (msg && msg.type === 'plugin-ready') {
    console.log('Plugin is ready:', msg.message);
    var resultDiv = document.getElementById('results');
    if (resultDiv) {
      resultDiv.innerHTML = '<div style="color: green;">' + msg.message + '</div>';
    }
  }
  
  if (msg && msg.type === 'extraction-complete') {
    var resultDiv = document.getElementById('results');
    if (resultDiv) {
      // Create JSON output
      var jsonOutput = JSON.stringify(msg.data, null, 2);
      
      // Create downloadable JSON
      var blob = new Blob([jsonOutput], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      
      var html = '<h3>Complete Design System Extraction!</h3>';
      html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">';
      
      // Variables section
      html += '<div style="padding: 10px; background: #f8f9fa; border-radius: 4px;">';
      html += '<h4 style="margin: 0 0 8px 0; color: #007ACC;">🔧 Variables</h4>';
      html += '<p style="margin: 2px 0;"><strong>Total:</strong> ' + msg.data.metadata.totalVariables + '</p>';
      var variableTypes = Object.keys(msg.data.variables || {});
      if (variableTypes.length > 0) {
        html += '<p style="margin: 2px 0; font-size: 12px;"><strong>Types:</strong> ' + variableTypes.join(', ') + '</p>';
      }
      html += '</div>';
      
      // Styles section
      html += '<div style="padding: 10px; background: #f0f8ff; border-radius: 4px;">';
      html += '<h4 style="margin: 0 0 8px 0; color: #28a745;">🎨 Legacy Styles</h4>';
      html += '<p style="margin: 2px 0;"><strong>Paint:</strong> ' + msg.data.metadata.totalPaintStyles + '</p>';
      html += '<p style="margin: 2px 0;"><strong>Text:</strong> ' + msg.data.metadata.totalTextStyles + '</p>';
      html += '<p style="margin: 2px 0;"><strong>Effect:</strong> ' + msg.data.metadata.totalEffectStyles + '</p>';
      html += '<p style="margin: 2px 0;"><strong>Grid:</strong> ' + msg.data.metadata.totalGridStyles + '</p>';
      html += '</div>';
      
      html += '</div>';
      
      html += '<div style="margin: 20px 0;">';
      html += '<a href="' + url + '" download="figma-variables.json" style="background:#007ACC; color:white; padding:10px 20px; text-decoration:none; border-radius:4px; display:inline-block;">📁 Download JSON</a>';
      html += '</div>';
      
      html += '<details style="margin-top: 20px;">';
      html += '<summary style="cursor: pointer; padding: 10px; background: #f5f5f5;">📄 View JSON Preview</summary>';
      html += '<pre style="background: #f8f8f8; padding: 10px; overflow-x: auto; max-height: 300px; font-size: 12px;">' + jsonOutput + '</pre>';
      html += '</details>';
      
      resultDiv.innerHTML = html;
    }
  }
});