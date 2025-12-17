// Theme constants for Agent App
export const colors = {
  // Background colors
  background: {
    primary: '#0A0A0F',
    secondary: '#12121A',
    tertiary: '#1A1A25',
    card: '#1E1E2D',
    elevated: '#252535',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B4B4C0',
    muted: '#6B6B80',
    placeholder: '#4A4A5A',
  },

  // Primary accent (orange for agent app)
  primary: {
    default: '#FF6B35',
    light: '#FF8C5A',
    dark: '#E55A2B',
    gradient: ['#FF6B35', '#FF8C5A'] as const,
  },

  // Status colors
  success: {
    default: '#10B981',
    light: '#34D399',
  },
  warning: {
    default: '#F59E0B',
    light: '#FBBF24',
  },
  danger: {
    default: '#EF4444',
    light: '#F87171',
  },

  // Border colors
  border: {
    default: '#2A2A3A',
    light: '#3A3A4A',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    '2xl': 26,
    '3xl': 32,
    '4xl': 40,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Format currency in BDT
export const formatCurrency = (amount: number): string => {
  return `৳${amount.toLocaleString('bn-BD')}`;
};
