// Modern Design System for AloeVeraMate
// Inspired by contemporary mobile design trends (2024-2026)

export const Colors = {
  // Primary Brand Colors - Modern green palette
  primary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main brand color
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Secondary - Accent colors
  accent: {
    mint: '#00E676',
    teal: '#1DE9B6',
    amber: '#FFD54F',
    coral: '#FF6E40',
  },
  
  // Neutrals - Modern grayscale
  neutral: {
    white: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    black: '#000000',
  },
  
  // Semantic colors
  status: {
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },
  
  // Gradients
  gradients: {
    primary: ['#1B5E20', '#2E7D32', '#4CAF50'],
    primaryReverse: ['#4CAF50', '#2E7D32', '#1B5E20'],
    accent: ['#00E676', '#1DE9B6'],
    warm: ['#FFD54F', '#FFC107'],
    cool: ['#4CAF50', '#00BCD4'],
    dark: ['#1B5E20', '#0D3312'],
  },
  
  // Overlay colors
  overlay: {
    light: 'rgba(255, 255, 255, 0.95)',
    medium: 'rgba(255, 255, 255, 0.7)',
    dark: 'rgba(0, 0, 0, 0.5)',
    darkStrong: 'rgba(0, 0, 0, 0.8)',
  },
};

export const Typography = {
  // Font sizes - Modern scale
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

export const Spacing = {
  // Modern 4px base scale
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
};

export const BorderRadius = {
  none: 0,
  sm: 6,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  full: 9999,
};

export const Shadows = {
  // Modern subtle shadows
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const Layout = {
  screenPadding: Spacing.base,
  cardPadding: Spacing.lg,
  sectionSpacing: Spacing['2xl'],
  itemSpacing: Spacing.md,
};

export const Animation = {
  duration: {
    fast: 150,
    base: 250,
    slow: 350,
    slower: 500,
  },
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Component Styles
export const Components = {
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.base,
  },
  
  button: {
    primary: {
      backgroundColor: Colors.primary[500],
      borderRadius: BorderRadius.base,
      paddingVertical: Spacing.base,
      paddingHorizontal: Spacing.xl,
    },
    secondary: {
      backgroundColor: Colors.neutral[100],
      borderRadius: BorderRadius.base,
      paddingVertical: Spacing.base,
      paddingHorizontal: Spacing.xl,
    },
  },
  
  input: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.base,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  Animation,
  Components,
};
