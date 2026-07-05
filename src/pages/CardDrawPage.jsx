// src/pages/CardDrawPage.jsx
import { Box } from '@mui/material';
import CardDrawPanel from '@/components/CardDrawPanel';
import DamageDistPanel from '@/components/DamageDistPanel';

export default function CardDrawPage() {
  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div>
        <h2 className="panel-title">出卡概率计算器 Card Draw Probability</h2>
        <CardDrawPanel />
      </div>
      <DamageDistPanel />
    </Box>
  );
}
