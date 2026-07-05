import cloneDeep from 'lodash/cloneDeep';
import { createEmptyBuffs, DEFAULT_SOURCES, DEFAULT_NEXT_ID } from '@/constants/buffDefs';

const createDefaultServantSlot = (id) => ({
  id,
  servantId: null,
  isCustom: false,
  customServant: null,
  _resolvedServant: null,  // cached full servant data (from transformNiceToCalc)
  _resolving: false,       // loading flag for API fetch
  config: {
    level: 90,
    npLevel: 1,
    fou: 0,
    ceAtk: 0,
    extraAtk: 0,
  },
  buffs: {
    sources: cloneDeep(DEFAULT_SOURCES),
    _nextId: DEFAULT_NEXT_ID,
  },
  // Per-servant skill selection and activation tracking
  skills: [null, null, null],
  skillsActivated: [null, null, null],
  npGauge: 0,
});

const defaultTeam = {
  servants: [
    createDefaultServantSlot(1),
    createDefaultServantSlot(2),
    createDefaultServantSlot(3),
  ],
  enemy: {
    class: 'Saber',
    attr: 'Human',
    def: 0,
  },
  options: {
    isCrit: false,
    overkill: false,
  },
};

export const createTeamSlice = (set) => ({
  team: cloneDeep(defaultTeam),

  // ── Servant selection ──
  setTeamServant: (slotIndex, servantId) => set((state) => {
    const servants = [...state.team.servants];
    servants[slotIndex] = { ...servants[slotIndex], servantId, isCustom: false };
    return { team: { ...state.team, servants } };
  }),

  setTeamResolvedServant: (slotIndex, data) => set((state) => {
    const servants = [...state.team.servants];
    servants[slotIndex] = { ...servants[slotIndex], _resolvedServant: data, _resolving: false };
    return { team: { ...state.team, servants } };
  }),

  setTeamResolving: (slotIndex, resolving) => set((state) => {
    const servants = [...state.team.servants];
    servants[slotIndex] = { ...servants[slotIndex], _resolving: resolving };
    return { team: { ...state.team, servants } };
  }),

  setTeamCustomServant: (slotIndex, customData) => set((state) => {
    const servants = [...state.team.servants];
    servants[slotIndex] = { ...servants[slotIndex], isCustom: true, customServant: customData };
    return { team: { ...state.team, servants } };
  }),

  // ── Per-servant config ──
  updateTeamConfig: (slotIndex, key, value) => set((state) => {
    const servants = [...state.team.servants];
    servants[slotIndex] = {
      ...servants[slotIndex],
      config: { ...servants[slotIndex].config, [key]: value },
    };
    return { team: { ...state.team, servants } };
  }),

  // ── Per-servant buffs ──
  addTeamBuffSource: (slotIndex, name) => set((state) => {
    const servants = [...state.team.servants];
    const slot = servants[slotIndex];
    servants[slotIndex] = {
      ...slot,
      buffs: {
        sources: [...slot.buffs.sources, { id: 'src_' + slot.buffs._nextId, name, buffs: createEmptyBuffs() }],
        _nextId: slot.buffs._nextId + 1,
      },
    };
    return { team: { ...state.team, servants } };
  }),

  removeTeamBuffSource: (slotIndex, sourceId) => set((state) => {
    const servants = [...state.team.servants];
    const slot = servants[slotIndex];
    servants[slotIndex] = {
      ...slot,
      buffs: { ...slot.buffs, sources: slot.buffs.sources.filter(s => s.id !== sourceId) },
    };
    return { team: { ...state.team, servants } };
  }),

  renameTeamBuffSource: (slotIndex, sourceId, name) => set((state) => {
    const servants = [...state.team.servants];
    const slot = servants[slotIndex];
    servants[slotIndex] = {
      ...slot,
      buffs: {
        ...slot.buffs,
        sources: slot.buffs.sources.map(s => s.id === sourceId ? { ...s, name } : s),
      },
    };
    return { team: { ...state.team, servants } };
  }),

  updateTeamBuffValue: (slotIndex, sourceId, buffKey, value) => set((state) => {
    const servants = [...state.team.servants];
    const slot = servants[slotIndex];
    servants[slotIndex] = {
      ...slot,
      buffs: {
        ...slot.buffs,
        sources: slot.buffs.sources.map(s =>
          s.id === sourceId ? { ...s, buffs: { ...s.buffs, [buffKey]: value } } : s
        ),
      },
    };
    return { team: { ...state.team, servants } };
  }),

  setTeamBuffs: (slotIndex, buffs) => set((state) => {
    const servants = [...state.team.servants];
    servants[slotIndex] = { ...servants[slotIndex], buffs };
    return { team: { ...state.team, servants } };
  }),

  // ── Per-servant skills ──
  setTeamSkill: (slotIndex, skillIndex, skillId) => set((state) => {
    const servants = [...state.team.servants];
    const skills = [...servants[slotIndex].skills];
    skills[skillIndex] = skillId;
    servants[slotIndex] = { ...servants[slotIndex], skills };
    return { team: { ...state.team, servants } };
  }),

  activateTeamSkill: (slotIndex, skillIndex, turn) => set((state) => {
    const servants = [...state.team.servants];
    const skillsActivated = [...servants[slotIndex].skillsActivated];
    skillsActivated[skillIndex] = turn;
    servants[slotIndex] = { ...servants[slotIndex], skillsActivated };
    return { team: { ...state.team, servants } };
  }),

  deactivateTeamSkill: (slotIndex, skillIndex) => set((state) => {
    const servants = [...state.team.servants];
    const skillsActivated = [...servants[slotIndex].skillsActivated];
    skillsActivated[skillIndex] = null;
    servants[slotIndex] = { ...servants[slotIndex], skillsActivated };
    return { team: { ...state.team, servants } };
  }),

  setTeamNPGauge: (slotIndex, value) => set((state) => {
    const servants = [...state.team.servants];
    servants[slotIndex] = { ...servants[slotIndex], npGauge: Math.max(0, Math.min(200, value)) };
    return { team: { ...state.team, servants } };
  }),

  resetTeamSkills: (slotIndex) => set((state) => {
    const servants = [...state.team.servants];
    servants[slotIndex] = {
      ...servants[slotIndex],
      skills: [null, null, null],
      skillsActivated: [null, null, null],
      npGauge: 0,
    };
    return { team: { ...state.team, servants } };
  }),

  // ── Enemy ──
  updateTeamEnemy: (key, value) => set((state) => ({
    team: { ...state.team, enemy: { ...state.team.enemy, [key]: value } },
  })),

  // ── Options ──
  toggleTeamOption: (key) => set((state) => ({
    team: { ...state.team, options: { ...state.team.options, [key]: !state.team.options[key] } },
  })),

  // ── Bulk ──
  resetTeamServant: (slotIndex) => set((state) => {
    const servants = [...state.team.servants];
    servants[slotIndex] = createDefaultServantSlot(slotIndex + 1);
    return { team: { ...state.team, servants } };
  }),

  resetTeam: () => set({ team: cloneDeep(defaultTeam) }),

  // Copy buffs from one slot to another (convenience)
  copyTeamBuffs: (fromSlot, toSlot) => set((state) => {
    const servants = [...state.team.servants];
    servants[toSlot] = {
      ...servants[toSlot],
      buffs: cloneDeep(servants[fromSlot].buffs),
    };
    return { team: { ...state.team, servants } };
  }),
});
