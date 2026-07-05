// src/App.jsx
import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const ServantListPage = lazy(() => import('@/pages/ServantListPage'));
const CalculatorPage = lazy(() => import('@/pages/CalculatorPage'));
const CardDrawPage = lazy(() => import('@/pages/CardDrawPage'));
const TeamPlannerPage = lazy(() => import('@/pages/TeamPlannerPage'));
const TurnSimPage = lazy(() => import('@/pages/TurnSimPage'));

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <Suspense fallback={<div className="route-loading">加载中...</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/servants" replace />} />
              <Route path="/servants" element={<ServantListPage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/cards" element={<CardDrawPage />} />
              <Route path="/team" element={<TeamPlannerPage />} />
              <Route path="/turnsim" element={<TurnSimPage />} />
            </Route>
          </Routes>
        </Suspense>
      </div>
    </HashRouter>
  );
}
