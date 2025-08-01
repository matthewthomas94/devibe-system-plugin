// UI logic for DeVibe System plugin
interface PluginState {
  currentStep: 'analyze' | 'configure' | 'generate' | 'export';
  extractedTokens: any[];
  analyzedComponents: any[];
  config: any;
  outputs: any[];
  isProcessing: boolean;
  error?: string;
}

class PluginUI {
  private currentStep = 1;
  private maxSteps = 3;
  private selectedAITools: string[] = ['all'];
  private pluginState: PluginState | null = null;

  constructor() {
    this.initializeEventListeners();
    this.updateProgress();
    
    // Notify plugin that UI is ready
    (parent as any).postMessage({ pluginMessage: { type: 'ui-ready' } }, '*');
  }

  private initializeEventListeners() {
    // Step navigation
    const startBtn = document.getElementById('startExtractionBtn');
    if (startBtn) startBtn.addEventListener('click', () => this.startExtraction());
    const backToConfigBtn = document.getElementById('backToConfigBtn');
    if (backToConfigBtn) backToConfigBtn.addEventListener('click', () => this.goToStep(1));
    const generateBtn = document.getElementById('generateOutputsBtn');
    if (generateBtn) generateBtn.addEventListener('click', () => this.generateOutputs());
    const backToResultsBtn = document.getElementById('backToResultsBtn');
    if (backToResultsBtn) backToResultsBtn.addEventListener('click', () => this.goToStep(2));
    const extractAgainBtn = document.getElementById('extractAgainBtn');
    if (extractAgainBtn) extractAgainBtn.addEventListener('click', () => this.resetToStart());

    // AI tool selection
    document.querySelectorAll('.ai-tool-card').forEach(card => {
      card.addEventListener('click', (e) => this.toggleAITool(e.target as HTMLElement));
    });

    // Listen for messages from plugin
    window.addEventListener('message', (event) => this.handlePluginMessage(event));
  }

  private toggleAITool(element: HTMLElement) {
    const tool = element.getAttribute('data-tool');
    if (!tool) return;

    if (tool === 'all') {
      // If selecting "all", deselect other options
      document.querySelectorAll('.ai-tool-card').forEach(card => {
        card.classList.remove('selected');
      });
      element.classList.add('selected');
      this.selectedAITools = ['all'];
    } else {
      // If selecting specific tool, deselect "all"
      const allCard = document.querySelector('.ai-tool-card[data-tool="all"]');
      if (allCard) allCard.classList.remove('selected');
      
      // Toggle this tool
      element.classList.toggle('selected');
      
      if (element.classList.contains('selected')) {
        if (!this.selectedAITools.includes(tool)) {
          this.selectedAITools.push(tool);
        }
      } else {
        this.selectedAITools = this.selectedAITools.filter(t => t !== tool);
      }

      // If no tools selected, select "all"
      if (this.selectedAITools.length === 0 || this.selectedAITools.includes('all')) {
        if (allCard) allCard.classList.add('selected');
        this.selectedAITools = ['all'];
      }
    }
  }

  private async startExtraction() {
    const config = this.gatherConfiguration();
    
    this.showStatus('Analyzing your Figma design system...', 'info');
    this.setButtonLoading('startExtractionBtn', true);

    // Send extraction request to plugin
    (parent as any).postMessage({ 
      pluginMessage: { 
        type: 'extract-tokens', 
        config 
      } 
    }, '*');
  }

  private gatherConfiguration() {
    return {
      includeColors: ((document.getElementById('includeColors') as HTMLInputElement) || {}).checked || false,
      includeTypography: ((document.getElementById('includeTypography') as HTMLInputElement) || {}).checked || false,
      includeSpacing: ((document.getElementById('includeSpacing') as HTMLInputElement) || {}).checked || false,
      includeComponents: ((document.getElementById('includeComponents') as HTMLInputElement) || {}).checked || false,
      namingConvention: ((document.getElementById('namingConvention') as HTMLSelectElement) || {}).value || 'kebab-case',
      semanticNaming: ((document.getElementById('semanticNaming') as HTMLInputElement) || {}).checked || false,
      includeUsageExamples: ((document.getElementById('includeUsageExamples') as HTMLInputElement) || {}).checked || false,
      generateDocumentation: true,
      aiToolTargets: this.selectedAITools,
      outputFormats: ['css-utilities', 'tailwind-config', 'react-components', 'context-cards']
    };
  }

  private generateOutputs() {
    const formats: string[] = [];
    
    if (((document.getElementById('outputUtilityCSS') as HTMLInputElement) || {}).checked) {
      formats.push('css-utilities');
    }
    if (((document.getElementById('outputTailwindConfig') as HTMLInputElement) || {}).checked) {
      formats.push('tailwind-config');
    }
    if (((document.getElementById('outputReactComponents') as HTMLInputElement) || {}).checked) {
      formats.push('react-components');
    }
    if (((document.getElementById('outputContextCards') as HTMLInputElement) || {}).checked) {
      formats.push('context-cards');
    }

    if (formats.length === 0) {
      this.showStatus('Please select at least one output format', 'error');
      return;
    }

    this.showStatus('Generating AI-optimized outputs...', 'info');
    this.setButtonLoading('generateOutputsBtn', true);

    (parent as any).postMessage({ 
      pluginMessage: { 
        type: 'generate-outputs', 
        formats 
      } 
    }, '*');
  }

  private handlePluginMessage(event: MessageEvent) {
    const pluginMessage = event.data.pluginMessage || {};
    const type = pluginMessage.type;
    const data = Object.assign({}, pluginMessage);
    delete data.type;

    switch (type) {
      case 'plugin-ready':
        this.pluginState = data.state;
        break;

      case 'status':
        this.showStatus(data.message, 'info');
        break;

      case 'analyze-complete':
        this.handleAnalysisComplete(data.tokens, data.components);
        break;

      case 'generation-complete':
        this.handleGenerationComplete(data.outputs);
        break;

      case 'error':
        this.showStatus(data.message, 'error');
        this.setButtonLoading('startExtractionBtn', false);
        this.setButtonLoading('generateOutputsBtn', false);
        break;

      case 'copy-to-clipboard':
        this.copyToClipboard(data.content);
        break;
    }
  }

  private handleAnalysisComplete(tokens: any[], components: any[]) {
    this.setButtonLoading('startExtractionBtn', false);
    
    // Update statistics
    const colorCount = tokens.filter(t => t.type === 'color').length;
    const typographyCount = tokens.filter(t => t.type === 'typography').length;
    const spacingCount = tokens.filter(t => t.type === 'spacing').length;
    const componentCount = components.length;

    document.getElementById('colorCount')!.textContent = colorCount.toString();
    document.getElementById('typographyCount')!.textContent = typographyCount.toString();
    document.getElementById('spacingCount')!.textContent = spacingCount.toString();
    document.getElementById('componentCount')!.textContent = componentCount.toString();

    this.showStatus(`Found ${tokens.length} design tokens and ${components.length} components!`, 'success');
    this.goToStep(2);
  }

  private handleGenerationComplete(outputs: any[]) {
    this.setButtonLoading('generateOutputsBtn', false);
    this.renderOutputs(outputs);
    this.showStatus(`Generated ${outputs.length} AI-optimized outputs!`, 'success');
    this.goToStep(3);
  }

  private renderOutputs(outputs: any[]) {
    const container = document.getElementById('outputsContainer')!;
    container.innerHTML = '';

    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];
      const outputCard = this.createOutputCard(output, i);
      container.appendChild(outputCard);
    }
  }

  private createOutputCard(output: any, index: number): HTMLElement {
    const card = document.createElement('div');
    card.className = 'output-card';

    const formatNames: Record<string, string> = {
      'css-utilities': '🎨 Utility CSS Classes',
      'tailwind-config': '🌊 Tailwind CSS Configuration',
      'react-components': '⚛️ React Component Library',
      'context-cards': '🧠 AI Context Documentation'
    };

    card.innerHTML = `
      <div class="output-header">
        <div>
          <div class="output-title">${formatNames[output.format] || output.format}</div>
          <div class="output-meta">
            Generated ${new Date(output.metadata.generatedAt).toLocaleTimeString()} • 
            ${output.metadata.aiToolCompatibility.join(', ')}
          </div>
        </div>
        <button class="copy-button" onclick="pluginUI.copyOutput('${output.format}', '${index}')">
          📋 Copy
        </button>
      </div>
      <div class="output-content">
        <pre>${this.truncateContent(output.content, 2000)}</pre>
      </div>
    `;

    // Store the full content as data attribute for copying
    card.dataset.content = output.content;
    card.dataset.index = index.toString();

    return card;
  }

  private truncateContent(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '\n\n... (truncated for display, full content available when copied)';
  }

  public copyOutput(format: string, index: string) {
    const card = document.querySelector(`[data-index="${index}"]`) as HTMLElement;
    const content = card ? card.dataset.content || '' : '';
    
    this.copyToClipboard(content);
    
    // Visual feedback
    const button = card ? card.querySelector('.copy-button') as HTMLButtonElement : null;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✅ Copied!';
      button.style.background = '#48bb78';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 2000);
    }
  }

  private async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  private goToStep(step: number) {
    // Hide current step
    const activeStep = document.querySelector('.step.active');
    if (activeStep) activeStep.classList.remove('active');
    
    // Show target step
    const targetStep = document.getElementById(`step${step}`);
    if (targetStep) targetStep.classList.add('active');
    
    this.currentStep = step;
    this.updateProgress();
  }

  private updateProgress() {
    const progress = (this.currentStep / this.maxSteps) * 100;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
  }

  private showStatus(message: string, type: 'info' | 'success' | 'error') {
    const statusDiv = document.getElementById('statusMessage')!;
    const statusText = document.getElementById('statusText')!;
    
    statusDiv.className = `status ${type}`;
    statusText.textContent = message;
    statusDiv.classList.remove('hidden');

    // Auto-hide success and error messages
    if (type !== 'info') {
      setTimeout(() => {
        statusDiv.classList.add('hidden');
      }, 5000);
    }
  }

  private setButtonLoading(buttonId: string, loading: boolean) {
    const button = document.getElementById(buttonId) as HTMLButtonElement;
    if (button) {
      button.disabled = loading;
      if (loading) {
        button.innerHTML = '<span class="loading"></span>' + button.textContent;
      } else {
        button.innerHTML = button.textContent ? button.textContent.replace('...', '') : '';
      }
    }
  }

  private resetToStart() {
    this.currentStep = 1;
    this.updateProgress();
    this.goToStep(1);
    
    // Clear outputs
    const container = document.getElementById('outputsContainer')!;
    container.innerHTML = '';
    
    // Hide status
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) statusMessage.classList.add('hidden');
    
    // Reset statistics
    document.getElementById('colorCount')!.textContent = '0';
    document.getElementById('typographyCount')!.textContent = '0';
    document.getElementById('spacingCount')!.textContent = '0';
    document.getElementById('componentCount')!.textContent = '0';
  }
}

// Initialize the UI
const pluginUI = new PluginUI();

// Make it globally available for HTML onclick handlers
(window as any).pluginUI = pluginUI;