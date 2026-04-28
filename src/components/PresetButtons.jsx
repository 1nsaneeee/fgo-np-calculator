import { Button, Box } from '@mui/material';
import useStore from '@/store/index';
import { PRESETS } from '@/constants/presets';
import { SOURCE_KEYS, defaultBuffs } from '@/constants/buffDefs';
import cloneDeep from 'lodash/cloneDeep';

const presetColors = {
  '黑杯Lv100': 'inherit',
  '满破黑杯': 'inherit',
  '双C呆+黑杯': 'primary',
  '双杀狐+黑杯': 'error',
  '双RBA+绿': 'success',
  '奥伯龙3技能': 'error',
};

export default function PresetButtons() {
  const setBuffs = useStore((s) => s.setBuffs);
  const updateConfig = useStore((s) => s.updateConfig);

  const handleApply = (preset) => {
    const fresh = cloneDeep(defaultBuffs);
    for (const src of SOURCE_KEYS) {
      if (preset[src]) {
        Object.assign(fresh[src], preset[src]);
      }
    }
    setBuffs(fresh);
    if (preset.ceAtk !== undefined) {
      updateConfig('ceAtk', preset.ceAtk);
    }
  };

  return (
    <div className="preset-row">
      <span className="preset-label">预设 Presets</span>
      {Object.entries(PRESETS).map(([label, preset]) => (
        <Button
          key={label}
          size="small"
          variant="outlined"
          color={presetColors[label] || 'inherit'}
          onClick={() => handleApply(preset)}
          sx={{ fontSize: 'var(--font-sm)', py: 0.5, px: 1.5 }}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
