// src/components/ServantCard.jsx
import { Box, Card, CardActionArea, Rating } from '@mui/material';
import { CLASS_COLORS } from '@/constants/gameData';
import npColors from '@/translations/npColors.json';
import servantNames from '@/translations/servant-names.json';
import servantNamesById from '@/translations/servant-names-by-id.json';

const NPC_LABEL = { Buster: 'B', Arts: 'A', Quick: 'Q' };

export default function ServantCard({ basic, onClick }) {
  const className = basic.className
    ? (basic.className.charAt(0).toUpperCase() + basic.className.slice(1))
    : '';
  const classColor = CLASS_COLORS[className] || '#333';
  const npColor = npColors[basic.id] || 'Buster';
  const npChar = NPC_LABEL[npColor] || 'B';
  const nameJp = basic.originalName || basic.name || '';
  const nameCn = servantNamesById[basic.id] || servantNames[nameJp] || nameJp;
  const npColorHex = npColor === 'Buster' ? 'var(--buster)' : npColor === 'Arts' ? 'var(--arts)' : 'var(--quick)';

  return (
    <Card sx={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 } }}>
      <CardActionArea onClick={onClick} sx={{ p: 1 }}>
        <Box sx={{ position: 'relative', mb: 0.5 }}>
          <Box
            component="img"
            src={basic.face}
            alt={nameCn}
            loading="lazy"
            sx={{
              width: '100%', aspectRatio: '1',
              objectFit: 'cover', borderRadius: 1,
              bgcolor: classColor,
            }}
          />
          <Box sx={{
            position: 'absolute', top: 4, left: 4,
            bgcolor: classColor, color: '#fff',
            px: 0.5, borderRadius: 0.5,
            fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.4,
          }}>
            {className.slice(0, 4)}
          </Box>
          <Box sx={{
            position: 'absolute', top: 4, right: 4,
            bgcolor: npColorHex, color: '#fff',
            width: 18, height: 18, borderRadius: '50%',
            fontSize: '0.6rem', fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {npChar}
          </Box>
        </Box>
        <Box sx={{ fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {nameCn}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          <Rating value={basic.rarity} readOnly size="small" max={5} sx={{ fontSize: '0.7rem' }} />
          <Box component="span" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
            ATK {basic.atkMax?.toLocaleString() || '?'}
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
}
