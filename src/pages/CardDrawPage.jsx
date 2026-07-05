// src/pages/CardDrawPage.jsx
import { Box } from '@mui/material';
import CardDrawPanel from '@/components/CardDrawPanel';
import DamageDistPanel from '@/components/DamageDistPanel';

export default function CardDrawPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div className="section-card">
        <CardDrawPanel />
      </div>

      <DamageDistPanel />
    </Box>
  );
}
