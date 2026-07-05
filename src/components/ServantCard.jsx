// src/components/ServantCard.jsx
import { Rating } from '@mui/material';
import { CLASS_COLORS } from '@/constants/gameData';
import npColors from '@/translations/npColors.json';
import servantNamesById from '@/translations/servant-names-by-id.json';

const NPC_LABEL = { Buster: 'B', Arts: 'A', Quick: 'Q' };

export default function ServantCard({ basic, onClick }) {
  const className = basic.className
    ? (basic.className.charAt(0).toUpperCase() + basic.className.slice(1))
    : '';
  const classColor = CLASS_COLORS[className] || '#555';
  const npColor = npColors[basic.id] || 'Buster';
  const npChar = NPC_LABEL[npColor] || 'B';
  const nameCn = servantNamesById[basic.id] || basic.name || '';
  const npColorVar = npColor === 'Buster' ? 'var(--buster)' : npColor === 'Arts' ? 'var(--arts)' : 'var(--quick)';

  return (
    <div className="sv-card" onClick={onClick}>
      <div style={{ position: 'relative' }}>
        <img
          className="sv-card-img"
          src={basic.face}
          alt={nameCn}
          loading="lazy"
          style={{ backgroundColor: classColor }}
        />
        <span style={{
          position: 'absolute', top: 4, left: 4,
          backgroundColor: classColor, color: '#fff',
          padding: '1px 5px', borderRadius: 3,
          fontSize: '0.6rem', fontWeight: 700, lineHeight: 1.5,
        }}>
          {className.slice(0, 4)}
        </span>
        <span style={{
          position: 'absolute', top: 4, right: 4,
          backgroundColor: npColorVar, color: '#fff',
          width: 18, height: 18, borderRadius: '50%',
          fontSize: '0.6rem', fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {npChar}
        </span>
      </div>
      <div className="sv-card-body">
        <div className="sv-card-name">{nameCn}</div>
        <div className="sv-card-meta">
          <Rating value={basic.rarity} readOnly size="small" max={5} sx={{ fontSize: '0.65rem', mr: 0.5 }} />
          ATK {basic.atkMax?.toLocaleString() || '?'}
        </div>
      </div>
    </div>
  );
}
