import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createServantSlice } from './servantSlice';
import { createConfigSlice } from './configSlice';
import { createBuffsSlice } from './buffsSlice';
import { createEnemySlice } from './enemySlice';
import { createOptionsSlice } from './optionsSlice';

const useStore = create(
  persist(
    (...args) => ({
      ...createServantSlice(...args),
      ...createConfigSlice(...args),
      ...createBuffsSlice(...args),
      ...createEnemySlice(...args),
      ...createOptionsSlice(...args),
    }),
    {
      name: 'fgo-calc-state',
      version: 1,
      partialize: (state) => ({
        selectedId: state.selectedId,
        servantData: state.servantData,
        isCustom: state.isCustom,
        customServant: state.customServant,
        config: state.config,
        buffs: state.buffs,
        enemy: state.enemy,
        options: state.options,
      }),
    }
  )
);

export default useStore;
