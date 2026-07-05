import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
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
      main: '#3d5a80',
      light: 'rgba(61, 90, 128, 0.08)',
      dark: '#2f4866',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
    },
    success: {
      main: '#16a34a',
    },
    warning: {
      main: '#d97706',
    },
    divider: 'rgba(0,0,0,0.08)',
    action: {
      hover: 'rgba(0,0,0,0.04)',
      selected: 'rgba(61, 90, 128, 0.1)',
    },
  },
  typography: {
    fontFamily:
      "-apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif",
    fontSize: 14,
    fontWeightRegular: 400,
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0,0,0,0.15) transparent',
          backgroundColor: '#faf9f6',
          color: '#1a1a2e',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
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
          backgroundColor: '#3d5a80',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#2f4866',
          },
        },
        outlined: {
          borderColor: 'rgba(0,0,0,0.12)',
          color: '#5a5d6e',
          '&:hover': {
            borderColor: 'rgba(0,0,0,0.2)',
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(0,0,0,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
            '&.Mui-focused fieldset': { borderColor: '#3d5a80' },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.12)' },
        },
      },
    },
    MuiSlider: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          color: '#3d5a80',
        },
      },
    },
    MuiTable: {
      defaultProps: { size: 'small' },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#3d5a80' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.85rem',
          '&.Mui-selected': { color: '#3d5a80' },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(0,0,0,0.25)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: 'rgba(0,0,0,0.12)',
          color: '#5a5d6e',
        },
        filled: {
          backgroundColor: 'rgba(61, 90, 128, 0.12)',
          color: '#2f4866',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            color: '#5a5d6e',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#8b8d9e',
          '&.Mui-focused': { color: '#3d5a80' },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0,0,0,0.12)',
          color: '#5a5d6e',
          '&.Mui-selected': {
            backgroundColor: 'rgba(61, 90, 128, 0.08)',
            color: '#2f4866',
          },
        },
      },
    },
  },
});

export default theme;
