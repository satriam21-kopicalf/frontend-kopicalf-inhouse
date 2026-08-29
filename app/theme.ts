import { createTheme } from '@mui/material/styles';

// ============================================================================
// BRAND PALETTE — Kopi Calf Internal
// ============================================================================
type BrandScale = {
  50: string; 100: string; 200: string; 300: string; 400: string;
  500: string; 600: string; 700: string; 800: string; 900: string; 950: string;
};

const deepTwilight: BrandScale = {
  50: '#e6e7fe', 100: '#cecefd', 200: '#9c9efc', 300: '#6b6dfa', 400: '#393cf9',
  500: '#080cf7', 600: '#0609c6', 700: '#050794', 800: '#030563', 900: '#020231', 950: '#010223',
};

const frenchBlue: BrandScale = {
  50: '#e6f1ff', 100: '#cde2fe', 200: '#9bc5fd', 300: '#68a9fd', 400: '#368cfc',
  500: '#046ffb', 600: '#0359c9', 700: '#024397', 800: '#022c64', 900: '#011632', 950: '#011023',
};

const brightTealBlue: BrandScale = {
  50: '#e5f6ff', 100: '#ccedff', 200: '#99dbff', 300: '#66c9ff', 400: '#33b8ff',
  500: '#00a6ff', 600: '#0085cc', 700: '#006399', 800: '#004266', 900: '#002133', 950: '#001724',
};

const blueGreen: BrandScale = {
  50: '#e5f9ff', 100: '#ccf2ff', 200: '#99e6ff', 300: '#66d9ff', 400: '#33ccff',
  500: '#00bfff', 600: '#0099cc', 700: '#007399', 800: '#004d66', 900: '#002633', 950: '#001b24',
};

const turquoiseSurf: BrandScale = {
  50: '#e5fbff', 100: '#ccf6ff', 200: '#99eeff', 300: '#66e5ff', 400: '#33ddff',
  500: '#00d4ff', 600: '#00aacc', 700: '#007f99', 800: '#005566', 900: '#002a33', 950: '#001e24',
};

const skyAqua: BrandScale = {
  50: '#e9f9fc', 100: '#d3f2f8', 200: '#a6e5f2', 300: '#7ad8eb', 400: '#4ecbe4',
  500: '#21bede', 600: '#1b98b1', 700: '#147285', 800: '#0d4c59', 900: '#07262c', 950: '#051b1f',
};

const lightCyan: BrandScale = {
  50: '#e8f9fc', 100: '#d2f3f9', 200: '#a5e6f3', 300: '#78daed', 400: '#4acde8',
  500: '#1dc1e2', 600: '#179ab5', 700: '#127487', 800: '#0c4d5a', 900: '#06272d', 950: '#041b20',
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

/** Signature brand gradient (deep twilight → french blue → turquoise surf) */
export const BRAND_GRADIENT = 'linear-gradient(135deg, #050794 0%, #046ffb 55%, #00d4ff 100%)';
/** Sidebar/hero gradient variant */
export const BRAND_GRADIENT_DARK = 'linear-gradient(160deg, #020231 0%, #050794 45%, #0359c9 100%)';

// ============================================================================
// THEME
// ============================================================================
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      ...deepTwilight,
      main: deepTwilight[600],
      light: deepTwilight[400],
      dark: deepTwilight[800],
      contrastText: '#ffffff',
    },
    secondary: {
      ...frenchBlue,
      main: frenchBlue[500],
      light: frenchBlue[300],
      dark: frenchBlue[700],
      contrastText: '#ffffff',
    },
    info: {
      ...brightTealBlue,
      main: brightTealBlue[500],
      light: brightTealBlue[300],
      dark: brightTealBlue[700],
      contrastText: '#ffffff',
    },
    teal: {
      ...turquoiseSurf,
      main: turquoiseSurf[500],
      light: turquoiseSurf[300],
      dark: turquoiseSurf[700],
      contrastText: '#002a33',
    },
    aqua: {
      ...skyAqua,
      main: skyAqua[500],
      light: skyAqua[300],
      dark: skyAqua[700],
      contrastText: '#ffffff',
    },
    cyan: {
      ...lightCyan,
      main: lightCyan[500],
      light: lightCyan[300],
      dark: lightCyan[700],
      contrastText: '#ffffff',
    },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error: { main: '#d32f2f' },
    background: {
      default: '#f7f9fc',
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
