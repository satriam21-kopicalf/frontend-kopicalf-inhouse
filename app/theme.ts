import { createTheme } from '@mui/material/styles';

// ============================================================================
// BRAND PALETTE — Kopi Calf Internal (dark blue, white & red)
// ============================================================================
type BrandScale = {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string; 950: string;
};

// Dark navy blue scale
const kopiNavy: BrandScale = {
  50: '#e8edf5', 100: '#c5d1e6', 200: '#9fb3d6', 300: '#7895c5', 400: '#5c7cb8',
  500: '#3D63AB', 600: '#0D2B5E', 700: '#091C42', 800: '#071336', 900: '#050B28', 950: '#03071A',
};

// Mid blue scale
const kopiBlue: BrandScale = {
  50: '#e6effe', 100: '#bdd7fc', 200: '#8fbdf9', 300: '#61a3f7', 400: '#3d8ff4',
  500: '#1E5799', 600: '#184a8a', 700: '#123b7a', 800: '#0c2c6b', 900: '#061d5c', 950: '#03104d',
};

// Sky blue accent
const kopiSky: BrandScale = {
  50: '#e8f5fe', 100: '#c5e4fc', 200: '#9fd1fa', 300: '#79bef8', 400: '#5db0f6',
  500: '#1E88E5', 600: '#1565C0', 700: '#0D47A1', 800: '#083078', 900: '#031950', 950: '#021142',
};

declare module '@mui/material/styles' {
  interface Palette {
    teal: Palette['primary'];
    aqua: Palette['primary'];
    cyan: Palette['primary'];
  }
  interface PaletteOptions {
    teal?: PaletteOptions['primary'];
    aqua?: PaletteOptions['primary'];
    cyan?: PaletteOptions['primary'];
  }
}

/** Signature brand gradient (dark navy → bright blue) */
export const BRAND_GRADIENT = 'linear-gradient(135deg, #091C42 0%, #0D2B5E 50%, #1E5799 100%)';
/** Sidebar/hero gradient variant */
export const BRAND_GRADIENT_DARK = 'linear-gradient(160deg, #03071A 0%, #091C42 45%, #0D2B5E 100%)';

// ============================================================================
// THEME
// ============================================================================
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      ...kopiNavy,
      main: kopiNavy[600],
      light: kopiNavy[400],
      dark: kopiNavy[800],
      contrastText: '#ffffff',
    },
    secondary: {
      ...kopiBlue,
      main: kopiBlue[500],
      light: kopiBlue[300],
      dark: kopiBlue[700],
      contrastText: '#ffffff',
    },
    info: {
      ...kopiSky,
      main: kopiSky[500],
      light: kopiSky[300],
      dark: kopiSky[700],
      contrastText: '#ffffff',
    },
    teal: {
      ...kopiSky,
      main: kopiSky[500],
      light: kopiSky[300],
      dark: kopiSky[700],
      contrastText: '#ffffff',
    },
    aqua: {
      ...kopiSky,
      main: kopiSky[500],
      light: kopiSky[300],
      dark: kopiSky[700],
      contrastText: '#ffffff',
    },
    cyan: {
      ...kopiSky,
      main: kopiSky[500],
      light: kopiSky[300],
      dark: kopiSky[700],
      contrastText: '#ffffff',
    },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error: { main: '#C62828' },
    background: {
      default: '#F0F4FA',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), Helvetica, Arial, sans-serif',
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: '1px solid', borderColor: 'divider' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: '1px solid', borderColor: 'divider' },
      },
    },
  },
});

export default theme;
