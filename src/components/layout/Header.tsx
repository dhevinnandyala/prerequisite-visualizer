import { useUiStore, type Theme } from '../../stores/uiStore';
import { Button } from '../shared/Button';
import { WorkspaceSelector } from '../workspace/WorkspaceSelector';

const themeIcons: Record<Theme, string> = {
  light: '☀️',
  dark: '🌙',
  system: '💻',
};

const themeNext: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

export function Header() {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-2 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Prerequisite Visualizer
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <WorkspaceSelector />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(themeNext[theme])}
          aria-label={`Theme: ${theme}. Click to change.`}
          title={`Theme: ${theme}`}
        >
          {themeIcons[theme]}
        </Button>
      </div>
    </header>
  );
}
