// src/pages/TurnSimPage.jsx
import { Box, Typography } from '@mui/material';
import useStore from '@/store/index';
import TurnSimulator from '@/components/TurnSimulator';

export default function TurnSimPage() {
  const team = useStore(s => s.team);
  const hasTeam = team.servants.some(s => s.servantId || s.isCustom);

  if (!hasTeam) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant="body1" sx={{ color: 'var(--text-muted)', mb: 2 }}>
          请先在"组队规划"页面配置三从者，再使用回合模拟
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TurnSimulator />
    </Box>
  );
}
