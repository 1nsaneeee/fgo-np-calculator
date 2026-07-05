// src/components/Layout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Avatar, Button } from '@mui/material';
import useStore from '@/store/index';

const NAV_ITEMS = [
  { label: '从者列表', path: '/servants', icon: '☰' },
  { label: '伤害计算', path: '/calculator', icon: '✧' },
  { label: '出卡概率', path: '/cards', icon: '◇' },
  { label: '组队规划', path: '/team', icon: '◆' },
  { label: '回合模拟', path: '/turnsim', icon: '⟳' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedId = useStore((s) => s.selectedId);
  const servantData = useStore((s) => s.servantData);
  const isCustom = useStore((s) => s.isCustom);

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
          sx={{ cursor: 'pointer', fontWeight: 900, letterSpacing: '-0.02em' }}
        >
          <span className="app-title">
            <span>FGO</span> Calc
          </span>
        </Box>

        {/* Servant info */}
        {(selectedId || isCustom) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
            {servantData && (
              <Avatar src={servantData._face} sx={{ width: 28, height: 28 }} />
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
          </Box>
        )}
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
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <main className="layout-main">
          <Outlet />
        </main>
      </div>

      <footer className="app-footer">
        FGO Damage Calculator v4.0 · Data from Atlas Academy API
      </footer>
    </Box>
  );
}
