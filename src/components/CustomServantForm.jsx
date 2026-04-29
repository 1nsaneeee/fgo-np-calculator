import { Box, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import useStore from '@/store/index';
import { CLASS_LIST, ATTRIBUTE_LIST } from '@/constants/gameData';
import { CUSTOM_SERVANT_DEFAULTS } from '@/constants/servantKeys';

export default function CustomServantForm() {
  const customServant = useStore((s) => s.customServant);
  const setCustomServant = useStore((s) => s.setCustomServant);

  const sv = customServant || CUSTOM_SERVANT_DEFAULTS;
  const set = (key, val) => setCustomServant({ ...sv, [key]: val });

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 12px', pt: 1 }}>
      <TextField label="名称" value={sv.name || ''} onChange={(e) => set('name', e.target.value)} size="small" />
      <FormControl size="small" fullWidth>
        <InputLabel>职阶</InputLabel>
        <Select value={sv.class} label="职阶" onChange={(e) => set('class', e.target.value)}>
          {CLASS_LIST.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" fullWidth>
        <InputLabel>宝具色卡</InputLabel>
        <Select value={sv.npColor} label="宝具色卡" onChange={(e) => set('npColor', e.target.value)}>
          <MenuItem value="Buster">Buster</MenuItem>
          <MenuItem value="Arts">Arts</MenuItem>
          <MenuItem value="Quick">Quick</MenuItem>
        </Select>
      </FormControl>
      <TextField label="ATK90" type="number" value={sv.atk90 || 0} onChange={(e) => set('atk90', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="ATK100" type="number" value={sv.atk100 || 0} onChange={(e) => set('atk100', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="ATK120" type="number" value={sv.atk120 || 0} onChange={(e) => set('atk120', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="NP率" type="number" value={sv.npRate || 0} onChange={(e) => set('npRate', parseFloat(e.target.value) || 0)} size="small" inputProps={{ step: 0.01 }} />
      <TextField label="NP Hit数" type="number" value={sv.npHits || 1} onChange={(e) => set('npHits', parseInt(e.target.value) || 1)} size="small" />
      <TextField label="Star Rate (0.1=10%)" type="number" value={sv.starRate || 0} onChange={(e) => set('starRate', parseFloat(e.target.value) || 0)} size="small" inputProps={{ step: 0.001 }} />
      <TextField label="配卡 (e.g. BBAAQ)" value={sv.deck || ''} onChange={(e) => set('deck', e.target.value.toUpperCase().replace(/[^BAQE]/g, ''))} size="small" inputProps={{ maxLength: 5 }} />
      <TextField label="B Hit" type="number" value={sv.bHits || 0} onChange={(e) => set('bHits', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="A Hit" type="number" value={sv.aHits || 0} onChange={(e) => set('aHits', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="Q Hit" type="number" value={sv.qHits || 0} onChange={(e) => set('qHits', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="EX Hit" type="number" value={sv.eHits || 0} onChange={(e) => set('eHits', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="NP1倍率%" type="number" value={sv.np1 || 0} onChange={(e) => set('np1', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="NP2倍率%" type="number" value={sv.np2 || 0} onChange={(e) => set('np2', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="NP3倍率%" type="number" value={sv.np3 || 0} onChange={(e) => set('np3', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="NP4倍率%" type="number" value={sv.np4 || 0} onChange={(e) => set('np4', parseInt(e.target.value) || 0)} size="small" />
      <TextField label="NP5倍率%" type="number" value={sv.np5 || 0} onChange={(e) => set('np5', parseInt(e.target.value) || 0)} size="small" />
      <FormControl size="small" fullWidth>
        <InputLabel>阵营</InputLabel>
        <Select value={sv.attr || 'Human'} label="阵营" onChange={(e) => set('attr', e.target.value)}>
          {ATTRIBUTE_LIST.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
        </Select>
      </FormControl>
      <Box sx={{ gridColumn: '1/-1', display: 'flex', gap: 1.5, flexWrap: 'wrap', py: 0.5 }}>
        <span style={{ fontSize: 'var(--font-xs)', lineHeight: '30px', fontWeight: 600 }}>被动:</span>
        <TextField label="红放" type="number" value={sv.passiveBuster || 0} onChange={(e) => set('passiveBuster', parseInt(e.target.value) || 0)} size="small" sx={{ width: 80 }} inputProps={{ min: 0, max: 50 }} />
        <TextField label="蓝放" type="number" value={sv.passiveArts || 0} onChange={(e) => set('passiveArts', parseInt(e.target.value) || 0)} size="small" sx={{ width: 80 }} inputProps={{ min: 0, max: 50 }} />
        <TextField label="绿放" type="number" value={sv.passiveQuick || 0} onChange={(e) => set('passiveQuick', parseInt(e.target.value) || 0)} size="small" sx={{ width: 80 }} inputProps={{ min: 0, max: 50 }} />
        <TextField label="爆伤" type="number" value={sv.passiveCrit || 0} onChange={(e) => set('passiveCrit', parseInt(e.target.value) || 0)} size="small" sx={{ width: 80 }} inputProps={{ min: 0, max: 50 }} />
        <TextField label="NP率" type="number" value={sv.passiveNpGen || 0} onChange={(e) => set('passiveNpGen', parseInt(e.target.value) || 0)} size="small" sx={{ width: 80 }} inputProps={{ min: 0, max: 50 }} />
      </Box>
    </Box>
  );
}
