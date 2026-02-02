import { useUiStore, type ColorTheme } from '../../stores/uiStore';
import { WorkspaceSelector } from '../workspace/WorkspaceSelector';
import { ThemePicker } from './ThemePicker';

const gradients: Record<ColorTheme, string> = {
  ocean: 'linear-gradient(135deg, hsl(210, 80%, 55%), hsl(270, 75%, 55%), hsl(330, 75%, 55%))',
  sunset: 'linear-gradient(135deg, hsl(10, 85%, 50%), hsl(35, 90%, 50%), hsl(55, 85%, 45%))',
  forest: 'linear-gradient(135deg, hsl(120, 60%, 40%), hsl(180, 55%, 40%), hsl(270, 55%, 50%))',
};

export function Header() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const colorTheme = useUiStore((s) => s.colorTheme);

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
        <h1
          className="text-4xl font-extrabold bg-clip-text text-transparent tracking-tight"
          style={{ backgroundImage: gradients[colorTheme] }}
        >
          PrereqTree
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <WorkspaceSelector />
        <ThemePicker />
      </div>
    </header>
  );
}
