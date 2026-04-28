const defaultConfig = { level: 90, npLevel: 1, fou: 1000, ceAtk: 0, extraAtk: 0 };

export const createConfigSlice = (set) => ({
  config: { ...defaultConfig },

  setConfig: (config) => set({ config }),

  updateConfig: (key, val) => set((state) => ({
    config: { ...state.config, [key]: val }
  })),

  resetConfig: () => set({ config: { ...defaultConfig } }),
});
