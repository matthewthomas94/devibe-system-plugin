# 🎨 DeVibe System - AI-Optimized Design System Extractor

A comprehensive Figma plugin that extracts design system tokens and components, generating outputs specifically optimized for AI prototyping tools like Bolt, v0, Loveable, Cursor, and other AI-powered development platforms.

## 🚀 Features

### **Design Token Extraction**
- **🎨 Colors**: Semantic color analysis with role detection (primary, secondary, success, error, etc.)
- **📝 Typography**: Hierarchical text styles with semantic naming
- **📏 Spacing**: Consistent spacing scale analysis and token generation
- **🧩 Components**: Component variant analysis with prop detection

### **AI-Optimized Outputs**
- **Utility CSS**: Self-documenting CSS classes with semantic naming
- **Tailwind Config**: Complete Tailwind CSS configuration with design tokens
- **React Components**: Type-safe React components with comprehensive documentation
- **AI Context Cards**: Contextual information for AI tool prompts

### **AI Tool Compatibility**
- ✅ **Bolt** (StackBlitz) - Optimized naming and structure
- ✅ **v0** (Vercel) - Clean, semantic class names
- ✅ **Loveable** (GPT Engineer) - Descriptive documentation
- ✅ **Cursor** - IDE-friendly component structure
- ✅ **Figma Make** - Native Figma integration patterns
- ✅ **Universal Format** - Works with any AI prototyping tool

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Figma Desktop App

### Setup
```bash
# Clone or download the project
git clone <repository-url>
cd devibe-system

# Install dependencies
npm install

# Build the plugin
npm run build

# For development
npm run dev
```

### Figma Plugin Installation
1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest**
3. Select the `manifest.json` file from this project
4. The plugin will appear in your Figma plugins list

## 🎯 Usage

### Step 1: Design System Analysis
1. Open your Figma file containing design system components
2. Launch the **DeVibe System** plugin
3. Configure extraction settings:
   - ✅ Colors & Semantic Roles
   - ✅ Typography & Text Styles  
   - ✅ Spacing & Layout Tokens
   - ✅ Components & Variants

### Step 2: AI Tool Optimization
1. Select your target AI tools:
   - **All Tools** (universal format)
   - **Bolt**, **v0**, **Loveable**, **Cursor**, etc.
2. Choose naming convention (kebab-case recommended)
3. Enable semantic naming for better AI comprehension

### Step 3: Output Generation
The plugin generates multiple formats:

#### 🎨 Utility CSS Classes
```css
/* Semantic color utilities */
.bg-brand-primary { background-color: #3b82f6; }
.text-semantic-success { color: #10b981; }
.border-neutral-200 { border-color: #e5e7eb; }

/* Typography hierarchy */
.text-heading-xl { font-size: 2.25rem; line-height: 2.5rem; font-weight: 700; }
.text-body-md { font-size: 1rem; line-height: 1.5rem; font-weight: 400; }

/* Consistent spacing */
.p-space-md { padding: 1rem; }
.m-space-lg { margin: 1.5rem; }
.gap-space-sm { gap: 0.5rem; }
```

#### 🌊 Tailwind CSS Configuration
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#3b82f6',
        'semantic-success': '#10b981',
        'neutral': {
          50: '#f9fafb',
          500: '#6b7280',
          900: '#111827'
        }
      },
      fontSize: {
        'heading-xl': ['2.25rem', { lineHeight: '2.5rem' }],
        'body-md': ['1rem', { lineHeight: '1.5rem' }]
      },
      spacing: {
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem'
      }
    }
  }
}
```

#### ⚛️ React Components
```tsx
/**
 * Button Component
 * 
 * Interactive button component for user actions and navigation
 * 
 * @example
 * <Button size="large" variant="primary">Get Started</Button>
 * <Button disabled>Loading...</Button>
 */
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  size = 'medium', 
  variant = 'primary',
  disabled = false,
  ...props 
}) => {
  const classes = clsx(
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
    {
      'px-4 py-2 text-sm': size === 'medium',
      'px-6 py-3 text-lg': size === 'large',
      'bg-brand-primary text-white hover:bg-brand-primary-dark': variant === 'primary',
      'opacity-50 cursor-not-allowed': disabled
    }
  );

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
```

#### 🧠 AI Context Documentation
```markdown
## Design System Context for AI Tools

### Color System
- **Primary Colors**: Use `bg-brand-primary` for main actions and CTAs
- **Semantic Colors**: `text-semantic-success` for positive states, `text-semantic-error` for errors
- **Neutral Colors**: `text-neutral-600` for body text, `bg-neutral-50` for subtle backgrounds

### Typography Hierarchy
- **Headings**: `text-heading-xl` for hero sections, `text-heading-lg` for page titles
- **Body Text**: `text-body-lg` for introductions, `text-body-md` for standard content

### Spacing Guidelines
- Use `p-space-md` for component padding
- Apply `gap-space-sm` for tight element spacing
- Use `m-space-lg` for section separation

### Component Patterns
- Button: Primary actions use `<Button variant="primary" size="large">`
- Cards: Content containers use semantic spacing and neutral backgrounds
- Forms: Consistent spacing with `space-md` between fields
```

## 🤖 AI Tool Integration

### Using with Bolt (StackBlitz)
```
Prompt: "Create a landing page using the design system. Use bg-brand-primary for the hero section, text-heading-xl for the main title, and Button components for CTAs."
```

### Using with v0 (Vercel)
```
Context: [Paste AI Context Documentation]
Prompt: "Build a dashboard with cards using the provided design system tokens. Follow the component patterns and spacing guidelines."
```

### Using with Loveable
```
System Context: "Use the component library with semantic, accessible components. Each component has variants and follows design system principles."
Prompt: "Create a user profile page with proper typography hierarchy and consistent spacing."
```

## 📁 Project Structure

```
devibe-system/
├── manifest.json              # Figma plugin manifest
├── code.ts                   # Main plugin logic
├── ui.html                   # Plugin interface
├── ui.ts                     # UI logic
├── types.ts                  # TypeScript definitions
├── extractors/               # Token extraction logic
│   ├── colors.ts            # Color analysis
│   ├── typography.ts        # Typography extraction
│   ├── spacing.ts           # Spacing pattern analysis
│   ├── components.ts        # Component analysis
│   └── semantic-analysis.ts # AI semantic optimization
├── generators/               # Output generators
│   ├── utility-css.ts       # CSS utility generator
│   ├── tailwind-config.ts   # Tailwind configuration
│   ├── component-library.ts # React component generator
│   └── ai-context.ts        # AI context generator
├── formatters/               # AI-friendly formatting
│   └── ai-friendly-naming.ts # Semantic naming optimizer
├── utils/                    # Utility functions
│   └── naming.ts            # Naming helpers
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── webpack.config.js        # Build configuration
```

## 🔧 Development

### Build Commands
```bash
npm run build     # Production build
npm run dev       # Development with watch mode
npm run lint      # Code linting
npm run type-check # TypeScript checking
```

### Adding New AI Tool Support
1. Add tool configuration in `formatters/ai-friendly-naming.ts`
2. Update generators to support new naming patterns
3. Add tool-specific optimization logic
4. Update UI with new tool option

## 🎨 Customization

### Custom Token Extraction
Extend extractors in the `extractors/` directory:

```typescript
// Custom color extraction
export class CustomColorExtractor extends ColorExtractor {
  async extractBrandColors(): Promise<ColorToken[]> {
    // Your custom logic here
  }
}
```

### Custom Output Formats
Add new generators in the `generators/` directory:

```typescript
// Custom generator
export class CustomGenerator {
  generateCustomFormat(tokens: DesignToken[]): string {
    // Your custom format logic
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Check the inline code documentation
- **Examples**: See the generated outputs for reference patterns

## 🔮 Roadmap

- [ ] Additional AI tool integrations
- [ ] Advanced component variant detection
- [ ] Design token versioning support
- [ ] Automated accessibility testing
- [ ] Integration with design system documentation tools
- [ ] Support for design token transforms
- [ ] Advanced semantic analysis with ML

---

**Built for the future of AI-powered development** 🚀

Transform your Figma design systems into AI-ready code with semantic precision and developer-friendly documentation.