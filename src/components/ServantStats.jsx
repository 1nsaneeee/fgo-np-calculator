import { useState } from 'react';
import { Box, Button } from '@mui/material';
import { getSv } from '@/utils/helpers';
import { CLASS_COLORS } from '@/constants/gameData';

export default function ServantStats({ servant }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!servant) {
    return (
      <div className="section-card">
        <h2 className="panel-title">Servant Info</h2>
        <div style={{ color: 'var(--text-muted)' }}>Select a servant / 选择一个从者</div>
      </div>
    );
  }

  const sv = servant;
  const svClass = getSv(sv, 'class');
  const npColor = getSv(sv, 'npColor');
  const npColorHex = npColor === 'Buster' ? 'var(--buster)' : npColor === 'Arts' ? 'var(--arts)' : 'var(--quick)';

  const detailLabel = showDetails
    ? `\u25B2 收起详情`
    : `\u25BC 查看完整数据 (${getSv(sv, 'atk100') ? 'ATK100/120, ' : ''}Hits, 星率, 被动...)`;

  return (
    <div className="section-card">
      <div className="servant-card">
        <span className="servant-class" style={{ background: CLASS_COLORS[svClass] || '#333', color: '#fff' }}>
          {svClass}
        </span>
        <Box>
          <div className="servant-name">{getSv(sv, 'name')}</div>
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            {getSv(sv, 'nameEn')}
          </div>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <div className="servant-stat">ATK <span>{getSv(sv, 'atk90')}</span></div>
          <div className="servant-stat">NP <span style={{ color: npColorHex }}>{npColor}</span></div>
          <div className="servant-stat">NP率 <span>{getSv(sv, 'npRate')}</span></div>
          <div className="servant-stat">配卡 <span>{getSv(sv, 'deck')}</span></div>
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
        {detailLabel}
      </Button>

      {showDetails && (
        <div style={{ marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 'var(--font-sm)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          {getSv(sv, 'atk100') ? <span>ATK100: {getSv(sv, 'atk100')}</span> : null}
          {getSv(sv, 'atk120') ? <span>ATK120: {getSv(sv, 'atk120')}</span> : null}
          <span>NP Hit: {getSv(sv, 'npHits')}</span>
          <span>属性: {getSv(sv, 'attr') || '-'}</span>
          <span>Hit: B{getSv(sv, 'bHits')}/A{getSv(sv, 'aHits')}/Q{getSv(sv, 'qHits')}/EX{getSv(sv, 'eHits')}</span>
          <span>星率: {getSv(sv, 'starRate')}%</span>
          <span>宝具: NP1:{getSv(sv, 'np1')}% NP2:{getSv(sv, 'np2')}% NP3:{getSv(sv, 'np3')}% NP4:{getSv(sv, 'np4')}% NP5:{getSv(sv, 'np5')}%</span>
          {getSv(sv, 'passiveBuster') > 0 && <span>红放+{getSv(sv, 'passiveBuster')}%</span>}
          {getSv(sv, 'passiveArts') > 0 && <span>蓝放+{getSv(sv, 'passiveArts')}%</span>}
          {getSv(sv, 'passiveQuick') > 0 && <span>绿放+{getSv(sv, 'passiveQuick')}%</span>}
          {getSv(sv, 'passiveCrit') > 0 && <span>爆伤+{getSv(sv, 'passiveCrit')}%</span>}
          {getSv(sv, 'passiveNpGen') > 0 && <span>NP率+{getSv(sv, 'passiveNpGen')}%</span>}
          {getSv(sv, 'passiveNpStrength') > 0 && <span>宝威+{getSv(sv, 'passiveNpStrength')}%</span>}
        </div>
      )}
    </div>
  );
}
