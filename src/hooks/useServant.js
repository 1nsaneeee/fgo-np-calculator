import { useMemo } from 'react';
import useStore from '@/store/index';
import { SERVANT_DB } from '@/data/servantDb';

export function useServant() {
  const selectedIndex = useStore((s) => s.selectedIndex);
  const isCustom = useStore((s) => s.isCustom);
  const customServant = useStore((s) => s.customServant);

  const servant = useMemo(() => {
    if (isCustom) return customServant;
    if (selectedIndex !== null && selectedIndex >= 0) return SERVANT_DB[selectedIndex];
    return null;
  }, [isCustom, customServant, selectedIndex]);

  return servant;
}
