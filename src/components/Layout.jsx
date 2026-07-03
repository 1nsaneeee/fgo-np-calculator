// src/components/Layout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Tabs, Tab, Box, Avatar, Button } from '@mui/material';
import useStore from '@/store/index';

const TABS = [
  { label: '从者列表', path: '/servants' },
  { label: '计算器', path: '/calculator' },
  { label: '出卡概率', path: '/cards' },
];

function tabValue(pathname) {
  if (pathname.startsWith('/calculator')) return '/calculator';
  if (pathname.startsWith('/cards')) return '/cards';
  return '/servants';
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedId = useStore((s) => s.selectedId);
  const servantData = useStore((s) => s.servantData);
  const isCustom = useStore((s) => s.isCustom);

  const currentTab = tabValue(location.pathname);

  return (
    <Box>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 2 }}>
          <Box
            component="span"
            sx={{ fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => navigate('/servants')}
          >
            FGO Calc
          </Box>
          <Tabs
            value={currentTab}
            onChange={(_, v) => navigate(v)}
            textColor="inherit"
            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontSize: '0.85rem', textTransform: 'none' } }}
          >
            {TABS.map(t => <Tab key={t.path} label={t.label} value={t.path} />)}
          </Tabs>
        </Toolbar>
      </AppBar>

      {(selectedId || isCustom) && (
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            px: 2, py: 1, bgcolor: 'action.hover', borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {servantData && (
            <Avatar src={servantData._face} sx={{ width: 32, height: 32 }} />
          )}
          <Box sx={{ flex: 1 }}>
            <Box component="span" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {isCustom ? '自定义从者' : (servantData?.name || '加载中...')}
            </Box>
            {servantData && (
              <Box component="span" sx={{ ml: 1, fontSize: '0.8rem', color: 'text.secondary' }}>
                {servantData.class} ★{servantData._rarity}
              </Box>
            )}
          </Box>
          <Button size="small" onClick={() => navigate('/servants')}>切换从者</Button>
        </Box>
      )}

      <Box component="main" className="main-col">
        <Outlet />
      </Box>
    </Box>
  );
}
