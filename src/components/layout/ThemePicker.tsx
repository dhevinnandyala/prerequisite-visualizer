import { useState, useRef, useEffect, useCallback } from 'react';
import { useUiStore, type Theme, type ColorTheme } from '../../stores/uiStore';

const themeOptions: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
];

const colorThemeOptions: { value: ColorTheme; label: string; icon: string }[] = [
  { value: 'ocean', label: 'Ocean', icon: '🌊' },
  { value: 'sunset', label: 'Sunset', icon: '🌅' },
  { value: 'forest', label: 'Forest', icon: '🌲' },
];

export function ThemePicker() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const colorTheme = useUiStore((s) => s.colorTheme);
  const setColorTheme = useUiStore((s) => s.setColorTheme);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, close]);

  const activeThemeIcon = themeOptions.find((o) => o.value === theme)?.icon;
  const activeColorIcon = colorThemeOptions.find((o) => o.value === colorTheme)?.icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="
          inline-flex items-center gap-1.5 px-2.5 py-1.5
          text-sm font-medium rounded-lg
          bg-gray-100 hover:bg-gray-200
          dark:bg-gray-800 dark:hover:bg-gray-700
          text-gray-700 dark:text-gray-300
          border border-gray-200 dark:border-gray-700
          transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        "
        aria-label="Theme settings"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{activeColorIcon}</span>
        <span className="text-base leading-none">{activeThemeIcon}</span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-1.5 z-50
            min-w-[180px] py-1
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-lg
            ring-1 ring-black/5 dark:ring-white/5
          "
        >
          <div className="px-3 pt-2 pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Appearance
            </span>
          </div>
          {themeOptions.map((opt) => {
            const isActive = opt.value === theme;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                  ${isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <span className="text-base leading-none">{opt.icon}</span>
                <span className="flex-1">{opt.label}</span>
                {isActive && (
                  <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}

          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

          <div className="px-3 pt-2 pb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Color Scheme
            </span>
          </div>
          {colorThemeOptions.map((opt) => {
            const isActive = opt.value === colorTheme;
            return (
              <button
                key={opt.value}
                onClick={() => setColorTheme(opt.value)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                  ${isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <span className="text-base leading-none">{opt.icon}</span>
                <span className="flex-1">{opt.label}</span>
                {isActive && (
                  <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
