// src/pages/CardDrawPage.jsx
import { Box } from '@mui/material';
import CardDrawPanel from '@/components/CardDrawPanel';

export default function CardDrawPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <h1 className="visually-hidden">出卡概率</h1>
      <div className="section-card">
        <CardDrawPanel />
      </div>
    </Box>
  );
}
