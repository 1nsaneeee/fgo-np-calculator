const defaultOptions = { overkill: false, isCrit: false };

export const createOptionsSlice = (set) => ({
  options: { ...defaultOptions },

  setOptions: (options) => set({ options }),

  toggleOption: (key) => set((state) => ({
    options: { ...state.options, [key]: !state.options[key] }
  })),

  resetOptions: () => set({ options: { ...defaultOptions } }),
});
