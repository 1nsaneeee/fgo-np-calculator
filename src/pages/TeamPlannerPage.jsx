// src/pages/TeamPlannerPage.jsx
import { Box } from '@mui/material';
import TeamServantSelector from '@/components/TeamServantSelector';
import TeamBuffPanel from '@/components/TeamBuffPanel';
import TeamResultPanel from '@/components/TeamResultPanel';
import TeamCardQueryPanel from '@/components/TeamCardQueryPanel';
import TurnSimulator from '@/components/TurnSimulator';

export default function TeamPlannerPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 3 servant slots */}
      <div className="section-card">
        <h2 className="panel-title">组队配置 Team Setup</h2>
        <div className="team-slots-grid">
          {[0, 1, 2].map((i) => (
            <TeamServantSelector key={i} slotIndex={i} />
          ))}
        </div>
      </div>

      {/* Per-servant buff panel */}
      <TeamBuffPanel />

      {/* Card query + damage */}
      <TeamCardQueryPanel />

      {/* Damage distribution & clear rate */}
      <TeamResultPanel />

      {/* 3-turn simulation */}
      <TurnSimulator />
    </Box>
  );
}
