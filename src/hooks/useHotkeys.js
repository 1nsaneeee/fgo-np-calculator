import { useEffect, useRef } from 'react';

const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function useHotkeys(hotkeys) {
  const ref = useRef(hotkeys);
  ref.current = hotkeys;

  useEffect(() => {
    const handler = (e) => {
      const target = e.target;
      const tag = target.tagName;
      if (IGNORED_TAGS.has(tag) || target.isContentEditable) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      const fn = ref.current[key];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
