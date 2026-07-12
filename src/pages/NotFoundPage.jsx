import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography
        variant="h2"
        sx={{ fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.04em' }}
      >
        404
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text)' }}>
        页面不存在
      </Typography>
      <Typography variant="body2" sx={{ color: 'var(--text-muted)', maxWidth: 380 }}>
        你访问的路径不存在,可能已失效或输入有误。
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
          返回上一页
        </Button>
        <Button variant="contained" size="small" onClick={() => navigate('/servants')}>
          回到从者列表
        </Button>
      </Box>
    </Box>
  );
}
