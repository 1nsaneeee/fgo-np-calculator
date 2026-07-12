import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useStore from '@/store/index';

const SYNC_KEYS = ['selectedId', 'isCustom', 'config', 'enemy', 'options', 'buffs'];
const PARAM_KEY = 's';

function encodeState(state) {
  const data = {};
  SYNC_KEYS.forEach((k) => {
    if (state[k] !== undefined && state[k] !== null) data[k] = state[k];
  });
  const json = JSON.stringify(data);
  try {
    const utf8 = unescape(encodeURIComponent(json));
    return btoa(utf8);
  } catch (e) {
    return null;
  }
}

function decodeState(encoded) {
  try {
    const utf8 = atob(encoded);
    const json = decodeURIComponent(escape(utf8));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export function useUrlSync() {
  const [searchParams, setSearchParams] = useSearchParams();
  const restoredRef = useRef(false);

  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const encoded = searchParams.get(PARAM_KEY);
    if (!encoded) return;

    const data = decodeState(encoded);
    if (!data) return;

    const store = useStore.getState();
    const patch = {};
    SYNC_KEYS.forEach((k) => {
      if (data[k] !== undefined && data[k] !== null) {
        if (JSON.stringify(store[k]) !== JSON.stringify(data[k])) {
          patch[k] = data[k];
        }
      }
    });
    if (Object.keys(patch).length > 0) {
      useStore.setState(patch, false);
    }
  }, [searchParams]);

  useEffect(() => {
    let timer = null;
    let lastEncoded = null;

    const unsubscribe = useStore.subscribe((state) => {
      const encoded = encodeState(state);
      if (!encoded || encoded === lastEncoded) return;
      lastEncoded = encoded;

      clearTimeout(timer);
      timer = setTimeout(() => {
        setSearchParams({ [PARAM_KEY]: encoded }, { replace: true });
      }, 600);
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [setSearchParams]);
}
