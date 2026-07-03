// src/hooks/useServant.js
import { useMemo } from 'react';
import useStore from '@/store/index';

export function useServant() {
  const servantData = useStore((s) => s.servantData);
  const isCustom = useStore((s) => s.isCustom);
  const customServant = useStore((s) => s.customServant);

  const servant = useMemo(() => {
    if (isCustom) return customServant;
    if (servantData) return servantData;
    return null;
  }, [isCustom, customServant, servantData]);

  return servant;
}
