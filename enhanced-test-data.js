/**
 * Enhanced Test Data for Complete Component Library Demonstration
 * Shows what a full design system extraction would look like
 */

const enhancedComponentData = {
  metadata: {
    extractedAt: new Date().toISOString(),
    totalVariables: 305,
    totalPaintStyles: 0,
    totalTextStyles: 20,
    totalEffectStyles: 6,
    totalGridStyles: 2
  },
  componentAnalysis: {
    summary: {
      uniqueComponents: 25,
      totalInstances: 487,
      totalPages: 8,
      avgInstancesPerPage: 60.9
    },
    componentUsage: [
      {
        name: "Button/Primary",
        type: "button",
        count: 89,
        pages: ["Dashboard", "Settings", "Profile", "Checkout"],
        variants: ["default", "loading", "disabled"],
        instances: [
          { name: "CTA Button", page: "Landing", context: "hero-section" },
          { name: "Submit Button", page: "Form", context: "form-footer" },
          { name: "Save Changes", page: "Settings", context: "settings-panel" }
        ]
      },
      {
        name: "Button/Secondary",
        type: "button", 
        count: 67,
        pages: ["Dashboard", "Settings", "Profile"],
        variants: ["default", "outline", "ghost"],
        instances: [
          { name: "Cancel Button", page: "Modal", context: "dialog-footer" },
          { name: "Back Button", page: "Wizard", context: "navigation" }
        ]
      },
      {
        name: "Input/Text Field",
        type: "input",
        count: 45,
        pages: ["Forms", "Settings", "Profile", "Search"],
        variants: ["default", "error", "focused", "disabled"],
        instances: [
          { name: "Email Input", page: "Login", context: "auth-form" },
          { name: "Search Bar", page: "Dashboard", context: "header" },
          { name: "Message Input", page: "Chat", context: "message-compose" }
        ]
      },
      {
        name: "Card/Product",
        type: "card",
        count: 34,
        pages: ["Catalog", "Dashboard", "Favorites"],
        variants: ["default", "featured", "compact", "large"],
        instances: [
          { name: "Product Card", page: "Catalog", context: "product-grid" },
          { name: "Feature Card", page: "Landing", context: "features-section" },
          { name: "Stat Card", page: "Analytics", context: "metrics-grid" }
        ]
      },
      {
        name: "Navigation/Header",
        type: "navigation",
        count: 28,
        pages: ["All Pages"],
        variants: ["desktop", "mobile", "sticky"],
        instances: [
          { name: "Main Navigation", page: "Dashboard", context: "layout-header" },
          { name: "Mobile Menu", page: "Mobile", context: "overlay-menu" }
        ]
      },
      {
        name: "Modal/Dialog",
        type: "modal",
        count: 23,
        pages: ["Settings", "Confirmation", "Forms"],
        variants: ["small", "medium", "large", "fullscreen"],
        instances: [
          { name: "Delete Confirmation", page: "Settings", context: "destructive-action" },
          { name: "Edit Profile", page: "Profile", context: "form-overlay" },
          { name: "Image Viewer", page: "Gallery", context: "media-overlay" }
        ]
      },
      {
        name: "Table/Data Grid",
        type: "table",
        count: 19,
        pages: ["Analytics", "Users", "Orders"],
        variants: ["default", "sortable", "paginated", "filterable"],
        instances: [
          { name: "User Management", page: "Admin", context: "data-management" },
          { name: "Order History", page: "Account", context: "transaction-list" },
          { name: "Analytics Table", page: "Reports", context: "data-visualization" }
        ]
      },
      {
        name: "Avatar/User Profile",
        type: "media",
        count: 18,
        pages: ["Header", "Profile", "Comments", "Team"],
        variants: ["xs", "sm", "md", "lg", "xl"],
        instances: [
          { name: "Profile Picture", page: "Header", context: "user-menu" },
          { name: "Team Member", page: "Team", context: "member-grid" },
          { name: "Comment Author", page: "Blog", context: "comment-thread" }
        ]
      },
      {
        name: "Badge/Status",
        type: "feedback",
        count: 16,
        pages: ["Dashboard", "Orders", "Notifications"],
        variants: ["success", "warning", "error", "info", "neutral"],
        instances: [
          { name: "Order Status", page: "Orders", context: "status-indicator" },
          { name: "Notification Count", page: "Header", context: "counter-badge" },
          { name: "Feature Flag", page: "Settings", context: "feature-toggle" }
        ]
      },
      {
        name: "Loading/Spinner",
        type: "feedback",
        count: 14,
        pages: ["All Pages"],
        variants: ["small", "medium", "large", "inline", "overlay"],
        instances: [
          { name: "Page Loader", page: "Dashboard", context: "page-transition" },
          { name: "Button Loading", page: "Forms", context: "form-submission" },
          { name: "Content Loading", page: "Feed", context: "infinite-scroll" }
        ]
      },
      {
        name: "Checkbox/Toggle",
        type: "input",
        count: 12,
        pages: ["Settings", "Forms", "Filters"],
        variants: ["default", "checked", "indeterminate", "disabled"],
        instances: [
          { name: "Feature Toggle", page: "Settings", context: "preferences" },
          { name: "Terms Agreement", page: "Signup", context: "form-validation" },
          { name: "Bulk Select", page: "Table", context: "row-selection" }
        ]
      },
      {
        name: "Dropdown/Select",
        type: "input",
        count: 11,
        pages: ["Forms", "Filters", "Settings"],
        variants: ["default", "searchable", "multi-select", "disabled"],
        instances: [
          { name: "Country Selector", page: "Checkout", context: "address-form" },
          { name: "Filter Options", page: "Catalog", context: "product-filters" },
          { name: "User Role", page: "Admin", context: "user-management" }
        ]
      },
      // Lucide Icons
      {
        name: "lucide/earth",
        type: "media",
        count: 5,
        pages: ["Global", "Settings"],
        variants: ["default"],
        instances: [
          { name: "Global Icon", page: "Navigation", context: "global-menu" }
        ]
      },
      {
        name: "lucide/alarm-clock-check", 
        type: "media",
        count: 3,
        pages: ["Dashboard"],
        variants: ["default"],
        instances: [
          { name: "Schedule Icon", page: "Calendar", context: "time-indicator" }
        ]
      },
      {
        name: "lucide/anchor",
        type: "media", 
        count: 2,
        pages: ["Navigation"],
        variants: ["default"],
        instances: [
          { name: "Anchor Link", page: "Documentation", context: "section-link" }
        ]
      },
      {
        name: "lucide/apple",
        type: "media",
        count: 1,
        pages: ["About"],
        variants: ["default"],
        instances: [
          { name: "Platform Icon", page: "Download", context: "platform-selector" }
        ]
      },
      {
        name: "lucide/baby",
        type: "media",
        count: 1,
        pages: ["Profile"],
        variants: ["default"],
        instances: [
          { name: "Age Icon", page: "Demographics", context: "user-stats" }
        ]
      }
    ],
    stylePatterns: {
      colors: [
        {
          color: "#007fa7",
          usage: 45,
          contexts: ["COMPONENT", "BACKGROUND", "BORDER"],
          avgOpacity: 1
        },
        {
          color: "#ffffff",
          usage: 89,
          contexts: ["COMPONENT", "BACKGROUND", "TEXT"],
          avgOpacity: 1
        },
        {
          color: "#020517",
          usage: 67,
          contexts: ["COMPONENT", "TEXT"],
          avgOpacity: 1
        },
        {
          color: "#ff7266",
          usage: 23,
          contexts: ["COMPONENT", "BACKGROUND"],
          avgOpacity: 1
        }
      ],
      typography: [
        {
          fontFamily: "Inter",
          fontSize: 16,
          fontWeight: 400,
          usage: 34,
          contexts: ["BODY_TEXT", "COMPONENT"]
        },
        {
          fontFamily: "Inter", 
          fontSize: 24,
          fontWeight: 600,
          usage: 28,
          contexts: ["HEADING", "COMPONENT"]
        }
      ],
      spacing: [
        {
          value: 16,
          usage: 156,
          contexts: ["PADDING", "MARGIN", "GAP"]
        },
        {
          value: 24,
          usage: 89,
          contexts: ["PADDING", "MARGIN"]
        },
        {
          value: 8,
          usage: 234,
          contexts: ["PADDING", "GAP"]
        }
      ]
    },
    layoutPatterns: [
      {
        type: "flex",
        direction: "column",
        gap: 16,
        usage: 45,
        contexts: ["CARD_LAYOUT", "FORM_LAYOUT"]
      },
      {
        type: "grid",
        columns: 3,
        gap: 24,
        usage: 23,
        contexts: ["PRODUCT_GRID", "FEATURE_GRID"]
      }
    ],
    recommendations: [
      {
        type: "color-token",
        suggestion: "Create color token for #007fa7 (used 45 times across COMPONENT, BACKGROUND, BORDER)",
        confidence: 0.85
      },
      {
        type: "spacing-token",
        suggestion: "Create spacing token for 16px (used 156 times across PADDING, MARGIN, GAP)",
        confidence: 0.92
      },
      {
        type: "component-consolidation",
        suggestion: "Consider consolidating Button variants into a unified component system",
        confidence: 0.78
      }
    ],
    insights: [
      {
        category: "Component Usage",
        insight: "Most used component: Button/Primary (89 instances across 4 pages)"
      },
      {
        category: "Token Opportunities", 
        insight: "16 colors and 12 spacing values could become design tokens"
      },
      {
        category: "Component Reusability",
        insight: "High reuse patterns in button and input components suggest mature component system"
      }
    ]
  },
  variables: {
    COLOR: {
      "BrandMOBI/100": { modes: { "light": "#cce5ed", "dark": "#cce5ed" } },
      "BrandMOBI/500": { modes: { "light": "#007fa7", "dark": "#007fa7" } },
      "Content/Primary": { modes: { "light": "#020517", "dark": "#ffffff" } },
      "Background/Primary": { modes: { "light": "#ffffff", "dark": "#1e293b" } },
      "Danger/500": { modes: { "light": "#ff7266", "dark": "#ff7266" } },
      "Success/500": { modes: { "light": "#46bd7e", "dark": "#46bd7e" } }
    }
  }
};

// Export for use in testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = enhancedComponentData;
} else if (typeof window !== 'undefined') {
  window.enhancedComponentData = enhancedComponentData;
}