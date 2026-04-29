import { Button } from '@mui/material';
import useStore from '@/store/index';
import { PRESETS } from '@/constants/presets';
import { createEmptyBuffs, SOURCE_KEY_NAMES } from '@/constants/buffDefs';

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
    const sourceKeys = ['ce', 'self', 'support', 'enemy', 'debuff'];
    const sources = [];
    let nextId = 1;

    for (const key of sourceKeys) {
      if (preset[key]) {
        const buffs = createEmptyBuffs();
        Object.assign(buffs, preset[key]);
        sources.push({
          id: 'src_' + nextId,
          name: SOURCE_KEY_NAMES[key] || key,
          buffs,
        });
        nextId++;
      }
    }

    if (sources.length === 0) {
      sources.push({
        id: 'src_1',
        name: '自身Self',
        buffs: createEmptyBuffs(),
      });
      nextId = 2;
    }

    setBuffs({ sources, _nextId: nextId });

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
