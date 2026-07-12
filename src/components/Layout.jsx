// src/components/Layout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Avatar, Button, IconButton } from '@mui/material';
import useStore from '@/store/index';
import { useThemeStore } from '@/store/themeStore';
import { useUrlSync } from '@/hooks/useUrlSync';

const NAV_ITEMS = [
  { label: '从者列表', path: '/servants', icon: '☰' },
  { label: '伤害计算', path: '/calculator', icon: '✧' },
  { label: '出卡概率', path: '/cards', icon: '◇' },
  { label: '组队规划', path: '/team', icon: '◆' },
  { label: '回合模拟', path: '/turnsim', icon: '⟳', wip: true },
];

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedId = useStore((s) => s.selectedId);
  const servantData = useStore((s) => s.servantData);
  const isCustom = useStore((s) => s.isCustom);

  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  useUrlSync();

  const isActive = (path) => {
    if (path === '/servants') return location.pathname.startsWith('/servants');
    if (path === '/calculator') return location.pathname.startsWith('/calculator');
    if (path === '/cards') return location.pathname.startsWith('/cards');
    if (path === '/team') return location.pathname.startsWith('/team');
    if (path === '/turnsim') return location.pathname.startsWith('/turnsim');
    return false;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      {/* Top bar */}
      <header className="app-header">
        <Box
          component="span"
          onClick={() => navigate('/servants')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/servants')}
          role="button"
          tabIndex={0}
          aria-label="返回从者列表"
          sx={{ cursor: 'pointer', fontWeight: 900, letterSpacing: '-0.02em' }}
        >
          <span className="app-title">FGO Calc</span>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
          <IconButton
            size="small"
            onClick={toggleTheme}
            aria-label={mode === 'light' ? '切换到深色模式' : '切换到浅色模式'}
            title={mode === 'light' ? '深色模式' : '浅色模式'}
            sx={{ color: 'var(--text-secondary)' }}
          >
            {mode === 'light' ? <MoonIcon /> : <SunIcon />}
          </IconButton>

          {/* Servant info */}
          {(selectedId || isCustom) && (
            <>
              {servantData && (
                <Avatar src={servantData._face} alt={servantData?.name || '从者头像'} sx={{ width: 28, height: 28 }} />
              )}
              <Box component="span" sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
                {isCustom ? '自定义从者' : (servantData?.name || '')}
              </Box>
              {servantData && (
                <Box component="span" sx={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {servantData.class} ★{servantData._rarity}
                </Box>
              )}
              <Button
                size="small"
                onClick={() => navigate('/servants')}
                sx={{ fontSize: '0.75rem', py: 0.3, px: 1.5, minWidth: 0 }}
              >
                切换
              </Button>
            </>
          )}
        </Box>
      </header>

      {/* Body: sidebar + main */}
      <div className="layout-shell">
        <nav className="layout-sidebar">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              className={'nav-item' + (isActive(item.path) ? ' active' : '')}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}{item.wip ? ' (WIP)' : ''}</span>
            </button>
          ))}
        </nav>

        <main className="layout-main">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="mobile-tabbar" aria-label="移动端主导航">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            className={'mobile-tab' + (isActive(item.path) ? ' active' : '')}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <span className="mobile-tab-icon" aria-hidden="true">{item.icon}</span>
            <span className="mobile-tab-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <footer className="app-footer">
        FGO Damage Calculator v4.0.0 · Data from Atlas Academy API
      </footer>
    </Box>
  );
}
