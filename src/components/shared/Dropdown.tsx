import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';

interface DropdownOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface DropdownProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: DropdownOption<T>[];
  label: string;
  icon?: ReactNode;
  footer?: ReactNode;
}

export function Dropdown<T extends string>({
  value,
  onChange,
  options,
  label,
  icon,
  footer,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeOption = options.find((o) => o.value === value);

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
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {icon && <span className="text-base leading-none">{icon}</span>}
        <span>{activeOption?.label}</span>
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
            min-w-[160px] py-1
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-lg
            ring-1 ring-black/5 dark:ring-white/5
            animate-in fade-in slide-in-from-top-1
          "
          role="listbox"
          aria-label={label}
        >
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onChange(option.value);
                  close();
                }}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left
                  transition-colors
                  ${isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                {option.icon && <span className="text-base leading-none">{option.icon}</span>}
                <span className="flex-1">{option.label}</span>
                {isActive && (
                  <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
          {footer && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
              {footer}
            </>
          )}
        </div>
      )}
    </div>
  );
}
