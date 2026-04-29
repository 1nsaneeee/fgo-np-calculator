import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { getSv } from '@/utils/helpers';
import { CLASS_COLORS } from '@/constants/gameData';

const Chip = ({ label, value, color, bg }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 'var(--font-sm)', lineHeight: '24px',
    padding: '2px 10px', borderRadius: 12,
    background: bg || 'var(--surface-alt)',
  }}>
    <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 'var(--font-xs)' }}>{label}</span>
    <span style={{ color: color || 'var(--text)', fontWeight: 700 }}>{value}</span>
  </span>
);

const COLOR_MAP = {
  Buster: { color: 'var(--buster)', bg: 'var(--buster-bg)' },
  Arts:   { color: 'var(--arts)',   bg: 'var(--arts-bg)' },
  Quick:  { color: 'var(--quick)',  bg: 'var(--quick-bg)' },
};

export default function ServantStats({ servant }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!servant) {
    return (
      <div style={{ color: 'var(--text-muted)', padding: 'var(--space-sm) 0' }}>Select a servant / 选择一个从者</div>
    );
  }

  const sv = servant;
  const svClass = getSv(sv, 'class');
  const npColor = getSv(sv, 'npColor');
  const np = COLOR_MAP[npColor] || COLOR_MAP.Arts;

  return (
    <>
      <div className="servant-card">
        <span className="servant-class" style={{ background: CLASS_COLORS[svClass] || '#333', color: '#fff' }}>
          {svClass}
        </span>
        <Box>
          <div className="servant-name">{getSv(sv, 'name')}</div>
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginTop: 'var(--space-2xs)' }}>
            {getSv(sv, 'nameEn')}
          </div>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          <Chip label="ATK" value={getSv(sv, 'atk90')} color="var(--blue)" bg="var(--accent-light)" />
          <Chip label="NP" value={npColor} color={np.color} bg={np.bg} />
          <Chip label="NP率" value={getSv(sv, 'npRate')} />
          <Chip label="配卡" value={getSv(sv, 'deck')} />
        </Box>
      </div>

      <Button
        onClick={() => setShowDetails(!showDetails)}
        sx={{
          display: 'block', mx: 'auto', mt: 1, fontSize: 'var(--font-xs)', py: 0.5, px: 2,
          color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 1,
          textTransform: 'none', minWidth: 0,
        }}
      >
        {showDetails ? '\u25B2 收起详情' : '\u25BC 查看完整数据'}
      </Button>

      {showDetails && (
        <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          {getSv(sv, 'atk100') ? <Chip label="ATK100" value={getSv(sv, 'atk100')} color="var(--blue)" bg="var(--accent-light)" /> : null}
          {getSv(sv, 'atk120') ? <Chip label="ATK120" value={getSv(sv, 'atk120')} color="var(--indigo)" bg="var(--indigo-bg)" /> : null}
          <Chip label="NP Hit" value={getSv(sv, 'npHits')} />
          <Chip label="属性" value={getSv(sv, 'attr') || '-'} />
          <Chip label="B Hit" value={getSv(sv, 'bHits')} color="var(--buster)" bg="var(--buster-bg)" />
          <Chip label="A Hit" value={getSv(sv, 'aHits')} color="var(--arts)" bg="var(--arts-bg)" />
          <Chip label="Q Hit" value={getSv(sv, 'qHits')} color="var(--quick)" bg="var(--quick-bg)" />
          <Chip label="EX Hit" value={getSv(sv, 'eHits')} color="var(--gold)" bg="var(--ex-bg)" />
          <Chip label="星率" value={`${getSv(sv, 'starRate')}%`} color="var(--gold)" bg="var(--ex-bg)" />
          <Chip label="NP1" value={`${getSv(sv, 'np1')}%`} />
          <Chip label="NP2" value={`${getSv(sv, 'np2')}%`} />
          <Chip label="NP3" value={`${getSv(sv, 'np3')}%`} />
          <Chip label="NP4" value={`${getSv(sv, 'np4')}%`} />
          <Chip label="NP5" value={`${getSv(sv, 'np5')}%`} />
          {getSv(sv, 'passiveBuster') > 0 && <Chip label="红放" value={`+${getSv(sv, 'passiveBuster')}%`} color="var(--buster)" bg="var(--buster-bg)" />}
          {getSv(sv, 'passiveArts') > 0 && <Chip label="蓝放" value={`+${getSv(sv, 'passiveArts')}%`} color="var(--arts)" bg="var(--arts-bg)" />}
          {getSv(sv, 'passiveQuick') > 0 && <Chip label="绿放" value={`+${getSv(sv, 'passiveQuick')}%`} color="var(--quick)" bg="var(--quick-bg)" />}
          {getSv(sv, 'passiveCrit') > 0 && <Chip label="爆伤" value={`+${getSv(sv, 'passiveCrit')}%`} color="var(--gold)" bg="var(--ex-bg)" />}
          {getSv(sv, 'passiveNpGen') > 0 && <Chip label="NP率" value={`+${getSv(sv, 'passiveNpGen')}%`} color="var(--arts)" bg="var(--arts-bg)" />}
          {getSv(sv, 'passiveNpStrength') > 0 && <Chip label="宝威" value={`+${getSv(sv, 'passiveNpStrength')}%`} color="var(--indigo)" bg="var(--indigo-bg)" />}
        </div>
      )}
    </>
  );
}
