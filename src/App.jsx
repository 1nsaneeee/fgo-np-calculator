import { Button } from '@mui/material';
import useStore from '@/store/index';
import { useServant } from '@/hooks/useServant';
import { useNpResult } from '@/hooks/useNpResult';

import ServantSelector from '@/components/ServantSelector';
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

export default function App() {
  const isCustom = useStore((s) => s.isCustom);
  const setCustomMode = useStore((s) => s.setCustomMode);
  const resetServant = useStore((s) => s.resetServant);
  const resetConfig = useStore((s) => s.resetConfig);
  const resetBuffs = useStore((s) => s.resetBuffs);
  const resetEnemy = useStore((s) => s.resetEnemy);
  const resetOptions = useStore((s) => s.resetOptions);
  const servant = useServant();
  const npResult = useNpResult();

  const handleReset = () => {
    resetServant();
    resetConfig();
    resetBuffs();
    resetEnemy();
    resetOptions();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">FGO NP Damage Calculator // 宝具伤害计算器</h1>
      </header>

      <main className="main-col">
        <div className="section">
          <div style={{ display: 'flex', gap: 0, marginBottom: 'var(--space-sm)' }}>
            <Button
              variant={!isCustom ? 'contained' : 'outlined'}
              onClick={() => setCustomMode(false)}
              sx={{ flex: 1, borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)' }}
            >
              数据库 Database
            </Button>
            <Button
              variant={isCustom ? 'contained' : 'outlined'}
              onClick={() => setCustomMode(true)}
              sx={{ flex: 1, borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
            >
              自定义 Custom
            </Button>
          </div>
          {!isCustom && <ServantSelector />}
          {isCustom ? <CustomServantForm /> : <ServantStats servant={servant} />}
        </div>

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

        <ThreeTResult />

        <CardChainPanel />

        <CardDrawPanel />

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'var(--space-md) 0' }}>
          <Button variant="outlined" color="error" onClick={handleReset}
            sx={{ fontSize: 'var(--font-sm)' }}>
            {'\u27F2'} Reset All
          </Button>
        </div>
      </main>

      <footer className="app-footer">
        FGO Damage Calculator v4.0 · Data from FGO计算器Ver9.9 · React 18 + Vite + MUI + Zustand
      </footer>
    </div>
  );
}
