import { create } from 'zustand';
import { createServantSlice } from './servantSlice';
import { createConfigSlice } from './configSlice';
import { createBuffsSlice } from './buffsSlice';
import { createEnemySlice } from './enemySlice';
import { createOptionsSlice } from './optionsSlice';

const useStore = create((...args) => ({
  ...createServantSlice(...args),
  ...createConfigSlice(...args),
  ...createBuffsSlice(...args),
  ...createEnemySlice(...args),
  ...createOptionsSlice(...args),
}));

export default useStore;
