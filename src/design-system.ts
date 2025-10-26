/**
 * Design System - Industry Standard UI/UX Guidelines
 * 
 * This file defines consistent design tokens across the entire application.
 * Following Material Design 3 and modern web design principles.
 */

export const designSystem = {
  /**
   * Typography Scale (Industry Standard)
   * Based on Material Design 3 type scale
   */
  typography: {
    // Page Titles (Main heading of a page)
    pageTitle: {
      fontSize: '2rem',        // 32px
      lineHeight: '2.5rem',    // 40px
      fontWeight: '700',       // Bold
      letterSpacing: '-0.02em'
    },
    
    // Section Titles (Major sections within a page)
    sectionTitle: {
      fontSize: '1.5rem',      // 24px
      lineHeight: '2rem',      // 32px
      fontWeight: '600',       // Semi-bold
      letterSpacing: '-0.01em'
    },
    
    // Card Titles (Titles within cards/components)
    cardTitle: {
      fontSize: '1.125rem',    // 18px
      lineHeight: '1.75rem',   // 28px
      fontWeight: '600',       // Semi-bold
      letterSpacing: '0'
    },
    
    // Subsection Titles
    subsectionTitle: {
      fontSize: '1rem',        // 16px
      lineHeight: '1.5rem',    // 24px
      fontWeight: '600',       // Semi-bold
      letterSpacing: '0'
    },
    
    // Body Text (Regular)
    bodyLarge: {
      fontSize: '1rem',        // 16px
      lineHeight: '1.5rem',    // 24px
      fontWeight: '400',       // Regular
      letterSpacing: '0'
    },
    
    // Body Text (Small)
    bodyMedium: {
      fontSize: '0.875rem',    // 14px
      lineHeight: '1.25rem',   // 20px
      fontWeight: '400',       // Regular
      letterSpacing: '0'
    },
    
    // Caption/Helper Text
    bodySmall: {
      fontSize: '0.75rem',     // 12px
      lineHeight: '1rem',      // 16px
      fontWeight: '400',       // Regular
      letterSpacing: '0.01em'
    },
    
    // Labels (Form labels, etc.)
    label: {
      fontSize: '0.875rem',    // 14px
      lineHeight: '1.25rem',   // 20px
      fontWeight: '500',       // Medium
      letterSpacing: '0.01em'
    },
    
    // Buttons
    button: {
      fontSize: '0.875rem',    // 14px
      lineHeight: '1.25rem',   // 20px
      fontWeight: '600',       // Semi-bold
      letterSpacing: '0.02em'
    }
  },

  /**
   * Spacing Scale (8px base unit)
   * Consistent spacing throughout the app
   */
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem'    // 96px
  },

  /**
   * Container/Page Layout
   */
  layout: {
    // Page container max width
    maxWidth: '1400px',
    
    // Page padding
    pagePadding: {
      mobile: '1rem',      // 16px
      tablet: '1.5rem',    // 24px
      desktop: '2rem'      // 32px
    },
    
    // Section spacing (between major sections)
    sectionGap: '2rem',    // 32px
    
    // Card/Component spacing
    componentGap: '1.5rem' // 24px
  },

  /**
   * Border Radius
   */
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px'   // Fully rounded
  },

  /**
   * Shadows (Elevation)
   */
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }
};

/**
 * CSS Class Utilities (to be used in Tailwind)
 */
export const classNames = {
  // Page Title
  pageTitle: 'text-3xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight tracking-tight',
  
  // Page Description (subtitle under page title)
  pageDescription: 'text-sm text-neutral-600 dark:text-neutral-400 mt-1',
  
  // Section Title
  sectionTitle: 'text-2xl font-semibold text-neutral-900 dark:text-neutral-100 leading-tight',
  
  // Card Title
  cardTitle: 'text-lg font-semibold text-neutral-900 dark:text-neutral-100',
  
  // Subsection Title
  subsectionTitle: 'text-base font-semibold text-neutral-900 dark:text-neutral-100',
  
  // Body Text
  bodyText: 'text-base text-neutral-700 dark:text-neutral-300',
  
  // Small Text
  smallText: 'text-sm text-neutral-600 dark:text-neutral-400',
  
  // Caption
  caption: 'text-xs text-neutral-500 dark:text-neutral-500',
  
  // Page Container
  pageContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
  
  // Section spacing
  section: 'space-y-6',
  
  // Card
  card: 'bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6'
};

/**
 * Component Size Standards
 */
export const componentSizes = {
  // Button heights
  button: {
    sm: '2rem',      // 32px
    md: '2.5rem',    // 40px
    lg: '3rem'       // 48px
  },
  
  // Input heights
  input: {
    sm: '2rem',      // 32px
    md: '2.5rem',    // 40px
    lg: '3rem'       // 48px
  },
  
  // Icon sizes
  icon: {
    xs: '1rem',      // 16px
    sm: '1.25rem',   // 20px
    md: '1.5rem',    // 24px
    lg: '2rem',      // 32px
    xl: '3rem'       // 48px
  }
};

