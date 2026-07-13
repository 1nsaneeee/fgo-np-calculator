// src/components/TeamServantSelector.jsx
import { useState, useMemo } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton,
  Rating,
  Tooltip,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import useStore from '@/store/index';
import { SERVANT_DB } from '@/data/servantDb';
import { getSv } from '@/utils/helpers';
import { CLASS_COLORS, MAIN_CLASSES, EXTRA_CLASSES } from '@/constants/gameData';
import { fetchNiceServant } from '@/services/atlasApi';
import { transformNiceToCalc, CLASS_MAP } from '@/services/transform';
import servantNamesById from '@/translations/servant-names-by-id.json';
import servantNamesJP from '@/translations/servant-names.json';

// ── helpers ──
const RARITY_MAP = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1, 8: 4 };

function getRarity(id) {
  if (id == null) return 0;
  return RARITY_MAP[String(id)[0]] || 0;
}

/** ATK at given level, linearly interpolated between ATK90 and ATK120 */
function getAtkForLevel(sv, level) {
  if (!sv) return 0;
  const atk90 = getSv(sv, 'atk90') || 0;
  const atk100 = getSv(sv, 'atk100') || 0;
  const atk120 = getSv(sv, 'atk120') || 0;
  // linear interpolation across known points
  if (level <= 90) {
    // 1→90: linear from 1/90 of atk90 (rough)
    return Math.round(atk90 * level / 90);
  }
  if (level <= 100) {
    const frac = (level - 90) / 10;
    return Math.round(atk90 + (atk100 - atk90) * frac);
  }
  const frac = Math.min((level - 100) / 20, 1);
  return Math.round(atk100 + (atk120 - atk100) * frac);
}

const SLIDER_MARKS = [
  { value: 1, label: '1' },
  { value: 90, label: '90' },
  { value: 100, label: '100' },
  { value: 120, label: '120' },
];

/**
 * Normalize a className (lowercase from API) to display class.
 * Uses CLASS_MAP from transform.js, falls back to capitalizing.
 */
function normalizeClass(rawClass) {
  if (!rawClass) return 'Saber';
  return CLASS_MAP[rawClass] || rawClass.charAt(0).toUpperCase() + rawClass.slice(1);
}

/** Translate servant name to Chinese: ID-based lookup first, then JP name fallback */
function translateName(id, jpName) {
  if (id && servantNamesById[id]) return servantNamesById[id];
  if (jpName && servantNamesJP[jpName]) return servantNamesJP[jpName];
  return jpName || '';
}

// ── sub-components ──

function ServantDropdown({ options, selectedOption, onSelect }) {
  const [inputValue, setInputValue] = useState('');

  return (
    <Autocomplete
      options={options}
      value={selectedOption}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onChange={(_, v) => onSelect(v)}
      getOptionLabel={(opt) => opt?.nameCn || opt?.name || getSv(opt, 'name') || ''}
      isOptionEqualToValue={(opt, val) => (opt?.id || opt?.[0]) === (val?.id || val?.[0])}
      filterOptions={(options, { inputValue }) => {
        const q = inputValue.toLowerCase().trim();
        if (!q) return options.slice(0, 100);
        return options.filter((s) => {
          const nameCn = s.nameCn || '';
          const name = s.name || getSv(s, 'name') || '';
          const nameEn = s.nameEn || getSv(s, 'nameEn') || '';
          const cls = s.class || s.className || normalizeClass(s.class || getSv(s, 'class')) || '';
          const collectionNo = String(s.collectionNo || s.id || '');
          return nameCn.toLowerCase().includes(q)
            || name.toLowerCase().includes(q)
            || nameEn.toLowerCase().includes(q)
            || cls.toLowerCase().includes(q)
            || collectionNo.includes(q);
        }).slice(0, 100);
      }}
      renderOption={(props, opt) => {
        const svClass = opt.class || normalizeClass(opt.className || getSv(opt, 'class'));
        const npColor = opt.npColor || getSv(opt, 'npColor');
        const npColorHex = npColor
          ? (npColor === 'Buster' ? 'var(--buster)' : npColor === 'Arts' ? 'var(--arts)' : 'var(--quick)')
          : 'var(--text-muted)';
        const rarity = opt.rarity || getRarity(opt.id || getSv(opt, 'id'));
        const { key, ...rest } = props;
        return (
          <li key={key} {...rest}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Box
                sx={{
                  display: 'inline-flex', width: 20, height: 20, borderRadius: 0.5,
                  fontSize: 'var(--text-xs)', background: CLASS_COLORS[svClass] || '#333',
                  color: '#fff', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, flexShrink: 0,
                }}
              >
                {svClass?.slice(0, 3)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" noWrap>{opt.nameCn || opt.name || getSv(opt, 'name')}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1, flexShrink: 0 }}>
              <Rating value={rarity} readOnly size="small" max={5} sx={{ fontSize: '0.6rem' }} />
              {npColor && (
                <Typography variant="caption" sx={{ color: npColorHex, fontWeight: 700, minWidth: 32 }}>
                  {npColor}
                </Typography>
              )}
            </Box>
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label="从者搜索..." placeholder="名称或职阶" size="small" />
      )}
      fullWidth
      size="small"
      sx={{ mb: 1 }}
    />
  );
}

function ServantInfoRow({ servant }) {
  if (!servant) return null;
  const svClass = servant.class || normalizeClass(servant.className || getSv(servant, 'class'));
  const attr = servant.attr || getSv(servant, 'attr');
  const deck = servant.deck || getSv(servant, 'deck');
  const rarity = servant.rarity || getRarity(servant.id || getSv(servant, 'id'));
  const id = servant.id || getSv(servant, 'id');

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-1) var(--space-3)',
        px: 1, py: 0.75,
        mb: 1,
        borderRadius: 'var(--radius-sm)',
        bgcolor: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
        fontSize: 'var(--text-sm)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          sx={{
            display: 'inline-flex', width: 18, height: 18, borderRadius: 0.5,
            fontSize: 'var(--text-2xs)', background: CLASS_COLORS[svClass] || '#333',
            color: '#fff', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, flexShrink: 0,
          }}
        >
          {svClass?.slice(0, 3)}
        </Box>
        <Rating value={rarity} readOnly size="small" max={5} sx={{ fontSize: '0.6rem' }} />
        <Typography variant="caption" color="var(--text-muted)" sx={{ ml: 0.5 }}>
          ID:{id}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="caption" color="var(--text-muted)">
          职阶: <b style={{ color: 'var(--text-strong)' }}>{svClass}</b>
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="var(--text-muted)">
          牌型: <b style={{ color: 'var(--text-strong)' }}>{deck}</b>
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="caption" color="var(--text-muted)">
          阵营: <b style={{ color: 'var(--text-strong)' }}>{attr}</b>
        </Typography>
      </Box>
    </Box>
  );
}

function LevelSlider({ value, onChange }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" component="label" sx={{ display: 'block', mb: 0.5 }}>
        等级 LV: <b>{value}</b>
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Slider
          min={1} max={120}
          value={value}
          marks={SLIDER_MARKS}
          valueLabelDisplay="auto"
          onChange={(_, v) => onChange(v)}
          sx={{ flex: 1 }}
        />
        <TextField
          type="number"
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            if (!isNaN(v)) onChange(Math.max(1, Math.min(120, v)));
          }}
          inputProps={{ min: 1, max: 120 }}
          size="small"
          sx={{ width: 64 }}
        />
      </Box>
    </Box>
  );
}

function NpToggles({ value, onChange }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" component="label" sx={{ display: 'block', mb: 0.5 }}>
        宝具 NP Lv.
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, v) => { if (v !== null) onChange(v); }}
        size="small"
        fullWidth
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <ToggleButton key={n} value={n} sx={{ fontWeight: 700 }}>
            {n}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}

function AtkInputs({ config, onChange }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2) var(--space-3)' }}>
      <Box>
        <Typography variant="caption" component="label" sx={{ display: 'block', mb: 0.5 }}>
          芙芙 ATK
        </Typography>
        <TextField
          type="number"
          value={config.fou}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            onChange('fou', isNaN(v) ? 0 : Math.max(0, Math.min(2000, v)));
          }}
          inputProps={{ min: 0, max: 2000 }}
          size="small"
          fullWidth
        />
      </Box>
      <Box>
        <Typography variant="caption" component="label" sx={{ display: 'block', mb: 0.5 }}>
          礼装 ATK
        </Typography>
        <TextField
          type="number"
          value={config.ceAtk}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            onChange('ceAtk', isNaN(v) ? 0 : Math.max(0, Math.min(3000, v)));
          }}
          inputProps={{ min: 0, max: 3000 }}
          size="small"
          fullWidth
        />
      </Box>
      <Box sx={{ gridColumn: '1/-1' }}>
        <Typography variant="caption" component="label" sx={{ display: 'block', mb: 0.5 }}>
          附加 ATK
        </Typography>
        <TextField
          type="number"
          value={config.extraAtk}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            onChange('extraAtk', isNaN(v) ? 0 : Math.max(0, Math.min(5000, v)));
          }}
          inputProps={{ min: 0, max: 5000 }}
          size="small"
          fullWidth
        />
      </Box>
    </Box>
  );
}

// ── main ──

export default function TeamServantSelector({ slotIndex }) {
  const slot = useStore((s) => s.team.servants[slotIndex]);
  const servantList = useStore((s) => s.servantList);
  const setTeamServant = useStore((s) => s.setTeamServant);
  const setTeamResolvedServant = useStore((s) => s.setTeamResolvedServant);
  const setTeamResolving = useStore((s) => s.setTeamResolving);
  const updateTeamConfig = useStore((s) => s.updateTeamConfig);
  const resetTeamServant = useStore((s) => s.resetTeamServant);

  const { servantId, config, _resolvedServant } = slot;

  // ── Build unified dropdown options from API servantList with SERVANT_DB fallback ──
  const DROPDOWN_OPTIONS = useMemo(() => {
    if (servantList && servantList.length > 0) {
      return servantList.map(s => ({
        id: s.id,
        collectionNo: s.collectionNo || s.id,
        name: s.name,
        nameCn: translateName(s.id, s.originalName || s.name),
        nameEn: s.nameEn || s.name,
        class: normalizeClass(s.className),
        rarity: s.rarity || 1,
        face: s.face,
        _source: 'api',
      }));
    }
    // Fallback to SERVANT_DB
    return SERVANT_DB.map((s, i) => {
      const id = getSv(s, 'id');
      const jpName = getSv(s, 'name');
      return {
        id,
        collectionNo: id,
        name: jpName,
        nameCn: translateName(id, jpName),
        nameEn: getSv(s, 'nameEn'),
        class: getSv(s, 'class'),
        npColor: getSv(s, 'npColor'),
        rarity: getRarity(id),
        _source: 'db',
        _raw: s,
        _idx: i,
      };
    });
  }, [servantList]);

  // Resolve full servant data for display: _resolvedServant > DROPDOWN_OPTIONS lookup > SERVANT_DB
  const selectedServant = useMemo(() => {
    if (servantId == null) return null;
    // Priority: cached resolved data from API fetch
    if (_resolvedServant) return _resolvedServant;
    // Check DROPDOWN_OPTIONS for DB entries that have full data
    const opt = DROPDOWN_OPTIONS.find(o => o.id === servantId);
    if (opt?._source === 'db' && opt._raw) {
      const arr = [...opt._raw];
      arr._idx = opt._idx;
      return arr;
    }
    // API entry without resolved data yet — return basic option for info display
    if (opt) return opt;
    // Last resort: SERVANT_DB direct lookup
    const idx = SERVANT_DB.findIndex((s) => s[0] === servantId);
    if (idx !== -1) {
      const arr = [...SERVANT_DB[idx]];
      arr._idx = idx;
      return arr;
    }
    return null;
  }, [servantId, _resolvedServant, DROPDOWN_OPTIONS]);

  // Autocomplete option matching selected
  const selectedOption = useMemo(() => {
    if (!servantId) return null;
    const opt = DROPDOWN_OPTIONS.find(o => o.id === servantId);
    if (opt) return opt;
    // Fallback: build from SERVANT_DB
    const dbIdx = SERVANT_DB.findIndex((s) => s[0] === servantId);
    if (dbIdx !== -1) {
      const s = SERVANT_DB[dbIdx];
      return {
        id: getSv(s, 'id'),
        name: getSv(s, 'name'),
        nameEn: getSv(s, 'nameEn'),
        class: getSv(s, 'class'),
        npColor: getSv(s, 'npColor'),
        rarity: getRarity(getSv(s, 'id')),
        _source: 'db',
        _raw: s,
        _idx: dbIdx,
      };
    }
    return null;
  }, [servantId, DROPDOWN_OPTIONS]);

  // derived ATK display
  const baseAtk = useMemo(() => {
    if (!selectedServant) return 0;
    return getAtkForLevel(selectedServant, config.level);
  }, [selectedServant, config.level]);

  const totalAtk = baseAtk + (config.fou || 0) + (config.ceAtk || 0) + (config.extraAtk || 0);

  const handleSelectServant = (opt) => {
    if (!opt) {
      resetTeamServant(slotIndex);
      return;
    }
    const servantId = opt.id || getSv(opt, 'id');

    // Store the basic reference
    setTeamServant(slotIndex, servantId);

    // If this is API data and we don't have full data yet, fetch it
    if (opt._source === 'api' || (!opt.atk90 && !opt._raw)) {
      setTeamResolving(slotIndex, true);
      fetchNiceServant(servantId)
        .then(nice => {
          const data = transformNiceToCalc(nice);
          setTeamResolvedServant(slotIndex, data);
        })
        .catch(() => {
          // Fallback to SERVANT_DB on error
          const dbServant = SERVANT_DB.find(s => s[0] === servantId);
          if (dbServant) {
            setTeamResolvedServant(slotIndex, dbServant);
          } else {
            setTeamResolving(slotIndex, false);
          }
        });
    } else if (opt._source === 'db' || opt._raw) {
      // Already has full data (from SERVANT_DB entry)
      setTeamResolvedServant(slotIndex, opt._raw || opt);
    }
  };

  const handleConfigChange = (key, value) => {
    updateTeamConfig(slotIndex, key, value);
  };

  return (
    <Box
      sx={{
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        p: 1.5,
        bgcolor: 'var(--surface-2)',
        '&:hover': { borderColor: 'var(--border-strong)' },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--text-strong)' }}>
          从者 S{slotIndex + 1}
        </Typography>
        <Tooltip title="重置">
          <IconButton
            size="small"
            onClick={() => resetTeamServant(slotIndex)}
            sx={{
              color: 'var(--text-muted)',
              '&:hover': { color: 'var(--color-negative)', bgcolor: 'var(--buster-bg)' },
            }}
          >
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Servant dropdown */}
      <ServantDropdown options={DROPDOWN_OPTIONS} selectedOption={selectedOption} onSelect={handleSelectServant} />

      {/* Servant info & ATK */}
      {selectedServant && (
        <>
          <ServantInfoRow servant={selectedServant} />
          <Box
            sx={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              px: 1, py: 0.5, mb: 1,
              borderRadius: 'var(--radius-sm)',
              bgcolor: 'var(--arts-bg)',
              border: '1px solid var(--accent-glow)',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--arts)' }}>
              ATK: {totalAtk.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="var(--text-muted)">
              基础 {baseAtk.toLocaleString()} + {((config.fou || 0) + (config.ceAtk || 0) + (config.extraAtk || 0)).toLocaleString()}
            </Typography>
          </Box>
        </>
      )}

      {/* Level + NP */}
      <LevelSlider value={config.level} onChange={(v) => handleConfigChange('level', v)} />
      <NpToggles value={config.npLevel} onChange={(v) => handleConfigChange('npLevel', v)} />

      {/* ATK inputs */}
      <AtkInputs config={config} onChange={handleConfigChange} />
    </Box>
  );
}
