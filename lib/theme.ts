export const theme = {
  colors: {
    primary: {
      DEFAULT: '#4DD4D4', // Main turquoise from logo
      50: '#F0FEFE',
      100: '#CCFBFB',
      200: '#99F6F6',
      300: '#66F0F0',
      400: '#4DD4D4',
      500: '#2DBABA',
      600: '#259999',
      700: '#1C7777',
      800: '#145555',
      900: '#0B3333',
    },
    secondary: {
      DEFAULT: '#5CDFDF', // Lighter turquoise accent
      50: '#F2FEFE',
      100: '#D9FCFC',
      200: '#B3F9F9',
      300: '#8DF5F5',
      400: '#5CDFDF',
      500: '#3BCCCC',
      600: '#2FA3A3',
      700: '#237A7A',
      800: '#175252',
      900: '#0B2929',
    },
    accent: {
      DEFAULT: '#44E4E4', // Bright turquoise for highlights
      dark: '#2BB8B8',
    },
    background: {
      DEFAULT: '#0A0F0F', // Deep dark for main background
      surface: '#141A1A', // Slightly lighter surface
      card: '#1A2222', // Card backgrounds
    },
    text: {
      primary: '#F0FEFE', // High contrast white-turquoise
      secondary: '#B3D9D9', // Muted turquoise for secondary text
      tertiary: '#7A9999', // Even more muted for captions
    },
    gray: {
      DEFAULT: '#8B9999', // Logo gray
      50: '#F5F7F7',
      100: '#E6EEEE',
      200: '#CCDDDD',
      300: '#B3CCCC',
      400: '#99BBBB',
      500: '#8B9999', // Main gray from logo
      600: '#708080',
      700: '#556666',
      800: '#3A4D4D',
      900: '#1F3333',
    },
    status: {
      success: '#00E6A6', // Turquoise-tinted success
      warning: '#FFD93D', // Bright yellow
      error: '#FF6B6B', // Coral red
      info: '#4DD4D4', // Primary turquoise
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 4,
    },
    strong: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 32,
      elevation: 8,
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },
} as const;

export type Theme = typeof theme;

// Helper functions
export const getElevation = (level: 'soft' | 'medium' | 'strong') => theme.shadows[level];

export const getCardGradient = () => ({
  colors: ['rgba(77, 212, 212, 0.08)', 'rgba(20, 26, 26, 0.9)'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
});

export const getPrimaryGradient = () => ({
  colors: ['#4DD4D4', '#44E4E4'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
});

export const getAccentGradient = () => ({
  colors: ['rgba(92, 223, 223, 0.1)', 'rgba(68, 228, 228, 0.05)'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
});

export const getStatusColor = (status: 'success' | 'warning' | 'error') => theme.colors.status[status];

export default theme;
