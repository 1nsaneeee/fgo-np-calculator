import cloneDeep from 'lodash/cloneDeep';
import { defaultBuffs } from '@/constants/buffDefs';

export const createBuffsSlice = (set) => ({
  buffs: cloneDeep(defaultBuffs),

  setBuffs: (buffs) => set({ buffs }),

  updateBuffSource: (source, key, val) => set((state) => {
    const newBuffs = cloneDeep(state.buffs);
    newBuffs[source][key] = val;
    return { buffs: newBuffs };
  }),

  resetBuffs: () => set({ buffs: cloneDeep(defaultBuffs) }),
});
