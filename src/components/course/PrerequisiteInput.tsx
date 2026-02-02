import { useState, useRef, useEffect } from 'react';
import type { Course } from '../../types/course';

interface PrerequisiteInputProps {
  courses: Course[];
  selected: string[];
  onChange: (ids: string[]) => void;
  excludeId?: string;
}

export function PrerequisiteInput({
  courses,
  selected,
  onChange,
  excludeId,
}: PrerequisiteInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const available = courses.filter(
    (c) =>
      c.id !== excludeId &&
      !selected.includes(c.id) &&
      c.name.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  function addPrereq(id: string) {
    onChange([...selected, id]);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  function removePrereq(id: string) {
    onChange(selected.filter((s) => s !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, available.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0 && available[activeIndex]) {
      e.preventDefault();
      addPrereq(available[activeIndex].id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Prerequisites
      </label>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const course = courses.find((c) => c.id === id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300"
              >
                {course?.name ?? 'Unknown'}
                <button
                  type="button"
                  onClick={() => removePrereq(id)}
                  className="hover:text-red-600 dark:hover:text-red-400"
                  aria-label={`Remove ${course?.name}`}
                >
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Combobox */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Search courses..."
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="prereq-listbox"
        />
        {open && available.length > 0 && (
          <ul
            ref={listRef}
            id="prereq-listbox"
            role="listbox"
            className="absolute z-20 mt-1 w-full max-h-40 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
          >
            {available.map((course, i) => (
              <li
                key={course.id}
                role="option"
                aria-selected={i === activeIndex}
                className={`px-3 py-1.5 text-sm cursor-pointer ${
                  i === activeIndex
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-900 dark:text-primary-200'
                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  addPrereq(course.id);
                }}
              >
                {course.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
