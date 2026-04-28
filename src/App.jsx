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
import NPDamageSticky from '@/components/NPDamageSticky';
import NPDamageResult from '@/components/NPDamageResult';
import CardChainPanel from '@/components/CardChainPanel';
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
  const config = useStore((s) => s.config);
  const buffs = useStore((s) => s.buffs);
  const enemy = useStore((s) => s.enemy);
  const options = useStore((s) => s.options);
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
      <h1 className="app-title">FGO NP Damage Calculator // 宝具伤害计算器</h1>

      <div className="layout-2col">
        {/* LEFT COLUMN: Inputs */}
        <div className="left-col">
          {/* Mode toggle + Search */}
          <div className="section">
            <div style={{ display: 'flex', gap: 0, marginBottom: 12 }}>
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
          </div>

          {/* Servant Info / Custom Form */}
          {isCustom ? <CustomServantForm /> : <ServantStats servant={servant} />}

          {/* Presets */}
          <PresetButtons />

          {/* Level Config + Enemy + Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <LevelConfig />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <EnemyPanel />
              <OptionsPanel />
            </div>
          </div>

          {/* Buff Table */}
          <BuffTable />

          {/* NP Damage Detail */}
          <NPDamageResult result={npResult} servant={servant} config={config}
            buffs={buffs} enemy={enemy} options={options} />

          {/* Card Chain */}
          <CardChainPanel />

          {/* Reset */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleReset}
              sx={{ fontSize: 'var(--font-sm)' }}
            >
              {'\u27F2'} Reset All
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Results */}
        <div className="right-col">
          <NPDamageSticky result={npResult} servant={servant} config={config} />
          <ThreeTResult />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 40, fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
        FGO Damage Calculator v3.0 · Data from FGO计算器Ver9.9 · React 18 + Vite + MUI + Zustand
      </div>
    </div>
  );
}
