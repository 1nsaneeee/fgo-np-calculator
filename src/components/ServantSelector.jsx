import { useState, useMemo } from 'react';
import { Autocomplete, TextField, Chip, Box } from '@mui/material';
import useStore from '@/store/index';
import { SERVANT_DB } from '@/data/servantDb';
import { getSv } from '@/utils/helpers';
import { CLASS_COLORS, MAIN_CLASSES, EXTRA_CLASSES } from '@/constants/gameData';

export default function ServantSelector() {
  const selectedIndex = useStore((s) => s.selectedIndex);
  const selectServant = useStore((s) => s.selectServant);
  const [classFilter, setClassFilter] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const filteredOptions = useMemo(() => {
    let options = SERVANT_DB.map((s, i) => ({ ...s, _idx: i }));
    if (classFilter) {
      options = options.filter((s) => getSv(s, 'class') === classFilter);
    }
    return options;
  }, [classFilter]);

  const selectedOption = selectedIndex !== null && selectedIndex >= 0
    ? { ...SERVANT_DB[selectedIndex], _idx: selectedIndex }
    : null;

  const handleClassToggle = (cls) => {
    setClassFilter((prev) => (prev === cls ? null : cls));
  };

  return (
    <Box>
      <Autocomplete
        options={filteredOptions}
        value={selectedOption}
        inputValue={inputValue}
        onInputChange={(_, v) => setInputValue(v)}
        onChange={(_, v) => {
          if (v) selectServant(v._idx);
        }}
        getOptionLabel={(opt) => getSv(opt, 'name') || ''}
        isOptionEqualToValue={(opt, val) => opt._idx === val._idx}
        filterOptions={(options, { inputValue }) => {
          const q = inputValue.toLowerCase().trim();
          if (!q) return options.slice(0, 100);
          return options.filter((s) => {
            const name = getSv(s, 'name');
            const nameEn = getSv(s, 'nameEn');
            const cls = getSv(s, 'class');
            return (name && name.toLowerCase().includes(q))
              || (nameEn && nameEn.toLowerCase().includes(q))
              || (cls && cls.toLowerCase().includes(q));
          }).slice(0, 100);
        }}
        renderOption={(props, opt) => {
          const svClass = getSv(opt, 'class');
          const npColor = getSv(opt, 'npColor');
          const npColorHex = npColor === 'Buster' ? 'var(--buster)' : npColor === 'Arts' ? 'var(--arts)' : 'var(--quick)';
          const { key, ...rest } = props;
          return (
            <li key={key} {...rest}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'inline-block', width: 20, height: 20, borderRadius: 0.5,
                    fontSize: 'var(--font-xs)', background: CLASS_COLORS[svClass] || '#333',
                    color: '#fff', textAlign: 'center', lineHeight: '20px', fontWeight: 700
                  }}
                >
                  {svClass?.slice(0, 3)}
                </Box>
                <span>{getSv(opt, 'name')}</span>
              </Box>
              <span style={{ fontSize: 'var(--font-xs)', color: npColorHex, fontWeight: 700 }}>
                {npColor}
              </span>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} label="从者搜索 Servant Search" placeholder="输入从者名称或职阶..." />
        )}
        fullWidth
        size="small"
      />

      {/* Class filter chips */}
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
        <Chip
          label="ALL"
          size="small"
          variant={classFilter === null ? 'filled' : 'outlined'}
          color={classFilter === null ? 'primary' : 'default'}
          onClick={() => setClassFilter(null)}
        />
        {MAIN_CLASSES.map((cls) => (
          <Chip
            key={cls}
            label={cls}
            size="small"
            variant={classFilter === cls ? 'filled' : 'outlined'}
            color={classFilter === cls ? 'primary' : 'default'}
            onClick={() => handleClassToggle(cls)}
          />
        ))}
        <Chip
          label="Extra"
          size="small"
          variant={classFilter && EXTRA_CLASSES.includes(classFilter) ? 'filled' : 'outlined'}
          color={classFilter && EXTRA_CLASSES.includes(classFilter) ? 'primary' : 'default'}
          onClick={() => setClassFilter((prev) => EXTRA_CLASSES.includes(prev) ? null : 'Ruler')}
        />
      </Box>

      {/* Extra class sub-chips */}
      {classFilter && EXTRA_CLASSES.includes(classFilter) && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
          {EXTRA_CLASSES.map((cls) => (
            <Chip
              key={cls}
              label={cls}
              size="small"
              variant={classFilter === cls ? 'filled' : 'outlined'}
              color={classFilter === cls ? 'primary' : 'default'}
              onClick={() => setClassFilter(cls)}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
