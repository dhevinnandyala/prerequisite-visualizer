import { useEffect } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { meta?: boolean; shift?: boolean } = {},
) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (options.meta && !(e.metaKey || e.ctrlKey)) return;
      if (options.shift && !e.shiftKey) return;
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      e.preventDefault();
      callback();
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options.meta, options.shift]);
}
