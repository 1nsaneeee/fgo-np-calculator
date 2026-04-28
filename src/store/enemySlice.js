const defaultEnemy = { class: 'Saber', attr: 'Human', def: 0 };

export const createEnemySlice = (set) => ({
  enemy: { ...defaultEnemy },

  setEnemy: (enemy) => set({ enemy }),

  updateEnemy: (key, val) => set((state) => ({
    enemy: { ...state.enemy, [key]: val }
  })),

  resetEnemy: () => set({ enemy: { ...defaultEnemy } }),
});
