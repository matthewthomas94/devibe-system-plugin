// Simplified UI
console.log('🚀 Simple UI script starting...');
console.log('Document ready state:', document.readyState);
console.log('Window object:', !!window);
console.log('Parent object:', !!parent);

// Function to safely set up event listeners
function setupEventListeners() {
  console.log('Setting up event listeners');
  
  // Remove any existing listeners first to avoid duplicates
  var extractBtn = document.getElementById('extract-btn');
  var closeBtn = document.getElementById('close-btn');
  
  console.log('Extract button found:', !!extractBtn);
  console.log('Close button found:', !!closeBtn);
  
  if (extractBtn) {
    console.log('Setting up extract button listener');
    
    // Clone button to remove all existing event listeners
    var newExtractBtn = extractBtn.cloneNode(true);
    extractBtn.parentNode?.replaceChild(newExtractBtn, extractBtn);
    
    // Add multiple event types to ensure capture
    newExtractBtn.addEventListener('click', function(e) {
      console.log('🔥 EXTRACT BUTTON CLICKED!');
      console.log('Event:', e);
      console.log('Target:', e.target);
      console.log('Sending message to parent...');
      
      try {
        (parent as any).postMessage({ pluginMessage: { type: 'extract-basic' } }, '*');
        console.log('✅ Message sent successfully');
      } catch (error) {
        console.error('❌ Error sending message:', error);
      }
    });
    
    // Also add mousedown as backup
    newExtractBtn.addEventListener('mousedown', function() {
      console.log('🖱️ Extract button mousedown detected');
    });
    
    console.log('✅ Extract button listeners added');
  }
  
  if (closeBtn) {
    // Clone button to remove all existing event listeners  
    var newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode?.replaceChild(newCloseBtn, closeBtn);
    
    newCloseBtn.addEventListener('click', function() {
      console.log('Close button clicked');
      (parent as any).postMessage({ pluginMessage: { type: 'close' } }, '*');
    });
  }
}

// Set up when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  // DOM is already ready
  setupEventListeners();
}

window.addEventListener('message', function(event) {
  console.log('=== MESSAGE RECEIVED ===');
  console.log('Full event data:', event.data);
  console.log('Event origin:', event.origin);
  console.log('Event data type:', typeof event.data);
  console.log('Event data keys:', Object.keys(event.data || {}));
  
  // Figma sends messages directly, not wrapped in pluginMessage
  var msg = event.data;
  console.log('Message object:', msg);
  console.log('Message type:', msg?.type);
  
  if (!msg || !msg.type) {
    console.log('❌ No valid message with type found');
    return;
  }
  
  if (msg && msg.type === 'plugin-ready') {
    console.log('Plugin is ready:', msg.message);
    var resultDiv = document.getElementById('results');
    if (resultDiv) {
      resultDiv.innerHTML = '<div style="color: green;">' + msg.message + '</div>';
    }
  }
  
  if (msg && msg.type === 'extraction-complete') {
    console.log('Extraction complete message received');
    console.log('Message data:', msg);
    console.log('Has markdown:', !!msg.markdown);
    console.log('Has fileName:', !!msg.fileName);
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
      
      // Component Analysis Section
      if (msg.data.componentAnalysis) {
        var ca = msg.data.componentAnalysis;
        html += '<div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 10px 0; border: 1px solid #ffeaa7;">';
        html += '<h4 style="margin: 0 0 10px 0; color: #856404;">🧩 Component Analysis</h4>';
        html += '<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 5px 0;">';
        html += '<div style="text-align: center;"><strong style="display: block; font-size: 18px; color: #856404;">' + ca.summary.totalPages + '</strong><small>Pages</small></div>';
        html += '<div style="text-align: center;"><strong style="display: block; font-size: 18px; color: #856404;">' + ca.summary.totalInstances + '</strong><small>Instances</small></div>';
        html += '<div style="text-align: center;"><strong style="display: block; font-size: 18px; color: #856404;">' + ca.summary.uniqueComponents + '</strong><small>Components</small></div>';
        html += '</div>';
        
        // Top components
        if (ca.componentUsage && ca.componentUsage.length > 0) {
          html += '<p style="margin: 10px 0 5px 0;"><strong>Most Used Components:</strong></p>';
          for (var i = 0; i < Math.min(3, ca.componentUsage.length); i++) {
            var comp = ca.componentUsage[i];
            html += '<div style="background: rgba(255,255,255,0.5); padding: 5px 8px; margin: 2px 0; border-radius: 3px; font-size: 13px;">';
            html += '<strong>' + comp.name + '</strong> - ' + comp.count + ' instances across ' + comp.pages.length + ' pages';
            html += '</div>';
          }
        }
        html += '</div>';
      }
      
      html += '<div style="margin: 20px 0;">';
      html += '<a href="' + url + '" download="figma-variables.json" style="background:#007ACC; color:white; padding:10px 20px; text-decoration:none; border-radius:4px; display:inline-block;">📁 Download JSON Data</a>';
      html += '</div>';
      
      html += '<details style="margin-top: 20px;">';
      html += '<summary style="cursor: pointer; padding: 10px; background: #f5f5f5;">📄 View JSON Preview</summary>';
      html += '<pre style="background: #f8f8f8; padding: 10px; overflow-x: auto; max-height: 300px; font-size: 12px;">' + jsonOutput + '</pre>';
      html += '</details>';
      
      // Add full markdown display if available
      if (msg.markdown) {
        html += '<div style="margin-top: 20px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">';
        html += '<div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">';
        html += '<h3 style="margin: 0; color: #333;">📝 AI-Optimized Design System Documentation</h3>';
        html += '<div style="display: flex; gap: 10px;">';
        html += '<button id="copy-markdown-btn" style="background:#6f42c1; color:white; padding:8px 16px; border:none; border-radius:4px; cursor:pointer; font-size:12px;">📋 Copy to Clipboard</button>';
        var markdownBlob = new Blob([msg.markdown], { type: 'text/markdown' });
        var markdownUrl = URL.createObjectURL(markdownBlob);
        var markdownFileName = msg.fileName || 'design-system.md';
        html += '<a href="' + markdownUrl + '" download="' + markdownFileName + '" style="background:#28a745; color:white; padding:8px 16px; text-decoration:none; border-radius:4px; display:inline-block; font-size:12px;">💾 Download MD</a>';
        html += '</div>';
        html += '</div>';
        html += '<div style="background: #fff; padding: 20px; max-height: 500px; overflow-y: auto;">';
        html += '<div id="markdown-content" style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; line-height: 1.6; color: #333;">';
        html += formatMarkdownForDisplay(msg.markdown);
        html += '</div>';
        html += '</div>';
        html += '</div>';
        
        // Store markdown content for copying
        (window as any).markdownContent = msg.markdown;
      }
      
      resultDiv.innerHTML = html;
      
      // Add copy functionality
      setTimeout(function() {
        var copyBtn = document.getElementById('copy-markdown-btn');
        if (copyBtn && (window as any).markdownContent) {
          copyBtn.addEventListener('click', function() {
            var markdownContent = (window as any).markdownContent;
            if (markdownContent && navigator.clipboard) {
              navigator.clipboard.writeText(markdownContent).then(function() {
                if (copyBtn) {
                  var originalText = copyBtn.textContent;
                  copyBtn.textContent = '✅ Copied!';
                  copyBtn.style.background = '#28a745';
                  setTimeout(function() {
                    if (copyBtn) {
                      copyBtn.textContent = originalText || '📋 Copy to Clipboard';
                      copyBtn.style.background = '#6f42c1';
                    }
                  }, 2000);
                }
              }).catch(function(err) {
                console.error('Failed to copy: ', err);
                if (copyBtn) {
                  copyBtn.textContent = '❌ Failed';
                  setTimeout(function() {
                    if (copyBtn) {
                      copyBtn.textContent = '📋 Copy to Clipboard';
                    }
                  }, 2000);
                }
              });
            }
          });
        }
      }, 100);
    }
  }
});

// Function to format markdown for display
function formatMarkdownForDisplay(markdown) {
  var html = markdown
    // Headers
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: bold; margin: 20px 0 15px 0; color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 10px;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: bold; margin: 18px 0 12px 0; color: #333;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 16px; font-weight: bold; margin: 15px 0 10px 0; color: #555;">$1</h3>')
    .replace(/^#### (.*$)/gim, '<h4 style="font-size: 14px; font-weight: bold; margin: 12px 0 8px 0; color: #666;">$1</h4>')
    
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<div style="margin: 15px 0;"><div style="background: #f6f8fa; color: #586069; padding: 8px 12px; border-top-left-radius: 6px; border-top-right-radius: 6px; font-size: 12px; font-weight: 600;">$1</div><pre style="background: #f6f8fa; padding: 16px; margin: 0; border-bottom-left-radius: 6px; border-bottom-right-radius: 6px; overflow-x: auto; font-family: SFMono-Regular, Consolas, \'Liberation Mono\', Menlo, monospace; font-size: 12px; line-height: 1.4;"><code>$2</code></pre></div>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-family: SFMono-Regular, Consolas, \'Liberation Mono\', Menlo, monospace; font-size: 13px; color: #e83e8c;">$1</code>')
    
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
    
    // Lists
    .replace(/^- (.*$)/gim, '<li style="margin: 5px 0; list-style-type: disc; margin-left: 20px;">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li style="margin: 5px 0; list-style-type: decimal; margin-left: 20px;">$2</li>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">')
    
    // Line breaks
    .replace(/\n/g, '<br>');
    
  return html;
}