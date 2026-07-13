// src/components/Layout.jsx
// 顶栏 segmented nav — 替代旧 sidebar 5 项
// IA: 从者 / 单从者 / 队伍 三大工作区 + 设置收纳
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useStore from '@/store/index';
import { useThemeStore } from '@/store/themeStore';
import { useUrlSync } from '@/hooks/useUrlSync';
import { useToast } from '@/store/toastStore';

const NAV_ITEMS = [
  {
    label: '从者',
    path: '/servants',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: '单从者',
    path: '/calc',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L4.5 14H11l-1 8 8.5-12H12l1-8z" />
      </svg>
    ),
  },
  {
    label: '队伍',
    path: '/team',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedId = useStore((s) => s.selectedId);
  const servantData = useStore((s) => s.servantData);
  const isCustom = useStore((s) => s.isCustom);

  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const toast = useToast();

  useUrlSync();

  const isActive = (path) => location.pathname.startsWith(path);

  const currentServantName = isCustom
    ? '自定义从者'
    : (servantData?.name || '');

  return (
    <div className="app">
      {/* 顶栏 — 紧凑工具栏风格 */}
      <header className="app-header">
        {/* 左：产品名 + segmented nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span
            className="app-title"
            onClick={() => navigate('/servants')}
            style={{ cursor: 'pointer' }}
          >
            FGO·NP
          </span>

          <nav className="top-nav" aria-label="主导航">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                className={`top-nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <span className="top-nav-icon">{item.icon}</span>
                <span className="top-nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 右：当前从者 chip + 主题切换 */}
        <div className="app-header-right">
          {/* 当前从者 chip — 点击跳从者列表切换 */}
          {(selectedId || isCustom) && (
            <button
              className="servant-info"
              onClick={() => navigate('/servants')}
              style={{
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
              }}
              aria-label="切换从者"
            >
              <span className="servant-info-name">
                {currentServantName || '未选择'}
              </span>
              {servantData && !isCustom && (
                <span className="servant-info-meta">
                  {servantData.class}★{servantData._rarity}
                </span>
              )}
            </button>
          )}

          {/* 主题切换 */}
          <button
            className="btn btn-small"
            onClick={() => {
              toggleTheme();
              toast.show(`已切换为${mode === 'dark' ? '浅色' : '深色'}模式`);
            }}
            aria-label={mode === 'light' ? '切换到深色模式' : '切换到浅色模式'}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {mode === 'light' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>

          {/* 设置 */}
          <button
            className="btn btn-small"
            onClick={() => navigate('/settings')}
            title="设置"
            aria-label="设置"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>

      {/* 主体 */}
      <div className="layout-shell">
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
