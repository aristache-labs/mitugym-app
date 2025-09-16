export const theme = {
  colors: {
    primary: {
      DEFAULT: '#1e9b71',
      50: '#e6f2ee',
      100: '#b3d9c8',
      200: '#80c0a2',
      300: '#4da77c',
      400: '#1e9b71',
      500: '#1a8660',
      600: '#167050',
      700: '#125b40',
      800: '#0e4630',
      900: '#0a3020',
    },
    secondary: {
      DEFAULT: '#31d7a6',
      50: '#e8f8f3',
      100: '#c2ebd9',
      200: '#9cdfc0',
      300: '#76d2a7',
      400: '#31d7a6',
      500: '#2bc194',
      600: '#25ab82',
      700: '#1f9570',
      800: '#197f5e',
      900: '#13694c',
    },
    background: {
      DEFAULT: '#0b0f0e',
      surface: '#111618',
    },
    text: {
      primary: '#e6f2ee',
      secondary: '#a7c3ba',
    },
    status: {
      success: '#2ecc71',
      warning: '#f1c40f',
      error: '#e74c3c',
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
  colors: ['rgba(30, 155, 113, 0.05)', 'rgba(17, 22, 24, 0.8)'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
});

export const getStatusColor = (status: 'success' | 'warning' | 'error') => theme.colors.status[status];

export default theme;
