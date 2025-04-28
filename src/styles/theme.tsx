import type {} from '@mui/x-date-pickers/themeAugmentation';
import { PaletteMode, ThemeOptions, PaletteOptions } from '@mui/material';
import darkScrollbar from '@mui/material/darkScrollbar';

const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#1E3A8A', // Deep navy for primary elements
  },
  secondary: {
    main: '#10B981', // Teal accent for buttons or highlights
  },
  background: {
    default: '#F8FAFC', // Light grayish background
    paper: '#FFFFFF', // White for cards and containers
  },
  text: {
    primary: '#1E293B', // Dark gray for primary text
    secondary: '#475569', // Lighter gray for secondary text
  },
  divider: '#E2E8F0', // Subtle gray for dividers
  action: {
    active: '#475569', // Active state
    hover: '#F0FDF4', // Light teal hover for primary interactions
  },
};

const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#60A5FA', // Lighter shade of blue for better contrast
  },
  secondary: {
    main: '#34D399', // Bright green-teal accent for contrast
  },
  background: {
    default: '#1E293B', // Deep blue-gray for the main background
    paper: '#111827', // Darker shade for cards
  },
  text: {
    primary: '#F8FAFC', // White text for readability on dark backgrounds
    secondary: '#CBD5E1', // Light gray for secondary text
  },
  divider: '#334155', // Darker gray for dividers to reduce contrast
  action: {
    active: '#10B981', // Teal-green active state
    hover: '#1E3A8A', // Deep navy hover for interactions
  },
};

export const getDesignTokens = (mode: PaletteMode, dir: 'ltr' | 'rtl'): ThemeOptions => ({
  direction: dir,
  palette: mode === 'dark' ? darkPalette : lightPalette,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body:
          mode === 'dark'
            ? darkScrollbar()
            : darkScrollbar({
                track: '#f1f1f1',
                thumb: '#c1c1c1',
                active: '#a6a6a6',
              }),
      },
    },
  },
});
