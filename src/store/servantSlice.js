// src/store/servantSlice.js
import { CUSTOM_SERVANT_DEFAULTS } from '@/constants/servantKeys';

export const createServantSlice = (set) => ({
  selectedId: null,
  servantData: null,
  isCustom: false,
  customServant: { ...CUSTOM_SERVANT_DEFAULTS },
  servantList: [],
  servantLoading: false,
  servantError: null,

  selectServant: (id) => set({ selectedId: id, isCustom: false }),

  setServantData: (data) => set({ servantData: data }),

  setServantList: (list) => set({ servantList: list }),

  setServantLoading: (loading) => set({ servantLoading: loading }),

  setServantError: (error) => set({ servantError: error }),

  setCustomMode: (isCustom) => set({ isCustom }),

  setCustomServant: (servant) => set({ customServant: servant }),

  resetServant: () => set({
    selectedId: null,
    servantData: null,
    isCustom: false,
    customServant: { ...CUSTOM_SERVANT_DEFAULTS },
  }),
});
