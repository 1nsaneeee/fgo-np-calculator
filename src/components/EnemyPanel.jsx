import { Box, Select, MenuItem, Slider, Typography, FormControl, InputLabel } from '@mui/material';
import useStore from '@/store/index';
import { CLASS_LIST, ATTRIBUTE_LIST } from '@/constants/gameData';

export default function EnemyPanel() {
  const enemy = useStore((s) => s.enemy);
  const updateEnemy = useStore((s) => s.updateEnemy);

  return (
    <div className="section">
      <h2 className="panel-title">Enemy Config</h2>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.25 }}>
        <FormControl size="small" fullWidth>
          <InputLabel>敌方职阶</InputLabel>
          <Select
            value={enemy.class}
            label="敌方职阶"
            onChange={(e) => updateEnemy('class', e.target.value)}
          >
            {CLASS_LIST.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>敌方阵营</InputLabel>
          <Select
            value={enemy.attr}
            label="敌方阵营"
            onChange={(e) => updateEnemy('attr', e.target.value)}
          >
            {ATTRIBUTE_LIST.map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box>
          <Typography variant="caption">敌方防御 DEF%</Typography>
          <Slider
            min={0} max={100} value={enemy.def}
            onChange={(_, v) => updateEnemy('def', v)}
          />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'var(--text-muted)' }}>
            {enemy.def}%
          </Typography>
        </Box>
      </Box>
    </div>
  );
}
