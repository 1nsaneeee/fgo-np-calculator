import cloneDeep from 'lodash/cloneDeep';
import { createEmptyBuffs, DEFAULT_SOURCES, DEFAULT_NEXT_ID } from '@/constants/buffDefs';

export const createBuffsSlice = (set) => ({
  buffs: {
    sources: cloneDeep(DEFAULT_SOURCES),
    _nextId: DEFAULT_NEXT_ID,
  },

  addBuffSource: (name) => set((state) => ({
    buffs: {
      sources: [...state.buffs.sources, { id: 'src_' + state.buffs._nextId, name, buffs: createEmptyBuffs() }],
      _nextId: state.buffs._nextId + 1,
    }
  })),

  removeBuffSource: (id) => set((state) => ({
    buffs: {
      ...state.buffs,
      sources: state.buffs.sources.filter(s => s.id !== id),
    }
  })),

  renameBuffSource: (id, name) => set((state) => ({
    buffs: {
      ...state.buffs,
      sources: state.buffs.sources.map(s => s.id === id ? { ...s, name } : s),
    }
  })),

  updateBuffValue: (sourceId, buffKey, value) => set((state) => ({
    buffs: {
      ...state.buffs,
      sources: state.buffs.sources.map(s =>
        s.id === sourceId
          ? { ...s, buffs: { ...s.buffs, [buffKey]: value } }
          : s
      ),
    }
  })),

  setBuffs: (buffs) => set({ buffs }),

  resetBuffs: () => set({
    buffs: {
      sources: cloneDeep(DEFAULT_SOURCES),
      _nextId: DEFAULT_NEXT_ID,
    }
  }),
});
