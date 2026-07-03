// src/pages/CalculatorPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Tabs, Tab, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import useStore from '@/store/index';
import { useServant } from '@/hooks/useServant';
import { useNpResult } from '@/hooks/useNpResult';
import ServantStats from '@/components/ServantStats';
import LevelConfig from '@/components/LevelConfig';
import EnemyPanel from '@/components/EnemyPanel';
import OptionsPanel from '@/components/OptionsPanel';
import BuffTable from '@/components/BuffTable';
import NPDamageResult from '@/components/NPDamageResult';
import CardChainPanel from '@/components/CardChainPanel';
import CardDrawPanel from '@/components/CardDrawPanel';
import ThreeTResult from '@/components/ThreeTResult';
import PresetButtons from '@/components/PresetButtons';
import CustomServantForm from '@/components/CustomServantForm';

export default function CalculatorPage() {
  const navigate = useNavigate();
  const selectedId = useStore((s) => s.selectedId);
  const isCustom = useStore((s) => s.isCustom);
  const setCustomMode = useStore((s) => s.setCustomMode);
  const resetServant = useStore((s) => s.resetServant);
  const resetConfig = useStore((s) => s.resetConfig);
  const resetBuffs = useStore((s) => s.resetBuffs);
  const resetEnemy = useStore((s) => s.resetEnemy);
  const resetOptions = useStore((s) => s.resetOptions);

  const servant = useServant();
  const npResult = useNpResult();

  const [tab, setTab] = useState(0);
  const [customOpen, setCustomOpen] = useState(false);

  const handleReset = () => {
    resetServant();
    resetConfig();
    resetBuffs();
    resetEnemy();
    resetOptions();
  };

  if (!selectedId && !isCustom) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <p>请先从从者列表中选择一位从者</p>
        <Button variant="contained" onClick={() => navigate('/servants')}>
          前往从者列表
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0, px: 2, pt: 2 }}>
        <Button
          variant={!isCustom ? 'contained' : 'outlined'}
          onClick={() => setCustomMode(false)}
          sx={{ flex: 1, borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)' }}
        >
          数据库 Database
        </Button>
        <Button
          variant={isCustom ? 'contained' : 'outlined'}
          onClick={() => { setCustomMode(true); setCustomOpen(true); }}
          sx={{ flex: 1, borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
        >
          自定义 Custom
        </Button>
      </Box>

      <Dialog open={customOpen && isCustom} onClose={() => setCustomOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>自定义从者</DialogTitle>
        <DialogContent>
          <CustomServantForm />
        </DialogContent>
      </Dialog>

      {servant && !isCustom && (
        <Box sx={{ px: 2, pt: 1 }}>
          <ServantStats servant={servant} />
        </Box>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)}
        sx={{ px: 2, borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab label="伤害计算" />
        <Tab label="三回合模拟" />
        <Tab label="指令卡链" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ px: 2 }}>
          <div className="config-row">
            <div className="section">
              <h2 className="panel-title">Level Config</h2>
              <LevelConfig />
            </div>
            <div className="section">
              <h2 className="panel-title">Enemy & Options</h2>
              <EnemyPanel />
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <OptionsPanel />
              </div>
            </div>
          </div>
          <PresetButtons />
          <div className="section">
            <BuffTable />
          </div>
          <NPDamageResult result={npResult} servant={servant} />
          <CardDrawPanel />
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ px: 2 }}>
          <div className="config-row">
            <div className="section">
              <h2 className="panel-title">Level Config</h2>
              <LevelConfig />
            </div>
            <div className="section">
              <h2 className="panel-title">Enemy & Options</h2>
              <EnemyPanel />
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <OptionsPanel />
              </div>
            </div>
          </div>
          <PresetButtons />
          <div className="section">
            <BuffTable />
          </div>
          <ThreeTResult />
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ px: 2 }}>
          <CardChainPanel />
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
        <Button variant="outlined" color="error" onClick={handleReset}
          sx={{ fontSize: 'var(--font-sm)' }}>
          {'⟲'} Reset All
        </Button>
      </Box>
    </Box>
  );
}
