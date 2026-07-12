import { Component } from 'react';
import { Button, Box, Typography } from '@mui/material';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.hash = '#/servants';
    this.handleReset();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

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
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text)' }}>
          出错了
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-muted)', maxWidth: 420 }}>
          页面渲染时遇到问题。可以尝试重置状态、刷新页面,或返回从者列表。
        </Typography>
        {import.meta.env.DEV && this.state.error && (
          <Box
            component="pre"
            sx={{
              mt: 1,
              p: 1.5,
              bgcolor: 'var(--hover-bg)',
              borderRadius: 1,
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              maxWidth: 600,
              overflow: 'auto',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error.message}
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="outlined" size="small" onClick={this.handleReset}>
            重试
          </Button>
          <Button variant="outlined" size="small" onClick={this.handleHome}>
            返回列表
          </Button>
          <Button variant="contained" size="small" onClick={this.handleReload}>
            刷新页面
          </Button>
        </Box>
      </Box>
    );
  }
}
