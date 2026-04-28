import { CUSTOM_SERVANT_DEFAULTS } from '@/constants/servantKeys';

export const createServantSlice = (set) => ({
  selectedIndex: null,
  isCustom: false,
  customServant: { ...CUSTOM_SERVANT_DEFAULTS },

  selectServant: (idx) => set({ selectedIndex: idx, isCustom: false }),

  setCustomMode: (isCustom) => set({
    isCustom,
    selectedIndex: isCustom ? null : undefined,
  }),

  setCustomServant: (servant) => set({ customServant: servant }),

  resetServant: () => set({
    selectedIndex: null,
    isCustom: false,
    customServant: { ...CUSTOM_SERVANT_DEFAULTS },
  }),
});
