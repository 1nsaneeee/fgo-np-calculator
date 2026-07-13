// src/pages/SettingsPage.jsx
import { Box, Button, Typography, Divider } from '@mui/material';
import { useThemeStore } from '@/store/themeStore';

export default function SettingsPage() {
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto' }}>
      <h1 className="visually-hidden">设置</h1>

      {/* 主题 */}
      <div className="section-card">
        <h2 className="panel-title">主题</h2>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="body1" sx={{ color: 'var(--text-muted)' }}>
            当前: {mode === 'dark' ? '深色' : '浅色'}
          </Typography>
          <Button variant="outlined" size="small" onClick={toggleTheme}>
            切换为{mode === 'dark' ? '浅色' : '深色'}
          </Button>
        </Box>
      </div>

      {/* 快捷键 */}
      <div className="section-card" style={{ marginTop: 'var(--space-4)' }}>
        <h2 className="panel-title">快捷键</h2>
        <Box component="table" sx={{ width: '100%', fontSize: 'var(--text-sm)', '& td': { py: 0.75, pr: 2 } }}>
          <tbody>
            <tr>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-strong)' }}>R</td>
              <td style={{ color: 'var(--text-muted)' }}>重置所有配置（单从者页面）</td>
            </tr>
          </tbody>
        </Box>
      </div>

      {/* 关于 */}
      <div className="section-card" style={{ marginTop: 'var(--space-4)' }}>
        <h2 className="panel-title">关于</h2>
        <Typography variant="body2" sx={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
          FGO NP Calculator v4.0.0<br />
          数据来源: Atlas Academy API<br />
          458+ 从者数据库
        </Typography>
      </div>
    </Box>
  );
}
