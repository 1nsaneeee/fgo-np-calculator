// src/App.jsx
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/ToastContainer';
import { useThemeStore } from '@/store/themeStore';
import { createAppTheme } from '@/theme';

const ServantListPage = lazy(() => import('@/pages/ServantListPage'));
const CalculatorPage = lazy(() => import('@/pages/CalculatorPage'));
const TeamPlannerPage = lazy(() => import('@/pages/TeamPlannerPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress size={32} />
    </Box>
  );
}

export default function App() {
  const mode = useThemeStore((s) => s.mode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <div className="app">
          <ErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route element={<Layout />}>
                  {/* 默认 → 从者列表 */}
                  <Route path="/" element={<Navigate to="/servants" replace />} />

                  {/* 三大工作区 */}
                  <Route path="/servants" element={<ServantListPage />} />
                  <Route path="/calc" element={<CalculatorPage />} />
                  <Route path="/team" element={<TeamPlannerPage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  {/* 旧路径重定向（IA 重构后合并到 /team sub-tab） */}
                  <Route path="/calculator" element={<Navigate to="/calc" replace />} />
                  <Route path="/cards" element={<Navigate to="/team?tab=draw" replace />} />
                  <Route path="/turnsim" element={<Navigate to="/team?tab=sim" replace />} />

                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
            <ToastContainer />
          </ErrorBoundary>
        </div>
      </HashRouter>
    </ThemeProvider>
  );
}
