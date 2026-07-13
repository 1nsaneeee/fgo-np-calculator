import { createTheme } from '@mui/material/styles';

// ============================================================
// FGO NP Calc — Design System v2
// 暖灰黑 surface + FGO 三色卡 brand + 微圆角 + 砍阴影
// 字体：Inter (UI) + JetBrains Mono (数字/ID)
// ============================================================

// ---- 暗色 token（默认） ----
const COLORS_DARK = {
  // Surface — 暖灰黑，替代纯黑 #0d0d0d
  surface0: '#0e0f12',
  surface1: '#14161a',
  surface2: '#1a1d22',
  surface3: '#22262c',

  // Text
  textStrong: '#f0f1f3',
  textDefault: '#c9ccd2',
  textMuted: '#8a8f99',
  textFaint: '#5a5f68',

  // Border
  borderSubtle: '#1f2227',
  borderDefault: '#2a2e35',
  borderStrong: '#3a3f48',

  // Brand — FGO 卡色，不是装饰
  buster: '#e25456', // 红 = 主操作 CTA / 伤害
  arts: '#4d8df0',   // 蓝 = 信息 / 链接 / 焦点
  quick: '#58c47a',  // 绿 = 成功 / 增益
  neutral: '#8a8f99',

  // Status（复用品牌色）
  positive: '#58c47a',
  warning: '#e0a64a',
  danger: '#e25456',
  info: '#4d8df0',

  // FGO 色卡（用于卡牌视觉，与 brand 同色但语义独立）
  cardBuster: '#e25456',
  cardArts: '#4d8df0',
  cardQuick: '#58c47a',
  cardExtra: '#e0a64a',
};

// ---- 亮色 token（暖白） ----
const COLORS_LIGHT = {
  surface0: '#fafaf9',
  surface1: '#ffffff',
  surface2: '#f4f4f3',
  surface3: '#e8e8e6',

  textStrong: '#1a1c20',
  textDefault: '#3d4048',
  textMuted: '#6b7079',
  textFaint: '#9aa0a8',

  borderSubtle: '#e8e8e6',
  borderDefault: '#d4d4d2',
  borderStrong: '#b0b0ac',

  buster: '#c8424a',
  arts: '#3a78d8',
  quick: '#3aa866',
  neutral: '#6b7079',

  positive: '#3aa866',
  warning: '#c4882a',
  danger: '#c8424a',
  info: '#3a78d8',

  cardBuster: '#c8424a',
  cardArts: '#3a78d8',
  cardQuick: '#3aa866',
  cardExtra: '#c4882a',
};

// ---- 字体（UI 用 Inter，数字用 Mono） ----
const typography = {
  fontFamily: "'Inter', -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', system-ui, sans-serif",
  fontFamilyMono: "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace",
  fontSize: 13,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  h1: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h2: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.005em',
  },
  h3: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.0625rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.8125rem',
    lineHeight: 1.5,
  },
  body2: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.75rem',
    lineHeight: 1.5,
  },
  caption: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.6875rem',
    lineHeight: 1.4,
  },
  overline: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.625rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    lineHeight: 1.4,
  },
};

// ---- 形状：微圆角，替代零圆角 ----
const shape = {
  borderRadius: 6,
};

// ---- 间距 ----
const spacing = 4;

function buildPalette(mode) {
  const c = mode === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  return {
    mode,
    background: {
      default: c.surface0,
      paper: c.surface1,
    },
    text: {
      primary: c.textDefault,
      secondary: c.textMuted,
      disabled: c.textFaint,
    },
    primary: {
      main: c.buster,        // 主操作色 = Buster 红
      light: c.arts,
      dark: c.buster,
      contrastText: c.surface0,
    },
    secondary: {
      main: c.arts,
      contrastText: c.surface0,
    },
    error: { main: c.danger },
    success: { main: c.positive },
    warning: { main: c.warning },
    info: { main: c.info },
    divider: c.borderSubtle,
    action: {
      hover: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      selected: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      disabled: c.textFaint,
    },
  };
}

function buildComponents(mode) {
  const c = mode === 'dark' ? COLORS_DARK : COLORS_LIGHT;

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${c.borderDefault} transparent`,
          backgroundColor: c.surface0,
          color: c.textDefault,
          fontFamily: typography.fontFamily,
          fontSize: typography.fontSize,
          lineHeight: 1.5,
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
        '*': {
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: c.borderDefault,
            borderRadius: '3px',
            '&:hover': {
              background: c.borderStrong,
            },
          },
        },
        // 数字输入用 mono，UI 输入用 sans
        'input[type="number"], input[data-num="true"]': {
          fontFamily: typography.fontFamilyMono,
          fontVariantNumeric: 'tabular-nums',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: c.surface1,
          borderBottom: `1px solid ${c.borderSubtle}`,
          color: c.textDefault,
          height: '48px',
          minHeight: '48px',
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 4,
          border: `1px solid ${c.borderDefault}`,
          color: c.textDefault,
          backgroundColor: 'transparent',
          padding: '6px 12px',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          boxShadow: 'none',
          transition: 'background-color 80ms ease-out, border-color 80ms ease-out, color 80ms ease-out',
          '&:hover': {
            backgroundColor: c.surface3,
            borderColor: c.borderStrong,
            boxShadow: 'none',
          },
          '&:active': {
            backgroundColor: c.surface2,
            boxShadow: 'none',
          },
          '&.Mui-disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        },
        containedPrimary: {
          backgroundColor: c.buster,
          color: c.surface0,
          border: `1px solid ${c.buster}`,
          '&:hover': {
            backgroundColor: '#d44548',
            borderColor: '#d44548',
            boxShadow: 'none',
          },
        },
        containedSecondary: {
          backgroundColor: c.arts,
          color: c.surface0,
          border: `1px solid ${c.arts}`,
          '&:hover': {
            backgroundColor: '#3a78d8',
            borderColor: '#3a78d8',
            boxShadow: 'none',
          },
        },
        outlinedError: {
          borderColor: c.danger,
          color: c.danger,
          '&:hover': {
            backgroundColor: 'rgba(226, 84, 86, 0.1)',
            borderColor: c.danger,
          },
        },
        sizeSmall: {
          padding: '4px 8px',
          fontSize: '0.6875rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        fullWidth: true,
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            backgroundColor: c.surface2,
            '& fieldset': {
              borderColor: c.borderDefault,
            },
            '&:hover fieldset': {
              borderColor: c.borderStrong,
            },
            '&.Mui-focused fieldset': {
              borderColor: c.arts,
              borderWidth: '1px',
            },
          },
          '& .MuiInputBase-input': {
            fontFamily: typography.fontFamily,
            fontSize: '0.8125rem',
            padding: '6px 8px',
            height: '20px',
          },
          '& input[type="number"]': {
            fontFamily: typography.fontFamilyMono,
            fontVariantNumeric: 'tabular-nums',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.75rem',
            color: c.textMuted,
            '&.Mui-focused': {
              color: c.arts,
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: c.surface2,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: c.borderDefault,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: c.borderStrong,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: c.arts,
          },
        },
        select: {
          fontFamily: typography.fontFamily,
          fontSize: '0.8125rem',
          padding: '6px 8px',
        },
      },
    },
    MuiSlider: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          color: c.buster,
          height: '4px',
          padding: '8px 0',
        },
        thumb: {
          borderRadius: '50%',
          width: '14px',
          height: '14px',
          backgroundColor: c.surface1,
          border: `2px solid ${c.buster}`,
          boxShadow: 'none',
          '&:hover, &.Mui-focusVisible': {
            boxShadow: 'none',
            backgroundColor: c.surface1,
          },
          '&.Mui-active': {
            boxShadow: 'none',
          },
        },
        track: {
          backgroundColor: c.buster,
          height: '4px',
          borderRadius: '2px',
        },
        rail: {
          backgroundColor: c.borderDefault,
          height: '4px',
          borderRadius: '2px',
        },
        valueLabel: {
          backgroundColor: c.surface3,
          border: `1px solid ${c.borderDefault}`,
          borderRadius: 4,
          color: c.textStrong,
          fontFamily: typography.fontFamilyMono,
          fontSize: '0.6875rem',
          padding: '2px 6px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '36px',
          borderBottom: `1px solid ${c.borderSubtle}`,
        },
        indicator: {
          backgroundColor: c.buster,
          height: '2px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.8125rem',
          minHeight: '36px',
          padding: '8px 12px',
          color: c.textMuted,
          transition: 'color 80ms ease-out',
          '&:hover': {
            color: c.textDefault,
          },
          '&.Mui-selected': {
            color: c.textStrong,
          },
        },
      },
    },
    MuiTable: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          fontFamily: typography.fontFamily,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontFamily,
          fontSize: '0.75rem',
          padding: '6px 10px',
          borderBottom: `1px solid ${c.borderSubtle}`,
          color: c.textDefault,
        },
        head: {
          fontWeight: 600,
          color: c.textMuted,
          borderBottom: `1px solid ${c.borderDefault}`,
          fontSize: '0.6875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 80ms ease-out',
          '&:nth-of-type(even)': {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
          },
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: c.textFaint,
          borderRadius: 3,
          padding: '4px',
          transition: 'color 80ms ease-out',
          '&.Mui-checked': {
            color: c.buster,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontFamily: typography.fontFamily,
          fontSize: '0.6875rem',
          height: '22px',
          fontWeight: 500,
        },
        outlined: {
          borderColor: c.borderDefault,
          color: c.textMuted,
        },
        filled: {
          backgroundColor: c.surface3,
          color: c.textDefault,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: c.surface1,
          border: `1px solid ${c.borderDefault}`,
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontFamily,
          fontSize: '0.9375rem',
          fontWeight: 600,
          padding: '14px 16px',
          borderBottom: `1px solid ${c.borderSubtle}`,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '10px 16px',
          borderTop: `1px solid ${c.borderSubtle}`,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          border: `1px solid ${c.borderDefault}`,
          color: c.textMuted,
          padding: '4px 10px',
          fontSize: '0.75rem',
          fontFamily: typography.fontFamily,
          backgroundColor: 'transparent',
          transition: 'all 80ms ease-out',
          '&.Mui-selected': {
            backgroundColor: c.surface3,
            color: c.textStrong,
            borderColor: c.borderStrong,
          },
          '&:hover': {
            backgroundColor: c.surface3,
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          '& .MuiToggleButton-root': {
            borderRight: 'none',
            '&:last-child': {
              borderRight: `1px solid ${c.borderDefault}`,
            },
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            borderRadius: 4,
            color: c.textMuted,
            fontFamily: typography.fontFamily,
            fontSize: '0.75rem',
            '&.Mui-selected': {
              backgroundColor: c.surface3,
              color: c.textStrong,
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: c.textMuted,
          fontSize: '0.75rem',
          '&.Mui-focused': {
            color: c.arts,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          border: `1px solid ${c.borderSubtle}`,
          backgroundColor: c.surface1,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '14px',
          '&:last-child': {
            paddingBottom: '14px',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: c.surface3,
          border: `1px solid ${c.borderDefault}`,
          borderRadius: 4,
          color: c.textStrong,
          fontFamily: typography.fontFamily,
          fontSize: '0.6875rem',
          padding: '4px 8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        },
        arrow: {
          color: c.surface3,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: c.surface1,
          border: `1px solid ${c.borderDefault}`,
          borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontFamily,
          fontSize: '0.8125rem',
          padding: '8px 12px',
          minHeight: '32px',
          transition: 'background-color 80ms ease-out',
          '&:hover': {
            backgroundColor: c.surface3,
          },
          '&.Mui-selected': {
            backgroundColor: c.surface3,
            '&:hover': {
              backgroundColor: c.surface3,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontFamily: typography.fontFamily,
          fontSize: '0.8125rem',
        },
        standardWarning: {
          backgroundColor: 'rgba(224, 166, 74, 0.1)',
          color: c.warning,
          border: `1px solid rgba(224, 166, 74, 0.3)`,
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: c.buster,
        },
      },
    },
  };
}

export function createAppTheme(mode = 'dark') {
  return createTheme({
    palette: buildPalette(mode),
    typography,
    shape,
    components: buildComponents(mode),
    spacing,
  });
}

export default createAppTheme('dark');
