import { create } from 'zustand';

const THEME_KEY = 'fgo-calc-theme';

const getInitialMode = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) { /* ignore */ }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const useThemeStore = create((set) => ({
  mode: getInitialMode(),
  toggle: () => set((s) => {
    const next = s.mode === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    return { mode: next };
  }),
  setMode: (mode) => set(() => {
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* ignore */ }
    return { mode };
  }),
}));
