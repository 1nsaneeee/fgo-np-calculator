import { Box, Slider, TextField, Typography } from '@mui/material';
import useStore from '@/store/index';

export default function LevelConfig() {
  const config = useStore((s) => s.config);
  const updateConfig = useStore((s) => s.updateConfig);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 14px' }}>
      <Box>
        <Typography variant="caption" component="label" sx={{ display: 'block', mb: 0.5 }}>
          从者 LV: <b>{config.level}</b>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Slider
            min={1} max={120} value={config.level}
            onChange={(_, v) => updateConfig('level', v)}
            sx={{ flex: 1 }}
          />
          <TextField
            type="number"
            value={config.level}
            onChange={(e) => updateConfig('level', parseInt(e.target.value) || 1)}
            inputProps={{ min: 1, max: 120 }}
            sx={{ width: 70 }}
          />
        </Box>
      </Box>
      <Box>
        <Typography variant="caption" component="label" sx={{ display: 'block', mb: 0.5 }}>
          宝具 NP Lv.<b>{config.npLevel}</b>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Slider
            min={1} max={5} value={config.npLevel}
            onChange={(_, v) => updateConfig('npLevel', v)}
            sx={{ flex: 1 }}
          />
          <TextField
            type="number"
            value={config.npLevel}
            onChange={(e) => updateConfig('npLevel', parseInt(e.target.value) || 1)}
            inputProps={{ min: 1, max: 5 }}
            sx={{ width: 70 }}
          />
        </Box>
      </Box>
      <Box>
        <Typography variant="caption" component="label" sx={{ display: 'block', mb: 0.5 }}>
          芙芙 ATK
        </Typography>
        <TextField
          type="number"
          value={config.fou}
          onChange={(e) => updateConfig('fou', parseInt(e.target.value) || 0)}
          inputProps={{ min: 0, max: 2000 }}
        />
      </Box>
      <Box>
        <Typography variant="caption" component="label" sx={{ display: 'block', mb: 0.5 }}>
          礼装 ATK
        </Typography>
        <TextField
          type="number"
          value={config.ceAtk}
          onChange={(e) => updateConfig('ceAtk', parseInt(e.target.value) || 0)}
          inputProps={{ min: 0, max: 3000 }}
        />
      </Box>
      <Box sx={{ gridColumn: '1/-1' }}>
        <Typography variant="caption" component="label" sx={{ display: 'block', mb: 0.5 }}>
          额外 ATK
        </Typography>
        <TextField
          type="number"
          value={config.extraAtk}
          onChange={(e) => updateConfig('extraAtk', parseInt(e.target.value) || 0)}
          inputProps={{ min: 0, max: 5000 }}
        />
      </Box>
    </Box>
  );
}
