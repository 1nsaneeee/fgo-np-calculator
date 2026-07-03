// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ServantListPage from '@/pages/ServantListPage';
import CalculatorPage from '@/pages/CalculatorPage';
import CardDrawPage from '@/pages/CardDrawPage';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">FGO NP Damage Calculator // 宝具伤害计算器</h1>
        </header>

        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/servants" replace />} />
            <Route path="/servants" element={<ServantListPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/cards" element={<CardDrawPage />} />
          </Route>
        </Routes>

        <footer className="app-footer">
          FGO Damage Calculator v4.0 · Data from Atlas Academy API · React 18 + Vite + MUI + Zustand
        </footer>
      </div>
    </BrowserRouter>
  );
}
