// src/App.jsx
import { lazy, Suspense, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useThemeStore } from '@/store/themeStore';
import { createAppTheme } from '@/theme';

const ServantListPage = lazy(() => import('@/pages/ServantListPage'));
const CalculatorPage = lazy(() => import('@/pages/CalculatorPage'));
const CardDrawPage = lazy(() => import('@/pages/CardDrawPage'));
const TeamPlannerPage = lazy(() => import('@/pages/TeamPlannerPage'));
const TurnSimPage = lazy(() => import('@/pages/TurnSimPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function RouteFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress size={32} sx={{ color: 'var(--accent)' }} />
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
                  <Route path="/" element={<Navigate to="/servants" replace />} />
                  <Route path="/servants" element={<ServantListPage />} />
                  <Route path="/calculator" element={<CalculatorPage />} />
                  <Route path="/cards" element={<CardDrawPage />} />
                  <Route path="/team" element={<TeamPlannerPage />} />
                  <Route path="/turnsim" element={<TurnSimPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </HashRouter>
    </ThemeProvider>
  );
}
