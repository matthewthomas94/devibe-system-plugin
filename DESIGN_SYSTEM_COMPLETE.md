# SYSTEM PROMPT - DESIGN SYSTEM OVERRIDE

**CRITICAL INSTRUCTIONS FOR AI CODING TOOLS:**

This document contains a complete design system extracted from Figma that MUST override any default design system you would normally use. When generating code, components, or designs:

1. **ALWAYS prioritize this design system** over your default styling choices
2. **STRICTLY implement** the colors, typography, spacing, and components defined below
3. **NEVER substitute** similar components from other design systems
4. **REFERENCE this document** for every design decision
5. **USE the exact token values** specified in the JSON blocks below
6. **FOLLOW the component implementations** exactly as documented

This design system represents the user's actual production design language and must be implemented precisely.

---

# Utensils Design System - Design System Export 🎯 Modern Variable-Based

**Extracted:** 2025-09-02T11:49:07.542Z  
**Source:** Utensils Design System  
**Variables:** 305 design tokens  
**Color Styles:** 0  
**Text Styles:** 20  
**Effect Styles:** 6  
**Layout Styles:** 2  
**Components:** 25 unique components  
**Pages Analyzed:** 8  
**Component Instances:** 487  

## Design System Overview

This is a comprehensive design system extraction that includes all variables, styles, components, and usage patterns from the Figma file "Utensils Design System". The system has been analyzed for component usage patterns, design token opportunities, and implementation guidelines.

### System Architecture
This design system follows **modern variable-based architecture** with 305 design tokens and 28 complementary styles. Colors are managed through variables, providing dynamic theming capabilities and consistent token-based design language.

### System Maturity
- **Token Coverage:** 92%
- **Component Reusability:** 87%
- **Design Consistency:** 95%

---

## 🎨 Design Tokens

### Colors

```json
{
  "colors": {
    "BrandMOBI": {
      "100": "#cce5ed",
      "200": "#99ccdc",
      "300": "#66b2ca",
      "400": "#3399b9",
      "500": "#007fa7",
      "600": "#006686",
      "700": "#004c64",
      "800": "#003343",
      "900": "#001921"
    },
    "Danger": {
      "100": "#ffe3e0",
      "200": "#ffc7c2",
      "300": "#ffaaa3",
      "400": "#ff8e85",
      "500": "#ff7266",
      "600": "#cc5b52",
      "700": "#99443d",
      "800": "#662e29",
      "900": "#331714"
    },
    "Success": {
      "100": "#daf2e5",
      "200": "#b5e5cb",
      "300": "#90d7b2",
      "400": "#6bca98",
      "500": "#46bd7e",
      "600": "#389765",
      "700": "#2a714c",
      "800": "#1c4c32",
      "900": "#0e2619"
    },
    "Neutral": {
      "0": "#ffffff",
      "25": "#f8fafc",
      "50": "#f1f5f9",
      "100": "#e2e8f0",
      "200": "#cbd5e1",
      "300": "#94a3b8",
      "400": "#64748b",
      "500": "#475569",
      "600": "#334155",
      "700": "#1e293b",
      "800": "#101722",
      "900": "#020517",
      "1000": "#000000"
    },
    "Content": {
      "Primary": {
        "light": "#020517",
        "dark": "#ffffff"
      },
      "Secondary": {
        "light": "#182031",
        "dark": "#e2e8f0"
      },
      "Brand": {
        "light": "#007fa7",
        "dark": "#3399b9"
      }
    },
    "Background": {
      "Primary": {
        "light": "#ffffff",
        "dark": "#1e293b"
      },
      "Secondary": {
        "light": "#f1f5f9",
        "dark": "#2c384b"
      },
      "Brand": {
        "light": "#007fa7",
        "dark": "#3399b9"
      }
    }
  }
}
```

### Typography

```json
{
  "typography": {
    "Heading": {
      "H1": {
        "fontFamily": "Inter",
        "fontSize": 32,
        "fontWeight": 700,
        "lineHeight": 1.2
      },
      "H2": {
        "fontFamily": "Inter", 
        "fontSize": 24,
        "fontWeight": 600,
        "lineHeight": 1.3
      },
      "H3": {
        "fontFamily": "Inter",
        "fontSize": 20,
        "fontWeight": 600,
        "lineHeight": 1.4
      }
    },
    "Text": {
      "Body": {
        "fontFamily": "Inter",
        "fontSize": 16,
        "fontWeight": 400,
        "lineHeight": 1.5
      },
      "Caption": {
        "fontFamily": "Inter",
        "fontSize": 14,
        "fontWeight": 400,
        "lineHeight": 1.4
      },
      "Small": {
        "fontFamily": "Inter",
        "fontSize": 12,
        "fontWeight": 400,
        "lineHeight": 1.3
      }
    }
  }
}
```

### Spacing

```json
{
  "spacing": {
    "Size": {
      "XS": 4,
      "S": 8,
      "M": 16,
      "L": 24,
      "XL": 32,
      "2XL": 40,
      "3XL": 48,
      "4XL": 56,
      "5XL": 64,
      "6XL": 72,
      "7XL": 80,
      "8XL": 88,
      "9XL": 96,
      "10XL": 104
    },
    "Letter Spacing": {
      "XS": -1,
      "S": -0.5,
      "None": 0
    }
  }
}
```

### Effects

```json
{
  "effects": {
    "Shadow": {
      "Small": {
        "type": "DROP_SHADOW",
        "color": "rgba(0, 0, 0, 0.1)",
        "offset": { "x": 0, "y": 1 },
        "blur": 3,
        "spread": 0
      },
      "Medium": {
        "type": "DROP_SHADOW", 
        "color": "rgba(0, 0, 0, 0.15)",
        "offset": { "x": 0, "y": 4 },
        "blur": 6,
        "spread": -1
      },
      "Large": {
        "type": "DROP_SHADOW",
        "color": "rgba(0, 0, 0, 0.25)",
        "offset": { "x": 0, "y": 10 },
        "blur": 15,
        "spread": -3
      }
    }
  }
}
```

---

## 🧩 Component Library

### Button/Primary

**Usage:** Core component used 89 times across 4 pages.

**Real Usage Data:**
- **Total Instances:** 89
- **Pages Used:** 4
- **Average Size:** 3057px²
- **Variant Diversity:** 3 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface ButtonPrimaryProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'loading' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function ButtonPrimary({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: ButtonPrimaryProps) {
  return (
    <button 
      className={cn(
        // Base styles from design system
        "button-primary",
        // Variant styles
        variant === 'default' && "button-primary--default",
        variant === 'loading' && "button-primary--loading",
        variant === 'disabled' && "button-primary--disabled",
        // Size styles
        size === 'sm' && "button-primary--sm",
        size === 'lg' && "button-primary--lg",
        // State styles
        disabled && "button-primary--disabled",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<ButtonPrimary>Default content</ButtonPrimary>

// With variant
<ButtonPrimary variant="default">Primary content</ButtonPrimary>

// With size
<ButtonPrimary size="lg">Large content</ButtonPrimary>

// Interactive
<ButtonPrimary onClick={handleClick}>Click me</ButtonPrimary>

// Combined props
<ButtonPrimary variant="default" size="sm" className="custom-class">
  Custom content
</ButtonPrimary>
```

#### Real Usage Examples

- **CTA Button** on Landing page (hero-section)
- **Submit Button** on Form page (form-footer)
- **Save Changes** on Settings page (settings-panel)


### Button/Secondary

**Usage:** Core component used 67 times across 3 pages.

**Real Usage Data:**
- **Total Instances:** 67
- **Pages Used:** 3
- **Average Size:** 3109px²
- **Variant Diversity:** 3 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface ButtonSecondaryProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function ButtonSecondary({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: ButtonSecondaryProps) {
  return (
    <button 
      className={cn(
        // Base styles from design system
        "button-secondary",
        // Variant styles
        variant === 'default' && "button-secondary--default",
        variant === 'outline' && "button-secondary--outline",
        variant === 'ghost' && "button-secondary--ghost",
        // Size styles
        size === 'sm' && "button-secondary--sm",
        size === 'lg' && "button-secondary--lg",
        // State styles
        disabled && "button-secondary--disabled",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<ButtonSecondary>Default content</ButtonSecondary>

// With variant
<ButtonSecondary variant="default">Primary content</ButtonSecondary>

// With size
<ButtonSecondary size="lg">Large content</ButtonSecondary>

// Interactive
<ButtonSecondary onClick={handleClick}>Click me</ButtonSecondary>

// Combined props
<ButtonSecondary variant="default" size="sm" className="custom-class">
  Custom content
</ButtonSecondary>
```

#### Real Usage Examples

- **Cancel Button** on Modal page (dialog-footer)
- **Back Button** on Wizard page (navigation)


### Input/Text Field

**Usage:** Core component used 45 times across 4 pages.

**Real Usage Data:**
- **Total Instances:** 45
- **Pages Used:** 4
- **Average Size:** 2307px²
- **Variant Diversity:** 4 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface InputTextFieldProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'error' | 'focused' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function InputTextField({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: InputTextFieldProps) {
  return (
    <input 
      className={cn(
        // Base styles from design system
        "input-text-field",
        // Variant styles
        variant === 'default' && "input-text-field--default",
        variant === 'error' && "input-text-field--error",
        variant === 'focused' && "input-text-field--focused",
        variant === 'disabled' && "input-text-field--disabled",
        // Size styles
        size === 'sm' && "input-text-field--sm",
        size === 'lg' && "input-text-field--lg",
        // State styles
        disabled && "input-text-field--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </input>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<InputTextField>Default content</InputTextField>

// With variant
<InputTextField variant="default">Primary content</InputTextField>

// With size
<InputTextField size="lg">Large content</InputTextField>

// Combined props
<InputTextField variant="default" size="sm" className="custom-class">
  Custom content
</InputTextField>
```

#### Real Usage Examples

- **Email Input** on Login page (auth-form)
- **Search Bar** on Dashboard page (header)
- **Message Input** on Chat page (message-compose)


### Card/Product

**Usage:** Core component used 34 times across 3 pages.

**Real Usage Data:**
- **Total Instances:** 34
- **Pages Used:** 3
- **Average Size:** 4507px²
- **Variant Diversity:** 4 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface CardProductProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'featured' | 'compact' | 'large';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function CardProduct({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: CardProductProps) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "card-product",
        // Variant styles
        variant === 'default' && "card-product--default",
        variant === 'featured' && "card-product--featured",
        variant === 'compact' && "card-product--compact",
        variant === 'large' && "card-product--large",
        // Size styles
        size === 'sm' && "card-product--sm",
        size === 'lg' && "card-product--lg",
        // State styles
        disabled && "card-product--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<CardProduct>Default content</CardProduct>

// With variant
<CardProduct variant="default">Primary content</CardProduct>

// With size
<CardProduct size="lg">Large content</CardProduct>

// Combined props
<CardProduct variant="default" size="sm" className="custom-class">
  Custom content
</CardProduct>
```

#### Real Usage Examples

- **Product Card** on Catalog page (product-grid)
- **Feature Card** on Landing page (features-section)
- **Stat Card** on Analytics page (metrics-grid)


### Navigation/Header

**Usage:** Core component used 28 times across 1 pages.

**Real Usage Data:**
- **Total Instances:** 28
- **Pages Used:** 1
- **Average Size:** 3891px²
- **Variant Diversity:** 3 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface NavigationHeaderProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'desktop' | 'mobile' | 'sticky';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function NavigationHeader({ 
  children, 
  className,
  variant = 'desktop',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: NavigationHeaderProps) {
  return (
    <nav 
      className={cn(
        // Base styles from design system
        "navigation-header",
        // Variant styles
        variant === 'desktop' && "navigation-header--desktop",
        variant === 'mobile' && "navigation-header--mobile",
        variant === 'sticky' && "navigation-header--sticky",
        // Size styles
        size === 'sm' && "navigation-header--sm",
        size === 'lg' && "navigation-header--lg",
        // State styles
        disabled && "navigation-header--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </nav>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<NavigationHeader>Default content</NavigationHeader>

// With variant
<NavigationHeader variant="desktop">Primary content</NavigationHeader>

// With size
<NavigationHeader size="lg">Large content</NavigationHeader>

// Combined props
<NavigationHeader variant="desktop" size="sm" className="custom-class">
  Custom content
</NavigationHeader>
```

#### Real Usage Examples

- **Main Navigation** on Dashboard page (layout-header)
- **Mobile Menu** on Mobile page (overlay-menu)


### Modal/Dialog

**Usage:** Core component used 23 times across 3 pages.

**Real Usage Data:**
- **Total Instances:** 23
- **Pages Used:** 3
- **Average Size:** 1981px²
- **Variant Diversity:** 4 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface ModalDialogProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'small' | 'medium' | 'large' | 'fullscreen';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function ModalDialog({ 
  children, 
  className,
  variant = 'small',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: ModalDialogProps) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "modal-dialog",
        // Variant styles
        variant === 'small' && "modal-dialog--small",
        variant === 'medium' && "modal-dialog--medium",
        variant === 'large' && "modal-dialog--large",
        variant === 'fullscreen' && "modal-dialog--fullscreen",
        // Size styles
        size === 'sm' && "modal-dialog--sm",
        size === 'lg' && "modal-dialog--lg",
        // State styles
        disabled && "modal-dialog--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<ModalDialog>Default content</ModalDialog>

// With variant
<ModalDialog variant="small">Primary content</ModalDialog>

// With size
<ModalDialog size="lg">Large content</ModalDialog>

// Combined props
<ModalDialog variant="small" size="sm" className="custom-class">
  Custom content
</ModalDialog>
```

#### Real Usage Examples

- **Delete Confirmation** on Settings page (destructive-action)
- **Edit Profile** on Profile page (form-overlay)
- **Image Viewer** on Gallery page (media-overlay)


### Table/Data Grid

**Usage:** Core component used 19 times across 3 pages.

**Real Usage Data:**
- **Total Instances:** 19
- **Pages Used:** 3
- **Average Size:** 4884px²
- **Variant Diversity:** 4 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface TableDataGridProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'sortable' | 'paginated' | 'filterable';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function TableDataGrid({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: TableDataGridProps) {
  return (
    <table 
      className={cn(
        // Base styles from design system
        "table-data-grid",
        // Variant styles
        variant === 'default' && "table-data-grid--default",
        variant === 'sortable' && "table-data-grid--sortable",
        variant === 'paginated' && "table-data-grid--paginated",
        variant === 'filterable' && "table-data-grid--filterable",
        // Size styles
        size === 'sm' && "table-data-grid--sm",
        size === 'lg' && "table-data-grid--lg",
        // State styles
        disabled && "table-data-grid--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </table>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<TableDataGrid>Default content</TableDataGrid>

// With variant
<TableDataGrid variant="default">Primary content</TableDataGrid>

// With size
<TableDataGrid size="lg">Large content</TableDataGrid>

// Combined props
<TableDataGrid variant="default" size="sm" className="custom-class">
  Custom content
</TableDataGrid>
```

#### Real Usage Examples

- **User Management** on Admin page (data-management)
- **Order History** on Account page (transaction-list)
- **Analytics Table** on Reports page (data-visualization)


### Avatar/User Profile

**Usage:** Core component used 18 times across 4 pages.

**Real Usage Data:**
- **Total Instances:** 18
- **Pages Used:** 4
- **Average Size:** 5809px²
- **Variant Diversity:** 5 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface AvatarUserProfileProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function AvatarUserProfile({ 
  children, 
  className,
  variant = 'xs',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: AvatarUserProfileProps) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "avatar-user-profile",
        // Variant styles
        variant === 'xs' && "avatar-user-profile--xs",
        variant === 'sm' && "avatar-user-profile--sm",
        variant === 'md' && "avatar-user-profile--md",
        variant === 'lg' && "avatar-user-profile--lg",
        variant === 'xl' && "avatar-user-profile--xl",
        // Size styles
        size === 'sm' && "avatar-user-profile--sm",
        size === 'lg' && "avatar-user-profile--lg",
        // State styles
        disabled && "avatar-user-profile--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<AvatarUserProfile>Default content</AvatarUserProfile>

// With variant
<AvatarUserProfile variant="xs">Primary content</AvatarUserProfile>

// With size
<AvatarUserProfile size="lg">Large content</AvatarUserProfile>

// Combined props
<AvatarUserProfile variant="xs" size="sm" className="custom-class">
  Custom content
</AvatarUserProfile>
```

#### Real Usage Examples

- **Profile Picture** on Header page (user-menu)
- **Team Member** on Team page (member-grid)
- **Comment Author** on Blog page (comment-thread)


### Badge/Status

**Usage:** Core component used 16 times across 3 pages.

**Real Usage Data:**
- **Total Instances:** 16
- **Pages Used:** 3
- **Average Size:** 3844px²
- **Variant Diversity:** 5 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface BadgeStatusProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function BadgeStatus({ 
  children, 
  className,
  variant = 'success',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: BadgeStatusProps) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "badge-status",
        // Variant styles
        variant === 'success' && "badge-status--success",
        variant === 'warning' && "badge-status--warning",
        variant === 'error' && "badge-status--error",
        variant === 'info' && "badge-status--info",
        variant === 'neutral' && "badge-status--neutral",
        // Size styles
        size === 'sm' && "badge-status--sm",
        size === 'lg' && "badge-status--lg",
        // State styles
        disabled && "badge-status--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<BadgeStatus>Default content</BadgeStatus>

// With variant
<BadgeStatus variant="success">Primary content</BadgeStatus>

// With size
<BadgeStatus size="lg">Large content</BadgeStatus>

// Combined props
<BadgeStatus variant="success" size="sm" className="custom-class">
  Custom content
</BadgeStatus>
```

#### Real Usage Examples

- **Order Status** on Orders page (status-indicator)
- **Notification Count** on Header page (counter-badge)
- **Feature Flag** on Settings page (feature-toggle)


### Loading/Spinner

**Usage:** Core component used 14 times across 1 pages.

**Real Usage Data:**
- **Total Instances:** 14
- **Pages Used:** 1
- **Average Size:** 1636px²
- **Variant Diversity:** 5 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface LoadingSpinnerProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'small' | 'medium' | 'large' | 'inline' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function LoadingSpinner({ 
  children, 
  className,
  variant = 'small',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "loading-spinner",
        // Variant styles
        variant === 'small' && "loading-spinner--small",
        variant === 'medium' && "loading-spinner--medium",
        variant === 'large' && "loading-spinner--large",
        variant === 'inline' && "loading-spinner--inline",
        variant === 'overlay' && "loading-spinner--overlay",
        // Size styles
        size === 'sm' && "loading-spinner--sm",
        size === 'lg' && "loading-spinner--lg",
        // State styles
        disabled && "loading-spinner--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<LoadingSpinner>Default content</LoadingSpinner>

// With variant
<LoadingSpinner variant="small">Primary content</LoadingSpinner>

// With size
<LoadingSpinner size="lg">Large content</LoadingSpinner>

// Combined props
<LoadingSpinner variant="small" size="sm" className="custom-class">
  Custom content
</LoadingSpinner>
```

#### Real Usage Examples

- **Page Loader** on Dashboard page (page-transition)
- **Button Loading** on Forms page (form-submission)
- **Content Loading** on Feed page (infinite-scroll)


### Checkbox/Toggle

**Usage:** Core component used 12 times across 3 pages.

**Real Usage Data:**
- **Total Instances:** 12
- **Pages Used:** 3
- **Average Size:** 3472px²
- **Variant Diversity:** 4 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface CheckboxToggleProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'checked' | 'indeterminate' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function CheckboxToggle({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: CheckboxToggleProps) {
  return (
    <input 
      className={cn(
        // Base styles from design system
        "checkbox-toggle",
        // Variant styles
        variant === 'default' && "checkbox-toggle--default",
        variant === 'checked' && "checkbox-toggle--checked",
        variant === 'indeterminate' && "checkbox-toggle--indeterminate",
        variant === 'disabled' && "checkbox-toggle--disabled",
        // Size styles
        size === 'sm' && "checkbox-toggle--sm",
        size === 'lg' && "checkbox-toggle--lg",
        // State styles
        disabled && "checkbox-toggle--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </input>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<CheckboxToggle>Default content</CheckboxToggle>

// With variant
<CheckboxToggle variant="default">Primary content</CheckboxToggle>

// With size
<CheckboxToggle size="lg">Large content</CheckboxToggle>

// Combined props
<CheckboxToggle variant="default" size="sm" className="custom-class">
  Custom content
</CheckboxToggle>
```

#### Real Usage Examples

- **Feature Toggle** on Settings page (preferences)
- **Terms Agreement** on Signup page (form-validation)
- **Bulk Select** on Table page (row-selection)


### Dropdown/Select

**Usage:** Core component used 11 times across 3 pages.

**Real Usage Data:**
- **Total Instances:** 11
- **Pages Used:** 3
- **Average Size:** 3979px²
- **Variant Diversity:** 4 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface DropdownSelectProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'searchable' | 'multi-select' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function DropdownSelect({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: DropdownSelectProps) {
  return (
    <input 
      className={cn(
        // Base styles from design system
        "dropdown-select",
        // Variant styles
        variant === 'default' && "dropdown-select--default",
        variant === 'searchable' && "dropdown-select--searchable",
        variant === 'multi-select' && "dropdown-select--multi-select",
        variant === 'disabled' && "dropdown-select--disabled",
        // Size styles
        size === 'sm' && "dropdown-select--sm",
        size === 'lg' && "dropdown-select--lg",
        // State styles
        disabled && "dropdown-select--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </input>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<DropdownSelect>Default content</DropdownSelect>

// With variant
<DropdownSelect variant="default">Primary content</DropdownSelect>

// With size
<DropdownSelect size="lg">Large content</DropdownSelect>

// Combined props
<DropdownSelect variant="default" size="sm" className="custom-class">
  Custom content
</DropdownSelect>
```

#### Real Usage Examples

- **Country Selector** on Checkout page (address-form)
- **Filter Options** on Catalog page (product-filters)
- **User Role** on Admin page (user-management)


### lucide/earth

**Usage:** Core component used 5 times across 2 pages.

**Real Usage Data:**
- **Total Instances:** 5
- **Pages Used:** 2
- **Average Size:** 4371px²
- **Variant Diversity:** 1 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface LucideEarthProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function LucideEarth({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: LucideEarthProps) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "lucide-earth",
        // Variant styles
        variant === 'default' && "lucide-earth--default",
        // Size styles
        size === 'sm' && "lucide-earth--sm",
        size === 'lg' && "lucide-earth--lg",
        // State styles
        disabled && "lucide-earth--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<LucideEarth>Default content</LucideEarth>

// With size
<LucideEarth size="lg">Large content</LucideEarth>

// Combined props
<LucideEarth variant="default" size="sm" className="custom-class">
  Custom content
</LucideEarth>
```

#### Real Usage Examples

- **Global Icon** on Navigation page (global-menu)


### lucide/alarm-clock-check

**Usage:** Core component used 3 times across 1 pages.

**Real Usage Data:**
- **Total Instances:** 3
- **Pages Used:** 1
- **Average Size:** 2531px²
- **Variant Diversity:** 1 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface LucideAlarmClockCheckProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function LucideAlarmClockCheck({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: LucideAlarmClockCheckProps) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "lucide-alarm-clock-check",
        // Variant styles
        variant === 'default' && "lucide-alarm-clock-check--default",
        // Size styles
        size === 'sm' && "lucide-alarm-clock-check--sm",
        size === 'lg' && "lucide-alarm-clock-check--lg",
        // State styles
        disabled && "lucide-alarm-clock-check--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<LucideAlarmClockCheck>Default content</LucideAlarmClockCheck>

// With size
<LucideAlarmClockCheck size="lg">Large content</LucideAlarmClockCheck>

// Combined props
<LucideAlarmClockCheck variant="default" size="sm" className="custom-class">
  Custom content
</LucideAlarmClockCheck>
```

#### Real Usage Examples

- **Schedule Icon** on Calendar page (time-indicator)


### lucide/anchor

**Usage:** Core component used 2 times across 1 pages.

**Real Usage Data:**
- **Total Instances:** 2
- **Pages Used:** 1
- **Average Size:** 5070px²
- **Variant Diversity:** 1 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface LucideAnchorProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function LucideAnchor({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: LucideAnchorProps) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "lucide-anchor",
        // Variant styles
        variant === 'default' && "lucide-anchor--default",
        // Size styles
        size === 'sm' && "lucide-anchor--sm",
        size === 'lg' && "lucide-anchor--lg",
        // State styles
        disabled && "lucide-anchor--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<LucideAnchor>Default content</LucideAnchor>

// With size
<LucideAnchor size="lg">Large content</LucideAnchor>

// Combined props
<LucideAnchor variant="default" size="sm" className="custom-class">
  Custom content
</LucideAnchor>
```

#### Real Usage Examples

- **Anchor Link** on Documentation page (section-link)


### lucide/apple

**Usage:** Core component used 1 times across 1 pages.

**Real Usage Data:**
- **Total Instances:** 1
- **Pages Used:** 1
- **Average Size:** 4482px²
- **Variant Diversity:** 1 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface LucideAppleProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function LucideApple({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: LucideAppleProps) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "lucide-apple",
        // Variant styles
        variant === 'default' && "lucide-apple--default",
        // Size styles
        size === 'sm' && "lucide-apple--sm",
        size === 'lg' && "lucide-apple--lg",
        // State styles
        disabled && "lucide-apple--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<LucideApple>Default content</LucideApple>

// With size
<LucideApple size="lg">Large content</LucideApple>

// Combined props
<LucideApple variant="default" size="sm" className="custom-class">
  Custom content
</LucideApple>
```

#### Real Usage Examples

- **Platform Icon** on Download page (platform-selector)


### lucide/baby

**Usage:** Core component used 1 times across 1 pages.

**Real Usage Data:**
- **Total Instances:** 1
- **Pages Used:** 1
- **Average Size:** 5547px²
- **Variant Diversity:** 1 configurations
- **Component Set:** Multi-instance

#### Implementation

```tsx
interface LucideBabyProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

export function LucideBaby({ 
  children, 
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  ...props 
}: LucideBabyProps) {
  return (
    <div 
      className={cn(
        // Base styles from design system
        "lucide-baby",
        // Variant styles
        variant === 'default' && "lucide-baby--default",
        // Size styles
        size === 'sm' && "lucide-baby--sm",
        size === 'lg' && "lucide-baby--lg",
        // State styles
        disabled && "lucide-baby--disabled",
        className
      )}
      
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Usage Examples

```jsx
// Basic usage
<LucideBaby>Default content</LucideBaby>

// With size
<LucideBaby size="lg">Large content</LucideBaby>

// Combined props
<LucideBaby variant="default" size="sm" className="custom-class">
  Custom content
</LucideBaby>
```

#### Real Usage Examples

- **Age Icon** on Demographics page (user-stats)




---

## 📊 Usage Patterns & Guidelines

### Component Usage Statistics

```json
{
  "totalComponents": 25,
  "totalInstances": 487,
  "averageInstancesPerPage": 60.9,
  "mostUsedComponents": [
    {
      "name": "Button/Primary",
      "usage": 89,
      "pages": 4
    },
    {
      "name": "Button/Secondary",
      "usage": 67,
      "pages": 3
    },
    {
      "name": "Input/Text Field",
      "usage": 45,
      "pages": 4
    },
    {
      "name": "Card/Product",
      "usage": 34,
      "pages": 3
    },
    {
      "name": "Navigation/Header",
      "usage": 28,
      "pages": 1
    }
  ]
}
```

### Style Patterns

```json
{
  "colors": [
    {
      "color": "#007fa7",
      "usage": 45,
      "contexts": [
        "COMPONENT",
        "BACKGROUND",
        "BORDER"
      ],
      "avgOpacity": 1
    },
    {
      "color": "#ffffff",
      "usage": 89,
      "contexts": [
        "COMPONENT",
        "BACKGROUND",
        "TEXT"
      ],
      "avgOpacity": 1
    },
    {
      "color": "#020517",
      "usage": 67,
      "contexts": [
        "COMPONENT",
        "TEXT"
      ],
      "avgOpacity": 1
    },
    {
      "color": "#ff7266",
      "usage": 23,
      "contexts": [
        "COMPONENT",
        "BACKGROUND"
      ],
      "avgOpacity": 1
    }
  ],
  "typography": [
    {
      "fontFamily": "Inter",
      "fontSize": 16,
      "fontWeight": 400,
      "usage": 34,
      "contexts": [
        "BODY_TEXT",
        "COMPONENT"
      ]
    },
    {
      "fontFamily": "Inter",
      "fontSize": 24,
      "fontWeight": 600,
      "usage": 28,
      "contexts": [
        "HEADING",
        "COMPONENT"
      ]
    }
  ],
  "spacing": [
    {
      "value": 16,
      "usage": 156,
      "contexts": [
        "PADDING",
        "MARGIN",
        "GAP"
      ]
    },
    {
      "value": 24,
      "usage": 89,
      "contexts": [
        "PADDING",
        "MARGIN"
      ]
    },
    {
      "value": 8,
      "usage": 234,
      "contexts": [
        "PADDING",
        "GAP"
      ]
    }
  ]
}
```

### Layout Patterns

```json
[
  {
    "type": "flex",
    "direction": "column",
    "gap": 16,
    "usage": 45,
    "contexts": [
      "CARD_LAYOUT",
      "FORM_LAYOUT"
    ]
  },
  {
    "type": "grid",
    "columns": 3,
    "gap": 24,
    "usage": 23,
    "contexts": [
      "PRODUCT_GRID",
      "FEATURE_GRID"
    ]
  }
]
```

---

## 💡 AI Implementation Guidelines

### Design System Rules

Based on the analysis of this design system, follow these specific implementation guidelines:

1. **Color Usage:** Primary colors are #007fa7. Use these for main UI elements.
2. **Typography Hierarchy:** Follow the extracted typography scale with Inter font family.
3. **Spacing System:** Use consistent spacing values from the design system (4, 8, 16, 24, 32px scale).
4. **Component Patterns:** Most used component is Button/Primary. Follow its patterns for consistency.

### Recommendations

1. **color-token:** Create color token for #007fa7 (used 45 times across COMPONENT, BACKGROUND, BORDER) (Confidence: 85%)
2. **spacing-token:** Create spacing token for 16px (used 156 times across PADDING, MARGIN, GAP) (Confidence: 92%)
3. **component-consolidation:** Consider consolidating Button variants into a unified component system (Confidence: 78%)

### Design System Insights

1. **Component Usage:** Most used component: Button/Primary (89 instances across 4 pages)
2. **Token Opportunities:** 16 colors and 12 spacing values could become design tokens
3. **Component Reusability:** High reuse patterns in button and input components suggest mature component system

### Token Creation Opportunities

Based on usage patterns, consider creating design tokens for:

- Create color token for #007fa7 (used 45 times across COMPONENT, BACKGROUND, BORDER)
- Create color token for #ffffff (used 89 times across COMPONENT, BACKGROUND, TEXT)
- Create color token for #020517 (used 67 times across COMPONENT, TEXT)

- Create spacing token for 16px (used 156 times across PADDING, MARGIN, GAP)
- Create spacing token for 24px (used 89 times across PADDING, MARGIN)
- Create spacing token for 8px (used 234 times across PADDING, GAP)