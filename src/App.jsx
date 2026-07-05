// src/App.jsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ServantListPage from '@/pages/ServantListPage';
import CalculatorPage from '@/pages/CalculatorPage';
import CardDrawPage from '@/pages/CardDrawPage';

export default function App() {
  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/servants" replace />} />
            <Route path="/servants" element={<ServantListPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/cards" element={<CardDrawPage />} />
          </Route>
        </Routes>
      </div>
    </HashRouter>
  );
}
