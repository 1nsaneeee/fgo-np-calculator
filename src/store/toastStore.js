// src/store/toastStore.js
import { create } from 'zustand';

export const useToast = create((set) => ({
  open: false,
  message: '',
  severity: 'success', // success | info | warning | error
  show: (message, severity = 'success') => set({ open: true, message, severity }),
  hide: () => set({ open: false }),
}));
