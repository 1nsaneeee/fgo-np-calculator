// src/components/ServantFilterPanel.jsx
import { Box, FormControlLabel, Checkbox, Divider, Button } from '@mui/material';
import { MAIN_CLASSES, EXTRA_CLASSES, CLASS_COLORS } from '@/constants/gameData';

const RARITY_OPTIONS = [
  { label: '★1-3', values: [1, 2, 3] },
  { label: '★4', values: [4] },
  { label: '★5', values: [5] },
];

const NP_COLORS = ['Buster', 'Arts', 'Quick'];

export default function ServantFilterPanel({
  classFilter, setClassFilter,
  rarityFilter, setRarityFilter,
  npColorFilter, setNpColorFilter,
  onReset,
}) {
  const allClasses = [...MAIN_CLASSES, ...EXTRA_CLASSES];

  const toggleClass = (cls) => {
    setClassFilter(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    );
  };

  const toggleRarity = (val) => {
    setRarityFilter(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const toggleNpColor = (color) => {
    setNpColorFilter(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  return (
    <div className="filter-panel">
      <div className="filter-section-title">职阶 Class</div>
      {allClasses.map(cls => (
        <FormControlLabel
          key={cls}
          control={
            <Checkbox
              size="small"
              checked={classFilter.includes(cls)}
              onChange={() => toggleClass(cls)}
              sx={{
                color: CLASS_COLORS[cls] || 'var(--text-muted)',
                '&.Mui-checked': { color: CLASS_COLORS[cls] || 'var(--accent)' },
                p: 0.5,
              }}
            />
          }
          label={<Box component="span" sx={{ fontSize: '0.78rem' }}>{cls}</Box>}
          sx={{ display: 'flex', ml: 0, mb: -0.5, '& .MuiFormControlLabel-label': { ml: 0.5 } }}
        />
      ))}

      <Divider sx={{ my: 1.5 }} />

      <div className="filter-section-title">稀有度 Rarity</div>
      {RARITY_OPTIONS.map(opt => (
        <FormControlLabel
          key={opt.label}
          control={
            <Checkbox
              size="small"
              checked={rarityFilter.includes(opt.values[0])}
              onChange={() => toggleRarity(opt.values[0])}
              sx={{ p: 0.5 }}
            />
          }
          label={<Box component="span" sx={{ fontSize: '0.78rem' }}>{opt.label}</Box>}
          sx={{ display: 'flex', ml: 0, mb: -0.5 }}
        />
      ))}

      <Divider sx={{ my: 1.5 }} />

      <div className="filter-section-title">宝具色卡</div>
      {NP_COLORS.map(color => (
        <FormControlLabel
          key={color}
          control={
            <Checkbox
              size="small"
              checked={npColorFilter.includes(color)}
              onChange={() => toggleNpColor(color)}
              sx={{
                color: color === 'Buster' ? 'var(--buster)' : color === 'Arts' ? 'var(--arts)' : 'var(--quick)',
                '&.Mui-checked': { color: color === 'Buster' ? 'var(--buster)' : color === 'Arts' ? 'var(--arts)' : 'var(--quick)' },
                p: 0.5,
              }}
            />
          }
          label={<Box component="span" sx={{ fontSize: '0.78rem' }}>{color}</Box>}
          sx={{ display: 'flex', ml: 0, mb: -0.5 }}
        />
      ))}

      <Divider sx={{ my: 1.5 }} />

      <Button size="small" variant="outlined" fullWidth onClick={onReset} sx={{ fontSize: '0.78rem' }}>
        重置 Reset
      </Button>
    </div>
  );
}
