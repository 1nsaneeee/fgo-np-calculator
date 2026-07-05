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
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
          请先从从者列表中选择一位从者
        </p>
        <Button variant="contained" onClick={() => navigate('/servants')}>
          前往从者列表
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* DB / Custom toggle */}
      <Box sx={{ display: 'flex', gap: 0, mb: 2 }}>
        <Button
          variant={!isCustom ? 'contained' : 'outlined'}
          onClick={() => setCustomMode(false)}
          sx={{ flex: 1, borderRadius: '8px 0 0 8px' }}
        >
          数据库 Database
        </Button>
        <Button
          variant={isCustom ? 'contained' : 'outlined'}
          onClick={() => { setCustomMode(true); setCustomOpen(true); }}
          sx={{ flex: 1, borderRadius: '0 8px 8px 0' }}
        >
          自定义 Custom
        </Button>
      </Box>

      <Dialog open={customOpen && isCustom} onClose={() => setCustomOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>自定义从者</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <CustomServantForm />
        </DialogContent>
      </Dialog>

      {/* Servant stats */}
      {servant && !isCustom && (
        <Box sx={{ mb: 2 }}>
          <ServantStats servant={servant} />
        </Box>
      )}

      {/* Tab bar */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="伤害计算" />
        <Tab label="三回合模拟" />
        <Tab label="指令卡链" />
      </Tabs>

      {/* Tab 0: Damage calc */}
      {tab === 0 && (
        <Box>
          <div className="config-row">
            <div className="section-card">
              <h3 className="panel-title">等级配置</h3>
              <LevelConfig />
            </div>
            <div className="section-card">
              <h3 className="panel-title">敌方 & 选项</h3>
              <EnemyPanel />
              <div style={{ marginTop: 'var(--space-md)' }}>
                <OptionsPanel />
              </div>
            </div>
          </div>

          <Box sx={{ mt: 2 }}>
            <PresetButtons />
          </Box>

          <div className="section-card" style={{ marginTop: 'var(--space-md)' }}>
            <BuffTable />
          </div>

          <div style={{ marginTop: 'var(--space-md)' }}>
            <NPDamageResult result={npResult} servant={servant} />
          </div>
        </Box>
      )}

      {/* Tab 1: 3T loop */}
      {tab === 1 && (
        <Box>
          <div className="config-row">
            <div className="section-card">
              <h3 className="panel-title">等级配置</h3>
              <LevelConfig />
            </div>
            <div className="section-card">
              <h3 className="panel-title">敌方 & 选项</h3>
              <EnemyPanel />
              <div style={{ marginTop: 'var(--space-md)' }}>
                <OptionsPanel />
              </div>
            </div>
          </div>

          <Box sx={{ mt: 2 }}>
            <PresetButtons />
          </Box>

          <div className="section-card" style={{ marginTop: 'var(--space-md)' }}>
            <BuffTable />
          </div>

          <div style={{ marginTop: 'var(--space-md)' }}>
            <ThreeTResult />
          </div>
        </Box>
      )}

      {/* Tab 2: Card chain */}
      {tab === 2 && (
        <div className="section-card">
          <CardChainPanel />
        </div>
      )}

      {/* Reset button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button variant="outlined" color="error" onClick={handleReset} sx={{ fontSize: '0.8rem' }}>
          重置全部 Reset All
        </Button>
      </Box>
    </Box>
  );
}
