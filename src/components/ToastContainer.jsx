// src/components/ToastContainer.jsx
import { Snackbar, Alert } from '@mui/material';
import { useToast } from '@/store/toastStore';

export default function ToastContainer() {
  const { open, message, severity, hide } = useToast();

  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={hide}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 1 }}
    >
      <Alert onClose={hide} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
