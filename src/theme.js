import { createTheme } from '@mui/material/styles';

const FGO_GOLD = '#b89c1f';
const FGO_GOLD_DARK = '#9a8219';

const sharedTypography = {
  fontFamily: "'Inter', -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif",
  fontSize: 14,
  fontWeightRegular: 400,
  fontWeightMedium: 600,
  fontWeightBold: 700,
};

const sharedShape = { borderRadius: 6 };

function buildPalette(mode) {
  if (mode === 'dark') {
    return {
      mode: 'dark',
      background: {
        default: '#15111c',
        paper: '#221b2e',
      },
      text: {
        primary: '#e8e2f0',
        secondary: '#a89fb5',
        disabled: '#6a6378',
      },
      primary: {
        main: FGO_GOLD,
        light: 'rgba(184, 156, 31, 0.15)',
        dark: FGO_GOLD_DARK,
        contrastText: '#15111c',
      },
      error: { main: '#f56565' },
      success: { main: '#48bb78' },
      warning: { main: '#ed8936' },
      divider: 'rgba(255,255,255,0.08)',
      action: {
        hover: 'rgba(255,255,255,0.06)',
        selected: 'rgba(184, 156, 31, 0.15)',
      },
    };
  }
  return {
    mode: 'light',
    background: {
      default: '#faf9f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#5a5d6e',
    },
    primary: {
      main: FGO_GOLD,
      light: 'rgba(184, 156, 31, 0.10)',
      dark: FGO_GOLD_DARK,
      contrastText: '#ffffff',
    },
    error: { main: '#dc2626' },
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
    divider: 'rgba(0,0,0,0.08)',
    action: {
      hover: 'rgba(0,0,0,0.04)',
      selected: 'rgba(184, 156, 31, 0.12)',
    },
  };
}

function buildComponents(mode) {
  const isDark = mode === 'dark';
  const bg = isDark ? '#221b2e' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
  const borderStrong = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)';
  const textSecondary = isDark ? '#a89fb5' : '#5a5d6e';
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: isDark ? 'rgba(255,255,255,0.2) transparent' : 'rgba(0,0,0,0.15) transparent',
          backgroundColor: bg,
          color: isDark ? '#e8e2f0' : '#1a1a2e',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: bg,
          borderBottom: `1px solid ${border}`,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 6,
        },
        containedPrimary: {
          backgroundColor: FGO_GOLD,
          color: '#ffffff',
          '&:hover': { backgroundColor: FGO_GOLD_DARK },
        },
        outlined: {
          borderColor: border,
          color: textSecondary,
          '&:hover': {
            borderColor: borderStrong,
            backgroundColor: hoverBg,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: border },
            '&:hover fieldset': { borderColor: borderStrong },
            '&.Mui-focused fieldset': { borderColor: FGO_GOLD },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: border },
        },
      },
    },
    MuiSlider: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          color: FGO_GOLD,
        },
      },
    },
    MuiTable: {
      defaultProps: { size: 'small' },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: FGO_GOLD },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.85rem',
          '&.Mui-selected': { color: FGO_GOLD },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: border,
          color: textSecondary,
        },
        filled: {
          backgroundColor: 'rgba(184, 156, 31, 0.15)',
          color: FGO_GOLD,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: bg,
          border: `1px solid ${border}`,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            color: textSecondary,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: isDark ? '#787488' : '#8b8d9e',
          '&.Mui-focused': { color: FGO_GOLD },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: border,
          color: textSecondary,
          '&.Mui-selected': {
            backgroundColor: 'rgba(184, 156, 31, 0.15)',
            color: FGO_GOLD,
          },
        },
      },
    },
  };
}

export function createAppTheme(mode = 'light') {
  return createTheme({
    palette: buildPalette(mode),
    typography: sharedTypography,
    shape: sharedShape,
    components: buildComponents(mode),
  });
}

export default createAppTheme('light');
