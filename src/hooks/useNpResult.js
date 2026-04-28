import { useMemo } from 'react';
import useStore from '@/store/index';
import { useServant } from './useServant';
import { calcNPDamage } from '@/utils/calculations';

export function useNpResult() {
  const servant = useServant();
  const config = useStore((s) => s.config);
  const buffs = useStore((s) => s.buffs);
  const enemy = useStore((s) => s.enemy);
  const options = useStore((s) => s.options);

  const npResult = useMemo(() => {
    if (!servant) return null;
    return calcNPDamage(servant, config, buffs, enemy, options);
  }, [servant, config, buffs, enemy, options]);

  return npResult;
}
